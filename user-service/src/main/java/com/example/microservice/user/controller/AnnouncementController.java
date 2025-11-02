package com.example.microservice.user.controller;

import com.example.microservice.user.entity.Announcement;
import com.example.microservice.user.service.AnnouncementService;
import com.example.microservice.user.util.ResponseResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 公告控制器
 */
@RestController
@RequestMapping("/api/announcement")
@Tag(name = "公告管理", description = "公告管理相关接口")
public class AnnouncementController {
    
    @Autowired
    private AnnouncementService announcementService;
    
    /**
     * 获取当前有效的公告列表（用户端）
     */
    @GetMapping("/active")
    @Operation(summary = "获取当前有效的公告列表")
    public ResponseResult<List<Announcement>> getActiveAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.getActiveAnnouncements();
            return ResponseResult.success(announcements);
        } catch (Exception e) {
            return ResponseResult.error("获取公告失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有公告列表（管理端）
     */
    @GetMapping("/list")
    @Operation(summary = "获取所有公告列表")
    public ResponseResult<List<Announcement>> getAllAnnouncements() {
        try {
            List<Announcement> announcements = announcementService.list();
            return ResponseResult.success(announcements);
        } catch (Exception e) {
            return ResponseResult.error("获取公告列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID获取公告详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取公告详情")
    public ResponseResult<Announcement> getAnnouncementById(@PathVariable Long id) {
        try {
            Announcement announcement = announcementService.getById(id);
            if (announcement == null) {
                return ResponseResult.error("公告不存在");
            }
            return ResponseResult.success(announcement);
        } catch (Exception e) {
            return ResponseResult.error("获取公告失败: " + e.getMessage());
        }
    }
    
    /**
     * 创建公告
     */
    @PostMapping
    @Operation(summary = "创建公告")
    public ResponseResult<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        try {
            boolean saved = announcementService.save(announcement);
            if (saved) {
                return ResponseResult.success(announcement);
            } else {
                return ResponseResult.error("创建公告失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("创建公告失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新公告
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新公告")
    public ResponseResult<Announcement> updateAnnouncement(@PathVariable Long id, @RequestBody Announcement announcement) {
        try {
            announcement.setId(id);
            boolean updated = announcementService.updateById(announcement);
            if (updated) {
                Announcement updatedAnnouncement = announcementService.getById(id);
                return ResponseResult.success(updatedAnnouncement);
            } else {
                return ResponseResult.error("更新公告失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新公告失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除公告
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除公告")
    public ResponseResult<String> deleteAnnouncement(@PathVariable Long id) {
        try {
            boolean deleted = announcementService.removeById(id);
            if (deleted) {
                return ResponseResult.success("删除成功");
            } else {
                return ResponseResult.error("删除失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("删除公告失败: " + e.getMessage());
        }
    }
    
    /**
     * 发布/取消发布公告
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "发布/取消发布公告")
    public ResponseResult<Announcement> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        try {
            Announcement announcement = announcementService.getById(id);
            if (announcement == null) {
                return ResponseResult.error("公告不存在");
            }
            announcement.setStatus(status);
            boolean updated = announcementService.updateById(announcement);
            if (updated) {
                Announcement updatedAnnouncement = announcementService.getById(id);
                return ResponseResult.success(updatedAnnouncement);
            } else {
                return ResponseResult.error("更新状态失败");
            }
        } catch (Exception e) {
            return ResponseResult.error("更新状态失败: " + e.getMessage());
        }
    }
}

