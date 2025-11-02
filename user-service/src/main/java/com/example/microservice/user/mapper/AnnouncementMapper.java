package com.example.microservice.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.microservice.user.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 公告Mapper接口
 */
@Mapper
public interface AnnouncementMapper extends BaseMapper<Announcement> {
    
    /**
     * 查询当前有效的公告（已发布且在时间范围内）
     */
    @Select("SELECT * FROM announcement WHERE status = 1 " +
            "AND (start_time IS NULL OR start_time <= NOW()) " +
            "AND (end_time IS NULL OR end_time >= NOW()) " +
            "ORDER BY priority DESC, create_time DESC")
    List<Announcement> selectActiveAnnouncements();
}

