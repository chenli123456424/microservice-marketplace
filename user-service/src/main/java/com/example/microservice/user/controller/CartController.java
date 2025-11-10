package com.example.microservice.user.controller;

import com.example.microservice.user.entity.CartItem;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.CartService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "购物车接口")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("用户未认证，请先登录");
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        return user.getId();
    }

    @GetMapping("/items")
    @Operation(summary = "获取购物车商品列表")
    public ResponseResult<List<CartItem>> getCartItems(Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            System.out.println("获取购物车商品，用户ID: " + userId);
            List<CartItem> items = cartService.getUserCartItems(userId);
            System.out.println("购物车商品数量: " + (items != null ? items.size() : 0));
            return ResponseResult.success(items);
        } catch (Exception e) {
            System.err.println("获取购物车商品失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("获取购物车商品失败: " + e.getMessage());
        }
    }

    @PostMapping("/items")
    @Operation(summary = "添加商品到购物车")
    public ResponseResult<String> addToCart(
            Authentication authentication,
            @RequestBody Map<String, Object> params) {
        try {
            Long userId = getUserId(authentication);
            
            // 安全地解析productId
            Object productIdObj = params.get("productId");
            if (productIdObj == null) {
                return ResponseResult.error("商品ID不能为空");
            }
            Long productId = Long.parseLong(productIdObj.toString());
            
            // 安全地解析quantity
            Object quantityObj = params.get("quantity");
            if (quantityObj == null) {
                return ResponseResult.error("数量不能为空");
            }
            Integer quantity = Integer.parseInt(quantityObj.toString());
            
            // 获取可选参数
            String spec = params.get("spec") != null ? params.get("spec").toString() : null;
            String color = params.get("color") != null ? params.get("color").toString() : null;

            cartService.addToCart(userId, productId, quantity, spec, color);
            return ResponseResult.success("添加成功");
        } catch (NumberFormatException e) {
            return ResponseResult.error("参数格式错误");
        } catch (Exception e) {
            return ResponseResult.error("添加失败: " + e.getMessage());
        }
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "更新购物车商品数量")
    public ResponseResult<String> updateCartItemQuantity(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> params) {
        Long userId = getUserId(authentication);
        Integer quantity = params.get("quantity");

        cartService.updateCartItemQuantity(userId, itemId, quantity);
        return ResponseResult.success("更新成功");
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "从购物车中删除商品")
    public ResponseResult<String> removeFromCart(
            Authentication authentication,
            @PathVariable Long itemId) {
        Long userId = getUserId(authentication);
        cartService.removeFromCart(userId, itemId);
        return ResponseResult.success("删除成功");
    }

    @DeleteMapping("/items/batch")
    @Operation(summary = "批量删除购物车商品")
    public ResponseResult<String> batchRemoveFromCart(
            Authentication authentication,
            @RequestBody Map<String, Object> params) {
        try {
            Long userId = getUserId(authentication);
            @SuppressWarnings("unchecked")
            List<Long> itemIds = (List<Long>) params.get("itemIds");
            
            if (itemIds == null || itemIds.isEmpty()) {
                return ResponseResult.error("请选择要删除的商品");
            }
            
            cartService.batchRemoveFromCart(userId, itemIds);
            return ResponseResult.success("批量删除成功");
        } catch (Exception e) {
            return ResponseResult.error("批量删除失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/items")
    @Operation(summary = "清空购物车")
    public ResponseResult<String> clearCart(Authentication authentication) {
        Long userId = getUserId(authentication);
        cartService.clearCart(userId);
        return ResponseResult.success("清空成功");
    }
}