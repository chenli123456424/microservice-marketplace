package com.example.microservice.user.dto;

import lombok.Data;
import java.util.List;

/**
 * 创建订单请求DTO
 */
@Data
public class CreateOrderRequest {
    
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 订单项列表（立即购买时只有一个，购物车结算时可能有多个）
     */
    private List<OrderItemRequest> orderItems;
    
    /**
     * 收货人姓名
     */
    private String receiverName;
    
    /**
     * 收货人电话
     */
    private String receiverPhone;
    
    /**
     * 收货地址
     */
    private String receiverAddress;
    
    /**
     * 订单备注
     */
    private String remark;
    
    /**
     * 支付方式
     */
    private String payMethod;
    
    /**
     * 订单项请求DTO
     */
    @Data
    public static class OrderItemRequest {
        /**
         * 商品ID
         */
        private Long productId;
        
        /**
         * 购买数量
         */
        private Integer quantity;
        
        /**
         * 商品规格
         */
        private String spec;
        
        /**
         * 商品颜色
         */
        private String color;
    }
}
