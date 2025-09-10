package com.example.microservice.user.vo;

import com.example.microservice.user.entity.Product;
import lombok.Data;

@Data
public class ProductVO {
    private Long productId;
    private String name;
    private String mainCategoryName;
    private String subCategoryName;
    private String brandName;
    private String price;
    private String imageUrl; // 主图
}
