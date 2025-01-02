package com.codenext.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Slf4j
@Component
public class I18nUtil
{
    @Value("${spring.messages.basename}")
    private String basename;
    private static String path;

    @PostConstruct
    public void init()
    {
        I18nUtil.path = basename;
    }

    public static String getMessage(String code, String lang)
    {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.toString());
        messageSource.setBasename(path);
        Locale locale = new Locale("en", "US");
        if(lang.equals("zh-CN"))
        {
            locale = new Locale("zh", "CN");
        }

        try
        {
            return messageSource.getMessage(code, null, locale);
        }
        catch (Exception e)
        {
            return code;
        }
    }
}


