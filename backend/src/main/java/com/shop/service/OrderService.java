package com.shop.service;

import com.shop.dto.OrderDetailsDTO;
import com.shop.enums.OrderStatus;
import com.shop.model.Cart;
import com.shop.model.Order;
import com.shop.model.OrderItem;
import com.shop.model.Product;
import com.shop.model.User;
import com.shop.repository.OrderItemRepository;
import com.shop.repository.OrderRepository;
import com.shop.repository.ProductRepository;
import com.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public boolean placeOrder(Long userId, String shippingAddress, String paymentMethod) {
        List<Cart> cartItems = cartService.getRawCartItems(userId);
        if (cartItems.isEmpty()) return false;

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();

        // Validate ALL items first before touching DB
        for (Cart c : cartItems) {
            Product p = productRepository.findById(c.getProductId()).orElse(null);
            if (p == null) throw new RuntimeException("Product not found: " + c.getProductId());
            if (p.getQuantity() < c.getQuantity())
                throw new RuntimeException("Insufficient stock for: " + p.getName());
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(c.getQuantity())));
            OrderItem item = new OrderItem();
            item.setProductId(p.getId());
            item.setQuantity(c.getQuantity());
            item.setPrice(p.getPrice());
            items.add(item);
        }

        // Decrement stock for each item
        for (Cart c : cartItems) {
            int updated = productRepository.decrementStock(c.getProductId(), c.getQuantity());
            if (updated == 0) throw new RuntimeException("Stock race condition — please retry");
        }

        // Save order
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(total);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(shippingAddress);
        order.setPaymentMethod(paymentMethod);
        Order saved = orderRepository.save(order);

        // Save order items
        items.forEach(i -> { i.setOrderId(saved.getId()); orderItemRepository.save(i); });

        // Clear cart
        cartService.clearCart(userId);

        // Send order placed email — async, won't block response
        BigDecimal finalTotal = total;
        userRepository.findById(userId).ifPresent(user ->
            emailService.sendOrderPlacedMail(user.getName(), user.getEmail(), saved.getId(), finalTotal)
        );

        return true;
    }

    public List<Order> getByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public Optional<OrderDetailsDTO> getOrderDetails(Long orderId, Long userId) {
        return orderRepository.findById(orderId)
            .filter(o -> o.getUserId().equals(userId))
            .map(o -> new OrderDetailsDTO(o, orderItemRepository.findByOrderId(orderId)));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    // Called by AdminController — sends appropriate email per status change


    private void sendStatusEmail(User user, Long orderId, OrderStatus status) {
        switch (status) {
            case CONFIRMED  -> emailService.sendOrderConfirmedMail(user.getName(), user.getEmail(), orderId);
            case SHIPPED    -> emailService.sendOrderShippedMail(user.getName(), user.getEmail(), orderId);
            case DELIVERED  -> emailService.sendDeliveredMail(user.getName(), user.getEmail(), orderId);
            case CANCELLED  -> emailService.sendOrderCancelledMail(user.getName(), user.getEmail(), orderId);
            // PENDING — no email needed
            default -> {}
        }
    }
    @Transactional
    public boolean updateStatus(Long orderId, OrderStatus newStatus) {

        return orderRepository.findById(orderId).map(order -> {

            OrderStatus oldStatus = order.getStatus();

            // Prevent processing the same cancellation twice
            if (oldStatus == OrderStatus.CANCELLED
                    && newStatus == OrderStatus.CANCELLED) {

                return true;
            }

            // Restore inventory when order becomes CANCELLED
            if (newStatus == OrderStatus.CANCELLED
                    && oldStatus != OrderStatus.CANCELLED) {

                if (oldStatus == OrderStatus.SHIPPED
                        || oldStatus == OrderStatus.DELIVERED) {

                    throw new RuntimeException(
                            "Order cannot be cancelled after shipping"
                    );
                }

                List<OrderItem> items =
                        orderItemRepository.findByOrderId(orderId);

                for (OrderItem item : items) {

                    productRepository.restoreStock(
                            item.getProductId(),
                            item.getQuantity()
                    );
                }
            }



            // Update order status
            order.setStatus(newStatus);
            orderRepository.save(order);

            // Send status email
            userRepository.findById(order.getUserId()).ifPresent(user ->
                    sendStatusEmail(user, orderId, newStatus)
            );

            return true;

        }).orElse(false);
    }
}
