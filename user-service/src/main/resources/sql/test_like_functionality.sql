-- 测试点赞功能的SQL脚本
-- 数据库: ecommerce_user
-- 端口: 3307
-- 用户: root
-- 密码: 123456

USE ecommerce_user;

-- 1. 查看所有帖子及其点赞信息
SELECT 
    id,
    title,
    like_count,
    liked_user_ids,
    CASE 
        WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
        ELSE JSON_LENGTH(liked_user_ids)
    END as actual_like_count,
    CASE 
        WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN '[]'
        ELSE liked_user_ids
    END as liked_user_ids_display
FROM community_post
ORDER BY id;

-- 2. 检查数据一致性（点赞数与liked_user_ids数组长度是否一致）
SELECT 
    id,
    title,
    like_count,
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

-- 3. 查看特定帖子（ID=1）的详细点赞信息
SELECT 
    id,
    title,
    like_count,
    liked_user_ids,
    JSON_EXTRACT(liked_user_ids, '$[*]') as liked_user_ids_array,
    JSON_LENGTH(liked_user_ids) as liked_user_ids_count
FROM community_post
WHERE id = 1;

-- 4. 修复数据不一致问题（如果需要）
-- UPDATE community_post 
-- SET like_count = CASE 
--     WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
--     ELSE JSON_LENGTH(liked_user_ids)
-- END
-- WHERE like_count != CASE 
--     WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
--     ELSE JSON_LENGTH(liked_user_ids)
-- END;

-- 5. 测试添加点赞用户ID（示例：用户ID=1点赞帖子ID=1）
-- UPDATE community_post 
-- SET liked_user_ids = CASE 
--     WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN '[1]'
--     ELSE JSON_ARRAY_APPEND(liked_user_ids, '$', 1)
-- END,
-- like_count = CASE 
--     WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 1
--     ELSE JSON_LENGTH(JSON_ARRAY_APPEND(liked_user_ids, '$', 1))
-- END
-- WHERE id = 1;

