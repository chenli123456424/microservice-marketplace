# 我的订单功能实现

## 功能概述

根据小米商城的"我的订单"页面效果，为项目创建了完整的订单管理功能，包括：

1. **我的订单页面** (`/orders`)
   - 参考小米商城设计风格
   - 支持订单状态筛选（全部、待支付、待收货、已完成）
   - 支持订单搜索功能
   - 显示订单详细信息

2. **订单状态管理**
   - 待付款 (1)
   - 已付款 (2) 
   - 已发货 (3)
   - 已完成 (4)
   - 已取消 (5)

3. **订单操作功能**
   - 根据订单状态显示相应操作按钮
   - 取消订单、立即付款、查看物流、确认收货等

## 文件结构

### 前端文件
- `frontend-app/src/pages/MyOrdersPage.js` - 我的订单页面组件
- `frontend-app/src/pages/MyOrdersPage.css` - 订单页面样式
- `frontend-app/src/App.js` - 添加了订单页面路由

### 后端文件（已存在）
- `user-service/src/main/java/com/example/microservice/user/entity/Order.java` - 订单实体
- `user-service/src/main/java/com/example/microservice/user/entity/OrderItem.java` - 订单商品实体
- `user-service/src/main/java/com/example/microservice/user/controller/OrderController.java` - 订单控制器
- `user-service/src/main/java/com/example/microservice/user/service/OrderService.java` - 订单服务接口

## 数据库表结构

### 订单表 (`order`)
```sql
CREATE TABLE IF NOT EXISTS `order` (
    `order_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` varchar(50) NOT NULL COMMENT '订单号',
    `user_id` bigint(20) NOT NULL COMMENT '用户ID',
    `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
    `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额',
    `pay_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '实付金额',
    `order_status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '订单状态：1-待付款，2-已付款，3-已发货，4-已完成，5-已取消',
    `pay_status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '支付状态：0-未支付，1-已支付',
    `pay_method` varchar(20) DEFAULT NULL COMMENT '支付方式：alipay-支付宝，wechat-微信，bank-银行卡',
    `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
    `delivery_status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '发货状态：0-未发货，1-已发货',
    `delivery_time` datetime DEFAULT NULL COMMENT '发货时间',
    `receiver_name` varchar(50) NOT NULL COMMENT '收货人姓名',
    `receiver_phone` varchar(20) NOT NULL COMMENT '收货人电话',
    `receiver_address` varchar(200) NOT NULL COMMENT '收货地址',
    `remark` varchar(500) DEFAULT NULL COMMENT '订单备注',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`order_id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_order_status` (`order_status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
```

### 订单商品表 (`order_item`)
```sql
CREATE TABLE IF NOT EXISTS `order_item` (
    `item_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '订单商品ID',
    `order_id` bigint(20) NOT NULL COMMENT '订单ID',
    `product_id` bigint(20) NOT NULL COMMENT '商品ID',
    `product_name` varchar(100) NOT NULL COMMENT '商品名称',
    `product_image` varchar(200) DEFAULT NULL COMMENT '商品图片',
    `product_price` decimal(10,2) NOT NULL COMMENT '商品单价',
    `quantity` int(11) NOT NULL COMMENT '购买数量',
    `total_price` decimal(10,2) NOT NULL COMMENT '商品总价',
    `spec` varchar(100) DEFAULT NULL COMMENT '商品规格',
    `color` varchar(50) DEFAULT NULL COMMENT '商品颜色',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`item_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品详情表';
```

## API接口

### 获取订单列表
- **URL**: `GET /api/orders/list`
- **Headers**: `Authorization: Bearer {token}`
- **参数**: 
  - `orderNo` (可选): 订单号
  - `username` (可选): 用户名
  - `orderStatus` (可选): 订单状态
  - `payStatus` (可选): 支付状态
  - `deliveryStatus` (可选): 发货状态

### 获取订单详情
- **URL**: `GET /api/orders/{orderId}`
- **Headers**: `Authorization: Bearer {token}`

### 更新订单状态
- **URL**: `PUT /api/orders/{orderId}/status`
- **参数**: `status` - 订单状态

### 更新支付状态
- **URL**: `PUT /api/orders/{orderId}/pay-status`
- **Body**: `{"payStatus": 1, "payMethod": "alipay"}`

## 功能特性

### 1. 订单状态筛选
- 全部有效订单
- 待支付
- 待收货
- 已完成

### 2. 搜索功能
- 支持按商品名称搜索
- 支持按订单号搜索

### 3. 订单信息展示
- 订单基本信息（订单号、创建时间、状态）
- 商品详情（图片、名称、规格、数量、价格）
- 收货信息（收货人、电话、地址）
- 金额信息（商品总价、优惠金额、实付金额）

### 4. 订单操作
根据订单状态显示不同的操作按钮：
- **待付款**: 取消订单、立即付款
- **已付款**: 联系客服
- **已发货**: 查看物流、确认收货
- **已完成**: 评价晒单、再次购买
- **已取消**: 再次购买

## 样式设计

参考小米商城的"我的订单"页面设计：
- 左侧导航栏（订单中心、个人中心、售后服务、账户管理）
- 主内容区域包含：
  - 面包屑导航
  - 页面标题和安全提示
  - 订单状态标签页
  - 搜索功能
  - 订单列表展示

## 使用方法

1. 用户登录后，点击顶部导航栏的用户头像
2. 在下拉菜单中选择"我的订单"
3. 系统会跳转到订单页面 (`/orders`)
4. 可以查看所有订单，按状态筛选，或搜索特定订单

## 技术实现

- **前端**: React + CSS3
- **后端**: Spring Boot + MyBatis Plus
- **数据库**: MySQL
- **认证**: JWT Token
- **API**: RESTful接口

## 注意事项

1. 需要用户登录才能访问订单页面
2. 订单数据通过JWT Token进行身份验证
3. 支持响应式设计，适配移动端
4. 订单状态和操作按钮根据实际业务逻辑动态显示
