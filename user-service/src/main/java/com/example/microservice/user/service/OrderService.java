package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.dto.CreateOrderRequest;
import com.example.microservice.user.dto.CreateOrderResponse;
import com.example.microservice.user.entity.Order;

import java.util.List;

public interface OrderService extends IService<Order> {
    
    /**
     * 获取所有订单（包含用户信息）
     */
    List<Order> getAllOrdersWithUser();
    
    /**
     * 根据条件获取订单列表（包含用户信息）
     */
    List<Order> getAllOrdersWithUser(String orderNo, String username, Integer orderStatus, Integer payStatus, Integer deliveryStatus);
    
    /**
     * 根据用户ID获取订单列表
     */
    List<Order> getOrdersByUserId(Long userId, String orderNo, Integer orderStatus, Integer payStatus, Integer deliveryStatus);
    
    /**
     * 根据订单ID获取订单详情（包含订单商品）
     */
    Order getOrderWithItems(Long orderId);
    
    /**
     * 更新订单状态
     */
    boolean updateOrderStatus(Long orderId, Integer status);
    
    /**
     * 更新支付状态
     */
    boolean updatePayStatus(Long orderId, Integer payStatus, String payMethod);
    
    /**
     * 更新发货状态
     */
    boolean updateDeliveryStatus(Long orderId, Integer deliveryStatus);
    
    /**
     * 取消订单
     * @param orderId 订单ID
     * @param reason 取消原因
     * @return 是否成功
     */
    boolean cancelOrder(Long orderId, String reason);
    
    /**
     * 创建订单
     * @param request 创建订单请求
     * @return 创建订单响应
     */
    CreateOrderResponse createOrder(CreateOrderRequest request);
}
