-- 修复公告表和预约表的字段注释乱码问题
-- 使用UTF-8编码执行此脚本

-- 修复公告表字段注释
ALTER TABLE `announcement` 
MODIFY COLUMN `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '公告ID',
MODIFY COLUMN `title` varchar(200) NOT NULL COMMENT '公告标题',
MODIFY COLUMN `content` mediumtext NOT NULL COMMENT '公告内容（富文本HTML）',
MODIFY COLUMN `type` varchar(20) NOT NULL DEFAULT 'SYSTEM' COMMENT '公告类型：ACTIVITY-活动通知, SYSTEM-系统通知, MESSAGE-私信',
MODIFY COLUMN `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-未发布，1-已发布',
MODIFY COLUMN `priority` int(11) NOT NULL DEFAULT 0 COMMENT '优先级，数字越大越优先',
MODIFY COLUMN `start_time` datetime DEFAULT NULL COMMENT '开始时间',
MODIFY COLUMN `end_time` datetime DEFAULT NULL COMMENT '结束时间',
MODIFY COLUMN `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
MODIFY COLUMN `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- 修复预约表字段注释
ALTER TABLE `appointment` 
MODIFY COLUMN `id` bigint NOT NULL AUTO_INCREMENT COMMENT '预约ID',
MODIFY COLUMN `user_id` bigint DEFAULT NULL COMMENT '用户ID',
MODIFY COLUMN `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
MODIFY COLUMN `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
MODIFY COLUMN `city` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所在城市',
MODIFY COLUMN `area` int DEFAULT NULL COMMENT '房屋面积（平方米）',
MODIFY COLUMN `style` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '装修风格',
MODIFY COLUMN `budget` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '预算范围',
MODIFY COLUMN `remark` text COLLATE utf8mb4_unicode_ci COMMENT '备注信息',
MODIFY COLUMN `designer_id` bigint DEFAULT NULL COMMENT '指定设计师ID',
MODIFY COLUMN `status` tinyint DEFAULT '0' COMMENT '预约状态：0-待处理，1-已联系，2-已量尺，3-已完成，9-已取消',
MODIFY COLUMN `handler_id` bigint DEFAULT NULL COMMENT '处理人（管理员ID）',
MODIFY COLUMN `handle_time` datetime DEFAULT NULL COMMENT '处理时间',
MODIFY COLUMN `handle_remark` text COLLATE utf8mb4_unicode_ci COMMENT '处理备注',
MODIFY COLUMN `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
MODIFY COLUMN `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

