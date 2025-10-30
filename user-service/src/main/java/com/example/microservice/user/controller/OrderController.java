package com.example.microservice.user.controller;

import com.example.microservice.user.dto.CreateOrderRequest;
import com.example.microservice.user.dto.CreateOrderResponse;
import com.example.microservice.user.dto.PayStatusRequest;
import com.example.microservice.user.entity.Order;
import com.example.microservice.user.entity.OrderItem;
import com.example.microservice.user.service.OrderService;
import com.example.microservice.user.util.ResponseResult;
import com.example.microservice.user.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "订单管理", description = "订单相关接口")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserMapper userMapper;

    @GetMapping("/admin/list")
    @Operation(summary = "管理员获取所有订单列表")
    public ResponseResult<List<Order>> getAdminOrderList(
            @Parameter(description = "订单号") @RequestParam(required = false) String orderNo,
            @Parameter(description = "用户名") @RequestParam(required = false) String username,
            @Parameter(description = "订单状态") @RequestParam(required = false) Integer orderStatus,
            @Parameter(description = "支付状态") @RequestParam(required = false) Integer payStatus,
            @Parameter(description = "发货状态") @RequestParam(required = false) Integer deliveryStatus
    ) {
        try {
            System.out.println("管理员获取订单列表，搜索条件: orderNo=" + orderNo + 
                             ", username=" + username + ", orderStatus=" + orderStatus + 
                             ", payStatus=" + payStatus + ", deliveryStatus=" + deliveryStatus);
            List<Order> orders = orderService.getAllOrdersWithUser(orderNo, username, orderStatus, payStatus, deliveryStatus);
            System.out.println("获取到订单数量: " + (orders != null ? orders.size() : 0));
            
            // 为每个订单加载订单商品
            if (orders != null) {
                for (Order order : orders) {
                    List<OrderItem> orderItems = orderService.getOrderWithItems(order.getOrderId()).getOrderItems();
                    order.setOrderItems(orderItems);
                }
            }
            
            return ResponseResult.success(orders);
        } catch (Exception e) {
            System.err.println("管理员获取订单列表失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("获取订单列表失败: " + e.getMessage());
        }
    }
    
    @GetMapping("/list")
    @Operation(summary = "获取当前用户的订单列表")
    public ResponseResult<List<Order>> getOrderList(
            @Parameter(description = "订单号") @RequestParam(required = false) String orderNo,
            @Parameter(description = "订单状态") @RequestParam(required = false) Integer orderStatus,
            @Parameter(description = "支付状态") @RequestParam(required = false) Integer payStatus,
            @Parameter(description = "发货状态") @RequestParam(required = false) Integer deliveryStatus,
            @RequestHeader("Authorization") String token
    ) {
        try {
            // 从JWT token中解析用户ID
            Long userId = extractUserIdFromToken(token);
            if (userId == null) {
                return ResponseResult.error("用户认证失败");
            }
            
            System.out.println("开始获取用户订单列表，用户ID: " + userId + ", 搜索条件: orderNo=" + orderNo + 
                             ", orderStatus=" + orderStatus + ", payStatus=" + payStatus + ", deliveryStatus=" + deliveryStatus);
            List<Order> orders = orderService.getOrdersByUserId(userId, orderNo, orderStatus, payStatus, deliveryStatus);
            System.out.println("获取到订单数量: " + (orders != null ? orders.size() : 0));
            if (orders != null && !orders.isEmpty()) {
                System.out.println("第一个订单信息: " + orders.get(0));
            }
            return ResponseResult.success(orders);
        } catch (Exception e) {
            System.err.println("获取订单列表失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("获取订单列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    @Operation(summary = "测试订单API")
    public ResponseResult<String> testOrderApi() {
        try {
            System.out.println("订单API测试接口被调用");
            return ResponseResult.success("订单API工作正常");
        } catch (Exception e) {
            System.err.println("订单API测试失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("订单API测试失败: " + e.getMessage());
        }
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "获取订单详情")
    public ResponseResult<Order> getOrderDetail(
            @Parameter(description = "订单ID") @PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderWithItems(orderId);
            if (order != null) {
                return ResponseResult.success(order);
            } else {
                return ResponseResult.error("订单不存在");
            }
        } catch (Exception e) {
            return ResponseResult.error("获取订单详情失败: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/status")
    @Operation(summary = "更新订单状态")
    public ResponseResult<String> updateOrderStatus(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @Parameter(description = "订单状态") @RequestParam Integer status) {
        try {
            boolean success = orderService.updateOrderStatus(orderId, status);
            if (success) {
                return ResponseResult.success("订单状态更新成功");
            } else {
                return ResponseResult.error("订单状态更新失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新订单状态失败: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/pay-status")
    @Operation(summary = "更新支付状态")
    public ResponseResult<String> updatePayStatus(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @RequestBody PayStatusRequest request) {
        try {
            System.out.println("更新支付状态，订单ID: " + orderId + ", 支付状态: " + request.getPayStatus() + ", 支付方式: " + request.getPayMethod());
            boolean success = orderService.updatePayStatus(orderId, request.getPayStatus(), request.getPayMethod());
            if (success) {
                return ResponseResult.success("支付状态更新成功");
            } else {
                return ResponseResult.error("支付状态更新失败");
            }
        } catch (Exception e) {
            System.err.println("更新支付状态失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("更新支付状态失败: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/delivery-status")
    @Operation(summary = "更新发货状态")
    public ResponseResult<String> updateDeliveryStatus(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @Parameter(description = "发货状态") @RequestParam Integer deliveryStatus) {
        try {
            boolean success = orderService.updateDeliveryStatus(orderId, deliveryStatus);
            if (success) {
                return ResponseResult.success("发货状态更新成功");
            } else {
                return ResponseResult.error("发货状态更新失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新发货状态失败: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/cancel")
    @Operation(summary = "取消订单")
    public ResponseResult<String> cancelOrder(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @Parameter(description = "取消原因") @RequestParam(required = false) String reason,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            System.out.println("取消订单请求，订单ID: " + orderId + ", 原因: " + reason);
            
            // 如果有token，验证是否是订单所有者
            if (token != null && !token.isEmpty()) {
                Long userId = extractUserIdFromToken(token);
                Order order = orderService.getOrderWithItems(orderId);
                if (order != null && userId != null && !order.getUserId().equals(userId)) {
                    return ResponseResult.error("无权取消此订单");
                }
            }
            
            boolean success = orderService.cancelOrder(orderId, reason);
            if (success) {
                return ResponseResult.success("订单取消成功");
            } else {
                return ResponseResult.error("订单取消失败");
            }
        } catch (Exception e) {
            System.err.println("取消订单失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("取消订单失败: " + e.getMessage());
        }
    }

    @PutMapping("/{orderId}/confirm-receipt")
    @Operation(summary = "确认收货")
    public ResponseResult<String> confirmReceipt(
            @Parameter(description = "订单ID") @PathVariable Long orderId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            System.out.println("确认收货请求，订单ID: " + orderId);
            
            // 验证token
            if (token == null || token.isEmpty()) {
                return ResponseResult.error("请先登录");
            }
            
            // 验证是否是订单所有者
            Long userId = extractUserIdFromToken(token);
            Order order = orderService.getOrderWithItems(orderId);
            if (order == null) {
                return ResponseResult.error("订单不存在");
            }
            
            if (userId == null || !order.getUserId().equals(userId)) {
                return ResponseResult.error("无权操作此订单");
            }
            
            // 验证订单状态，只有待收货（状态3）的订单才能确认收货
            if (order.getOrderStatus() != 3) {
                return ResponseResult.error("该订单当前状态不允许确认收货");
            }
            
            boolean success = orderService.confirmReceipt(orderId);
            if (success) {
                return ResponseResult.success("确认收货成功");
            } else {
                return ResponseResult.error("确认收货失败");
            }
        } catch (Exception e) {
            System.err.println("确认收货失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("确认收货失败: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    @Operation(summary = "创建订单")
    public ResponseResult<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            System.out.println("开始创建订单，用户ID: " + request.getUserId());
            System.out.println("订单项数量: " + (request.getOrderItems() != null ? request.getOrderItems().size() : 0));
            
            CreateOrderResponse response = orderService.createOrder(request);
            
            System.out.println("订单创建成功，订单号: " + response.getOrderNo());
            return ResponseResult.success(response);
        } catch (Exception e) {
            System.err.println("创建订单失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("创建订单失败: " + e.getMessage());
        }
    }
    
    /**
     * 从JWT token中解析用户ID
     */
    private Long extractUserIdFromToken(String token) {
        try {
            // 移除 "Bearer " 前缀
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // 使用JwtUtil解析token获取用户名
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                return null;
            }
            
            // 根据用户名查询用户ID
            User user = userMapper.selectByUsername(username);
            if (user != null) {
                return user.getId();
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("解析JWT token失败: " + e.getMessage());
            return null;
        }
    }
}
