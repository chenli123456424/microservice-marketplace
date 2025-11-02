-- 订单表
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

-- 订单商品详情表
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

-- 插入一些测试数据
INSERT INTO `order` (`order_no`, `user_id`, `total_amount`, `discount_amount`, `pay_amount`, `order_status`, `pay_status`, `pay_method`, `pay_time`, `delivery_status`, `delivery_time`, `receiver_name`, `receiver_phone`, `receiver_address`, `remark`) VALUES
('ORD20241201001', 1, 299.00, 0.00, 299.00, 2, 1, 'alipay', '2024-12-01 10:30:00', 0, NULL, '张三', '13800138001', '北京市朝阳区xxx街道xxx号', '请尽快发货'),
('ORD20241201002', 1, 599.00, 50.00, 549.00, 3, 1, 'wechat', '2024-12-01 14:20:00', 1, '2024-12-01 16:00:00', '李四', '13800138002', '上海市浦东新区xxx路xxx号', ''),
('ORD20241201003', 2, 199.00, 0.00, 199.00, 1, 0, NULL, NULL, 0, NULL, '王五', '13800138003', '广州市天河区xxx大道xxx号', ''),
('ORD20241201004', 2, 899.00, 100.00, 799.00, 4, 1, 'bank', '2024-12-01 09:15:00', 1, '2024-12-01 11:30:00', '赵六', '13800138004', '深圳市南山区xxx路xxx号', '已签收');

INSERT INTO `order_item` (`order_id`, `product_id`, `product_name`, `product_image`, `product_price`, `quantity`, `total_price`, `spec`, `color`) VALUES
(1, 1, '优质瓷砖', '/uploads/product1.jpg', 299.00, 1, 299.00, '800x800mm', '白色'),
(2, 2, '高端卫浴', '/uploads/product2.jpg', 599.00, 1, 599.00, '18L/桶', '黑色'),
(3, 3, '门锁套装', '/uploads/product3.jpg', 199.00, 1, 199.00, '执手+合页(4件套)', '银色'),
(4, 1, '优质瓷砖', '/uploads/product1.jpg', 299.00, 2, 598.00, '800x800mm', '白色'),
(4, 4, '智能马桶', '/uploads/product4.jpg', 301.00, 1, 301.00, '智能款', '白色');
