package com.example.microservice.user.vo;

import lombok.Data;

@Data
public class SubCategoryVO {
    private Integer subId;
    private Integer mainId;
    private String name;
    private Integer sortOrder;
}
