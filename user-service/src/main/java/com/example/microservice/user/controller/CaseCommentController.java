package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.entity.CaseComment;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.CaseCommentService;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/case-comments")
@CrossOrigin
public class CaseCommentController {
    
    @Autowired
    private CaseCommentService caseCommentService;
    
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
     * 分页查询案例评论
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询案例评论")
    public ResponseResult<Page<CaseComment>> page(
            @RequestParam Long caseId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<CaseComment> page = caseCommentService.page(caseId, pageNum, pageSize);
        return ResponseResult.success(page);
    }
    
    /**
     * 查询案例的所有评论
     */
    @GetMapping("/list")
    @Operation(summary = "查询案例的所有评论")
    public ResponseResult<List<CaseComment>> list(@RequestParam Long caseId) {
        List<CaseComment> list = caseCommentService.listByCaseId(caseId);
        return ResponseResult.success(list);
    }
    
    /**
     * 根据ID查询评论
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询评论")
    public ResponseResult<CaseComment> getById(@PathVariable Long id) {
        CaseComment comment = caseCommentService.getById(id);
        if (comment != null) {
            return ResponseResult.success(comment);
        } else {
            return ResponseResult.error("评论不存在");
        }
    }
    
    /**
     * 新增评论
     */
    @PostMapping
    @Operation(summary = "新增评论")
    public ResponseResult<String> save(
            Authentication authentication,
            @RequestBody CaseComment comment) {
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
            
            boolean success = caseCommentService.save(comment);
            if (success) {
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
            @RequestBody CaseComment comment) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseResult.error("请先登录");
            }
            
            // 检查是否是评论作者
            CaseComment existingComment = caseCommentService.getById(comment.getId());
            if (existingComment == null || !existingComment.getUserId().equals(userId)) {
                return ResponseResult.error("无权修改此评论");
            }
            
            boolean success = caseCommentService.update(comment);
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
            CaseComment comment = caseCommentService.getById(id);
            if (comment == null || !comment.getUserId().equals(userId)) {
                return ResponseResult.error("无权删除此评论");
            }
            
            boolean success = caseCommentService.deleteById(id);
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
     * 增加点赞数
     */
    @PostMapping("/{id}/like")
    @Operation(summary = "点赞评论")
    public ResponseResult<String> incrementLikeCount(@PathVariable Long id) {
        boolean success = caseCommentService.incrementLikeCount(id);
        if (success) {
            return ResponseResult.success("点赞成功");
        } else {
            return ResponseResult.error("点赞失败");
        }
    }
}

