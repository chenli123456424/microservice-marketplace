package com.example.microservice.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 统一使用项目根目录下的uploads文件夹
        String projectRoot = System.getProperty("user.dir");
        
        // 确定uploads目录路径
        String uploadDir;
        if (projectRoot.endsWith("user-service")) {
            // 如果当前工作目录是user-service，向上一级找到项目根目录
            uploadDir = Paths.get(projectRoot, "..", "uploads").toAbsolutePath().normalize().toString();
        } else {
            // 如果当前工作目录已经是项目根目录
            uploadDir = Paths.get(projectRoot, "uploads").toAbsolutePath().normalize().toString();
        }
        
        // 确保目录存在
        try {
            java.nio.file.Path uploadPath = Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
        } catch (Exception e) {
            System.err.println("创建uploads目录失败: " + e.getMessage());
        }
        
        System.out.println("配置静态资源路径: " + uploadDir);
        System.out.println("当前工作目录: " + projectRoot);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600); // 设置缓存时间
    }
}


