package com.example.microservice.user.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String category;
    private String subcategory;
    private BigDecimal price;  // 保持BigDecimal类型
    private String mainImageUrl;
    private String tags;
    
    // 添加来自 furniture 表的额外字段
    private String space;
    private String style;
    private String material;
    private String brand;
    private String color;
    private Integer seats;
    private String fabric;
    private String productFunction;
    private String size;

    // 添加来自 kitchen_bathroom_goods 表的额外字段
    private String toiletType;
    private String flushMethod;
    private String pitDistance;
    private String drainageMethod;
    private String waterEfficiencyLevel;
    private String showerRoomType;
    private String glassThickness;
    private String faucetType;
    private String outflowMode;
    private String bathroomCabinetMaterial;
    private String bathroomCabinetSize;

    // 添加来自 hardware_tools 表的额外字段
    private String openingMethod;
    private String securityLevel;
    private String lockType;
    private String unlockingMethod;
    private String applicableDoorType;
    private String hingeType;
    private String slideTrackType;
    private String windowAccessoriesType;

    // 添加来自 lighting 表的额外字段
    private String classification;
    private String lightSourceType;
    private String power;
    private String colorTemperature;
    private String controlMethod;
    private String lampshadeMaterial;

    // 添加来自 soft_furnishings 表的额外字段
    private String pattern;
}