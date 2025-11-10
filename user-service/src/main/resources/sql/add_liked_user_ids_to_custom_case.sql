-- 为custom_case表添加liked_user_ids字段，用于存储点赞用户ID列表（JSON数组格式）
-- 如果字段已存在，会报错，可以忽略

-- 检查字段是否存在，如果不存在则添加
-- MySQL不支持IF NOT EXISTS语法，所以使用存储过程来检查
DELIMITER $$

DROP PROCEDURE IF EXISTS add_liked_user_ids_if_not_exists$$

CREATE PROCEDURE add_liked_user_ids_if_not_exists()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'custom_case'
      AND COLUMN_NAME = 'liked_user_ids';
    
    IF column_exists = 0 THEN
        ALTER TABLE custom_case 
        ADD COLUMN liked_user_ids TEXT COMMENT '点赞用户ID列表（JSON数组格式）' AFTER like_count;
    END IF;
END$$

DELIMITER ;

CALL add_liked_user_ids_if_not_exists();

DROP PROCEDURE IF EXISTS add_liked_user_ids_if_not_exists;

