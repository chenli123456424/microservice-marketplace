package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 公告实体类
 */
@Data
@TableName("announcement")
public class Announcement implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 公告标题
     */
    private String title;
    
    /**
     * 公告内容（富文本HTML）
     */
    private String content;
    
    /**
     * 状态：0-未发布，1-已发布
     */
    private Integer status;
    
    /**
     * 优先级，数字越大越优先
     */
    private Integer priority;
    
    /**
     * 开始时间
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}

