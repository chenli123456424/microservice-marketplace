package com.example.microservice.user.controller;
import com.example.microservice.user.dto.LoginRequest;
import com.example.microservice.user.dto.SendCodeRequest;
import com.example.microservice.user.dto.VerifyCodeRequest;
import com.example.microservice.user.entity.User;
import com.example.microservice.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

/**
 * @RestController: 这是一个组合注解，相当于 @Controller + @ResponseBody。
 * 它告诉Spring，这个类里的所有方法返回的都是数据（如JSON），而不是视图（如HTML页面）。
 *
 * @RequestMapping("/api/user"): 定义了这个Controller中所有接口的公共路径前缀。
 * 也就是说，访问这个类里的任何接口，URL都必须以 /api/user 开头。
 *
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
     * @PostMapping("/register"): 映射到HTTP POST请求，通常用于创建资源。
     * @RequestBody User user:
     *   这个注解告诉Spring，从HTTP请求的 Body 中获取JSON数据，
     *   并自动转换(反序列化)成一个User对象。
     *
     * @return User: 我们将保存成功后的用户信息（包含数据库生成的ID）返回给客户端。
     */
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        //调用service层的方法
        return userService.register(user);
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
        //调用继承自Iservice的getById方法
        return userService.getById(id);
    }
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest loginRequest){
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
    public Map<String, String> verifyCode(@RequestBody VerifyCodeRequest request){
        String token = userService.verifyCodeAndLogin(request.getEmail(), request.getCode());
        return Collections.singletonMap("token", token);
    }
}
