package com.example.microservice.user.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 创建订单响应DTO
 */
@Data
public class CreateOrderResponse {
    
    /**
     * 订单ID
     */
    private Long orderId;
    
    /**
     * 订单号
     */
    private String orderNo;
    
    /**
     * 订单总金额
     */
    private BigDecimal totalAmount;
    
    /**
     * 实付金额
     */
    private BigDecimal payAmount;
    
    /**
     * 订单状态
     */
    private Integer orderStatus;
    
    /**
     * 支付状态
     */
    private Integer payStatus;
    
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    
    /**
     * 收货人信息
     */
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    
    /**
     * 订单备注
     */
    private String remark;
}
