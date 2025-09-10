package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
}
