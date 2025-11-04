package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 预约信息实体类
 */
@Data
@TableName("appointment")
public class Appointment implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 预约ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 用户ID
     */
    @TableField("user_id")
    private Long userId;
    
    /**
     * 姓名
     */
    @TableField("name")
    private String name;
    
    /**
     * 联系电话
     */
    @TableField("phone")
    private String phone;
    
    /**
     * 所在城市
     */
    @TableField("city")
    private String city;
    
    /**
     * 房屋面积（平方米）
     */
    @TableField("area")
    private Integer area;
    
    /**
     * 装修风格
     */
    @TableField("style")
    private String style;
    
    /**
     * 预算范围
     */
    @TableField("budget")
    private String budget;
    
    /**
     * 备注信息
     */
    @TableField("remark")
    private String remark;
    
    /**
     * 指定设计师ID
     */
    @TableField("designer_id")
    private Long designerId;
    
    /**
     * 预约状态：0-待处理，1-已联系，2-已量尺，3-已完成，9-已取消
     */
    @TableField("status")
    private Integer status;
    
    /**
     * 处理人（管理员ID）
     */
    @TableField("handler_id")
    private Long handlerId;
    
    /**
     * 处理时间
     */
    @TableField("handle_time")
    private LocalDateTime handleTime;
    
    /**
     * 处理备注
     */
    @TableField("handle_remark")
    private String handleRemark;
    
    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;
    
    /**
     * 更新时间
     */
    @TableField("update_time")
    private LocalDateTime updateTime;
}
