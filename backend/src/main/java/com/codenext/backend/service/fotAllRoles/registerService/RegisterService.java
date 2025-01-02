package com.codenext.backend.service.fotAllRoles.registerService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

// RegisterService
//
// POST
// public String createRootAccount(Account account)
//       use to create root account
//       those fields are required: accountName, email, phone, and password.
//       those fields are optional: firstName, middleName, lastName, addressLine1, addressLine2, addressCity, addressState, addressCountry, addressZipCode, registrationCode, and state.
//       the password has been encrypted by MD5()

@Service
public class RegisterService
{
    // Account Repository and password encryption tool
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncryptUtil;

    // Create Root Account()
    public String createRootAccount(Account account, String lang)
    {
        // format input account fields:
        // remove front and end space;
        account.format();

        // set account.role as root
        account.setRole(AccountTypeAndState.ROOT);

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = account.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check how many root account records are in the account table
        List<Account> accountList = this.accountRepository.findAccountEntityByRole(AccountTypeAndState.ROOT);
        if( accountList.size() != 0)
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

        // second encrypt password.
        account.setPassword(passwordEncryptUtil.encode(account.getPassword()));

        // set account.role as root
        account.setRole(AccountTypeAndState.ROOT);

        // set account.state to active
        account.setState(AccountTypeAndState.ACTIVE_STATE);

        // save root account record
        this.accountRepository.save(account);
        return I18nUtil.getMessage("REGISTER_ROOT_SUCCESS", lang);
    }
}

