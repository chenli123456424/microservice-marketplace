-- 更新订单表的状态注释
-- 订单状态：1-待付款，2-待发货（已付款），3-待收货（已发货），4-待评价（已收货），5-已完成（已评价），6-退款/售后

ALTER TABLE `order` MODIFY COLUMN `order_status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '订单状态：1-待付款，2-待发货（已付款），3-待收货（已发货），4-待评价（已收货），5-已完成（已评价），6-退款/售后';

