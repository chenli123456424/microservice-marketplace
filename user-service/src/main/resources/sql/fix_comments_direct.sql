-- 直接使用SQL语句修复注释
-- 确保文件以UTF-8编码保存

SET NAMES utf8mb4;

-- 修复公告表
ALTER TABLE `announcement` MODIFY COLUMN `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '公告ID';
ALTER TABLE `announcement` MODIFY COLUMN `title` varchar(200) NOT NULL COMMENT '公告标题';
ALTER TABLE `announcement` MODIFY COLUMN `content` mediumtext NOT NULL COMMENT '公告内容（富文本HTML）';
ALTER TABLE `announcement` MODIFY COLUMN `type` varchar(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '公告类型：ACTIVITY-活动通知, SYSTEM-系统通知, MESSAGE-私信';
ALTER TABLE `announcement` MODIFY COLUMN `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-未发布，1-已发布';
ALTER TABLE `announcement` MODIFY COLUMN `priority` int(11) NOT NULL DEFAULT 0 COMMENT '优先级，数字越大越优先';
ALTER TABLE `announcement` MODIFY COLUMN `start_time` datetime DEFAULT NULL COMMENT '开始时间';
ALTER TABLE `announcement` MODIFY COLUMN `end_time` datetime DEFAULT NULL COMMENT '结束时间';
ALTER TABLE `announcement` MODIFY COLUMN `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE `announcement` MODIFY COLUMN `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- 修复预约表
ALTER TABLE `appointment` MODIFY COLUMN `id` bigint NOT NULL AUTO_INCREMENT COMMENT '预约ID';
ALTER TABLE `appointment` MODIFY COLUMN `user_id` bigint DEFAULT NULL COMMENT '用户ID';
ALTER TABLE `appointment` MODIFY COLUMN `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名';
ALTER TABLE `appointment` MODIFY COLUMN `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话';
ALTER TABLE `appointment` MODIFY COLUMN `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所在城市';
ALTER TABLE `appointment` MODIFY COLUMN `area` int DEFAULT NULL COMMENT '房屋面积（平方米）';
ALTER TABLE `appointment` MODIFY COLUMN `style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '装修风格';
ALTER TABLE `appointment` MODIFY COLUMN `budget` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '预算范围';
ALTER TABLE `appointment` MODIFY COLUMN `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注信息';
ALTER TABLE `appointment` MODIFY COLUMN `designer_id` bigint DEFAULT NULL COMMENT '指定设计师ID';
ALTER TABLE `appointment` MODIFY COLUMN `status` tinyint DEFAULT '0' COMMENT '预约状态：0-待处理，1-已联系，2-已量尺，3-已完成，9-已取消';
ALTER TABLE `appointment` MODIFY COLUMN `handler_id` bigint DEFAULT NULL COMMENT '处理人（管理员ID）';
ALTER TABLE `appointment` MODIFY COLUMN `handle_time` datetime DEFAULT NULL COMMENT '处理时间';
ALTER TABLE `appointment` MODIFY COLUMN `handle_remark` text COLLATE utf8mb4_unicode_ci COMMENT '处理备注';
ALTER TABLE `appointment` MODIFY COLUMN `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE `appointment` MODIFY COLUMN `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

