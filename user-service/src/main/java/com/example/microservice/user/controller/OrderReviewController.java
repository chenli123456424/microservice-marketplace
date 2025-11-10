package com.example.microservice.user.controller;

import com.example.microservice.user.entity.Order;
import com.example.microservice.user.entity.OrderReview;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.OrderReviewService;
import com.example.microservice.user.service.OrderService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 订单评价控制器
 */
@RestController
@RequestMapping("/api/order-reviews")
@Tag(name = "订单评价接口")
public class OrderReviewController {
    
    @Autowired
    private OrderReviewService orderReviewService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderService orderService;
    
    /**
     * 获取用户ID
     */
    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user != null ? user.getId() : null;
    }
    
    /**
     * 根据订单ID获取评价列表
     */
    @GetMapping("/order/{orderId}")
    @Operation(summary = "根据订单ID获取评价列表")
    public ResponseResult<List<OrderReview>> getReviewsByOrderId(@PathVariable Long orderId) {
        try {
            List<OrderReview> reviews = orderReviewService.getReviewsByOrderId(orderId);
            return ResponseResult.success(reviews);
        } catch (Exception e) {
            return ResponseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据商品ID获取评价列表
     */
    @GetMapping("/product/{productId}")
    @Operation(summary = "根据商品ID获取评价列表")
    public ResponseResult<List<OrderReview>> getReviewsByProductId(@PathVariable Long productId) {
        try {
            List<OrderReview> reviews = orderReviewService.getReviewsByProductId(productId);
            return ResponseResult.success(reviews);
        } catch (Exception e) {
            return ResponseResult.error("获取评价列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据订单项ID获取评价
     */
    @GetMapping("/order-item/{orderItemId}")
    @Operation(summary = "根据订单项ID获取评价")
    public ResponseResult<OrderReview> getReviewByOrderItemId(@PathVariable Long orderItemId) {
        try {
            OrderReview review = orderReviewService.getReviewByOrderItemId(orderItemId);
            return ResponseResult.success(review);
        } catch (Exception e) {
            return ResponseResult.error("获取评价失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建评价
     */
    @PostMapping
    @Operation(summary = "创建评价")
    public ResponseResult<OrderReview> createReview(
            Authentication authentication,
            @RequestBody Map<String, Object> reviewData) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 获取用户信息
            User user = userService.getById(userId);
            if (user == null) {
                return ResponseResult.error("用户不存在");
            }
            
            // 构建评价对象
            OrderReview review = new OrderReview();
            
            // 检查必需字段
            if (!reviewData.containsKey("orderId") || reviewData.get("orderId") == null) {
                return ResponseResult.error("订单ID不能为空");
            }
            review.setOrderId(Long.valueOf(reviewData.get("orderId").toString()));
            
            // 检查productId（必需）
            if (!reviewData.containsKey("productId") || reviewData.get("productId") == null) {
                return ResponseResult.error("商品ID不能为空");
            }
            review.setProductId(Long.valueOf(reviewData.get("productId").toString()));
            
            // orderItemId是可选的
            if (reviewData.containsKey("orderItemId") && reviewData.get("orderItemId") != null) {
                review.setOrderItemId(Long.valueOf(reviewData.get("orderItemId").toString()));
            }
            
            review.setUserId(userId);
            review.setUsername(user.getUsername());
            review.setUserAvatar(user.getAvatar());
            
            // rating可选，默认为5
            if (reviewData.containsKey("rating") && reviewData.get("rating") != null) {
                review.setRating(Integer.valueOf(reviewData.get("rating").toString()));
            } else {
                review.setRating(5); // 默认5星
            }
            
            // content可选
            if (reviewData.containsKey("content") && reviewData.get("content") != null) {
                review.setContent(reviewData.get("content").toString());
            }
            
            // images可选
            if (reviewData.containsKey("images") && reviewData.get("images") != null) {
                String images = reviewData.get("images").toString();
                review.setImages(images.isEmpty() ? null : images);
            }
            
            boolean saved = orderReviewService.saveReview(review);
            if (saved) {
                // 评价成功后，更新订单状态为"已完成"（状态5）
                try {
                    Order order = orderService.getById(review.getOrderId());
                    if (order != null && order.getOrderStatus() == 4) { // 只有待评价状态的订单才更新
                        orderService.updateOrderStatus(review.getOrderId(), 5); // 更新为已完成
                    }
                } catch (Exception e) {
                    System.err.println("更新订单状态失败: " + e.getMessage());
                    // 即使更新订单状态失败，评价也已保存，所以继续返回成功
                }
                return ResponseResult.success(review);
            } else {
                return ResponseResult.error("评价失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("评价失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新评价
     */
    @PutMapping
    @Operation(summary = "更新评价")
    public ResponseResult<OrderReview> updateReview(
            Authentication authentication,
            @RequestBody OrderReview review) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查评价是否存在且属于当前用户
            OrderReview existingReview = orderReviewService.getById(review.getId());
            if (existingReview == null) {
                return ResponseResult.error("评价不存在");
            }
            
            if (!existingReview.getUserId().equals(userId)) {
                return ResponseResult.error("无权修改此评价");
            }
            
            boolean updated = orderReviewService.updateReview(review);
            if (updated) {
                return ResponseResult.success(review);
            } else {
                return ResponseResult.error("更新失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除评价
     */
    @DeleteMapping("/{reviewId}")
    @Operation(summary = "删除评价")
    public ResponseResult<String> deleteReview(
            Authentication authentication,
            @PathVariable Long reviewId) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查评价是否存在且属于当前用户
            OrderReview review = orderReviewService.getById(reviewId);
            if (review == null) {
                return ResponseResult.error("评价不存在");
            }
            
            if (!review.getUserId().equals(userId)) {
                return ResponseResult.error("无权删除此评价");
            }
            
            boolean deleted = orderReviewService.deleteReview(reviewId);
            if (deleted) {
                return ResponseResult.success("删除成功");
            } else {
                return ResponseResult.error("删除失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("删除失败: " + e.getMessage());
        }
    }
}

