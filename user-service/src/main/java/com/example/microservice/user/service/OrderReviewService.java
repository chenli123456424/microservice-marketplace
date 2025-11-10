package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.OrderReview;

import java.util.List;

/**
 * 订单评价服务接口
 */
public interface OrderReviewService extends IService<OrderReview> {
    
    /**
     * 根据订单ID获取评价列表
     */
    List<OrderReview> getReviewsByOrderId(Long orderId);
    
    /**
     * 根据商品ID获取评价列表
     */
    List<OrderReview> getReviewsByProductId(Long productId);
    
    /**
     * 根据订单项ID获取评价
     */
    OrderReview getReviewByOrderItemId(Long orderItemId);
    
    /**
     * 保存评价
     */
    boolean saveReview(OrderReview review);
    
    /**
     * 更新评价
     */
    boolean updateReview(OrderReview review);
    
    /**
     * 删除评价
     */
    boolean deleteReview(Long reviewId);
}

