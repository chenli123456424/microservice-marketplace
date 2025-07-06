package com.example.microservice.user;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;

/**
 * @SpringBootApplication: 这是一个复合注解，是Spring Boot项目的核心。
 * 它包含了三个关键注解：
 * 1. @SpringBootConfiguration: 声明这是一个配置类。
 * 2. @EnableAutoConfiguration: 启用Spring Boot的自动配置机制，它会根据你添加的依赖自动配置项目。
 * 3. @ComponentScan: 自动扫描该类所在包及其子包下的所有组件（如@Controller, @Service等）。
 */
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
