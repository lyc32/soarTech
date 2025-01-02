package com.codenext.backend.service.fotAllRoles.emailService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.repository.AccountRepository;
import jakarta.mail.internet.MimeMessage;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

// EmailService
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// POST
// public String forgetPassword(String email, String lang)
//       use to reset account password and send new password to account's email id.
//       password is the current timestamp.
//       lang is the language type of the return value.
//
// private boolean sendMail(String toEmail, String title, String content)
//        use to send email
//        smtp mail service config is in the application.properties.

@Service
public class EmailService
{
    // Account Repository and password encryption tool
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    PasswordEncoder passwordEncoder;

    // use to send email
    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String from;

    // Forget Password()
    public String forgetPassword(String email, String lang)
    {
        // check if account.email exists or not
        Optional<Account> optionalAccount = accountRepository.findAccountEntityByEmail(email);
        if(optionalAccount.isEmpty())
        {
            // if account.email does not exist, then try to find account by accountName
            optionalAccount = accountRepository.findAccountEntityByAccountName(email);
        }

        // check if account.accountName exists or not
        if(optionalAccount.isEmpty())
        {
            // if account name does not exist, return error
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check if account status is still suspend.
        if(AccountTypeAndState.SUSPEND_STATE.equals(optionalAccount.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_IS_SUSPENDED", lang);
        }

        // set email as password.
        String timeStamp = String.valueOf(System.currentTimeMillis());
        // and then encrypted the password using the same MD5 algorithm as the front-end.
        // and then double encrypt the password and add it to the account
        optionalAccount.get().setPassword(passwordEncoder.encode(DigestUtils.md5Hex(timeStamp)));

        String htmlEmail = I18nUtil.getMessage("EMAIL_PASS_BODY", lang);
        htmlEmail = htmlEmail.replace("{password}", timeStamp);
        htmlEmail = htmlEmail.replace("{email}", from);

        // check send email successful or not
        if(!sendMail(email, I18nUtil.getMessage("EMAIL_PASS_TITLE", lang), htmlEmail))
        {
            return I18nUtil.getMessage("ERROR_SEND_EMAIL_FAILED", lang);
        }

        // If the email was sent successfully
        // update account record in account table
        this.accountRepository.save(optionalAccount.get());
        return I18nUtil.getMessage("SEND_EMAIL_SUCCESS", lang);
    }

    // Send Mail()
    private boolean sendMail(String toEmail, String title, String content)
    {
        // get MIME style email message
        MimeMessage message =  javaMailSender.createMimeMessage();
        try
        {
            // Helper class for populating a MimeMessage
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            // smtp mail service
            helper.setFrom(from);
            // target email id
            helper.setTo(toEmail);
            // email title
            helper.setSubject(title);
            // email content, set 'true' to enable html format
            helper.setText(content,true);
            // send email
            javaMailSender.send(helper.getMimeMessage());
            return true;
        }
        catch (Exception e)
        {
            // if there is any exception, then return false.
            return false;
        }
    }
}
