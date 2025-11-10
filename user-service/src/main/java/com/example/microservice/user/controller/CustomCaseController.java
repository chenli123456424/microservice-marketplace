package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CustomCase;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.CustomCaseService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 定制案例Controller
 */
@RestController
@RequestMapping("/api/custom-cases")
@CrossOrigin
public class CustomCaseController {
    
    @Autowired
    private CustomCaseService customCaseService;
    
    @Autowired
    private UserService userService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 获取当前用户ID
     */
    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user != null ? user.getId() : null;
    }
    
    /**
     * 分页查询定制案例
     */
    @GetMapping("/page")
    public ResponseResult<Page<CustomCase>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String style,
            @RequestParam(required = false) Integer status) {
        
        Page<CustomCase> page = customCaseService.page(pageNum, pageSize, style, status);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询所有上架的定制案例
     */
    @GetMapping("/list")
    public ResponseResult<List<CustomCase>> list() {
        List<CustomCase> list = customCaseService.listAll();
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询定制案例
     */
    @GetMapping("/{id}")
    public ResponseResult<CustomCase> getById(@PathVariable Long id) {
        CustomCase customCase = customCaseService.getById(id);
        if (customCase != null) {
            return ResponseResult.success(customCase);
        } else {
            return ResponseResult.error("案例不存在");
        }
    }
    
    /**
     * 新增定制案例
     */
    @PostMapping
    public ResponseResult<String> save(@RequestBody CustomCase customCase) {
        boolean success = customCaseService.save(customCase);
        if (success) {
            return ResponseResult.success("保存成功");
        } else {
            return ResponseResult.error("保存失败");
        }
    }
    
    /**
     * 更新定制案例
     */
    @PutMapping
    public ResponseResult<String> update(@RequestBody CustomCase customCase) {
        boolean success = customCaseService.update(customCase);
        if (success) {
            return ResponseResult.success("更新成功");
        } else {
            return ResponseResult.error("更新失败");
        }
    }
    
    /**
     * 删除定制案例
     */
    @DeleteMapping("/{id}")
    public ResponseResult<String> delete(@PathVariable Long id) {
        boolean success = customCaseService.deleteById(id);
        if (success) {
            return ResponseResult.success("删除成功");
        } else {
            return ResponseResult.error("删除失败");
        }
    }
    
    /**
     * 增加浏览次数
     */
    @PostMapping("/{id}/view")
    public ResponseResult<String> incrementViewCount(@PathVariable Long id) {
        boolean success = customCaseService.incrementViewCount(id);
        if (success) {
            return ResponseResult.success("操作成功");
        } else {
            return ResponseResult.error("操作失败");
        }
    }
    
    /**
     * 检查用户是否已点赞
     */
    @GetMapping("/{id}/like-status")
    public ResponseResult<Map<String, Object>> getLikeStatus(
            Authentication authentication,
            @PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("liked", false);
        
        Long userId = getUserId(authentication);
        if (userId != null) {
            CustomCase customCase = customCaseService.getById(id);
            if (customCase != null && customCase.getLikedUserIds() != null && !customCase.getLikedUserIds().trim().isEmpty()) {
                try {
                    List<?> rawList = objectMapper.readValue(customCase.getLikedUserIds(), List.class);
                    boolean isLiked = false;
                    for (Object item : rawList) {
                        if (item != null) {
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
                    result.put("liked", false);
                }
            }
        }
        
        return ResponseResult.success(result);
    }
    
    /**
     * 点赞/取消点赞案例
     */
    @PostMapping("/{id}/like")
    public ResponseResult<Map<String, Object>> toggleLike(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            CustomCase customCase = customCaseService.getById(id);
            if (customCase == null) {
                return ResponseResult.error("案例不存在");
            }
            
            // 解析点赞用户ID列表
            List<Long> likedUserIds = new ArrayList<>();
            if (customCase.getLikedUserIds() != null && !customCase.getLikedUserIds().trim().isEmpty()) {
                try {
                    List<?> rawList = objectMapper.readValue(customCase.getLikedUserIds(), List.class);
                    for (Object item : rawList) {
                        if (item != null) {
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
                } catch (Exception e) {
                    e.printStackTrace();
                    likedUserIds = new ArrayList<>();
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            
            // 检查是否已点赞
            boolean isLiked = false;
            for (Long likedUserId : likedUserIds) {
                if (likedUserId != null && likedUserId.equals(userId)) {
                    isLiked = true;
                    break;
                }
            }
            
            if (isLiked) {
                // 取消点赞
                likedUserIds.removeIf(likedUserId -> likedUserId != null && likedUserId.equals(userId));
                int actualLikeCount = likedUserIds.size();
                customCase.setLikeCount(Integer.valueOf(actualLikeCount));
                customCase.setLikedUserIds(likedUserIds.isEmpty() ? null : objectMapper.writeValueAsString(likedUserIds));
                boolean updateResult = customCaseService.update(customCase);
                if (updateResult) {
                    result.put("liked", false);
                    result.put("likeCount", actualLikeCount);
                    result.put("message", "取消点赞成功");
                    return ResponseResult.success(result);
                } else {
                    return ResponseResult.error("取消点赞失败");
                }
            } else {
                // 点赞
                if (!likedUserIds.contains(userId)) {
                    likedUserIds.add(userId);
                }
                int actualLikeCount = likedUserIds.size();
                customCase.setLikeCount(Integer.valueOf(actualLikeCount));
                customCase.setLikedUserIds(objectMapper.writeValueAsString(likedUserIds));
                boolean updateResult = customCaseService.update(customCase);
                if (updateResult) {
                    result.put("liked", true);
                    result.put("likeCount", actualLikeCount);
                    result.put("message", "点赞成功");
                    return ResponseResult.success(result);
                } else {
                    return ResponseResult.error("点赞失败");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseResult.error("操作失败: " + e.getMessage());
        }
    }
}

