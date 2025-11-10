# 点赞功能问题诊断指南

## 问题现象
- 第一次点赞可以正常点亮，但点赞数没实时增加
- 取消点赞后再点击点赞就无法点亮，且点赞数也没更新

## 诊断步骤

### 1. 检查数据库状态

执行以下SQL命令：
```sql
-- 连接到数据库
mysql -u root -p123456 -h localhost -P 3307 ecommerce_user

-- 查看帖子数据
SELECT id, title, like_count, liked_user_ids FROM community_post WHERE id = 1;

-- 检查数据一致性
SELECT 
    id,
    like_count,
    CASE 
        WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
        ELSE JSON_LENGTH(liked_user_ids)
    END as actual_count,
    liked_user_ids
FROM community_post WHERE id = 1;
```

### 2. 检查后端日志

重启后端服务后，点击点赞按钮，查看控制台输出：
- 应该看到 "========== 点赞接口调用开始 =========="
- 检查用户ID、帖子信息、点赞状态等日志

### 3. 检查前端网络请求

打开浏览器开发者工具（F12）：
1. 切换到 Network 标签
2. 点击点赞按钮
3. 查看请求：
   - URL: `POST /api/community-posts/1/like`
   - Status: 应该是 200
   - Response: 检查返回的JSON数据

### 4. 检查前端控制台

查看浏览器控制台日志：
- "点赞操作结果 - 原始数据"
- "点赞操作结果 - 解析后"
- "isLiked 计算结果"
- "更新帖子 X 点赞数"
- "当前点赞列表"

### 5. 常见问题排查

#### 问题1: 后端没有日志输出
- 检查后端服务是否重启
- 检查请求是否到达后端（查看Security日志）

#### 问题2: 数据库更新失败
- 检查数据库连接
- 检查update方法是否返回true
- 查看后端日志中的"数据库更新结果"

#### 问题3: 前端状态不更新
- 检查React DevTools中的状态
- 检查likedPostsVersion是否增加
- 检查控制台是否有错误

#### 问题4: 数据格式问题
- 检查后端返回的JSON格式
- 检查前端解析逻辑
- 查看控制台中的"原始数据"和"解析后"日志

## 修复数据不一致的SQL

如果发现like_count与liked_user_ids不一致：
```sql
UPDATE community_post 
SET like_count = CASE 
    WHEN liked_user_ids IS NULL OR liked_user_ids = '' THEN 0
    ELSE JSON_LENGTH(liked_user_ids)
END
WHERE id = 1;
```

## 测试步骤

1. 清除浏览器缓存
2. 重启后端服务
3. 打开浏览器开发者工具
4. 点击点赞按钮
5. 查看：
   - 后端控制台日志
   - 浏览器Network请求
   - 浏览器控制台日志
   - 数据库数据

