package com.codenext.backend.config;

import com.codenext.backend.config.utils.JwtTokenUtils;
import com.codenext.backend.config.utils.OrderNumberUntils;
import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.WebClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.text.SimpleDateFormat;
import java.util.Date;

@Configuration
public class UtilConfig
{
    @Bean
    public PasswordEncoder passwordEncryptUtil()
    {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtTokenUtils jwtTokenUtils()
    {
        return new JwtTokenUtils();
    }

    @Bean
    public OrderNumberUntils orderNumberUntils()
    {
        return new OrderNumberUntils();
    }

    @Bean
    public WebClient webClient()
    {
        return new WebClient(BrowserVersion.CHROME);
    }

}
