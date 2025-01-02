package com.codenext.backend.service.fotAllRoles.myAccountService;

import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// MyAccountController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/myAccount/{lang}/info"
// public Account getMyAccountInfo()
//       used to return all info of the current account, excluding the password.
//
// PUT
// api = "/myAccount/{lang}/update"
// public String updateMyAccountInfo(Account account, String lang)
//       use to update account info, not include password.
//
// PATCH
// api = "/myAccount/{lang}/resetPassword"
// public String resetMyAccountPassword(String oldPassword, String newPassword, String lang)
//       use to reset password only.

@RestController
@RequestMapping(path = "/myAccount/{lang}")
public class MyAccountController
{
    @Autowired
    private MyAccountService myAccountService;

    @GetMapping("/info")
    public Account getMyAccountInfo()
    {
        return myAccountService.getAccountInfo();
    }

    @PutMapping("/update")
    public String updateMyAccountInfo(@RequestBody Account account, @PathVariable String lang)
    {
        return myAccountService.updateMyAccountInfo(account, lang);
    }

    @PatchMapping("/resetPassword")
    public String resetMyAccountPassword(@RequestParam String oldPassword, @RequestParam String newPassword, @PathVariable String lang)
    {
        return myAccountService.resetMyAccountPassword(oldPassword, newPassword, lang);
    }

}
