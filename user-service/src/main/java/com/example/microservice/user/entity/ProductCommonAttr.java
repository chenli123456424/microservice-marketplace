package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("product_common_attr")
public class ProductCommonAttr {
    @TableId(type = IdType.AUTO)
    private Long attrId;
    private Long productId;
    private String material;
    private String spec;
    private String priceUnit;
    private String envGrade;
    private String style;
    private String warranty;
    private String power;
}
