package com.example.microservice.user.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductSaveRequest {
    private Integer mainId;
    private Integer subId;
    private Integer brandId;
    private String name;
    private BigDecimal price;
    private BigDecimal marketPrice;
    private Integer stock;
    private Integer status;

    // 可选：促销/推荐等字段按需补充，此处保留常用

    // 商品详情
    private String detailDescription;

    // 图片URL列表（顺序即排序）
    private List<String> imageUrls;
}


