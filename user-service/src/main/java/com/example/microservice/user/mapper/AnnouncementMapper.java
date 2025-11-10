package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 公告Mapper接口
 */
@Mapper
public interface AnnouncementMapper extends BaseMapper<Announcement> {
    
    /**
     * 查询当前有效的公告（已发布且在时间范围内）
     * 如果end_time为NULL，表示永久有效
     * 如果end_time已过期，但status=1，仍然显示（在通知中心显示所有已发布的公告）
     * 注意：列表查询不返回content字段，减少数据传输量
     */
    @Select("SELECT id, title, type, status, priority, start_time, end_time, create_time, update_time " +
            "FROM announcement WHERE status = 1 " +
            "AND (start_time IS NULL OR start_time <= NOW()) " +
            "ORDER BY priority DESC, create_time DESC")
    List<Announcement> selectActiveAnnouncements();
    
    /**
     * 查询所有公告（管理端列表，不返回content字段）
     */
    @Select("SELECT id, title, type, status, priority, start_time, end_time, create_time, update_time " +
            "FROM announcement " +
            "ORDER BY priority DESC, create_time DESC")
    List<Announcement> selectAllWithoutContent();
}

