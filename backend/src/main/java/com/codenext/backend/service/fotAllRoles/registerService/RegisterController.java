package com.codenext.backend.service.fotAllRoles.registerService;

import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// RegisterController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// POST
// api = "/register/{lang}/root"
// public String createRootAccount(Account account)
//       use to create root account
//       the password has been encrypted by MD5()

@RestController
public class RegisterController
{
    @Autowired
    private RegisterService registerService;

    @PostMapping("/register/{lang}/root")
    public String createRootAccount(@RequestBody Account account, @PathVariable String lang)
    {
        return this.registerService.createRootAccount(account, lang);
    }
}
