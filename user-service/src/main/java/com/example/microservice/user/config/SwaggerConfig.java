package com.example.microservice.user.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("家居装修平台API文档")
                        .version("1.0")
                        .description("家居装修平台接口文档")
                        .contact(new Contact()
                                .name("开发团队")
                                .url("https://github.com")
                                .email("developer@example.com")));
    }
}
