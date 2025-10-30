package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public User findByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        return getOne(queryWrapper);
    }

    @Override
    public User findByEmail(String email) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        return getOne(queryWrapper);
    }

    @Override
    public User register(User user) {
        // 检查用户名是否已存在
        User existingUser = findByUsername(user.getUsername());
        if (existingUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // 保存用户
        save(user);
        return user;
    }

    @Override
    public String login(String username, String password) {
        // 查找用户
        User user = findByUsername(username);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 生成JWT令牌
        return jwtUtil.generateToken(username);
    }

    @Override
    public void sendVerificationCode(String email) {
        // 生成6位验证码
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        
        // 将验证码存入Redis，设置5分钟过期
        String key = "verification:" + email;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        
        // TODO: 发送验证码到邮箱
        System.out.println("验证码：" + code);
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String key = "verification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        return code.equals(savedCode);
    }

    @Override
    public String verifyCodeAndLogin(String email, String code) {
        if (!verifyCode(email, code)) {
            throw new RuntimeException("验证码错误");
        }

        // 查找用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        User user = getOne(queryWrapper);
        
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 生成JWT令牌
        return jwtUtil.generateToken(user.getUsername());
    }

    @Override
    public void forgotPassword(String email) {
        // 查找用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        User user = getOne(queryWrapper);
        
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 生成重置密码验证码
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        
        // 将验证码存入Redis，设置5分钟过期
        String key = "reset:" + email;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        
        // TODO: 发送验证码到邮箱
        System.out.println("重置密码验证码：" + code);
    }

    @Override
    public boolean resetPassword(String email, String code, String newPassword) {
        try {
            // 验证重置密码验证码
            if (!verifyResetCode(email, code)) {
                return false;
            }

            // 查找用户
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("email", email);
            User user = getOne(queryWrapper);
            
            if (user == null) {
                return false;
            }
            
            // 更新密码
            user.setPassword(passwordEncoder.encode(newPassword));
            updateById(user);
            
            // 删除验证码
            String key = "reset:" + email;
            redisTemplate.delete(key);
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean verifyResetCode(String email, String code) {
        String key = "reset:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        return code.equals(savedCode);
    }
}