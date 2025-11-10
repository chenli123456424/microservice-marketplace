package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityPost;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.CommunityPostService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 社区帖子Controller
 */
@RestController
@RequestMapping("/api/community-posts")
@CrossOrigin
public class CommunityPostController {
    
    @Autowired
    private CommunityPostService communityPostService;
    
    @Autowired
    private UserService userService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user != null ? user.getId() : null;
    }
    
    /**
     * 分页查询社区帖子
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询社区帖子")
    public ResponseResult<Page<CommunityPost>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        Page<CommunityPost> page = communityPostService.page(pageNum, pageSize, type, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有正常状态的帖子
     */
    @GetMapping("/list")
    @Operation(summary = "查询所有正常状态的帖子")
    public ResponseResult<List<CommunityPost>> list() {
        List<CommunityPost> list = communityPostService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 获取当前用户的帖子列表（分页）
     */
    @GetMapping("/my-posts")
    @Operation(summary = "获取当前用户的帖子列表")
    public ResponseResult<Page<CommunityPost>> getMyPosts(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            Page<CommunityPost> page = communityPostService.pageByUserId(userId, pageNum, pageSize, type, status);
            return ResponseResult.success(page);
        } catch (Exception e) {
            return ResponseResult.error("获取帖子列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID查询帖子
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询帖子")
    public ResponseResult<CommunityPost> getById(@PathVariable Long id) {
        CommunityPost post = communityPostService.getById(id);
        if (post != null) {
            // 增加浏览次数
            communityPostService.incrementViewCount(id);
            return ResponseResult.success(post);
        } else {
            return ResponseResult.error("帖子不存在");
        }
    }
    
    /**
     * 新增帖子
     */
    @PostMapping
    @Operation(summary = "发布新帖子")
    public ResponseResult<String> save(
            Authentication authentication,
            @RequestBody CommunityPost post) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            User user = userService.getById(userId);
            if (user != null) {
                post.setUserId(userId);
                post.setUsername(user.getUsername());
                post.setUserAvatar(user.getAvatar());
            }
            
            boolean success = communityPostService.save(post);
            if (success) {
                return ResponseResult.success("发布成功");
            } else {
                return ResponseResult.error("发布失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("发布失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新帖子
     */
    @PutMapping
    @Operation(summary = "更新帖子")
    public ResponseResult<String> update(
            Authentication authentication,
            @RequestBody CommunityPost post) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查是否是帖子作者
            CommunityPost existingPost = communityPostService.getById(post.getId());
            if (existingPost == null || !existingPost.getUserId().equals(userId)) {
                return ResponseResult.error("无权修改此帖子");
            }
            
            boolean success = communityPostService.update(post);
            if (success) {
                return ResponseResult.success("更新成功");
            } else {
                return ResponseResult.error("更新失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除帖子
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除帖子")
    public ResponseResult<String> delete(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查是否是帖子作者
            CommunityPost post = communityPostService.getById(id);
            if (post == null || !post.getUserId().equals(userId)) {
                return ResponseResult.error("无权删除此帖子");
            }
            
            boolean success = communityPostService.deleteById(id);
            if (success) {
                return ResponseResult.success("删除成功");
            } else {
                return ResponseResult.error("删除失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("删除失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查用户是否已点赞
     */
    @GetMapping("/{id}/like-status")
    @Operation(summary = "检查用户是否已点赞")
    public ResponseResult<Map<String, Object>> getLikeStatus(
            Authentication authentication,
            @PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("liked", false);
        
        Long userId = getUserId(authentication);
        if (userId != null) {
            CommunityPost post = communityPostService.getById(id);
            if (post != null && post.getLikedUserIds() != null && !post.getLikedUserIds().trim().isEmpty()) {
                try {
                    // 先解析为通用List，然后转换为Long列表，确保类型匹配
                    List<?> rawList = objectMapper.readValue(post.getLikedUserIds(), List.class);
                    boolean isLiked = false;
                    for (Object item : rawList) {
                        if (item != null) {
                            // 将各种数字类型转换为Long进行比较
                            Long likedUserId = null;
                            if (item instanceof Long) {
                                likedUserId = (Long) item;
                            } else if (item instanceof Integer) {
                                likedUserId = ((Integer) item).longValue();
                            } else if (item instanceof Number) {
                                likedUserId = ((Number) item).longValue();
                            } else if (item instanceof String) {
                                likedUserId = Long.parseLong((String) item);
                            }
                            if (likedUserId != null && likedUserId.equals(userId)) {
                                isLiked = true;
                                break;
                            }
                        }
                    }
                    result.put("liked", isLiked);
                } catch (Exception e) {
                    e.printStackTrace();
                    // JSON解析失败，默认未点赞
                    result.put("liked", false);
                }
            }
        }
        
        return ResponseResult.success(result);
    }
    
    /**
     * 点赞/取消点赞帖子
     */
    @PostMapping("/{id}/like")
    @Operation(summary = "点赞/取消点赞帖子")
    public ResponseResult<Map<String, Object>> toggleLike(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            System.out.println("========== 点赞接口调用开始 ==========");
            System.out.println("帖子ID: " + id);
            System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));
            
            Long userId = getUserId(authentication);
            System.out.println("用户ID: " + userId);
            
            if (userId == null) {
                System.out.println("错误: 用户未登录");
                return ResponseResult.error("请先登录");
            }
            
            CommunityPost post = communityPostService.getById(id);
            System.out.println("帖子信息: " + (post != null ? "存在, like_count=" + post.getLikeCount() + ", liked_user_ids=" + post.getLikedUserIds() : "不存在"));
            
            if (post == null) {
                System.out.println("错误: 帖子不存在");
                return ResponseResult.error("帖子不存在");
            }
            
            // 解析点赞用户ID列表
            List<Long> likedUserIds = new ArrayList<>();
            if (post.getLikedUserIds() != null && !post.getLikedUserIds().trim().isEmpty()) {
                try {
                    System.out.println("解析liked_user_ids: " + post.getLikedUserIds());
                    // 先解析为通用List，然后转换为Long列表，确保类型匹配
                    List<?> rawList = objectMapper.readValue(post.getLikedUserIds(), List.class);
                    System.out.println("解析后的原始列表: " + rawList);
                    for (Object item : rawList) {
                        if (item != null) {
                            // 将各种数字类型转换为Long
                            Long likedUserId = null;
                            if (item instanceof Long) {
                                likedUserId = (Long) item;
                            } else if (item instanceof Integer) {
                                likedUserId = ((Integer) item).longValue();
                            } else if (item instanceof Number) {
                                likedUserId = ((Number) item).longValue();
                            } else if (item instanceof String) {
                                likedUserId = Long.parseLong((String) item);
                            }
                            if (likedUserId != null) {
                                likedUserIds.add(likedUserId);
                            }
                        }
                    }
                    System.out.println("转换后的Long列表: " + likedUserIds);
                } catch (Exception e) {
                    System.out.println("JSON解析失败: " + e.getMessage());
                    e.printStackTrace();
                    // JSON解析失败，使用空列表
                    likedUserIds = new ArrayList<>();
                }
            } else {
                System.out.println("liked_user_ids为空或null");
            }
            
            Map<String, Object> result = new HashMap<>();
            
            // 检查是否已点赞（使用equals比较，确保类型匹配）
            boolean isLiked = false;
            for (Long likedUserId : likedUserIds) {
                if (likedUserId != null && likedUserId.equals(userId)) {
                    isLiked = true;
                    break;
                }
            }
            System.out.println("当前是否已点赞: " + isLiked);
            System.out.println("当前点赞用户列表: " + likedUserIds);
            
            if (isLiked) {
                // 取消点赞 - 使用迭代器安全删除
                System.out.println("执行取消点赞操作");
                likedUserIds.removeIf(likedUserId -> likedUserId != null && likedUserId.equals(userId));
                // 确保点赞数正确同步
                int actualLikeCount = likedUserIds.size();
                System.out.println("取消点赞后，点赞数: " + actualLikeCount);
                // 确保likeCount不为null，使用Integer.valueOf确保类型正确
                post.setLikeCount(Integer.valueOf(actualLikeCount));
                post.setLikedUserIds(likedUserIds.isEmpty() ? null : objectMapper.writeValueAsString(likedUserIds));
                System.out.println("========== Controller准备更新（取消点赞） ==========");
                System.out.println("更新前的post对象 - ID: " + post.getId() + ", likeCount: " + post.getLikeCount() + ", likedUserIds: " + post.getLikedUserIds());
                System.out.println("post.getLikeCount()类型: " + (post.getLikeCount() != null ? post.getLikeCount().getClass().getName() : "null"));
                boolean updateResult = communityPostService.update(post);
                System.out.println("Controller收到更新结果: " + updateResult);
                // 验证更新后的数据
                if (updateResult) {
                    CommunityPost updatedPost = communityPostService.getById(id);
                    System.out.println("Controller验证 - 更新后从数据库读取 - likeCount: " + updatedPost.getLikeCount() + ", likedUserIds: " + updatedPost.getLikedUserIds());
                } else {
                    System.out.println("Controller警告 - 更新返回false，但未抛出异常");
                }
                result.put("liked", false);
                result.put("likeCount", actualLikeCount);
                result.put("message", "取消点赞成功");
                System.out.println("返回结果: " + result);
                System.out.println("========== 取消点赞完成 ==========");
                return ResponseResult.success(result);
            } else {
                // 点赞 - 确保不会重复添加（使用equals检查）
                System.out.println("执行点赞操作");
                boolean alreadyExists = false;
                for (Long likedUserId : likedUserIds) {
                    if (likedUserId != null && likedUserId.equals(userId)) {
                        alreadyExists = true;
                        break;
                    }
                }
                if (!alreadyExists) {
                    likedUserIds.add(userId);
                    System.out.println("添加用户ID到点赞列表: " + userId);
                } else {
                    System.out.println("用户已在点赞列表中，跳过添加");
                }
                // 确保点赞数正确同步
                int actualLikeCount = likedUserIds.size();
                System.out.println("点赞后，点赞数: " + actualLikeCount);
                // 确保likeCount不为null，使用Integer.valueOf确保类型正确
                post.setLikeCount(Integer.valueOf(actualLikeCount));
                post.setLikedUserIds(objectMapper.writeValueAsString(likedUserIds));
                System.out.println("========== Controller准备更新 ==========");
                System.out.println("更新前的post对象 - ID: " + post.getId() + ", likeCount: " + post.getLikeCount() + ", likedUserIds: " + post.getLikedUserIds());
                System.out.println("post.getLikeCount()类型: " + (post.getLikeCount() != null ? post.getLikeCount().getClass().getName() : "null"));
                boolean updateResult = communityPostService.update(post);
                System.out.println("Controller收到更新结果: " + updateResult);
                // 验证更新后的数据
                if (updateResult) {
                    CommunityPost updatedPost = communityPostService.getById(id);
                    System.out.println("Controller验证 - 更新后从数据库读取 - likeCount: " + updatedPost.getLikeCount() + ", likedUserIds: " + updatedPost.getLikedUserIds());
                } else {
                    System.out.println("Controller警告 - 更新返回false，但未抛出异常");
                }
                result.put("liked", true);
                result.put("likeCount", actualLikeCount);
                result.put("message", "点赞成功");
                System.out.println("返回结果: " + result);
                System.out.println("========== 点赞完成 ==========");
                return ResponseResult.success(result);
            }
        } catch (Exception e) {
            System.out.println("========== 点赞操作异常 ==========");
            System.out.println("异常信息: " + e.getMessage());
            e.printStackTrace();
            return ResponseResult.error("操作失败: " + e.getMessage());
        }
    }
    
    /**
     * 上传社区图片或视频
     */
    @PostMapping("/upload")
    @Operation(summary = "上传社区图片或视频")
    public ResponseResult<String> uploadMedia(
            Authentication authentication,
            @RequestPart("file") MultipartFile file) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            if (file.isEmpty()) {
                return ResponseResult.error("文件为空");
            }
            
            // 检查文件类型
            String contentType = file.getContentType();
            boolean isImage = contentType != null && contentType.startsWith("image/");
            boolean isVideo = contentType != null && contentType.startsWith("video/");
            
            if (!isImage && !isVideo) {
                return ResponseResult.error("只支持图片或视频文件");
            }
            
            // 检查文件大小
            long maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 图片10MB，视频100MB
            if (file.getSize() > maxSize) {
                return ResponseResult.error(isImage ? "图片文件大小不能超过10MB" : "视频文件大小不能超过100MB");
            }
            
            // 使用项目根目录下的uploads/community文件夹
            String projectRoot = System.getProperty("user.dir");
            Path uploadDir;
            if (projectRoot.endsWith("user-service")) {
                uploadDir = Paths.get(projectRoot, "..", "uploads", "community").toAbsolutePath().normalize();
            } else {
                uploadDir = Paths.get(projectRoot, "uploads", "community").toAbsolutePath();
            }
            
            // 确保目录存在
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String prefix = isImage ? "community_img_" : "community_video_";
            String filename = prefix + UUID.randomUUID().toString() + extension;
            
            // 保存文件
            Path dest = uploadDir.resolve(filename);
            file.transferTo(dest.toFile());
            
            // 返回可访问的URL
            String url = "/uploads/community/" + filename;
            return ResponseResult.success(url);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("上传失败: " + e.getMessage());
        }
    }
}

