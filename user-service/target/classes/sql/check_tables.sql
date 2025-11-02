-- 检查订单相关表是否存在
SHOW TABLES LIKE 'order';
SHOW TABLES LIKE 'order_item';

-- 如果表不存在，显示错误信息
SELECT 'order表不存在' as message WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'order');
SELECT 'order_item表不存在' as message WHERE NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'order_item');

-- 如果表存在，显示表结构
DESCRIBE `order`;
DESCRIBE `order_item`;

-- 显示表中的数据数量
SELECT COUNT(*) as order_count FROM `order`;
SELECT COUNT(*) as order_item_count FROM `order_item`;
