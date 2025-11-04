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
 * 门店实体类
 */
@Data
@TableName("store")
public class Store implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 门店ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 门店名称
     */
    @TableField("name")
    private String name;
    
    /**
     * 所在城市
     */
    @TableField("city")
    private String city;
    
    /**
     * 门店地址
     */
    @TableField("address")
    private String address;
    
    /**
     * 联系电话
     */
    @TableField("phone")
    private String phone;
    
    /**
     * 营业时间
     */
    @TableField("business_hours")
    private String businessHours;
    
    /**
     * 门店图片URL
     */
    @TableField("image")
    private String image;
    
    /**
     * 门店描述
     */
    @TableField("description")
    private String description;
    
    /**
     * 纬度
     */
    @TableField("latitude")
    private BigDecimal latitude;
    
    /**
     * 经度
     */
    @TableField("longitude")
    private BigDecimal longitude;
    
    /**
     * 状态：0-关闭，1-营业
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 排序顺序
     */
    @TableField("sort_order")
    private Integer sortOrder;
    
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
