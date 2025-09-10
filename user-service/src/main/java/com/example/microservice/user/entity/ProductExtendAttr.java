package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("product_extend_attr")
public class ProductExtendAttr {
    @TableId(type = IdType.AUTO)
    private Long extendId;
    private Long productId;
    private Integer mainId;
    private String attrKey;
    private String attrValue;
}
