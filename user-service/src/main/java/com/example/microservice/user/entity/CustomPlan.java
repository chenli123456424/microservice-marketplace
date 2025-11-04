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
 * 定制方案实体类
 */
@Data
@TableName("custom_plan")
public class CustomPlan implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 方案ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 方案名称
     */
    @TableField("name")
    private String name;
    
    /**
     * 方案类型：basic-基础版，advanced-进阶版，luxury-豪华版
     */
    @TableField("type")
    private String type;
    
    /**
     * 价格区间（每平米）
     */
    @TableField("price_range")
    private String priceRange;
    
    /**
     * 起始价格
     */
    @TableField("price_from")
    private BigDecimal priceFrom;
    
    /**
     * 结束价格
     */
    @TableField("price_to")
    private BigDecimal priceTo;
    
    /**
     * 方案描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 包含内容（JSON数组）
     */
    @TableField("includes")
    private String includes;
    
    /**
     * 方案亮点
     */
    @TableField("highlight")
    private String highlight;
    
    /**
     * 方案图标（emoji）
     */
    @TableField("icon")
    private String icon;
    
    /**
     * 排序权重（越小越靠前）
     */
    @TableField("sort_order")
    private Integer sortOrder;
    
    /**
     * 状态：0-下架，1-上架
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
