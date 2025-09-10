package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("main_category")
public class MainCategory {
    @TableId(type = IdType.AUTO)
    private Integer mainId;
    private String name;
    private Integer sortOrder;
}
