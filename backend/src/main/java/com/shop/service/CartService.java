package com.shop.service;

import com.shop.dto.CartItemDTO;
import com.shop.model.Cart;
import com.shop.model.Product;
import com.shop.repository.CartRepository;
import com.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public void addOrUpdate(Long userId, Long productId, int quantity) {
        Optional<Cart> existing = cartRepository.findByUserIdAndProductId(userId, productId);
        Cart cart = existing.orElseGet(Cart::new);
        cart.setUserId(userId);
        cart.setProductId(productId);
        cart.setQuantity(existing.isPresent() ? cart.getQuantity() + quantity : quantity);
        cartRepository.save(cart);
    }

    public List<CartItemDTO> getByUserId(Long userId) {
        return cartRepository.findByUserId(userId).stream().map(c -> {
            Product p = productRepository.findById(c.getProductId()).orElse(null);
            if (p == null) return null;
            return new CartItemDTO(c.getId(), p.getId(), p.getName(), p.getPrice(), p.getImageUrl(), c.getQuantity());
        }).filter(i -> i != null).collect(Collectors.toList());
    }

    public boolean updateQuantity(Long cartId, Long userId, int quantity) {
        return cartRepository.findByIdAndUserId(cartId, userId).map(c -> {
            c.setQuantity(quantity);
            cartRepository.save(c);
            return true;
        }).orElse(false);
    }

    public boolean deleteItem(Long cartId, Long userId) {
        return cartRepository.findByIdAndUserId(cartId, userId).map(c -> {
            cartRepository.delete(c);
            return true;
        }).orElse(false);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }

    public List<Cart> getRawCartItems(Long userId) {
        return cartRepository.findByUserId(userId);
    }
}
