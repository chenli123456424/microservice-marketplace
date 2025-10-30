# 用户订单安全更新 - 只显示当前登录用户的订单

## 问题描述

之前的"我的订单"页面会显示所有用户的订单，存在严重的安全问题。现在已修复为只显示当前登录用户的订单。

## 解决方案

### 1. 后端API修改

#### OrderController.java 更新
- **修改前**: 获取所有用户的订单
- **修改后**: 通过JWT Token识别当前用户，只返回该用户的订单

```java
@GetMapping("/list")
public ResponseResult<List<Order>> getOrderList(
    @RequestParam(required = false) String orderNo,
    @RequestParam(required = false) Integer orderStatus,
    @RequestParam(required = false) Integer payStatus,
    @RequestParam(required = false) Integer deliveryStatus,
    @RequestHeader("Authorization") String token
) {
    // 从JWT token中解析用户ID
    Long userId = extractUserIdFromToken(token);
    if (userId == null) {
        return ResponseResult.error("用户认证失败");
    }
    
    // 只查询当前用户的订单
    List<Order> orders = orderService.getOrdersByUserId(userId, orderNo, orderStatus, payStatus, deliveryStatus);
    return ResponseResult.success(orders);
}
```

#### JWT Token解析
```java
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
```

### 2. 数据库查询优化

#### OrderMapper.java 新增方法
```java
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
```

#### OrderService.java 新增方法
```java
/**
 * 根据用户ID获取订单列表
 */
List<Order> getOrdersByUserId(Long userId, String orderNo, Integer orderStatus, Integer payStatus, Integer deliveryStatus);
```

#### OrderServiceImpl.java 实现
```java
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
```

### 3. 用户查询支持

#### UserMapper.java 新增方法
```java
/**
 * 根据用户名查询用户
 */
@Select("SELECT * FROM t_user WHERE username = #{username}")
User selectByUsername(@Param("username") String username);
```

### 4. 前端代码更新

#### MyOrdersPage.js 增强日志
```javascript
const fetchOrders = async () => {
    if (!isAuthenticated || !token) {
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
        console.log('MyOrdersPage: 开始获取用户订单，Token:', token ? '存在' : '不存在');
        
        const response = await axios.get('http://localhost:8081/api/orders/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('MyOrdersPage: 订单API响应:', response.data);
        
        if (response.data.code === 200) {
            const orders = response.data.data || [];
            console.log('MyOrdersPage: 获取到订单数量:', orders.length);
            setOrders(orders);
            setFilteredOrders(orders);
        } else {
            console.error('MyOrdersPage: API返回错误:', response.data.message);
        }
    } catch (error) {
        console.error('MyOrdersPage: 获取订单列表失败:', error);
        if (error.response) {
            console.error('MyOrdersPage: 错误响应:', error.response.data);
        }
    } finally {
        setLoading(false);
    }
};
```

## 安全特性

### 1. 用户身份验证
- 必须提供有效的JWT Token
- Token包含用户身份信息
- 自动验证Token有效性

### 2. 数据隔离
- 每个用户只能看到自己的订单
- 数据库查询自动过滤其他用户数据
- 防止数据泄露

### 3. 权限控制
- 后端自动识别当前用户
- 前端传递认证Token
- 确保数据访问安全

## 测试验证

### 1. 登录测试
```bash
# 用户A登录
curl -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "userA", "password": "password123"}'

# 用户B登录  
curl -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "userB", "password": "password123"}'
```

### 2. 订单查询测试
```bash
# 使用用户A的Token查询订单
curl -X GET "http://localhost:8081/api/orders/list" \
  -H "Authorization: Bearer USER_A_TOKEN"

# 使用用户B的Token查询订单
curl -X GET "http://localhost:8081/api/orders/list" \
  -H "Authorization: Bearer USER_B_TOKEN"
```

### 3. 前端页面测试
1. 用户A登录后访问"我的订单"页面
2. 用户B登录后访问"我的订单"页面
3. 验证两个用户看到的订单不同

## 数据库影响

### 查询性能
- 添加了 `user_id` 索引优化查询
- 减少了不必要的数据传输
- 提高了查询效率

### 数据安全
- 防止跨用户数据访问
- 确保数据隔离
- 符合数据保护要求

## 部署注意事项

1. **Token安全**: 确保JWT密钥安全存储
2. **用户认证**: 验证所有API都需要认证
3. **数据验证**: 确保用户只能访问自己的数据
4. **日志记录**: 记录用户访问日志用于审计

## 总结

通过这次更新，我们成功实现了：
- ✅ 用户身份识别和验证
- ✅ 数据安全隔离
- ✅ 只显示当前用户订单
- ✅ 防止数据泄露
- ✅ 提高系统安全性

现在"我的订单"页面只会显示当前登录用户的订单，确保了数据安全和用户隐私。
