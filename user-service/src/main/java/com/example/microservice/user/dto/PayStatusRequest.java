package com.example.microservice.user.dto;

import lombok.Data;

/**
 * 支付状态更新请求DTO
 */
@Data
public class PayStatusRequest {
    
    /**
     * 支付状态
     * 0: 未支付
     * 1: 已支付
     */
    private Integer payStatus;
    
    /**
     * 支付方式
     * alipay: 支付宝
     * wechat: 微信支付
     */
    private String payMethod;
}
