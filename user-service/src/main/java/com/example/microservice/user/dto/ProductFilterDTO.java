package com.example.microservice.user.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class ProductFilterDTO {
    @NotNull(message = "大分类ID不能为空")
    private Integer mainId;

    private Integer subId;

    private List<AttrFilterDTO> attrs;
    
    // 新增筛选条件
    private Boolean isPromotion; // 是否促销
    private Boolean supportInstallment; // 是否支持分期
    private Boolean onlyInStock; // 仅看有货
    private String hotSearchKeywords; // 热门搜索关键词
    
    // 排序相关字段
    private String sortType; // 排序类型：综合、新品、销量、价格
    private String sortOrder; // 排序方向：asc、desc
    private String location; // 收货地
    
    // 搜索相关字段
    private String searchKeyword; // 搜索关键字

    @Data
    public static class AttrFilterDTO {
        private String attrKey;
        private String attrValue;
    }
}