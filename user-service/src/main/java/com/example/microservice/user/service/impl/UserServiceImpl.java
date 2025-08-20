package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.swing.*;
import java.util.Collections;

/**
 * @Service: 告诉Spring，这是一个Service层的Bean，请把它交给我管理。
 * ServiceImpl<UserMapper, User> 是 IService 的标准实现，我们需要传入自己的 Mapper 和 Entity。
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService, UserDetailsService {
    /**
     * 这是我们真正的业务逻辑实现
     */
    //注入 PasswordEncoder
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // 注册
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

    // 登录
    @Override
    public String login(String username, String password) {
        // 1. 根据用户名查询用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        User user = baseMapper.selectOne(queryWrapper);
        // 如果用户不存在，则抛出异常
        if (user == null) {
            throw new BadCredentialsException("用户名或密码错误");
        }

        // 2. 验证密码
        // 使用 passwordEncoder.matches() 方法来比较明文密码和数据库中的哈希密码
        String encodedPassword = passwordEncoder.encode(password);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("密码错误");
        }

        // 3.如果验证通过，则生成JWT并返回
        return jwtUtil.generateToken(user.getUsername());
    }

    /**
     * 这是 UserDetailsService 接口要求实现的方法
     * Spring Security 在进行认证时会调用这个方法来加载用户信息
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        // 1. 从我们的数据库中根据用户名查询用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        User user = baseMapper.selectOne(queryWrapper);

        // 2.如果用户不存在，则抛出异常
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        // 3.如果用户存在，将我们的 User 对象转换成 Spring Security 能识别的 UserDetails 对象
        //    org.springframework.security.core.userdetails.User
        //    构造函数需要：用户名、密码(已加密的)、权限集合
        //    我们暂时不涉及复杂的角色权限，所以给一个空的权限集合
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.emptyList()
        );
    }
}
