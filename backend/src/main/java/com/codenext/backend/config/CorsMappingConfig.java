package com.codenext.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsMappingConfig implements WebMvcConfigurer
{
    @Override
    public void addCorsMappings(CorsRegistry registry)
    {
        registry.addMapping("/**")
                .allowCredentials(true)
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("POST", "GET", "PUT", "PATCH", "DELETE")
                .allowedHeaders("*");
    }
}
