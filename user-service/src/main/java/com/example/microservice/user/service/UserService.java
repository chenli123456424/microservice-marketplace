package com.example.microservice.user.service;

import com.example.microservice.user.entity.User;
import com.baomidou.mybatisplus.extension.service.IService;

public interface UserService extends IService<User> {
    User findByUsername(String username);
    User findByEmail(String email);
    User register(User user);
    String login(String username, String password);
    void sendVerificationCode(String email);
    boolean verifyCode(String email, String code);
    String verifyCodeAndLogin(String email, String code);
    void forgotPassword(String email);
    boolean resetPassword(String email, String code, String newPassword);
    boolean verifyResetCode(String email, String code);
}