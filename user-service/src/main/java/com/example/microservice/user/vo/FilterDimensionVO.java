package com.example.microservice.user.vo;

import lombok.Data;
import java.util.List;

@Data
public class FilterDimensionVO {
    private Integer dimensionId;
    private String name;
    private Integer level;
    private Integer sortOrder;
    private List<FilterDimensionVO> children;
}
