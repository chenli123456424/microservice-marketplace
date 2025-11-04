package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 设计师实体类
 */
@Data
@TableName("designer")
public class Designer implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 设计师ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 设计师姓名
     */
    @TableField("name")
    private String name;
    
    /**
     * 职称
     */
    @TableField("title")
    private String title;
    
    /**
     * 工作年限
     */
    @TableField("experience")
    private String experience;
    
    /**
     * 擅长风格（JSON数组字符串）
     */
    @TableField("specialties")
    private String specialties;
    
    /**
     * 头像图片URL
     */
    @TableField("avatar")
    private String avatar;
    
    /**
     * 已完成案例数
     */
    @TableField("case_count")
    private Integer caseCount;
    
    /**
     * 评分（0-5分）
     */
    @TableField("rating")
    private BigDecimal rating;
    
    /**
     * 个人简介
     */
    @TableField("description")
    private String description;
    
    /**
     * 联系电话
     */
    @TableField("phone")
    private String phone;
    
    /**
     * 排序权重（越大越靠前）
     */
    @TableField("sort_order")
    private Integer sortOrder;
    
    /**
     * 状态：0-离职，1-在职
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
