package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    @Select("SELECT o.*, u.username " +
            "FROM `order` o " +
            "LEFT JOIN `t_user` u ON o.user_id = u.id " +
            "ORDER BY o.create_time DESC")
    List<Order> selectOrdersWithUser();
    
    @Select("<script>" +
            "SELECT o.*, u.username " +
            "FROM `order` o " +
            "LEFT JOIN `t_user` u ON o.user_id = u.id " +
            "WHERE 1=1 " +
            "<if test='orderNo != null and orderNo != \"\"'>" +
            "AND o.order_no LIKE CONCAT('%', #{orderNo}, '%') " +
            "</if>" +
            "<if test='username != null and username != \"\"'>" +
            "AND u.username LIKE CONCAT('%', #{username}, '%') " +
            "</if>" +
            "<if test='orderStatus != null'>" +
            "AND o.order_status = #{orderStatus} " +
            "</if>" +
            "<if test='payStatus != null'>" +
            "AND o.pay_status = #{payStatus} " +
            "</if>" +
            "<if test='deliveryStatus != null'>" +
            "AND o.delivery_status = #{deliveryStatus} " +
            "</if>" +
            "ORDER BY o.create_time DESC" +
            "</script>")
    List<Order> selectOrdersWithUserByCondition(
            @Param("orderNo") String orderNo,
            @Param("username") String username,
            @Param("orderStatus") Integer orderStatus,
            @Param("payStatus") Integer payStatus,
            @Param("deliveryStatus") Integer deliveryStatus
    );
    
    @Select("<script>" +
            "SELECT o.*, u.username " +
            "FROM `order` o " +
            "LEFT JOIN `t_user` u ON o.user_id = u.id " +
            "WHERE o.user_id = #{userId} " +
            "<if test='orderNo != null and orderNo != \"\"'>" +
            "AND o.order_no LIKE CONCAT('%', #{orderNo}, '%') " +
            "</if>" +
            "<if test='orderStatus != null'>" +
            "AND o.order_status = #{orderStatus} " +
            "</if>" +
            "<if test='payStatus != null'>" +
            "AND o.pay_status = #{payStatus} " +
            "</if>" +
            "<if test='deliveryStatus != null'>" +
            "AND o.delivery_status = #{deliveryStatus} " +
            "</if>" +
            "ORDER BY o.create_time DESC" +
            "</script>")
    List<Order> selectOrdersByUserId(
            @Param("userId") Long userId,
            @Param("orderNo") String orderNo,
            @Param("orderStatus") Integer orderStatus,
            @Param("payStatus") Integer payStatus,
            @Param("deliveryStatus") Integer deliveryStatus
    );
}
