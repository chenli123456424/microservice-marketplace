package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.dto.CreateOrderRequest;
import com.example.microservice.user.dto.CreateOrderResponse;
import com.example.microservice.user.entity.Order;
import com.example.microservice.user.entity.OrderItem;
import com.example.microservice.user.entity.Product;
import com.example.microservice.user.mapper.OrderItemMapper;
import com.example.microservice.user.mapper.OrderMapper;
import com.example.microservice.user.mapper.ProductMapper;
import com.example.microservice.user.mapper.CartItemMapper;
import com.example.microservice.user.service.OrderService;
import com.example.microservice.user.util.OrderNumberGenerator;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private OrderItemMapper orderItemMapper;
    
    @Autowired
    private ProductMapper productMapper;
    
    @Autowired
    private CartItemMapper cartItemMapper;

    @Override
    public List<Order> getAllOrdersWithUser() {
        System.out.println("OrderService: 开始查询订单列表...");
        try {
            // 先测试基本查询
            List<Order> allOrders = orderMapper.selectList(null);
            System.out.println("OrderService: 基本查询订单数量: " + (allOrders != null ? allOrders.size() : 0));
            
            // 再测试带用户信息的查询
            List<Order> orders = orderMapper.selectOrdersWithUser();
            System.out.println("OrderService: 带用户信息查询订单数量: " + (orders != null ? orders.size() : 0));
            return orders;
        } catch (Exception e) {
            System.err.println("OrderService: 查询订单列表失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public List<Order> getAllOrdersWithUser(String orderNo, String username, Integer orderStatus, Integer payStatus, Integer deliveryStatus) {
        System.out.println("OrderService: 开始根据条件查询订单列表...");
        try {
            List<Order> orders = orderMapper.selectOrdersWithUserByCondition(orderNo, username, orderStatus, payStatus, deliveryStatus);
            System.out.println("OrderService: 条件查询订单数量: " + (orders != null ? orders.size() : 0));
            return orders;
        } catch (Exception e) {
            System.err.println("OrderService: 条件查询订单列表失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public List<Order> getOrdersByUserId(Long userId, String orderNo, Integer orderStatus, Integer payStatus, Integer deliveryStatus) {
        System.out.println("OrderService: 开始根据用户ID查询订单列表，用户ID: " + userId);
        try {
            List<Order> orders = orderMapper.selectOrdersByUserId(userId, orderNo, orderStatus, payStatus, deliveryStatus);
            System.out.println("OrderService: 用户订单查询数量: " + (orders != null ? orders.size() : 0));
            
            // 为每个订单加载订单商品
            if (orders != null) {
                for (Order order : orders) {
                    List<OrderItem> orderItems = orderItemMapper.selectByOrderId(order.getOrderId());
                    order.setOrderItems(orderItems);
                }
            }
            
            return orders;
        } catch (Exception e) {
            System.err.println("OrderService: 用户订单查询失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Order getOrderWithItems(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order != null) {
            List<OrderItem> orderItems = orderItemMapper.selectByOrderId(orderId);
            order.setOrderItems(orderItems);
        }
        return order;
    }

    @Override
    @Transactional
    public boolean updateOrderStatus(Long orderId, Integer status) {
        Order order = new Order();
        order.setOrderId(orderId);
        order.setOrderStatus(status);
        order.setUpdateTime(LocalDateTime.now());
        return orderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean updatePayStatus(Long orderId, Integer payStatus, String payMethod) {
        Order order = new Order();
        order.setOrderId(orderId);
        order.setPayStatus(payStatus);
        order.setPayMethod(payMethod);
        order.setUpdateTime(LocalDateTime.now());
        
        if (payStatus == 1) { // 已支付
            order.setPayTime(LocalDateTime.now());
            order.setOrderStatus(2); // 同时更新订单状态为"已付款"
        }
        
        return orderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean updateDeliveryStatus(Long orderId, Integer deliveryStatus) {
        Order order = new Order();
        order.setOrderId(orderId);
        order.setDeliveryStatus(deliveryStatus);
        order.setUpdateTime(LocalDateTime.now());
        
        if (deliveryStatus == 1) { // 已发货
            order.setDeliveryTime(LocalDateTime.now());
        }
        
        return orderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean cancelOrder(Long orderId, String reason) {
        System.out.println("OrderService: 开始取消订单，订单ID: " + orderId);
        
        try {
            // 1. 获取订单信息
            Order existingOrder = orderMapper.selectById(orderId);
            if (existingOrder == null) {
                throw new RuntimeException("订单不存在");
            }
            
            // 2. 检查订单状态（只有待付款和已付款的订单可以取消）
            if (existingOrder.getOrderStatus() != 1 && existingOrder.getOrderStatus() != 2) {
                throw new RuntimeException("当前订单状态不允许取消");
            }
            
            // 3. 获取订单商品，恢复库存
            List<OrderItem> orderItems = orderItemMapper.selectByOrderId(orderId);
            for (OrderItem item : orderItems) {
                Product product = productMapper.selectById(item.getProductId());
                if (product != null) {
                    // 恢复库存
                    Product updateProduct = new Product();
                    updateProduct.setProductId(product.getProductId());
                    updateProduct.setStock(product.getStock() + item.getQuantity());
                    updateProduct.setSalesCount(Math.max(0, product.getSalesCount() - item.getQuantity()));
                    productMapper.updateById(updateProduct);
                    
                    System.out.println("OrderService: 恢复库存，商品ID: " + item.getProductId() + 
                        ", 恢复数量: " + item.getQuantity() + ", 当前库存: " + updateProduct.getStock());
                }
            }
            
            // 4. 更新订单状态为已取消
            Order order = new Order();
            order.setOrderId(orderId);
            order.setOrderStatus(5); // 已取消
            if (reason != null && !reason.isEmpty()) {
                order.setRemark(existingOrder.getRemark() != null ? 
                    existingOrder.getRemark() + " | 取消原因: " + reason : 
                    "取消原因: " + reason);
            }
            order.setUpdateTime(LocalDateTime.now());
            
            boolean success = orderMapper.updateById(order) > 0;
            System.out.println("OrderService: 订单取消" + (success ? "成功" : "失败"));
            
            return success;
        } catch (Exception e) {
            System.err.println("OrderService: 取消订单失败: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        System.out.println("OrderService: 开始创建订单，用户ID: " + request.getUserId());
        
        // 1. 生成订单号
        String orderNo = OrderNumberGenerator.generateOrderNumber();
        System.out.println("OrderService: 生成订单号: " + orderNo);
        
        // 2. 计算订单总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            // 获取商品信息
            Product product = productMapper.selectById(itemRequest.getProductId());
            if (product == null) {
                throw new RuntimeException("商品不存在，商品ID: " + itemRequest.getProductId());
            }
            
            // 检查库存
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("商品库存不足，商品: " + product.getName() + 
                    "，当前库存: " + product.getStock() + "，需要数量: " + itemRequest.getQuantity());
            }
            
            // 计算商品总价
            BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }
        
        // 3. 创建订单
        Order order = new Order();
        order.setOrderNo(orderNo);
        order.setUserId(request.getUserId());
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(BigDecimal.ZERO); // 暂时没有折扣
        order.setPayAmount(totalAmount);
        order.setOrderStatus(1); // 待付款
        order.setPayStatus(0); // 未支付
        order.setPayMethod(request.getPayMethod());
        order.setDeliveryStatus(0); // 未发货
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverAddress(request.getReceiverAddress());
        order.setRemark(request.getRemark());
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        
        // 4. 保存订单
        int orderResult = orderMapper.insert(order);
        if (orderResult <= 0) {
            throw new RuntimeException("创建订单失败");
        }
        
        System.out.println("OrderService: 订单创建成功，订单ID: " + order.getOrderId());
        
        // 5. 创建订单项
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productMapper.selectById(itemRequest.getProductId());
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getOrderId());
            orderItem.setProductId(itemRequest.getProductId());
            orderItem.setProductName(product.getName());
            // 不再设置productImage，因为查询时会从product_image表实时获取
            // orderItem.setProductImage(getProductImage(product.getProductId()));
            orderItem.setProductPrice(product.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setTotalPrice(product.getPrice().multiply(new BigDecimal(itemRequest.getQuantity())));
            orderItem.setSpec(itemRequest.getSpec());
            orderItem.setColor(itemRequest.getColor());
            orderItem.setCreateTime(LocalDateTime.now());
            orderItem.setUpdateTime(LocalDateTime.now());
            
            int itemResult = orderItemMapper.insert(orderItem);
            if (itemResult <= 0) {
                throw new RuntimeException("创建订单项失败");
            }
            
            // 6. 更新商品库存
            Product updateProduct = new Product();
            updateProduct.setProductId(product.getProductId());
            updateProduct.setStock(product.getStock() - itemRequest.getQuantity());
            updateProduct.setSalesCount(product.getSalesCount() + itemRequest.getQuantity());
            productMapper.updateById(updateProduct);
            
            System.out.println("OrderService: 订单项创建成功，商品: " + product.getName() + 
                "，数量: " + itemRequest.getQuantity());
        }
        
        // 7. 删除购物车中的商品（如果是购物车结算）
        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getOrderItems()) {
            // 删除购物车中对应的商品
            int deleteResult = cartItemMapper.deleteByUserIdAndProductIdAndSpecAndColor(
                request.getUserId(), 
                itemRequest.getProductId(), 
                itemRequest.getSpec(), 
                itemRequest.getColor()
            );
            System.out.println("OrderService: 删除购物车商品，商品ID: " + itemRequest.getProductId() + 
                "，规格: " + itemRequest.getSpec() + "，颜色: " + itemRequest.getColor() + 
                "，删除结果: " + deleteResult);
        }
        
        // 8. 构建响应
        CreateOrderResponse response = new CreateOrderResponse();
        BeanUtils.copyProperties(order, response);
        
        System.out.println("OrderService: 订单创建完成，订单号: " + orderNo);
        return response;
    }
}
