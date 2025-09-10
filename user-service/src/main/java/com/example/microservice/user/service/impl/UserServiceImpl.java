package com.example.microservice.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

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

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private StringRedisTemplate redisTemplate;//使用StringRedisTemplate，因为它对字符串操作更友好

    // 从 application.yml 中读取发件人地址
    @Value("${spring.mail.username}")
    private String fromEmail;

    // 注册
    @Override
    public User register(User user) {
        // 1. 检查用户名是否已存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", user.getUsername());
        Long count = baseMapper.selectCount(queryWrapper);
        if (count > 0) {
            throw new RuntimeException("用户名已存在");
        }
        
        // 2. 检查邮箱是否已存在
        queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", user.getEmail());
        count = baseMapper.selectCount(queryWrapper);
        if (count > 0) {
            throw new RuntimeException("邮箱已存在");
        }

        // 3. 设置默认角色（如果未提供）
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER"); // 默认角色为普通用户
        }

        // 4. 密码加密
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // 5. 插入用户数据
        this.save(user);
        return user;
    }

    // 登录
    @Override
    public String login(String username, String password) {
        // 1. 根据用户名或邮箱查询用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        // 检查输入的是邮箱还是用户名
        if (username.contains("@")) {
            // 如果包含@符号，则按邮箱查询
            queryWrapper.eq("email", username);
        } else {
            // 否则按用户名查询
            queryWrapper.eq("username", username);
        }
        
        User user = baseMapper.selectOne(queryWrapper);
        // 如果用户不存在，则抛出异常
        if (user == null) {
            throw new BadCredentialsException("用户名或密码错误");
        }

        // 2. 验证密码
        // 使用 passwordEncoder.matches() 方法来比较明文密码和数据库中的哈希密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("密码错误");
        }

        // 3.如果验证通过，则生成JWT并返回
        return jwtUtil.generateToken(user.getUsername());
    }

    //实现发送验证码的方法
    @Override
    public void sendVerificationCode(String email) {
        // 1. 生成随机的6位数验证码
        String code = String.format("%06d", new Random().nextInt(999999));
        // 2. 将验证码保存到 Redis 中，并设置5分钟的有效期
        //使用一个有意义的前缀来构造key
        String redisKey = "email_code:" + email;
        redisTemplate.opsForValue().set(redisKey, code, 5 * 60L, TimeUnit.SECONDS);
        // 3. 创建邮件对象
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("验证码");
        message.setText("欢迎使用电商平台，您的验证码是：" + code + "，有效期为5分钟。");
        mailSender.send(message);

    }
    // 实现校验和登录的方法
    @Override
    public String verifyCodeAndLogin(String email, String code){
        // 从 Redis 中获取验证码
        String redisKey = "email_code:" + email;
        String correctCode = redisTemplate.opsForValue().get(redisKey);
        // 校验验证码
        if (correctCode == null){
            throw new BadCredentialsException("验证码已过期");
        }
        // 比较验证码
        if (!correctCode.equals(code)){
            throw new BadCredentialsException("验证码错误");
        }
        // 验证通过后，删除Redis中的验证码，避免重复使用
        redisTemplate.delete(redisKey);
        // 检查用户是否存在，如果不存在则自动注册
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        User user = baseMapper.selectOne(queryWrapper);

        if (user == null){
            // 用户不存在，执行自动注册
            user = new User();
            user.setEmail(email);
            //默认生成一个用户名，可以基于邮箱生成
            user.setUsername(email.split("@")[0]+new Random().nextInt(1000));
            //对于验证码登录的用户，密码设置成一个随机的、复杂的默认值
            //并对密码进行加密储存
            String randomPassword = passwordEncoder.encode(UUID.randomUUID().toString());
            user.setPassword(randomPassword);

            baseMapper.insert(user);
            //重新查询一次，以获取包含新增用户的所有信息
            user = baseMapper.selectOne(queryWrapper);
        }
        return jwtUtil.generateToken(user.getUsername());
    }

    // 忘记密码
    @Override
    public void forgotPassword(String email) {
        // 1. 检查用户是否存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        User user = baseMapper.selectOne(queryWrapper);

        if (user == null) {
            throw new BadCredentialsException("用户不存在");
        }

        // 2. 生成随机6位数验证码
        String code = String.format("%06d", new Random().nextInt(999999));
        // 3. 将验证码保存到 Redis 中，并设置5分钟的有效期
        String redisKey = "reset_password_code:" + email;
        redisTemplate.opsForValue().set(redisKey, code, 5 * 60L, TimeUnit.SECONDS);
        // 4. 创建邮件对象
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("重置密码");
        message.setText("欢迎使用电商平台，您的重置密码验证码是：" + code + "，有效期为5分钟。");
        mailSender.send(message);
    }

    // 验证重置密码验证码
    @Override
    public boolean verifyResetCode(String email, String code) {
        // 获取Redis中的验证码
        String redisKey = "reset_password_code:" + email;
        String correctCode = redisTemplate.opsForValue().get(redisKey);

        // 校验验证码
        if (correctCode == null) {
            return false; // 验证码已过期
        }

        // 比较验证码
        return correctCode.equals(code);
    }

    // 重置密码
    @Override
    public boolean resetPassword(String email, String code, String newPassword) {
        // 再次验证验证码确保安全性
        if (!verifyResetCode(email, code)) {
            return false;
        }

        // 验证通过后，删除Redis中的验证码，避免重复使用
        String redisKey = "reset_password_code:" + email;
        redisTemplate.delete(redisKey);

        // 更新密码
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("email", email);
        User user = baseMapper.selectOne(queryWrapper);

        if (user == null) {
            return false; // 用户不存在
        }

        // 对密码进行加密储存
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        baseMapper.updateById(user);
        return true; // 返回true表示重置成功
    }

    /**
     * 根据条件分页查询用户
     * @param page 分页对象
     * @param queryWrapper 查询条件
     * @return 分页结果
     */
    @Override
    public IPage<User> page(Page<User> page, QueryWrapper<User> queryWrapper) {
        // 使用父类的page方法进行分页查询
        return baseMapper.selectPage(page, queryWrapper);
    }

    /**
     * 这是 UserDetailsService 接口要求实现的方法
     * Spring Security 在进行认证时会调用这个方法来加载用户信息
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
        // 1. 从我们的数据库中根据用户名或邮箱查询用户
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        // 检查输入的是邮箱还是用户名
        if (username.contains("@")) {
            // 如果包含@符号，则按邮箱查询
            queryWrapper.eq("email", username);
        } else {
            // 否则按用户名查询
            queryWrapper.eq("username", username);
        }
        User user = baseMapper.selectOne(queryWrapper);

        // 2.如果用户不存在，则抛出异常
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }

        // 3.根据用户角色设置权限
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        
        // 添加基于角色的权限
        switch (user.getRole()) {
            case "SUPER_ADMIN":
                authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_MERCHANT"));
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
            case "MERCHANT":
                authorities.add(new SimpleGrantedAuthority("ROLE_MERCHANT"));
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
            case "USER":
            default:
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
        }

        // 4.将我们的 User 对象转换成 Spring Security 能识别的 UserDetails 对象
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                authorities
        );
    }
}
