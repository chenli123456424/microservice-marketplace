package com.example.microservice.user.vo;

import lombok.Data;

import java.util.List;

@Data
public class SubCategoryVO {
    private Integer subId;
    private Integer mainId;
    private String name;
    private Integer sortOrder;
    private String imageUrl;
}
