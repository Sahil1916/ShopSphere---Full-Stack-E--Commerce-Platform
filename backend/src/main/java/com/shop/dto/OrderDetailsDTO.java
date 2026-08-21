package com.shop.dto;
import com.shop.model.Order;
import com.shop.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderDetailsDTO {
    private Order order;
    private List<OrderItem> items;
}
