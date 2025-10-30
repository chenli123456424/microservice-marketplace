package com.example.microservice.user.vo;

import lombok.Data;
import java.util.List;

@Data
public class FilterDimensionVO {
    private Integer dimensionId;
    private Integer mainId;
    private Integer subId;
    private Integer parentId;
    private String name;
    private Integer level;
    private Integer sortOrder;
    private List<FilterDimensionVO> children;
}
