-- 为用户表添加关注量、粉丝量、获赞量字段
-- 如果字段已存在，会报错，可以忽略

-- 检查字段是否存在，如果不存在则添加
-- MySQL不支持IF NOT EXISTS语法，所以使用存储过程来检查
DELIMITER $$

DROP PROCEDURE IF EXISTS add_user_stats_fields_if_not_exists$$

CREATE PROCEDURE add_user_stats_fields_if_not_exists()
BEGIN
    DECLARE follow_count_exists INT DEFAULT 0;
    DECLARE follower_count_exists INT DEFAULT 0;
    DECLARE like_received_count_exists INT DEFAULT 0;
    
    -- 检查关注量字段
    SELECT COUNT(*) INTO follow_count_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 't_user'
      AND COLUMN_NAME = 'follow_count';
    
    IF follow_count_exists = 0 THEN
        ALTER TABLE t_user 
        ADD COLUMN follow_count INT DEFAULT 0 COMMENT '关注量' AFTER role;
    END IF;
    
    -- 检查粉丝量字段
    SELECT COUNT(*) INTO follower_count_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 't_user'
      AND COLUMN_NAME = 'follower_count';
    
    IF follower_count_exists = 0 THEN
        ALTER TABLE t_user 
        ADD COLUMN follower_count INT DEFAULT 0 COMMENT '粉丝量' AFTER follow_count;
    END IF;
    
    -- 检查获赞量字段
    SELECT COUNT(*) INTO like_received_count_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 't_user'
      AND COLUMN_NAME = 'like_received_count';
    
    IF like_received_count_exists = 0 THEN
        ALTER TABLE t_user 
        ADD COLUMN like_received_count INT DEFAULT 0 COMMENT '获赞量' AFTER follower_count;
    END IF;
END$$

DELIMITER ;

CALL add_user_stats_fields_if_not_exists();

DROP PROCEDURE IF EXISTS add_user_stats_fields_if_not_exists;

