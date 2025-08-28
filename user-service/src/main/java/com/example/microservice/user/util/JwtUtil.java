package com.example.microservice.user.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/**
 * @Component 是用于声明一个Bean，这个Bean会自动被Spring容器管理。
 */
@Component
public class JwtUtil {
    //密钥，用于签名。这个值应该保密，并且足够复杂，避免被破解。
    @Value("${app.jwt.secret}")
    private String SECRET_KEY;
    private Key key;

    /**
     * @PostConstruct 注解表示：
     * 这个方法会在JwtUtil类的构造函数执行完毕、并且所有依赖注入完成后自动执行一次。
     * 我们在这里初始化我们的密钥对象。
     */
    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成JWT令牌。
     * @param username 用户名
     * @return 生成的JWT令牌
     */
    public String generateToken(String username) {
        Date now = new Date();
        //过期时间，单位为毫秒。这里设置成24小时。
        long EXPIRATION_TIME = 86400000;
        Date expiryData = new Date(now.getTime() + EXPIRATION_TIME);
        return Jwts.builder()
                .setSubject(username)//将用户名作为主题
                .setIssuedAt(now)//设置令牌签发时间
                .setExpiration(expiryData)//设置令牌过期时间
                .signWith(key, SignatureAlgorithm.HS256)//使用HS256算法和密钥生成签名
                .compact();//compact()方法将JWT令牌生成为字符串并返回
    }
    /**
     * 从JWT中提取用户名
     * @param token JWT字符串
     * @return 用户名
     */
    public String extractUsername(String token) {
        return getAllClaimsFromToken(token).getSubject();
    }
    
    /**
     * 从JWT中提取所有声明
     * @param token JWT字符串
     * @return Claims对象
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    /**
     * 验证JWT令牌是否有效
     * @param token JWT字符串
     * @return true表示令牌有效，false表示令牌无效
     */
    public boolean isTokenExpired(String token) {
        return getAllClaimsFromToken(token).getExpiration().before(new Date());
    }
    /**
     * 验证JWT是否有效
     * @param token JWT字符串
     * @param username 从数据库查询出的用户名
     * @return true如果有效
     */
    public boolean validateToken(String token, String username) {
        final String userNameFromToken = extractUsername(token);
        // 检查token中的用户名是否和我们期望的一致，并且token没有过期
        return (username.equals(userNameFromToken) && !isTokenExpired(token));
    }
}
