package com.example.microservice.user.vo;

import com.example.microservice.user.entity.ProductCommonAttr;
import com.example.microservice.user.entity.ProductExtendAttr;
import com.example.microservice.user.entity.ProductImage;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductDetailVO {
    private Long productId;
    private Integer mainId;
    private Integer subId;
    private String mainCategoryName;
    private String subCategoryName;
    private Integer brandId;
    private String brandName;
    private String name;
    private BigDecimal price;
    private BigDecimal marketPrice;
    private Integer stock;
    private Integer status;
    private LocalDateTime createTime;

    private ProductCommonAttr commonAttr;
    private List<ProductExtendAttr> extendAttrs;
    private List<ProductImage> images;
    private String detailDescription;
}
