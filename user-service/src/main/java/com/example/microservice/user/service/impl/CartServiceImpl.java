package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.microservice.user.entity.CartItem;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.mapper.CartItemMapper;
import com.example.microservice.user.service.CartService;
import com.example.microservice.user.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartItemMapper cartItemMapper;
    
    @Autowired
    private ProductService productService;

    @Override
    public List<CartItem> getUserCartItems(Long userId) {
        return cartItemMapper.selectCartItemsWithProduct(userId);
    }

    @Override
    @Transactional
    public void addToCart(Long userId, Long productId, Integer quantity, String spec, String color) {
        // 检查商品是否存在
        Product product = productService.getById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        
        // 检查是否已经在购物车中
        QueryWrapper<CartItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .eq("product_id", productId);
        
        // 只有当spec不为null时才添加spec条件
        if (spec != null && !spec.trim().isEmpty()) {
            queryWrapper.eq("spec", spec);
        } else {
            queryWrapper.and(wrapper -> wrapper.isNull("spec").or().eq("spec", ""));
        }
        
        // 只有当color不为null时才添加color条件
        if (color != null && !color.trim().isEmpty()) {
            queryWrapper.eq("color", color);
        } else {
            queryWrapper.and(wrapper -> wrapper.isNull("color").or().eq("color", ""));
        }
        
        CartItem existingItem = cartItemMapper.selectOne(queryWrapper);
        
        if (existingItem != null) {
            // 更新数量
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setUpdateTime(LocalDateTime.now());
            cartItemMapper.updateById(existingItem);
        } else {
            // 新增购物车项
            CartItem cartItem = new CartItem();
            cartItem.setUserId(userId);
            cartItem.setProductId(productId);
            cartItem.setQuantity(quantity);
            cartItem.setSpec(spec);
            cartItem.setColor(color);
            cartItem.setCreateTime(LocalDateTime.now());
            cartItem.setUpdateTime(LocalDateTime.now());
            cartItemMapper.insert(cartItem);
        }
    }

    @Override
    @Transactional
    public void updateCartItemQuantity(Long userId, Long cartItemId, Integer quantity) {
        QueryWrapper<CartItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", cartItemId)
                   .eq("user_id", userId);
        
        CartItem cartItem = cartItemMapper.selectOne(queryWrapper);
        if (cartItem == null) {
            throw new RuntimeException("购物车项不存在");
        }
        
        if (quantity <= 0) {
            cartItemMapper.deleteById(cartItemId);
        } else {
            cartItem.setQuantity(quantity);
            cartItem.setUpdateTime(LocalDateTime.now());
            cartItemMapper.updateById(cartItem);
        }
    }

    @Override
    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        QueryWrapper<CartItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("id", cartItemId)
                   .eq("user_id", userId);
        
        cartItemMapper.delete(queryWrapper);
    }

    @Override
    @Transactional
    public void batchRemoveFromCart(Long userId, List<Long> cartItemIds) {
        if (cartItemIds == null || cartItemIds.isEmpty()) {
            return;
        }
        
        QueryWrapper<CartItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId)
                   .in("id", cartItemIds);
        
        cartItemMapper.delete(queryWrapper);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        QueryWrapper<CartItem> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("user_id", userId);
        
        cartItemMapper.delete(queryWrapper);
    }
}
