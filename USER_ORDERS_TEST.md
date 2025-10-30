# 用户订单功能测试指南

## 功能说明

现在"我的订单"页面已经修改为只显示当前登录用户的订单，而不是所有用户的订单。系统通过JWT Token识别当前登录用户，确保数据安全。

## 技术实现

### 1. 前端认证机制
- 使用 `AuthContext` 管理用户登录状态
- 从 `localStorage` 获取JWT Token
- 在API请求中携带 `Authorization: Bearer {token}` 头部

### 2. 后端认证机制
- 从请求头中提取JWT Token
- 解析Token获取用户ID
- 根据用户ID查询订单数据

### 3. 数据库查询优化
- 新增 `selectOrdersByUserId` 方法
- 只查询指定用户的订单
- 支持按订单状态、支付状态等条件筛选

## 测试步骤

### 1. 用户登录测试
```bash
# 1. 用户登录获取Token
curl -X POST "http://localhost:8081/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. 获取用户订单测试
```bash
# 2. 使用Token获取用户订单
curl -X GET "http://localhost:8081/api/orders/list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. 前端页面测试
1. 打开浏览器访问 `http://localhost:3000`
2. 点击登录，输入用户名和密码
3. 登录成功后，点击顶部导航栏的用户头像
4. 选择"我的订单"
5. 验证只显示当前用户的订单

## API接口变更

### 修改前
```java
@GetMapping("/list")
public ResponseResult<List<Order>> getOrderList(
    @RequestParam(required = false) String orderNo,
    @RequestParam(required = false) String username,
    @RequestParam(required = false) Integer orderStatus,
    @RequestParam(required = false) Integer payStatus,
    @RequestParam(required = false) Integer deliveryStatus
)
```

### 修改后
```java
@GetMapping("/list")
public ResponseResult<List<Order>> getOrderList(
    @RequestParam(required = false) String orderNo,
    @RequestParam(required = false) Integer orderStatus,
    @RequestParam(required = false) Integer payStatus,
    @RequestParam(required = false) Integer deliveryStatus,
    @RequestHeader("Authorization") String token
)
```

## 安全特性

1. **用户隔离**: 每个用户只能看到自己的订单
2. **Token验证**: 必须提供有效的JWT Token
3. **身份识别**: 从Token中自动提取用户ID
4. **数据过滤**: 后端自动过滤非当前用户的订单

## 错误处理

### 常见错误情况
1. **Token无效**: 返回"用户认证失败"
2. **Token过期**: 需要重新登录
3. **用户未登录**: 前端显示登录提示

### 调试信息
- 前端控制台会显示详细的请求和响应信息
- 后端日志会记录用户ID和查询结果
- 可以通过浏览器开发者工具查看网络请求

## 数据库查询示例

```sql
-- 查询特定用户的订单
SELECT o.*, u.username 
FROM `order` o 
LEFT JOIN `t_user` u ON o.user_id = u.id 
WHERE o.user_id = 1  -- 当前用户ID
ORDER BY o.create_time DESC;

-- 查询特定用户特定状态的订单
SELECT o.*, u.username 
FROM `order` o 
LEFT JOIN `t_user` u ON o.user_id = u.id 
WHERE o.user_id = 1 
AND o.order_status = 1  -- 待付款
ORDER BY o.create_time DESC;
```

## 注意事项

1. **Token安全**: JWT Token包含用户敏感信息，需要妥善保管
2. **会话管理**: 用户登出时需要清理Token
3. **权限控制**: 确保用户只能访问自己的数据
4. **性能优化**: 大量订单时考虑分页查询

## 测试数据

可以使用以下SQL插入测试数据：

```sql
-- 插入测试用户
INSERT INTO `t_user` (username, password, email) VALUES 
('testuser1', 'password123', 'test1@example.com'),
('testuser2', 'password123', 'test2@example.com');

-- 插入测试订单
INSERT INTO `order` (order_no, user_id, total_amount, pay_amount, order_status, pay_status, receiver_name, receiver_phone, receiver_address) VALUES 
('ORD001', 1, 299.00, 299.00, 1, 0, '张三', '13800138001', '北京市朝阳区xxx街道'),
('ORD002', 1, 599.00, 599.00, 2, 1, '张三', '13800138001', '北京市朝阳区xxx街道'),
('ORD003', 2, 199.00, 199.00, 1, 0, '李四', '13800138002', '上海市浦东新区xxx路');
```

这样，用户1登录后只能看到ORD001和ORD002，用户2登录后只能看到ORD003。
