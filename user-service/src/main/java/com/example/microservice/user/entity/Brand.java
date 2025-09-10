package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("brand")
public class Brand {
    @TableId(type = IdType.AUTO)
    private Integer brandId;
    private String name;
    private String logo;
}
