package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.OrderReview;
import com.example.microservice.user.mapper.OrderReviewMapper;
import com.example.microservice.user.service.OrderReviewService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单评价服务实现类
 */
@Service
public class OrderReviewServiceImpl extends ServiceImpl<OrderReviewMapper, OrderReview> implements OrderReviewService {
    
    @Override
    public List<OrderReview> getReviewsByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderReview::getOrderId, orderId)
               .eq(OrderReview::getStatus, 1)
               .orderByDesc(OrderReview::getCreateTime);
        return list(wrapper);
    }
    
    @Override
    public List<OrderReview> getReviewsByProductId(Long productId) {
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderReview::getProductId, productId)
               .eq(OrderReview::getStatus, 1)
               .orderByDesc(OrderReview::getCreateTime);
        return list(wrapper);
    }
    
    @Override
    public OrderReview getReviewByOrderItemId(Long orderItemId) {
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderReview::getOrderItemId, orderItemId)
               .eq(OrderReview::getStatus, 1)
               .orderByDesc(OrderReview::getCreateTime)
               .last("LIMIT 1");
        return getOne(wrapper);
    }
    
    @Override
    public boolean saveReview(OrderReview review) {
        if (review.getCreateTime() == null) {
            review.setCreateTime(LocalDateTime.now());
        }
        if (review.getUpdateTime() == null) {
            review.setUpdateTime(LocalDateTime.now());
        }
        if (review.getStatus() == null) {
            review.setStatus(1); // 默认正常状态
        }
        return save(review);
    }
    
    @Override
    public boolean updateReview(OrderReview review) {
        review.setUpdateTime(LocalDateTime.now());
        return updateById(review);
    }
    
    @Override
    public boolean deleteReview(Long reviewId) {
        OrderReview review = getById(reviewId);
        if (review != null) {
            review.setStatus(0); // 软删除
            review.setUpdateTime(LocalDateTime.now());
            return updateById(review);
        }
        return false;
    }
}

