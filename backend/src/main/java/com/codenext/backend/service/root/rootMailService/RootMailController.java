package com.codenext.backend.service.root.rootMailService;

import com.codenext.backend.entity.SmtpMail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/root/{lang}/mail")
public class RootMailController
{
    @Autowired
    private RootMailService rootMailService;


    @GetMapping("/get")
    public SmtpMail getMailConfig()
    {
        return rootMailService.getMailConfig();
    }

    @PutMapping("/save")
    public String setMailConfig(@RequestBody SmtpMail smtpMail, @PathVariable String lang)
    {
        return rootMailService.setMailConfig(smtpMail, lang);
    }
}
