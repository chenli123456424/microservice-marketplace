package com.example.microservice.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.microservice.user.dto.*;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.UserService;
import com.example.microservice.user.util.ResponseResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @RestController: 这是一个组合注解，相当于 @Controller + @ResponseBody。
 * 它告诉Spring，这个类里的所有方法返回的都是数据（如JSON），而不是视图（如HTML页面）。
 * @RequestMapping("/api/user"): 定义了这个类中所有接口的公共路径前缀。
 * 也就是说，访问这个类里的任何接口，URL都必须以 /api/user 开头。
 * @CrossOrigin 注解允许来自所有源的跨域请求。
 * 在生产环境中，为了安全，我们会配置为只允许特定的源，如 @CrossOrigin(origins = "http://your-frontend-domain.com")
 * 但在开发环境中，这样写是最方便的。
 */
@RestController
@RequestMapping("/api/user")
public class UserController {
    // 注入service层
    @Autowired
    private UserService userService;

    /**
     * @return User: 我们将保存成功后的用户信息（包含数据库生成的ID）返回给客户端。
     * @PostMapping("/register"): 映射到HTTP POST请求，通常用于创建资源。
     * @RequestBody User user:
     * 这个注解告诉Spring，从HTTP请求的 Body 中获取JSON数据，
     * 并自动转换(反序列化)成一个User对象。
     */
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 验证必填字段
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                result.put("success", false);
                result.put("errorMessage", "用户名不能为空");
                return result;
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                result.put("success", false);
                result.put("errorMessage", "密码不能为空");
                return result;
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                result.put("success", false);
                result.put("errorMessage", "邮箱不能为空");
                return result;
            }

            User registeredUser = userService.register(user);
            if (registeredUser != null) {
                result.put("success", true);
                result.put("data", registeredUser);
                return result;
            } else {
                result.put("success", false);
                result.put("errorMessage", "注册失败，用户名或邮箱已存在");
                return result;
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("errorMessage", "注册失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * @return User: 根据id查询到的用户信息。
     * @GetMapping("/{id}"): 映射到HTTP GET请求，通常用于查询资源。
     * @PathVariable Long id:
     * 这个注解告诉Spring，从URL路径中获取id参数的值。
     */
    @GetMapping("/{id}")
    public Map<String, Object> getUserById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            User user = userService.getById(id);
            if (user != null) {
                result.put("success", true);
                result.put("data", user);
                return result;
            } else {
                result.put("success", false);
                result.put("errorMessage", "用户不存在");
                return result;
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("errorMessage", "查询失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 更新用户信息
     *
     * @param id   用户ID
     * @param user 更新的用户信息
     * @return 更新后的用户信息
     */
    @PutMapping("/{id}")
    public Map<String, Object> updateUser(@PathVariable Long id, @RequestBody User user) {
        Map<String, Object> result = new HashMap<>();
        try {
            User existingUser = userService.getById(id);
            if (existingUser != null) {
                // 更新用户信息
                user.setId(id); // 确保ID一致
                boolean updated = userService.updateById(user);
                if (updated) {
                    // 重新查询以获取最新数据（包括角色等字段）
                    User updatedUser = userService.getById(id);
                    result.put("success", true);
                    result.put("data", updatedUser);
                    return result;
                } else {
                    result.put("success", false);
                    result.put("errorMessage", "更新失败");
                    return result;
                }
            } else {
                result.put("success", false);
                result.put("errorMessage", "用户不存在");
                return result;
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("errorMessage", "更新失败: " + e.getMessage());
            return result;
        }
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            User existingUser = userService.getById(id);
            if (existingUser != null) {
                boolean deleted = userService.removeById(id);
                if (deleted) {
                    result.put("success", true);
                    result.put("data", "用户删除成功");
                    return result;
                } else {
                    result.put("success", false);
                    result.put("errorMessage", "删除失败");
                    return result;
                }
            } else {
                result.put("success", false);
                result.put("errorMessage", "用户不存在");
                return result;
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("errorMessage", "删除失败: " + e.getMessage());
            return result;
        }
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.login(loginRequest.getUsername(), loginRequest.getPassword());
        //为了方便前端使用，我们将token包装在json对象中返回给前端
        return Collections.singletonMap("token", token);
    }

    // 发送验证码
    @PostMapping("/send-code")
    public Map<String, String> sendCode(@RequestBody SendCodeRequest request) {
        userService.sendVerificationCode(request.getEmail());//调用service层方法
        return Collections.singletonMap("message", "验证码已发送");
    }

    // 验证码登录
    @PostMapping("/verify-code")
    public Map<String, String> verifyCode(@RequestBody VerifyCodeRequest request) {
        String token = userService.verifyCodeAndLogin(request.getEmail(), request.getCode());
        return Collections.singletonMap("token", token);
    }

    // 忘记密码 - 发送重置密码验证码
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.getEmail());
        return Collections.singletonMap("message", "重置密码验证码已发送到您的邮箱");
    }

    // 验证重置密码验证码
    @PostMapping("/verify-reset-code")
    public Map<String, Object> verifyResetCode(@RequestBody VerifyResetCodeRequest request) {
        boolean isValid = userService.verifyResetCode(request.getEmail(), request.getCode());
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        if (isValid) {
            response.put("message", "验证码正确");
        } else {
            response.put("error", "验证码错误或已过期");
        }
        return response;
    }

    // 重置密码
    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        boolean success = userService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
        if (success) {
            return Collections.singletonMap("message", "密码重置成功");
        } else {
            return Collections.singletonMap("error", "密码重置失败，请检查验证码是否正确");
        }
    }

    /**
     * 根据关键字分页查询用户
     *
     * @param keyword  关键字模糊查询（可用于用户名或邮箱）
     * @param role     角色精确查询
     * @param page     当前页码
     * @param size     每页数量
     * @return ResponseResult<IPage<User>>: 包含分页数据和总数
     */
    @GetMapping("/list")
    public ResponseResult<IPage<User>> searchUsersWithPage(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            Page<User> userPage = new Page<>(page, size);
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            
            // 关键字查询（用户名或邮箱）
            if (!keyword.isEmpty()) {
                queryWrapper.and(wrapper -> wrapper.like("username", keyword).or().like("email", keyword));
            }
            
            // 角色精确查询
            if (role != null && !role.isEmpty()) {
                queryWrapper.eq("role", role);
            }
            
            IPage<User> userPageResult = userService.page(userPage, queryWrapper);
            return ResponseResult.success(userPageResult);
        } catch (Exception e) {
            return ResponseResult.error("查询失败: " + e.getMessage());
        }
    }
}
