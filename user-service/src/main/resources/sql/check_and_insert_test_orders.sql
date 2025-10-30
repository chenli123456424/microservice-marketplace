-- 检查并插入测试订单数据
-- 数据库: ecommerce_user
-- 端口: 3307

-- 1. 检查订单表是否存在
SELECT 'Checking if order table exists...' as status;
SHOW TABLES LIKE 'order';

-- 2. 检查订单商品表是否存在
SELECT 'Checking if order_item table exists...' as status;
SHOW TABLES LIKE 'order_item';

-- 3. 检查现有订单数量
SELECT 'Current order count:' as status, COUNT(*) as count FROM `order`;

-- 4. 检查用户表数据
SELECT 'Users in database:' as status;
SELECT id, username, email FROM `t_user` LIMIT 5;

-- 5. 如果订单数量为0，插入测试订单
-- 注意：请根据实际的用户ID修改以下SQL

-- 首先删除可能存在的测试订单（如果需要重新插入）
-- DELETE FROM `order_item` WHERE order_id IN (SELECT order_id FROM `order` WHERE order_no LIKE 'TEST%');
-- DELETE FROM `order` WHERE order_no LIKE 'TEST%';

-- 插入测试订单（请确保user_id对应数据库中存在的用户）
INSERT INTO `order` (`order_no`, `user_id`, `total_amount`, `discount_amount`, `pay_amount`, `order_status`, `pay_status`, `pay_method`, `pay_time`, `delivery_status`, `delivery_time`, `receiver_name`, `receiver_phone`, `receiver_address`, `remark`, `create_time`, `update_time`) 
VALUES
('TEST20251030001', 1, 299.00, 0.00, 299.00, 2, 1, 'alipay', '2024-10-30 10:30:00', 0, NULL, '张三', '13800138001', '北京市朝阳区测试街道123号', '测试订单1', NOW(), NOW()),
('TEST20251030002', 1, 599.00, 50.00, 549.00, 3, 1, 'wechat', '2024-10-30 14:20:00', 1, '2024-10-30 16:00:00', '李四', '13800138002', '上海市浦东新区测试路456号', '测试订单2', NOW(), NOW()),
('TEST20251030003', 1, 199.00, 0.00, 199.00, 1, 0, NULL, NULL, 0, NULL, '王五', '13800138003', '广州市天河区测试大道789号', '测试订单3', NOW(), NOW())
ON DUPLICATE KEY UPDATE order_no=order_no;

-- 获取刚插入订单的ID（假设从1开始，如果已有订单，请根据实际情况调整）
SET @order_id_1 = (SELECT order_id FROM `order` WHERE order_no = 'TEST20251030001');
SET @order_id_2 = (SELECT order_id FROM `order` WHERE order_no = 'TEST20251030002');
SET @order_id_3 = (SELECT order_id FROM `order` WHERE order_no = 'TEST20251030003');

-- 插入订单商品（请确保product_id对应数据库中存在的商品）
INSERT INTO `order_item` (`order_id`, `product_id`, `product_name`, `product_image`, `product_price`, `quantity`, `total_price`, `spec`, `color`, `create_time`, `update_time`) 
VALUES
(@order_id_1, 1, '测试商品1', '/uploads/test1.jpg', 299.00, 1, 299.00, '标准规格', '白色', NOW(), NOW()),
(@order_id_2, 2, '测试商品2', '/uploads/test2.jpg', 599.00, 1, 599.00', '高级规格', '黑色', NOW(), NOW()),
(@order_id_3, 3, '测试商品3', '/uploads/test3.jpg', 199.00, 1, 199.00, '基础规格', '银色', NOW(), NOW())
ON DUPLICATE KEY UPDATE item_id=item_id;

-- 6. 验证插入结果
SELECT 'Order count after insert:' as status, COUNT(*) as count FROM `order`;
SELECT 'Order item count after insert:' as status, COUNT(*) as count FROM `order_item`;

-- 7. 显示所有订单
SELECT 'All orders:' as status;
SELECT o.order_id, o.order_no, o.user_id, u.username, o.total_amount, o.pay_amount, o.order_status, o.pay_status, o.delivery_status, o.create_time
FROM `order` o
LEFT JOIN `t_user` u ON o.user_id = u.id
ORDER BY o.create_time DESC;

-- 8. 显示所有订单商品
SELECT 'All order items:' as status;
SELECT oi.item_id, oi.order_id, oi.product_id, oi.product_name, oi.quantity, oi.product_price, oi.total_price
FROM `order_item` oi
ORDER BY oi.order_id, oi.item_id;

