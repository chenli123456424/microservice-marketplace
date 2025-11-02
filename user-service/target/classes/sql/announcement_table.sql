-- 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '公告ID',
    `title` varchar(200) NOT NULL COMMENT '公告标题',
    `content` text NOT NULL COMMENT '公告内容（富文本HTML）',
    `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-未发布，1-已发布',
    `priority` int(11) NOT NULL DEFAULT 0 COMMENT '优先级，数字越大越优先',
    `start_time` datetime DEFAULT NULL COMMENT '开始时间',
    `end_time` datetime DEFAULT NULL COMMENT '结束时间',
    `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_start_end_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

