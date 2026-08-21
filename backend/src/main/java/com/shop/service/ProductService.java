package com.shop.service;

import com.shop.model.Product;
import com.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAll() { return productRepository.findAll(); }

    public Optional<Product> getById(Long id) { return productRepository.findById(id); }

    public Product save(Product product) { return productRepository.save(product); }

    public boolean update(Long id, Product product) {
        return productRepository.findById(id).map(p -> {
            p.setName(product.getName()); p.setDescription(product.getDescription());
            p.setCategory(product.getCategory()); p.setPrice(product.getPrice());
            p.setMrp(product.getMrp()); p.setQuantity(product.getQuantity());
            p.setImageUrl(product.getImageUrl());
            productRepository.save(p); return true;
        }).orElse(false);
    }

    public boolean delete(Long id) {
        if (!productRepository.existsById(id)) return false;
        productRepository.deleteById(id);
        return true;
    }

    public boolean decrementStock(Long id, int qty) {
        return productRepository.decrementStock(id, qty) > 0;
    }
}
