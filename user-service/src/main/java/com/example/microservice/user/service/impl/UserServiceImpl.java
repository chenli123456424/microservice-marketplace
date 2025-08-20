package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;
import com.example.microservice.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.*;

/**
 * @Service: 告诉Spring，这是一个Service层的Bean，请把它交给我管理。
 * ServiceImpl<UserMapper, User> 是 IService 的标准实现，我们需要传入自己的 Mapper 和 Entity。
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    /**
     * 这是我们真正的业务逻辑实现
     */
    //注入 PasswordEncoder
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User register(User user) {
        // 1. 检查用户名是否已存在
        // 创建一个查询条件包装器
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        // 添加查询条件
        queryWrapper.eq("username", user.getUsername());
        // baseMapper就是从ServiceImpl继承过来的UserMapper的实例
        Integer count = baseMapper.selectCount(queryWrapper);
        //如果count>0，则表示用户名已存在
        if (count > 0) {
            throw new RuntimeException("用户名已存在");
        }
        // 密码加密
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // 2. 检查邮箱是否已存在
        queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", user.getEmail());
        count = baseMapper.selectCount(queryWrapper);
        if (count > 0) {
            throw new RuntimeException("邮箱已存在");
        }

        // 3. 如果用户名和邮箱都不存在，则插入用户数据
        //this.save()是ServiceImpl继承的方法，它内部会调用baseMapper.insert()方法
        this.save(user);
        return user;
    }
}
