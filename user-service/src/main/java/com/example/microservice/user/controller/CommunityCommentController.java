package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CommunityComment;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.CommunityCommentService;
import com.example.microservice.user.service.CommunityPostService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 社区评论Controller
 */
@RestController
@RequestMapping("/api/community-comments")
@CrossOrigin
public class CommunityCommentController {
    
    @Autowired
    private CommunityCommentService communityCommentService;
    
    @Autowired
    private CommunityPostService communityPostService;
    
    @Autowired
    private UserService userService;
    
    private Long getUserId(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        return user != null ? user.getId() : null;
    }
    
    /**
     * 分页查询社区评论
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询社区评论")
    public ResponseResult<Page<CommunityComment>> page(
            @RequestParam Long postId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<CommunityComment> page = communityCommentService.page(postId, pageNum, pageSize);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询帖子的所有评论
     */
    @GetMapping("/list")
    @Operation(summary = "查询帖子的所有评论")
    public ResponseResult<List<CommunityComment>> list(@RequestParam Long postId) {
        List<CommunityComment> list = communityCommentService.listByPostId(postId);
        return ResponseResult.success(list);
    }
    
    /**
     * 新增评论
     */
    @PostMapping
    @Operation(summary = "新增评论")
    public ResponseResult<String> save(
            Authentication authentication,
            @RequestBody CommunityComment comment) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            User user = userService.getById(userId);
            if (user != null) {
                comment.setUserId(userId);
                comment.setUsername(user.getUsername());
                comment.setUserAvatar(user.getAvatar());
            }
            
            boolean success = communityCommentService.save(comment);
            if (success) {
                // 增加帖子的评论数
                communityPostService.incrementCommentCount(comment.getPostId());
                return ResponseResult.success("评论成功");
            } else {
                return ResponseResult.error("评论失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("评论失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新评论
     */
    @PutMapping
    @Operation(summary = "更新评论")
    public ResponseResult<String> update(
            Authentication authentication,
            @RequestBody CommunityComment comment) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查是否是评论作者
            CommunityComment existingComment = communityCommentService.getById(comment.getId());
            if (existingComment == null || !existingComment.getUserId().equals(userId)) {
                return ResponseResult.error("无权修改此评论");
            }
            
            boolean success = communityCommentService.update(comment);
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
     * 删除评论
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除评论")
    public ResponseResult<String> delete(
            Authentication authentication,
            @PathVariable Long id) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查是否是评论作者
            CommunityComment comment = communityCommentService.getById(id);
            if (comment == null || !comment.getUserId().equals(userId)) {
                return ResponseResult.error("无权删除此评论");
            }
            
            boolean success = communityCommentService.deleteById(id);
            if (success) {
                return ResponseResult.success("删除成功");
            } else {
                return ResponseResult.error("删除失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("删除失败: " + e.getMessage());
        }
    }
}

