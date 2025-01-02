package com.codenext.backend.service.fotAllRoles.myAccountService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// MyAccountController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// public Account getMyAccountInfo()
//       get account record by the id in jwt.
//       the password field will be removed
//
// PUT
// public String updateMyAccountInfo(Account account, String lang)
//       use to modified account table
//       those fields are required：id, accountName, email, phone, role
//       those fields are optional: firstName, middleName, lastName, addressLine1, addressLine2, addressCity, addressState, addressCountry, addressZipCode, registrationCode, state, and password.
//       those fields will not be used: registrationCode, state, and password
//       these fields can be edited: email, phone, firstName, middleName, lastName, addressLine1, addressLine2, addressCity, addressState, addressCountry, and addressZipCode.
//       these fields can not be edited: id, accountName, role, password, registrationCode, and state
//
// PATCH
// public String resetMyAccountPassword(String oldPassword, String newPassword, String lang)
//       use to change password
//       those fields are required：
//            id, password
//       the password submitted by the front-end has been encrypted using md5.

@Repository
public class MyAccountService
{
    // Account Repository and password encryption tool
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get Account Info()
    public Account getAccountInfo()
    {
        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return null;
        }

        // check if account exists or not
        Optional<Account> account = this.accountRepository.findAccountEntityById(((Account) authentication.getPrincipal()).getId());
        if(account.isEmpty())
        {
            return null;
        }

        // remove password
        account.get().setPassword("");
        return account.get();
    }

    // Update My Account Info()
    public String updateMyAccountInfo(Account accountEntity, String lang)
    {
        // format input account fields:
        // remove front and end space
        accountEntity.format();

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = accountEntity.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check that the account ID, account name, and role match the ID and account name in the JWT
        if( !accountEntity.getId().equals(((Account) authentication.getPrincipal()).getId()) || !accountEntity.getAccountName().equals(((Account) authentication.getPrincipal()).getAccountName()) || !accountEntity.getRole().equals(((Account) authentication.getPrincipal()).getRole()))
        {
            // as long as you use a valid JWT, you can access this api,
            // so you need to verify whether the info in the JWT matches the accountEntity in the request
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_MATCH_JWT", lang);
        }

        // check if account exists or not
        Optional<Account> account = this.accountRepository.findAccountEntityById(accountEntity.getId());
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account is suspended
        if(AccountTypeAndState.SUSPEND_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_SUSPENDED", lang);
        }

        // reset status, registration code, and password code
        accountEntity.setState(account.get().getState());
        accountEntity.setRegistrationCode(account.get().getRegistrationCode());
        accountEntity.setPassword(account.get().getPassword());

        // update account record.
        this.accountRepository.save(accountEntity);
        return I18nUtil.getMessage("UPDATE_ACCOUNT_SUCCESS", lang);
    }

    // Reset My Account Password()
    public String resetMyAccountPassword(String oldPassword, String newPassword, String lang)
    {
        // check new password is null or empty string
        newPassword = newPassword == null ? null : newPassword.trim();
        if(newPassword == null || newPassword.equals(""))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_PASS_EMPTY", lang);
        }

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check if account exists or not
        Optional<Account> account = this.accountRepository.findAccountEntityById(((Account) authentication.getPrincipal()).getId());
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account is active
        if(!AccountTypeAndState.ACTIVE_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_SUSPENDED", lang);
        }

        // Check if the original password is correct
        if(!passwordEncoder.matches(oldPassword, account.get().getPassword()))
        {
            return I18nUtil.getMessage("ERROR_WRONG_ORIGINAL_PASS", lang);
        }

        // update new password
        account.get().setPassword(passwordEncoder.encode(newPassword));

        // update account record.
        this.accountRepository.save(account.get());
        return I18nUtil.getMessage("RESET_PASSWORD_SUCCESS", lang);
    }

}
