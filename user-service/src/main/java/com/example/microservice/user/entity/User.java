package com.example.microservice.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * @Data: Lombok注解，自动为所有字段生成getter/setter, toString, equals, hashCode等方法。
 * @TableName("t_user"): Mybatis-Plus注解，将这个类与数据库中的 `t_user` 表进行映射。
 */
@Data
@TableName("t_user")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    /**
     * @TableId: Mybatis-Plus注解，指定这个字段是表的主键。
     * type = IdType.AUTO: 指定主键策略为数据库自增。
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String email;
    private String avatar; // 用户头像URL
    // 新增角色字段，默认为 USER
    private String role = "USER";
    // 这两个字段由数据库自动维护，通常在Java对象中声明为只读即可
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
