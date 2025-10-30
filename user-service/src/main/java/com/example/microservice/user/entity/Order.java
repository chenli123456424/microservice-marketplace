package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("`order`")
public class Order {
    @TableId(value = "order_id", type = IdType.AUTO)
    private Long orderId;
    
    @TableField("order_no")
    private String orderNo;
    
    @TableField("user_id")
    private Long userId;
    
    @TableField("total_amount")
    private BigDecimal totalAmount;
    
    @TableField("discount_amount")
    private BigDecimal discountAmount;
    
    @TableField("pay_amount")
    private BigDecimal payAmount;
    
    @TableField("order_status")
    private Integer orderStatus;
    
    @TableField("pay_status")
    private Integer payStatus;
    
    @TableField("pay_method")
    private String payMethod;
    
    @TableField("pay_time")
    private LocalDateTime payTime;
    
    @TableField("delivery_status")
    private Integer deliveryStatus;
    
    @TableField("delivery_time")
    private LocalDateTime deliveryTime;
    
    @TableField("receiver_name")
    private String receiverName;
    
    @TableField("receiver_phone")
    private String receiverPhone;
    
    @TableField("receiver_address")
    private String receiverAddress;
    
    private String remark;
    
    @TableField("create_time")
    private LocalDateTime createTime;
    
    @TableField("update_time")
    private LocalDateTime updateTime;
    
    // 非持久化字段：订单商品列表
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private List<OrderItem> orderItems;
    
    // 非持久化字段：用户名
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private String username;
    
    // 订单状态枚举
    public enum OrderStatus {
        PENDING_PAYMENT(1, "待付款"),
        PAID(2, "已付款"),
        SHIPPED(3, "已发货"),
        COMPLETED(4, "已完成"),
        CANCELLED(5, "已取消");
        
        private final int code;
        private final String desc;
        
        OrderStatus(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }
        
        public int getCode() {
            return code;
        }
        
        public String getDesc() {
            return desc;
        }
        
        public static String getDescByCode(int code) {
            for (OrderStatus status : values()) {
                if (status.code == code) {
                    return status.desc;
                }
            }
            return "未知状态";
        }
    }
    
    // 支付状态枚举
    public enum PayStatus {
        UNPAID(0, "未支付"),
        PAID(1, "已支付");
        
        private final int code;
        private final String desc;
        
        PayStatus(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }
        
        public int getCode() {
            return code;
        }
        
        public String getDesc() {
            return desc;
        }
        
        public static String getDescByCode(int code) {
            for (PayStatus status : values()) {
                if (status.code == code) {
                    return status.desc;
                }
            }
            return "未知状态";
        }
    }
    
    // 发货状态枚举
    public enum DeliveryStatus {
        NOT_SHIPPED(0, "未发货"),
        SHIPPED(1, "已发货");
        
        private final int code;
        private final String desc;
        
        DeliveryStatus(int code, String desc) {
            this.code = code;
            this.desc = desc;
        }
        
        public int getCode() {
            return code;
        }
        
        public String getDesc() {
            return desc;
        }
        
        public static String getDescByCode(int code) {
            for (DeliveryStatus status : values()) {
                if (status.code == code) {
                    return status.desc;
                }
            }
            return "未知状态";
        }
    }
}
