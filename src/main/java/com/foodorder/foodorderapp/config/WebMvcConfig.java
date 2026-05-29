package com.foodorder.foodorderapp.config;

import com.foodorder.foodorderapp.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uri = fileStorageService.getStoragePath().toUri().toString();
        registry.addResourceHandler("/api/images/**")
                .addResourceLocations(uri);
    }
}
