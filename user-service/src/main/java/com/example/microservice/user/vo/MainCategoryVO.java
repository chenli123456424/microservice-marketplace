package com.example.microservice.user.vo;

import lombok.Data;
import java.util.List;

@Data
public class MainCategoryVO {
    private Integer mainId;
    private String name;
    private Integer sortorder;
    private List<SubCategoryVO> subCategories;  // 添加子分类列表
}

