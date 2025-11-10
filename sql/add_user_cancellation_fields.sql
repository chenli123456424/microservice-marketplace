-- 为用户表添加注销相关字段
ALTER TABLE `t_user` 
ADD COLUMN `cancellation_status` TINYINT DEFAULT 0 COMMENT '注销状态：0-正常，1-已注销（等待期），2-已删除' AFTER `like_received_count`,
ADD COLUMN `cancellation_time` DATETIME DEFAULT NULL COMMENT '注销时间' AFTER `cancellation_status`,
ADD COLUMN `cancellation_revoke_time` DATETIME DEFAULT NULL COMMENT '撤销注销时间' AFTER `cancellation_time`,
ADD INDEX `idx_cancellation_status` (`cancellation_status`),
ADD INDEX `idx_cancellation_time` (`cancellation_time`);

