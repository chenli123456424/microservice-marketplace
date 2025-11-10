package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 案例评论实体类
 */
@Data
@TableName("case_comment")
public class CaseComment implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 评论ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 案例ID
     */
    @TableField("case_id")
    private Long caseId;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 用户名（冗余字段）
     */
    @TableField("username")
    private String username;
    
    /**
     * 用户头像（冗余字段）
     */
    @TableField("user_avatar")
    private String userAvatar;
    
    /**
     * 评论内容
     */
    @TableField("content")
    private String content;
    
    /**
     * 父评论ID（用于回复功能，0表示顶级评论）
     */
    @TableField("parent_id")
    private Long parentId;
    
    /**
     * 点赞数
     */
    @TableField("like_count")
    private Integer likeCount;
    
    /**
     * 状态：0-删除，1-正常
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField("update_time")
    private LocalDateTime updateTime;
}

