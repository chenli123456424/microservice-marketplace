package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 社区帖子实体类
 */
@Data
@TableName("community_post")
public class CommunityPost implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 帖子ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID（发布者）
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
     * 标题
     */
    @TableField("title")
    private String title;
    
    /**
     * 内容（支持富文本）
     */
    @TableField("content")
    private String content;
    
    /**
     * 图片URLs（JSON格式存储，多个图片用逗号分隔）
     */
    @TableField("images")
    private String images;
    
    /**
     * 视频URL（可选）
     */
    @TableField("video_url")
    private String videoUrl;
    
    /**
     * 类型：INSPIRATION-灵感分享, QUESTION-问答, SHOWCASE-作品展示
     */
    @TableField("type")
    private String type;
    
    /**
     * 点赞数
     */
    @TableField("like_count")
    private Integer likeCount;
    
    /**
     * 点赞用户ID列表（JSON数组格式）
     */
    @TableField("liked_user_ids")
    private String likedUserIds;
    
    /**
     * 评论数
     */
    @TableField("comment_count")
    private Integer commentCount;
    
    /**
     * 浏览数
     */
    @TableField("view_count")
    private Integer viewCount;
    
    /**
     * 状态：0-删除，1-正常，2-审核中
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 创建时间
     */
    @TableField("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField("update_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime updateTime;
}

