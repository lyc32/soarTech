package com.codenext.backend.service.fotAllRoles.loginService;

import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

// LoginController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// POST
// api = "/login/{lang}"
// public String login(Account account)
//       if account.accountName and account.password matches the record in the account table.
//       then return a JWT token.
//       if account.accountName and account.password does not match the record
//       then return an Error message.
//       those fields are required: accountName and password
//       you can use email as accountName to login

@RestController
public class LoginController
{
    @Autowired
    private LoginService loginService;

    @PostMapping("/login/{lang}")
    public String login(@RequestBody Account account, @PathVariable String lang)
    {
        return loginService.login(account.getAccountName(), account.getPassword(), lang);
    }

}
