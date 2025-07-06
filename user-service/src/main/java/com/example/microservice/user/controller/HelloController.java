package com.example.microservice.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @RestController: 这是一个组合注解，相当于 @Controller + @ResponseBody。
 * 它告诉Spring，这个类里的所有方法返回的都是数据（如JSON），而不是视图（如HTML页面）。
 *
 * @RequestMapping("/api/user"): 定义了这个Controller中所有接口的公共路径前缀。
 * 也就是说，访问这个类里的任何接口，URL都必须以 /api/user 开头。
 */
@RestController
@RequestMapping("/api/user")
public class HelloController {
    /**
     * @GetMapping("/hello"): 将这个方法映射到 HTTP GET 请求。
     * 完整的访问路径是类上的 @RequestMapping + 方法上的 @GetMapping，即 /api/user/hello。
     * 当有GET请求访问这个URL时，就会执行这个方法。
     *
     * @return String: 方法返回一个字符串。因为有@RestController，Spring会把这个字符串直接作为HTTP响应体返回给客户端。
     */
    @GetMapping("/hello")
    public String sayhello() {
        return "hello world";
    }
}
