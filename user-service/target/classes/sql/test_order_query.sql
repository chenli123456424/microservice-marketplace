-- 测试订单查询SQL
-- 这个脚本用于验证修复后的SQL语法是否正确

-- 测试基本查询
SELECT * FROM `order` LIMIT 1;

-- 测试带用户信息的查询
SELECT o.*, u.username 
FROM `order` o 
LEFT JOIN `user` u ON o.user_id = u.id 
ORDER BY o.create_time DESC 
LIMIT 1;

-- 测试订单商品查询
SELECT * FROM `order_item` WHERE order_id = 1 LIMIT 1;

-- 显示表结构
DESCRIBE `order`;
DESCRIBE `order_item`;
