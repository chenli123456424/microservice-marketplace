package com.example.microservice.user.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * @Configuration: 声明这是一个Spring的配置类
 */
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    //注入过滤器
    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    /**
     * @Bean: 将这个方法的返回值注册为一个Spring Bean，交由Spring容器管理。
     * 我们就可以在其他地方通过 @Autowired 注入这个 PasswordEncoder 了。
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        //返回BCrypt的实现
        return new BCryptPasswordEncoder();
    }

    /**
     * 这个方法用于配置HTTP安全策略
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // csrf().disable(): 暂时禁用CSRF（跨站请求伪造）保护，方便我们用Postman测试。
        // .authorizeRequests(): 开始配置请求授权
        // .antMatchers("/api/user/register").permitAll(): 允许对 /api/user/register 接口的匿名访问（否则没法注册）
        // .anyRequest().authenticated(): 其他任何请求都需要身份验证
        http
                //1. 禁用CSRF（跨站请求伪造）
                .csrf().disable()
                //2. 禁用默认的表单登录和HTTP Basic认证
                .formLogin().disable()
                .httpBasic().disable()
                // 3. 配置会话管理为无状态(STATELESS)，这是JWT认证的核心
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                // 4. 配置请求授权规则
                .authorizeRequests()
                .antMatchers("/api/user/register", "/api/user/login").permitAll()// 为了测试，这里直接允许所有请求通过
                .anyRequest().authenticated();

        // 将我们的JWT过滤器添加到UsernamePasswordAuthenticationFilter之前
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
