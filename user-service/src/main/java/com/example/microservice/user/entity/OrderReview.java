package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 订单评价实体类
 */
@Data
@TableName("order_review")
public class OrderReview implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 评价ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 订单ID
     */
    @TableField("order_id")
    private Long orderId;
    
    /**
     * 订单项ID（可选，如果是对整个订单评价则为null）
     */
    @TableField("order_item_id")
    private Long orderItemId;
    
    /**
     * 商品ID
     */
    @TableField("product_id")
    private Long productId;
    
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
     * 评分（1-5分）
     */
    @TableField("rating")
    private Integer rating;
    
    /**
     * 评价内容
     */
    @TableField("content")
    private String content;
    
    /**
     * 晒单图片（多张图片用逗号分隔）
     */
    @TableField("images")
    private String images;
    
    /**
     * 状态：0-删除，1-正常，2-待审核
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

