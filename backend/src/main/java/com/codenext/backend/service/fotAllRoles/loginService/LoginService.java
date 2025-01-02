package com.codenext.backend.service.fotAllRoles.loginService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.config.utils.JwtTokenUtils;
import com.codenext.backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

// LoginService
//
// POST
// public String login(String username, String password)
//       if username and password matches the record in the account table.
//       then return a JWT token.
//       if username and password does not match the record
//       then return an Error message.
//       the password passed from the front end has been encrypted by MD5()

@Service
public class LoginService
{
    // use to create a JWT token
    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    // use to decrypt password.
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Account Repository
    @Autowired
    private AccountRepository accountRepository;

    // Login()
    public String login(String username, String password, String lang)
    {
        // check if accountName exists or not
        Optional<Account> optionalAccount = accountRepository.findAccountEntityByAccountName(username);
        if(optionalAccount.isEmpty())
        {
            // if account name does not exist, then try to find account by email
            optionalAccount = accountRepository.findAccountEntityByEmail(username);
        }

        // check if account exists or not
        if(optionalAccount.isEmpty())
        {
            // if account name does not exist, return error
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if account status is "suspend" or not
        if(AccountTypeAndState.SUSPEND_STATE.equals(optionalAccount.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_SUSPENDED", lang);
        }

        // check if password is correct or not
        if(!passwordEncoder.matches(password, optionalAccount.get().getPassword()))
        {
            return I18nUtil.getMessage("ERROR_WRONG_PASS", lang);
        }

        // return JWT token
        return jwtTokenUtils.generateToken(optionalAccount.get());
    }
}
