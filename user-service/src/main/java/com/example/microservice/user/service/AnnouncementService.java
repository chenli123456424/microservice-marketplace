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
}

