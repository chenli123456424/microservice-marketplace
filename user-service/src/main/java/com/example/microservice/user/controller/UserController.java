package com.example.microservice.user.controller;

import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @RestController: 这是一个组合注解，相当于 @Controller + @ResponseBody。
 * 它告诉Spring，这个类里的所有方法返回的都是数据（如JSON），而不是视图（如HTML页面）。
 *
 * @RequestMapping("/api/user"): 定义了这个Controller中所有接口的公共路径前缀。
 * 也就是说，访问这个类里的任何接口，URL都必须以 /api/user 开头。
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    /**
     * @PostMapping("/register"): 映射到HTTP POST请求，通常用于创建资源。
     * @RequestBody User user:
     *   这个注解告诉Spring，从HTTP请求的 Body 中获取JSON数据，
     *   并自动转换(反序列化)成一个User对象。
     *
     * @return User: 我们将保存成功后的用户信息（包含数据库生成的ID）返回给客户端。
     */
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        // 调用继承自BaseMapper的insert方法，将用户数据插入数据库
        userMapper.insert(user);
        // 插入成功后，Mybatis-Plus会将数据库生成的自增ID回填到user对象中
        return user;
    }

    /**
     * @GetMapping("/{id}"): 映射到HTTP GET请求，通常用于查询资源。
     * @PathVariable Long id:
     *   这个注解告诉Spring，从URL路径中获取id参数的值。
     *
     * @return User: 根据id查询到的用户信息。
     */
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userMapper.selectById(id);
    }
}
