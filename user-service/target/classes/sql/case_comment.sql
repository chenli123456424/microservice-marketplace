-- 案例评论表
CREATE TABLE IF NOT EXISTS `case_comment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `case_id` BIGINT NOT NULL COMMENT '案例ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父评论ID（用于回复功能，0表示顶级评论）',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_case_id` (`case_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案例评论表';

