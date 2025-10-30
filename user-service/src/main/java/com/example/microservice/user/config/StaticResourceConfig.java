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
        String uploadDir = Paths.get(projectRoot, "uploads").toAbsolutePath().toString();
        
        System.out.println("配置静态资源路径: " + uploadDir);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600); // 设置缓存时间
    }
}


