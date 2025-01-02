package com.codenext.backend.service.admin.adminAccountService;

import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// AdminAccountController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/admin/{lang}/account/list/{page}"
// public List<Account> searchAccountList(String name, String email, String role, String state, Long page, String lang)
//       search for accounts by:
//             name  : optional
//             email : optional
//             role  : required, use 'all' stand for all.
//             state : required, use 'all' stand for all.
//             page  : required.
//       name and email use fuzzy search, you do not need to provide the full string.
//
// POST
// api = "/admin/{lang}/account/create"
// public String createAccount(Account account, String lang)
//       use to create admin, client, importer, and exporter account.
//
// PATCH
// api = "/admin/{lang}/account/resetPassword/{id}"
// public String resetPassword(Long id, String password, String lang)
//       use to reset password only.
//
// api = "/admin/{lang}/account/suspend/{id}"
// public String suspendAccount(Long id, String lang)
//       use to suspend account.
//       if the account status is "suspend", it will not be available
//
// api = "/admin/{lang}/account/active/{id}"
// public String activeAccount(Long id, String lang)
//       use to active account.
//
// DELETE
// api = "/admin/{lang}/account/delete/{id}"
// public String deleteAccount(Long id, String lang)
//       use to delete account, not include related orders and items.

@RestController
@RequestMapping("/admin/{lang}/account")
public class AdminAccountController
{
    @Autowired
    private AdminAccountService adminAccountService;

    @GetMapping("/list/{page}")
    public List<Account> searchAccountList(@RequestParam(required = false, defaultValue = "") String name, @RequestParam(required = false, defaultValue = "") String email, @RequestParam String role, @RequestParam String state, @PathVariable Long page)
    {
        return adminAccountService.searchAccountList(name, email, role, state, page);
    }

    @PostMapping("/create")
    public String createAccount(@RequestBody Account account, @PathVariable String lang)
    {
        return adminAccountService.createAccount(account, lang);
    }


    @PatchMapping("/suspend/{id}")
    public String suspendAccount(@PathVariable Long id, @PathVariable String lang)
    {
        return adminAccountService.suspendAccount(id, lang);
    }

    @PatchMapping("/active/{id}")
    public String activeAccount(@PathVariable Long id, @PathVariable String lang)
    {
        return adminAccountService.activeAccount(id, lang);
    }

    @PatchMapping("/resetPassword/{id}")
    public String resetPassword(@PathVariable Long id, @RequestParam String password, @PathVariable String lang)
    {
        return adminAccountService.resetPassword(id, password, lang);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAccount(@PathVariable Long id, @PathVariable String lang)
    {
        return adminAccountService.deleteAccount(id, lang);
    }

}
