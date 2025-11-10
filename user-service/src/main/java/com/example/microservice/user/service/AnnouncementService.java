package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.Announcement;

import java.util.List;

/**
 * 公告服务接口
 */
public interface AnnouncementService extends IService<Announcement> {
    
    /**
     * 获取当前有效的公告列表
     * @return 公告列表
     */
    List<Announcement> getActiveAnnouncements();
    
    /**
     * 获取所有公告列表（不包含content字段，用于列表展示）
     * @return 公告列表
     */
    List<Announcement> listWithoutContent();
}

