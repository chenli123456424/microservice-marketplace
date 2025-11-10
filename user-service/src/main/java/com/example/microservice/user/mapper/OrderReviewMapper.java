package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.OrderReview;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单评价Mapper
 */
@Mapper
public interface OrderReviewMapper extends BaseMapper<OrderReview> {
}

