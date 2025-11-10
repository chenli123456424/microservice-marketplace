-- 更新预约表，添加设计师ID字段（如果不存在）
-- 注意：如果字段已存在，执行此脚本会报错，这是正常的
-- 可以先检查字段是否存在：SHOW COLUMNS FROM `appointment` LIKE 'designer_id';

-- 添加designer_id字段（如果不存在会报错，可以忽略）
ALTER TABLE `appointment` 
ADD COLUMN `designer_id` BIGINT NULL COMMENT '指定设计师ID' AFTER `remark`;

-- 添加索引（如果不存在会报错，可以忽略）
ALTER TABLE `appointment` 
ADD INDEX `idx_designer_id` (`designer_id`);

