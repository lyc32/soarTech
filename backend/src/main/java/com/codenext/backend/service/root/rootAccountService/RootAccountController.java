package com.codenext.backend.service.root.rootAccountService;

import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// RootAccountController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/root/{lang}/account/list/{page}"
// public List<Account> searchAccountList(String name, String email, String role, String state, Long page)
//       search for accounts by:
//             name  : optional
//             email : optional
//             role  : required, use 'all' stand for all.
//             state : required, use 'all' stand for all.
//             page  : required.
//       name and email use fuzzy search, you do not need to provide the full string.
//
// POST
// api = "/root/{lang}/account/create"
// public String createAccount(Account account, String lang)
//       use to create admin, client, importer, and exporter account.
//
// PUT
// api = "/root/{lang}/account/update"
// public String updateAccount(Account account, String lang)
//       use to update account info, not include password.
//
// PATCH
// api = "/root/{lang}/account/resetPassword/{id}"
// public String resetPassword(Long id, String password, String lang)
//       use to reset password only.
//
// DELETE
// api = "/root/{lang}/account/delete/{id}"
// public String deleteAccount(Long id, String lang)
//       use to delete account, not include related orders and items.
//
// api = "/root/{lang}/account/delete/all/{id}"
// public String deleteAccountAll(Long id, String lang)
//       use to delete account, and all related orders and items.

@RestController
@RequestMapping("/root/{lang}/account")
public class RootAccountController
{
    @Autowired
    private RootAccountService adminAccountService;

    @GetMapping("/list/{page}")
    public List<Account> searchAccountList(@RequestParam(required = false, defaultValue = "") String name, @RequestParam(required = false, defaultValue = "") String email, @RequestParam String role, @RequestParam String state, @PathVariable Long page)
    {
        return this.adminAccountService.searchAccountList(name, email, role, state, page);
    }

    @PostMapping("/create")
    public String createAccount(@RequestBody Account account, @PathVariable String lang)
    {
        return this.adminAccountService.createAccount(account, lang);
    }

    @PutMapping("/update")
    public String updateAccount(@RequestBody Account account, @PathVariable String lang)
    {
        return this.adminAccountService.updateAccount(account, lang);
    }

    @PatchMapping("/resetPassword/{id}")
    public String resetPassword(@PathVariable Long id, @RequestParam String password, @PathVariable String lang)
    {
        return adminAccountService.resetPassword(id, password, lang);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteAccount(@PathVariable Long id, @PathVariable String lang)
    {
        return this.adminAccountService.deleteAccount(id, lang);
    }

    @DeleteMapping("/delete/all/{id}")
    public String deleteAccountAll(@PathVariable Long id, @PathVariable String lang)
    {
        return this.adminAccountService.deleteAccountAll(id, lang);
    }
}
