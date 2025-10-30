package com.example.microservice.user.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 使用项目根目录下的uploads文件夹
        String projectRoot = System.getProperty("user.dir");
        
        // 如果当前目录是user-service，需要向上一级找uploads目录
        String uploadDir;
        if (projectRoot.endsWith("user-service")) {
            uploadDir = Paths.get(projectRoot, "..", "uploads").toAbsolutePath().normalize().toString();
        } else {
            uploadDir = Paths.get(projectRoot, "uploads").toAbsolutePath().toString();
        }
        
        System.out.println("配置静态资源路径: " + uploadDir);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600); // 设置缓存时间
    }
}


