-- 订单评价表
CREATE TABLE IF NOT EXISTS `order_review` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `order_item_id` BIGINT DEFAULT NULL COMMENT '订单项ID（可选，如果是对整个订单评价则为NULL）',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `rating` TINYINT NOT NULL DEFAULT 5 COMMENT '评分（1-5分）',
  `content` TEXT COMMENT '评价内容',
  `images` TEXT COMMENT '晒单图片（多张图片用逗号分隔）',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-待审核',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_order_item_id` (`order_item_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价表';
