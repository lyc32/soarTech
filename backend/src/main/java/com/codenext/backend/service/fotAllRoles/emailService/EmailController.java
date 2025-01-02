package com.codenext.backend.service.fotAllRoles.emailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// EmailController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// POST
// api = "/email/{lang}/forgot/password"
// public String forgetPassword(String email, String lang)
//       use to reset account password and send new password to account's email id.
//       email is required.

@RestController
@RequestMapping("/email/{lang}")
public class EmailController
{
    @Autowired
    private EmailService emailService;

    @PostMapping("/forgot/password")
    public String forgetPassword(@RequestParam String email, @PathVariable String lang)
    {
        return this.emailService.forgetPassword(email, lang);
    }
}
