package com.example.microservice.user.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MainCategoryVO {
    private Integer mainId;
    private String name;
    private Integer sortOrder;
    private List<SubCategoryVO> subCategories;
}
