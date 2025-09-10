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

    @Data
    public static class AttrFilterDTO {
        private String attrKey;
        private String attrValue;
    }
}