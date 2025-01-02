package com.codenext.backend.service.root.rootAccountService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.AccountTypeAndState;
import com.codenext.backend.entity.*;
import com.codenext.backend.repository.*;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

// RootAccountService
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
//                    there are 15 records per page.
//
// POST
// public String createAccount(Account account, String lang)
//       use to add a record in account table.
//       Account must have those fields:
//             accountName, email, phone, role.
//       account.role can be admin, client, importer, and exporter.
//       account.role cannot be root.
//
// PUT
// public String updateAccount(Account account, String lang)
//       use to modified account table
//       those fields are required：
//            id, accountName, email, phone, role
//       those fields are immutable
//            id, registrationCode
//       password cannot be modified through this method
//
// PATCH
// public String resetPassword(Long id, String password, String lang)
//       use to change password
//       those fields are required：
//            id, password
//       the password submitted by the front-end has been encrypted using md5.
//
// DELETE
// public String deleteAccount(Long id, String lang)
//       use to delete record in account table only.
//       this method will only delete account records, not orders and items.
//       those fields are required： id
//
// public String deleteAccountAll(Long id, String lang)
//       use to delete records in:
//            account table,
//            order_in_process, order_in_history
//            item_in_process,  item in history
//       this method will delete account records, orders and items.
//       those fields are required：id

@Service
public class RootAccountService
{
    // Account Repository and password encryption tool
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // If the account name changed, the Orders and Items tables will also need to be updated.
    // Order Repository and Item Repository are use to search and delete records which related to account.
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;


    // Search Account List()
    public List<Account> searchAccountList(String name, String email, String role, String state, Long page)
    {
        return this.accountRepository.searchAccountList(name, email, role, state, ((page-1)*15), 15);
    }

    // Create Account()

    public String createAccount(Account account, String lang)
    {
        // format input account fields:
        // remove front and end space;
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

        // set email as password
        // the password is encrypted using the same MD5 algorithm as the front-end.
        // double encrypt the password and add it to the account
        account.setPassword(passwordEncoder.encode(DigestUtils.md5Hex(account.getEmail())));

        // save account record
        this.accountRepository.save(account);
        return I18nUtil.getMessage("CREATE_ACCOUNT_SUCCESS", lang);
    }

    // Update Account()
    @Transactional
    public String updateAccount(Account account, String lang)
    {
        // format input account fields:
        // remove front and end space;
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

        // Check if the account ID exists
        Optional<Account> optionalAccount = this.accountRepository.findById(account.getId());
        if(optionalAccount.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // Check if the account name has changed or not
        // check if the account name is unique in the table.
        if(!optionalAccount.get().getAccountName().equals(account.getAccountName()) && this.accountRepository.findAccountEntityByAccountName(account.getAccountName()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NAME_EXIST", lang);
        }

        // Check if the email has changed or not
        // check if the email is unique in the table.
        if(!optionalAccount.get().getEmail().equals(account.getEmail()) && this.accountRepository.findAccountEntityByEmail(account.getEmail()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_EMAIL_EXIST", lang);
        }

        // Check if the account name has changed or not
        if(!optionalAccount.get().getAccountName().equals(account.getAccountName()))
        {
            // if account name changed, then update order and item table.
            this.orderInProcessRepository.updateClientName(optionalAccount.get().getId(), account.getAccountName());
            this.orderInHistoryRepository.updateClientName(optionalAccount.get().getId(), account.getAccountName());
            this.itemInProcessRepository.updateImporter(optionalAccount.get().getId(), account.getAccountName());
            this.itemInProcessRepository.updateExporter(optionalAccount.get().getId(), account.getAccountName());
            this.itemInHistoryRepository.updateImporter(optionalAccount.get().getId(), account.getAccountName());
            this.itemInHistoryRepository.updateExporter(optionalAccount.get().getId(), account.getAccountName());
        }

        // keep original password.
        account.setPassword(optionalAccount.get().getPassword());
        // update account record.
        this.accountRepository.save(account);
        return I18nUtil.getMessage("UPDATE_ACCOUNT_SUCCESS", lang);
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

        // check account is root account or not.
        // root account can not be deleted.
        if( account.get().getRole().equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // delete account record.
        this.accountRepository.delete(account.get());
        return I18nUtil.getMessage("DELETE_ACCOUNT_SUCCESS", lang);
    }

    // Delete Account All()
    @Transactional
    public String deleteAccountAll(Long id, String lang)
    {
        // check account exists ot not.
        Optional<Account> account = this.accountRepository.findById(id);
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ACCOUNT_NOT_EXIST", lang);
        }

        // check account is root account or not.
        // root account can not be deleted.
        if( account.get().getRole().equals(AccountTypeAndState.ROOT))
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // find all orders in order_in_processing through account.id
        List<OrderInProcess> orderInProcesses = this.orderInProcessRepository.findOrderInProcessesByClientID(account.get().getId());
        orderInProcesses.forEach(
                e ->
                {
                    // delete all item records through the orderNumber
                    this.itemInProcessRepository.deleteAllByOrderNumber(e.getOrderNumber());
                    this.itemInHistoryRepository.deleteAllByOrderNumber(e.getOrderNumber());
                });
        // delete all orders in order_in_processing
        this.orderInProcessRepository.deleteAllByClientID(account.get().getId());

        // find all orders in order_in_history through account.id
        List<OrderInHistory> orderInHistories = this.orderInHistoryRepository.findOrderInHistoriesByClientID(account.get().getId());
        orderInHistories.forEach(
                e ->
                {
                    // delete all item records through the orderNumber
                    this.itemInProcessRepository.deleteAllByOrderNumber(e.getOrderNumber());
                    this.itemInHistoryRepository.deleteAllByOrderNumber(e.getOrderNumber());
                });
        // delete all orders in order_in_history
        this.orderInHistoryRepository.deleteAllByClientID(account.get().getId());

        // delete account record.
        this.accountRepository.delete(account.get());
        return I18nUtil.getMessage("DELETE_ACCOUNT_SUCCESS", lang);
    }
}
