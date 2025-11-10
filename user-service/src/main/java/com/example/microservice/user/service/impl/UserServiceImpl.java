package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.mapper.UserMapper;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
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

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.sender-name:筑家智选}")
    private String senderName;

    @Value("${app.account.cancellation.waiting-period-enabled:false}")
    private boolean waitingPeriodEnabled;

    @Value("${app.account.cancellation.waiting-days:3}")
    private int waitingDays;

    @Override
    public User findByUsername(String username) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", username);
        // 排除已删除的账号（状态2）
        // 如果启用等待期，等待期的账号（状态1）也算存在；如果不启用等待期，只查询正常账号（状态0或null）
        if (waitingPeriodEnabled) {
            queryWrapper.and(wrapper -> wrapper
                .isNull("cancellation_status")
                .or()
                .eq("cancellation_status", 0)
                .or()
                .eq("cancellation_status", 1)
            );
        } else {
            queryWrapper.and(wrapper -> wrapper
                .isNull("cancellation_status")
                .or()
                .eq("cancellation_status", 0)
            );
        }
        return getOne(queryWrapper);
    }

    @Override
    public User findByEmail(String email) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        // 排除已删除的账号（状态2）
        // 如果启用等待期，等待期的账号（状态1）也算存在；如果不启用等待期，只查询正常账号（状态0或null）
        if (waitingPeriodEnabled) {
            queryWrapper.and(wrapper -> wrapper
                .isNull("cancellation_status")
                .or()
                .eq("cancellation_status", 0)
                .or()
                .eq("cancellation_status", 1)
            );
        } else {
            queryWrapper.and(wrapper -> wrapper
                .isNull("cancellation_status")
                .or()
                .eq("cancellation_status", 0)
            );
        }
        return getOne(queryWrapper);
    }

    @Override
    public User register(User user) {
        // 检查用户名是否已存在（findByUsername 已排除已删除的账号）
        if (user.getUsername() != null && !user.getUsername().trim().isEmpty()) {
            User existingUser = findByUsername(user.getUsername());
            if (existingUser != null) {
                // 如果启用等待期且账号在等待期，检查是否超过等待期
                if (waitingPeriodEnabled && existingUser.getCancellationStatus() != null && existingUser.getCancellationStatus() == 1) {
                    if (existingUser.getCancellationTime() != null) {
                        LocalDateTime expirationTime = existingUser.getCancellationTime().plusDays(waitingDays);
                        if (LocalDateTime.now().isBefore(expirationTime)) {
                            throw new RuntimeException("该用户名在注销等待期内，请等待" + waitingDays + "天后再注册，或撤销注销");
                        }
                    }
                } else {
                    throw new RuntimeException("用户名已存在");
                }
            }
        }

        // 检查邮箱是否已存在（findByEmail 已排除已删除的账号）
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
            User existingEmailUser = findByEmail(user.getEmail());
            if (existingEmailUser != null) {
                // 如果启用等待期且账号在等待期，检查是否超过等待期
                if (waitingPeriodEnabled && existingEmailUser.getCancellationStatus() != null && existingEmailUser.getCancellationStatus() == 1) {
                    if (existingEmailUser.getCancellationTime() != null) {
                        LocalDateTime expirationTime = existingEmailUser.getCancellationTime().plusDays(waitingDays);
                        if (LocalDateTime.now().isBefore(expirationTime)) {
                            throw new RuntimeException("该邮箱在注销等待期内，请等待" + waitingDays + "天后再注册，或撤销注销");
                        }
                    }
                } else {
                    throw new RuntimeException("邮箱已被注册");
                }
            }
        }

        // 如果用户名为空，使用邮箱前缀作为用户名
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            if (user.getEmail() != null && user.getEmail().contains("@")) {
                String emailPrefix = user.getEmail().split("@")[0];
                // 确保用户名唯一
                String baseUsername = emailPrefix;
                int suffix = 1;
                while (findByUsername(baseUsername) != null) {
                    baseUsername = emailPrefix + suffix;
                    suffix++;
                }
                user.setUsername(baseUsername);
            } else {
                throw new RuntimeException("用户名或邮箱不能同时为空");
            }
        }

        // 如果密码为空，生成随机密码（邮箱注册时）
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            // 生成随机密码
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        } else {
            // 加密密码
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        // 设置注销状态为正常（0）
        if (user.getCancellationStatus() == null) {
            user.setCancellationStatus(0);
        }
        
        // 保存用户
        save(user);
        return user;
    }

    @Override
    public String login(String username, String password) {
        // 查找用户（findByUsername 已排除已删除的账号）
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
        // 验证邮箱格式
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new RuntimeException("邮箱格式不正确");
        }

        // 生成6位验证码
        String code = String.format("%06d", (int)(Math.random() * 1000000));
        
        // 将验证码存入Redis，设置5分钟过期
        String key = "verification:" + email;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        
        // 发送验证码到邮箱
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // 设置发件人显示名称（格式：显示名称 <邮箱地址>）
            message.setFrom(senderName + " <" + fromEmail + ">");
            message.setTo(email); // 接收方邮箱（用户输入的任意邮箱）
            message.setSubject("【筑家智选】验证码");
            message.setText("您的验证码是：" + code + "，有效期5分钟。请勿泄露给他人。");
            
            mailSender.send(message);
            System.out.println("验证码已发送到邮箱：" + email + "，验证码：" + code);
        } catch (Exception e) {
            System.err.println("发送邮件失败：" + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("发送验证码失败，请稍后重试");
        }
    }

    @Override
    public boolean verifyCode(String email, String code) {
        String key = "verification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        if (savedCode == null) {
            return false; // 验证码不存在或已过期
        }
        return code.equals(savedCode);
    }

    @Override
    public String verifyCodeAndLogin(String email, String code) {
        String key = "verification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        
        if (savedCode == null) {
            throw new RuntimeException("验证码已过期或不存在，请重新获取");
        }
        
        if (!code.equals(savedCode)) {
            throw new RuntimeException("验证码错误，请检查后重试");
        }
        
        // 验证成功后删除验证码（防止重复使用）
        redisTemplate.delete(key);

        // 查找用户（使用 findByEmail 排除已删除的账号）
        User user = findByEmail(email);
        
        // 如果用户不存在，自动注册
        if (user == null) {
            // 创建新用户
            User newUser = new User();
            newUser.setEmail(email);
            // 使用邮箱前缀作为用户名
            String emailPrefix = email.split("@")[0];
            String baseUsername = emailPrefix;
            int suffix = 1;
            while (findByUsername(baseUsername) != null) {
                baseUsername = emailPrefix + suffix;
                suffix++;
            }
            newUser.setUsername(baseUsername);
            // 生成随机密码
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setRole("USER");
            newUser.setCancellationStatus(0); // 正常状态
            // 保存用户
            save(newUser);
            user = newUser;
        }
        // 注意：如果用户存在，findByEmail 已排除已删除的账号，所以这里不需要再检查

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
        
        // 发送验证码到邮箱
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // 设置发件人显示名称（格式：显示名称 <邮箱地址>）
            message.setFrom(senderName + " <" + fromEmail + ">");
            message.setTo(email); // 接收方邮箱（用户输入的任意邮箱）
            message.setSubject("【筑家智选】重置密码验证码");
            message.setText("您的重置密码验证码是：" + code + "，有效期5分钟。请勿泄露给他人。");
            
            mailSender.send(message);
            System.out.println("重置密码验证码已发送到邮箱：" + email + "，验证码：" + code);
        } catch (Exception e) {
            System.err.println("发送邮件失败：" + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("发送验证码失败，请稍后重试");
        }
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

    @Override
    public User registerWithEmail(String email, String code) {
        // 验证验证码
        if (!verifyCode(email, code)) {
            throw new RuntimeException("验证码错误或已过期");
        }

        // 检查邮箱是否已存在（findByEmail 已排除已删除的账号）
        User existingUser = findByEmail(email);
        if (existingUser != null) {
            // 如果启用等待期且账号在等待期，检查是否超过等待期
            if (waitingPeriodEnabled && existingUser.getCancellationStatus() != null && existingUser.getCancellationStatus() == 1) {
                if (existingUser.getCancellationTime() != null) {
                    LocalDateTime expirationTime = existingUser.getCancellationTime().plusDays(waitingDays);
                    if (LocalDateTime.now().isBefore(expirationTime)) {
                        throw new RuntimeException("该邮箱在注销等待期内，请等待" + waitingDays + "天后再注册，或撤销注销");
                    }
                }
            } else {
                throw new RuntimeException("该邮箱已被注册");
            }
        }

        // 创建新用户
        User newUser = new User();
        newUser.setEmail(email);
        // 使用邮箱前缀作为用户名
        String emailPrefix = email.split("@")[0];
        String baseUsername = emailPrefix;
        int suffix = 1;
        while (findByUsername(baseUsername) != null) {
            baseUsername = emailPrefix + suffix;
            suffix++;
        }
        newUser.setUsername(baseUsername);
        // 生成随机密码
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setRole("USER");
        newUser.setCancellationStatus(0); // 正常状态
        
        // 保存用户
        save(newUser);
        
        // 删除验证码（已使用）
        String key = "verification:" + email;
        redisTemplate.delete(key);
        
        return newUser;
    }

    @Override
    @Transactional
    public boolean cancelAccount(Long userId) {
        try {
            User user = getById(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }

            if (waitingPeriodEnabled) {
                // 启用等待期：设置为等待期状态（1），记录注销时间
                user.setCancellationStatus(1);
                user.setCancellationTime(LocalDateTime.now());
                user.setCancellationRevokeTime(null);
                return updateById(user);
            } else {
                // 不启用等待期：直接从数据库物理删除账号
                return removeById(userId);
            }
        } catch (Exception e) {
            System.err.println("注销账号失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("注销账号失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public boolean revokeCancellation(Long userId) {
        try {
            User user = getById(userId);
            if (user == null) {
                throw new RuntimeException("用户不存在");
            }

            if (user.getCancellationStatus() == null || user.getCancellationStatus() != 1) {
                throw new RuntimeException("账号未处于注销等待期，无法撤销");
            }

            // 撤销注销
            user.setCancellationStatus(0); // 恢复正常
            user.setCancellationRevokeTime(LocalDateTime.now());
            return updateById(user);
        } catch (Exception e) {
            System.err.println("撤销注销失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("撤销注销失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteExpiredCancelledAccounts() {
        if (!waitingPeriodEnabled) {
            return; // 如果未启用等待期，不需要执行定时任务
        }

        try {
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("cancellation_status", 1); // 查找等待期的账号
            queryWrapper.isNotNull("cancellation_time");
            
            LocalDateTime expirationTime = LocalDateTime.now().minusDays(waitingDays);
            queryWrapper.le("cancellation_time", expirationTime); // 超过等待期的账号

            List<User> expiredUsers = list(queryWrapper);
            for (User user : expiredUsers) {
                user.setCancellationStatus(2); // 设置为已删除
                updateById(user);
                System.out.println("删除过期注销账号: " + user.getUsername() + " (ID: " + user.getId() + ")");
            }

            if (!expiredUsers.isEmpty()) {
                System.out.println("共删除 " + expiredUsers.size() + " 个过期注销账号");
            }
        } catch (Exception e) {
            System.err.println("删除过期注销账号失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}