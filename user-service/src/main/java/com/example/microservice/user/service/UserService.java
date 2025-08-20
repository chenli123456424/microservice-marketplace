package com.example.microservice.user.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.microservice.user.entity.User;

/**
 * 用户服务接口
 * 继承 IService<User> 是Mybatis-Plus提供的一个强大功能。
 * 继承后，UserService接口就自动拥有了大量的通用Service层方法，如 getById, list, save, update等。
 */
public interface UserService extends IService<User> {
    /**
     * 我们自定义的注册方法，因为包含了额外的业务逻辑
     * @param user 用户对象
     * @return 注册成功的用户
     */
    User register(User user);
}
