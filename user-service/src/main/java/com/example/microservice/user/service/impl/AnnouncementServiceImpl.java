package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.Announcement;
import com.example.microservice.user.mapper.AnnouncementMapper;
import com.example.microservice.user.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 公告服务实现类
 */
@Service
public class AnnouncementServiceImpl extends ServiceImpl<AnnouncementMapper, Announcement> implements AnnouncementService {
    
    @Autowired
    private AnnouncementMapper announcementMapper;
    
    @Override
    public List<Announcement> getActiveAnnouncements() {
        return announcementMapper.selectActiveAnnouncements();
    }
}

