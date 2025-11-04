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
 * 全屋定制案例实体类
 */
@Data
@TableName("custom_case")
public class CustomCase implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 案例ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 案例标题
     */
    @TableField("title")
    private String title;
    
    /**
     * 案例风格
     */
    @TableField("style")
    private String style;
    
    /**
     * 房屋面积（平方米）
     */
    @TableField("area")
    private Integer area;
    
    /**
     * 预算金额
     */
    @TableField("budget")
    private BigDecimal budget;
    
    /**
     * 案例图片（多张图片用逗号分隔）
     */
    @TableField("images")
    private String images;
    
    /**
     * 案例描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 设计亮点（JSON数组字符串）
     */
    @TableField("highlights")
    private String highlights;
    
    /**
     * 设计师ID
     */
    @TableField("designer_id")
    private Long designerId;
    
    /**
     * 设计师姓名（冗余字段，方便查询）
     */
    @TableField("designer_name")
    private String designerName;
    
    /**
     * 浏览次数
     */
    @TableField("view_count")
    private Integer viewCount;
    
    /**
     * 点赞次数
     */
    @TableField("like_count")
    private Integer likeCount;
    
    /**
     * 排序权重（越大越靠前）
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
