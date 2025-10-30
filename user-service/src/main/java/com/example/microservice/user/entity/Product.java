package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("product")
public class Product {
    @TableId(type = IdType.AUTO)
    private Long productId;
    private Integer mainId;
    private Integer subId;
    private Integer brandId;
    private String name;
    private BigDecimal price;
    private BigDecimal marketPrice;
    private Integer stock;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    // 推荐类型字段
    private Boolean isHotRecommended; // 热门推荐
    private Boolean isNewArrival; // 新品上市
    private Boolean isLimitedOffer; // 限时特惠
    private Boolean isBestSeller; // 爆款热销
    
    // 促销相关字段
    private Boolean isPromotion; // 是否促销
    private BigDecimal promotionPrice; // 促销价格
    private LocalDateTime promotionStartTime; // 促销开始时间
    private LocalDateTime promotionEndTime; // 促销结束时间
    
    // 分期相关字段
    private Boolean supportInstallment; // 是否支持分期
    private Integer installmentMonths; // 分期月数
    
    // 热门搜索相关字段
    private Boolean isHotSearch; // 是否热门搜索
    private String searchKeywords; // 搜索关键词
    
    // 库存状态字段
    private Boolean stockStatus; // 库存状态: true-有货, false-缺货
    
    // 销量相关字段
    private Integer salesCount; // 销量
    private Integer viewCount; // 浏览量

    // 商品详情富文本/markdown
    private String detailDescription;

    // 非持久化字段：列表首图/图片集合
    @TableField(exist = false)
    private String thumbnailUrl;

    @TableField(exist = false)
    private List<ProductImage> images;
    
    // 非持久化字段：图片URL列表（用于接收前端数据）
    @TableField(exist = false)
    private List<String> imageUrls;
    
    // 非持久化字段：颜色和规格选项（用于接收前端数据）
    @TableField(exist = false)
    private List<String> colors;
    
    @TableField(exist = false)
    private List<String> specs;
}
