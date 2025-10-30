package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {

    @Select("SELECT oi.*, " +
            "(SELECT pi.image_url FROM product_image pi WHERE pi.product_id = oi.product_id ORDER BY pi.sort LIMIT 1) as productImage " +
            "FROM order_item oi WHERE oi.order_id = #{orderId}")
    List<OrderItem> selectByOrderId(Long orderId);
}
