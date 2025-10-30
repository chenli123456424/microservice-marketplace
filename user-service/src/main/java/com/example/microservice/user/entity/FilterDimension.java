package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("filter_dimension")
public class FilterDimension {
    @TableId(type = IdType.AUTO)
    private Integer dimensionId;
    private Integer mainId;
    private Integer subId;
    private Integer parentId;
    private String name;
    private Integer level;
    private Integer sortOrder;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
