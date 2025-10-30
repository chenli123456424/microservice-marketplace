package com.example.microservice.user.service;

import com.example.microservice.user.entity.CartItem;

import java.util.List;

public interface CartService {
    List<CartItem> getUserCartItems(Long userId);
    
    void addToCart(Long userId, Long productId, Integer quantity, String spec, String color);
    
    void updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity);
    
    void removeFromCart(Long userId, Long cartItemId);
    
    void batchRemoveFromCart(Long userId, List<Long> cartItemIds);
    
    void clearCart(Long userId);
}
