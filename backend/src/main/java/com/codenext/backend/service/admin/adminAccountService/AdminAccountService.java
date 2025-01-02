package com.codenext.backend.service.admin.adminAccountService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import org.apache.commons.codec.digest.DigestUtils;

// AdminAccountService
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// public List<Account> searchAccountList(String name, String email, String role, String state, Long page)
//       Search for accounts based on these fields:
//             name : optional, default value is null.
//                    Search using the LIKE keyword.
//                    Search for all records containing the 'name' in the accountName, firstName, middleName, and lastName.
//             email: optional, default value is null.
//                    search using the LIKE keyword.
//                    search for all records containing the 'email' in accountName and email.
//             role : required, use 'all' stand for all.
//                    account's role.
//                    admin, client, importer, exporter, and all.
//             state: required, use 'all' stand for all.
//                    account's status.
//                    active, suspend, and all
//             page : page number of search results
//                    there are 5 records per page.
//
// POST
// public String createAccount(Account account, String lang)
//       use to add a record in account table.
//       those fields are required：id, accountName, email, phone, role
//       those fields are optional: firstName, middleName, lastName, addressLine1, addressLine2, addressCity, addressState, addressCountry, addressZipCode, registrationCode, state, and password.
//       those fields will be automatically generated: registrationCode, state, and password
//       account.role can be admin, client, importer, and exporter.
//       account.role cannot be root.
//
// PATCH
// public String suspendAccount(Long id, String lang)
//       use to suspend account.
//       if the account status is "suspend", it will not be available
//       admin can only suspend client, importer, and exporter.
//       those fields are required： id
//
// public String activeAccount(Long id, String lang)
//       use to active account.
//       admin can only active client, importer, and exporter.
//       those fields are required： id
//
// public String resetPassword(Long id, String password, String lang)
//       use to change password
//       those fields are required：
//            id, password
//       the password submitted by the front-end has been encrypted using md5.
//
// DELETE
// public String deleteAccount(Long id, String lang)
//       use to delete record in account table only.
//       admin can only delete "suspend" account.
//       this method will only delete account records, not orders and items.
//       those fields are required： id

@Service
public class AdminAccountService
{
    // Account Repository and password encryption tool
    @Autowired
    AccountRepository accountRepository;
    @Autowired
    PasswordEncoder passwordEncoder;

    // Search Account List()
    public List<Account> searchAccountList(String name, String email, String role, String state, Long page)
    {
        List<Account> result = this.accountRepository.searchAccountList(name, email, role, state, ((page-1)*5), 5);
        // remove account's password
        result.forEach(e -> e.setPassword(""));
        return result;
    }

    // Create Account()
    public String createAccount(Account account, String lang)
    {
        // format input account fields:
        // remove front and end space
        account.format();

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = account.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check account.role is root or not.
        // there is only one root account in the database table.
        if(account.getRole().equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("REGISTER_ROOT_FAILED", lang);
        }

        // check if account name exists or not
        // check if account name is unique in the table.
        if (this.accountRepository.findAccountEntityByAccountName(account.getAccountName()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NAME_EXIST", lang);
        }

        // check if email exists or not
        // check if email is unique in the table.
        if(this.accountRepository.findAccountEntityByEmail(account.getEmail()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_EMAIL_EXIST", lang);
        }

        // set registerCode
        account.setRegistrationCode(String.valueOf(System.currentTimeMillis()));

        // set account.state to active
        account.setState(AccountTypeAndState.ACTIVE_STATE);

        // set email as password.
        // and then encrypted the password using the same MD5 algorithm as the front-end.
        // and then double encrypt the password and add it to the account
        account.setPassword(passwordEncoder.encode(DigestUtils.md5Hex(account.getEmail())));

        // save account record
        this.accountRepository.save(account);
        return I18nUtil.getMessage("CREATE_ACCOUNT_SUCCESS", lang);
    }

    // Suspend Account()
    public String suspendAccount(Long id, String lang)
    {
        // check account exists ot not.
        Optional<Account> account = this.accountRepository.findById(id);
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account role is admin or root.
        // admin can not suspend admin or root.
        String targetRole = account.get().getRole();
        if( targetRole.equals(AccountTypeAndState.ADMIN) || targetRole.equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check if account status is still suspend.
        if(AccountTypeAndState.SUSPEND_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_SUSPENDED", lang);
        }

        // set account status to suspend
        account.get().setState(AccountTypeAndState.SUSPEND_STATE);

        // update account record.
        this.accountRepository.save(account.get());
        return I18nUtil.getMessage("SUSPEND_ACCOUNT_SUCCESS", lang);
    }

    // Active Account()
    public String activeAccount(Long id, String lang)
    {
        // check account exists ot not.
        Optional<Account> account = this.accountRepository.findById(id);
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account role is admin or root.
        // admin can not suspend admin or root.
        String targetRole = account.get().getRole();
        if( targetRole.equals(AccountTypeAndState.ADMIN) || targetRole.equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check if account status is still active.
        if(AccountTypeAndState.ACTIVE_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_ACTIVATED", lang);
        }

        // set account status to active
        account.get().setState(AccountTypeAndState.ACTIVE_STATE);;

        // update account record.
        this.accountRepository.save(account.get());
        return I18nUtil.getMessage("ACTIVE_ACCOUNT_SUCCESS", lang);
    }

    // Reset Password()
    public String resetPassword(Long id, String password, String lang)
    {
        // check password is null or empty string
        password = password == null ? null : password.trim();
        if(password == null || password.equals(""))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_PASS_EMPTY", lang);
        }

        // Check if the account ID exists
        Optional<Account> account = this.accountRepository.findById(id);
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account role is admin or root.
        // admin can not reset admin or root's password.
        String targetRole = account.get().getRole();
        if( targetRole.equals(AccountTypeAndState.ADMIN) || targetRole.equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check if account status is still suspend.
        if(AccountTypeAndState.SUSPEND_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_UPDATE_SUSPEND_ACCOUNT", lang);
        }

        // second encrypt password.
        account.get().setPassword(passwordEncoder.encode(password));

        // update account record.
        this.accountRepository.save(account.get());
        return I18nUtil.getMessage("RESET_PASSWORD_SUCCESS", lang);
    }

    // Delete Account()
    public String deleteAccount(Long id, String lang)
    {
        // check account exists ot not.
        Optional<Account> account = this.accountRepository.findById(id);
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if the account role is admin or root.
        // admin can not delete admin or root.
        String targetRole = account.get().getRole();
        if( targetRole.equals(AccountTypeAndState.ADMIN) || targetRole.equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // check if account status is still active.
        if(AccountTypeAndState.ACTIVE_STATE.equals(account.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_DELETE_ACTIVE_ACCOUNT", lang);
        }

        // delete account record.
        this.accountRepository.delete(account.get());
        return I18nUtil.getMessage("DELETE_ACCOUNT_SUCCESS", lang);
    }
}
