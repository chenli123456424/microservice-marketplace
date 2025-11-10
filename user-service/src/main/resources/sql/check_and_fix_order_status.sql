-- 检查并修复订单状态
-- 问题：旧的订单状态定义中，状态5是"已取消"，但现在新逻辑中状态5是"已完成"，状态6是"退款/售后"
-- 需要将旧的"已取消"订单（状态5）更新为"退款/售后"（状态6）

-- 1. 先查看当前订单状态分布
SELECT 
    order_status,
    COUNT(*) as count,
    CASE 
        WHEN order_status = 1 THEN '待付款'
        WHEN order_status = 2 THEN '待发货'
        WHEN order_status = 3 THEN '待收货'
        WHEN order_status = 4 THEN '待评价'
        WHEN order_status = 5 THEN '已完成（新）或已取消（旧）'
        WHEN order_status = 6 THEN '退款/售后'
        ELSE '未知状态'
    END as status_desc
FROM `order`
GROUP BY order_status
ORDER BY order_status;

-- 2. 查看状态5的订单详情（这些可能是旧的"已取消"订单）
SELECT 
    order_id,
    order_no,
    order_status,
    remark,
    create_time,
    update_time
FROM `order`
WHERE order_status = 5
ORDER BY create_time DESC;

-- 3. 将状态5且备注中包含"取消"的订单更新为状态6（退款/售后）
-- 这些是旧的"已取消"订单，应该显示为"退款/售后"
UPDATE `order`
SET order_status = 6, update_time = NOW()
WHERE order_status = 5 
  AND (remark LIKE '%取消%' OR remark LIKE '%取消原因%' OR remark LIKE '%退款%' OR remark LIKE '%售后%');

-- 4. 验证更新结果
SELECT 
    order_status,
    COUNT(*) as count
FROM `order`
GROUP BY order_status
ORDER BY order_status;

