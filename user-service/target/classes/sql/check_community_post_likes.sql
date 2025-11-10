-- 检查社区帖子点赞数据
USE ecommerce_user;

-- 1. 检查表结构
DESCRIBE community_post;

-- 2. 查看所有帖子的点赞信息
SELECT 
    id,
    title,
    like_count,
    liked_user_ids,
    LENGTH(liked_user_ids) as liked_user_ids_length,
    CASE 
        WHEN liked_user_ids IS NULL THEN 'NULL'
        WHEN liked_user_ids = '' THEN 'EMPTY'
        ELSE 'HAS_DATA'
    END as liked_user_ids_status
FROM community_post
ORDER BY id;

-- 3. 检查点赞数是否与liked_user_ids一致
SELECT 
    id,
    title,
    like_count,
    liked_user_ids,
    CASE 
        WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
        ELSE JSON_LENGTH(liked_user_ids)
    END as actual_like_count,
    like_count - CASE 
        WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
        ELSE JSON_LENGTH(liked_user_ids)
    END as difference
FROM community_post
WHERE like_count != CASE 
    WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
    ELSE JSON_LENGTH(liked_user_ids)
END;

-- 4. 查看特定帖子的详细信息（替换1为实际的帖子ID）
SELECT 
    id,
    title,
    like_count,
    liked_user_ids,
    JSON_EXTRACT(liked_user_ids, '$[*]') as liked_user_ids_array,
    JSON_LENGTH(liked_user_ids) as liked_user_ids_count
FROM community_post
WHERE id = 1;

