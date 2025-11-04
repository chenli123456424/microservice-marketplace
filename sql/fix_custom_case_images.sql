-- 修改 custom_case 表的 images 字段类型为 MEDIUMTEXT，以支持更长的Base64图片数据
USE ecommerce_user;

ALTER TABLE `custom_case` 
MODIFY COLUMN `images` MEDIUMTEXT COMMENT '案例图片（多张图片用逗号分隔，Base64格式）';

SELECT 'custom_case 表的 images 字段已修改为 MEDIUMTEXT' AS '提示信息';
