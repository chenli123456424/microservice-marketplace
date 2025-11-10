-- 社区帖子表
CREATE TABLE IF NOT EXISTS `community_post` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID（发布者）',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（冗余字段）',
  `user_avatar` VARCHAR(500) DEFAULT NULL COMMENT '用户头像（冗余字段）',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容（支持富文本）',
  `images` TEXT DEFAULT NULL COMMENT '图片URLs（JSON格式存储，多个图片用逗号分隔）',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '视频URL（可选）',
  `type` VARCHAR(20) NOT NULL DEFAULT 'INSPIRATION' COMMENT '类型：INSPIRATION-灵感分享, QUESTION-问答, SHOWCASE-作品展示',
  `like_count` INT DEFAULT 0 COMMENT '点赞数',
  `liked_user_ids` TEXT DEFAULT NULL COMMENT '点赞用户ID列表（JSON数组格式，如：[1,2,3]）',
  `comment_count` INT DEFAULT 0 COMMENT '评论数',
  `view_count` INT DEFAULT 0 COMMENT '浏览数',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-删除，1-正常，2-审核中',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='社区帖子表';
