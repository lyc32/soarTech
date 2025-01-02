package com.codenext.backend.service.root.rootOrderService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.OrderState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.OrderInHistory;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// RootItemService
//
// GET
// public List<OrderInProcess> searchProcessOrder(String orderNumber, String clientName, String startTime, String endTime, Long page, String storeHouse, String state)
//       search for item by:
//             orderNumber  : required, use '-' stand for empty.
//                            order's orderNumber
//             clientName   : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'clientName' in the clientName field.
//             startTime    : required, use '-' stand for empty.
//                            Search by creation time
//                            this is the minimum createTime
//             endTime      : required, use '-' stand for empty.
//                            Search by creation time
//                            this is the maximum createTime
//             storeHouse   : required, use 'all' stand for all.
//                            order's storehouse.
//                            input full storehouse name or use 'all'
//             state        : required, use 'all' stand for all.
//                            order's status
//                            initialize, error, processing, finished and 'all'
//             page         : page number of search results
//                            there are 15 records per page.
//
// public List<OrderInProcess> searchHistoryOrder(String orderNumber, String startTime, String endTime, Long page, String storeHouse)
//       search for item by:
//             orderNumber  : required, use '-' stand for empty.
//             clientName   : required, use '-' stand for empty.
//             startTime    : required, use '-' stand for empty.
//                            minimum createTime
//             endTime      : required, use '-' stand for empty.
//                            maximum createTime
//             storeHouse   : required, use 'all' stand for all.
//             page         : page number of search results
//                            there are 15 records per page.
//
// POST
// public String createOrderInProcess(OrderInProcess orderInProcess)
//       use to create an un-archive order record in order_in_process.
//       order's status can be 'initialize', 'error', 'processing' or 'finished'.
//       order must have: clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// public String createOrderInHistory(OrderInProcess orderInProcess)
//       use to create an archive order record in order_in_history.
//       order's status must be 'finished'.
//       order must have: clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// PUT
// public String updateOrderInProcess(OrderInProcess orderInProcess)
//       use to update an un-archive order record in order_in_process.
//       order's status can be 'initialize', 'error', 'processing' or 'finished'.
//       order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// public String updateOrderInHistory(OrderInProcess orderInProcess)
//       use to update an archive order record in order_in_history.
//       order's status must be 'finished'.
//       order must have: clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// public String archiveOrder(OrderInProcess orderInProcess)
//       used to update and enforce archive order.
//       order's status must be 'finished'.
//       order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// public String unarchiveOrder(OrderInProcess orderInProcess)
//       used to update and enforce un-archive order.
//       order's status can be 'initialize', 'error', 'processing' or 'finished'.
//       order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
//
// DELETE
// public String deleteOrderInProcess(Long id)
//       use to delete un-archive order record in order_in_process table.
//       this method will only delete the order and will not change the item records.
//       those fields are required： id
//
// public String deleteOrderInProcessAll(Long id)
//       use to delete un-archive order record in order_in_process table.
//       and also delete related items in item_in_process and item_in_history tables.
//       those fields are required： id
//
// public String deleteOrderInHistory(Long id)
//       use to delete archive order record in order_in_history table.
//       this method will only delete the order and will not change the item records.
//       those fields are required： id
//
// public String deleteOrderInHistoryAll(Long id)
//       use to delete archive order record in order_in_history table.
//       and also delete related items in item_in_process and item_in_history tables.
//       those fields are required： id

@Service
public class RootOrderService
{
    // order Repository
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;


    // when the order number is changed, the related items'orderNumber also need to be changed.
    // when the order is deleted, the related items also need to be deleted.
    // item Repository
    @Autowired
    private ItemInProcessRepository  itemInProcessRepository ;
    @Autowired
    private ItemInHistoryRepository  itemInHistoryRepository ;

    // account repository
    // when change or add clientName.
    // use account repository to search account info.
    @Autowired
    private AccountRepository accountRepository;

    // Search Process Order()
    public List<OrderInProcess> searchProcessOrder(String orderNumber, String  clientName, String startTime, String endTime, Long page, String storeHouse, String state)
    {
        return this.orderInProcessRepository.searchOrder(orderNumber, clientName, startTime,endTime,(page-1)*15,storeHouse, state, 15);
    }

    // Search History Order()
    public List<OrderInProcess> searchHistoryOrder(String orderNumber, String  clientName, String startTime, String endTime, Long page, String storeHouse)
    {
        List<OrderInProcess> orderInProcessList = new ArrayList<>();
        // get search result and then convert List<OrderInHistory> to List<OrderInProcess>.
        this.orderInHistoryRepository.searchOrder(orderNumber, clientName, startTime, endTime, (page-1)*15, storeHouse, 15)
                .forEach(e -> { OrderInProcess order = e.toOrderInProcessing(); order.setId(e.getId()); orderInProcessList.add(order);});
        return orderInProcessList;
    }

    // Create Order_In_Process()
    public String createOrderInProcess(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order number is unique in the table
        if(this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the client exists or not
        Optional<Account> account = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
        }

        // set clientId
        orderInProcess.setClientID(account.get().getId());

        // set createTime
        orderInProcess.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));

        // save un-archive order record
        this.orderInProcessRepository.save(orderInProcess);
        return I18nUtil.getMessage("CREATE_ORDER_SUCCESS", lang);
    }

    // Create Order_In_History()
    public String createOrderInHistory(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order's status is 'finished' or not.
        if(!OrderState.FINISHED.equals(orderInProcess.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNFINISHED_ORDER", lang);
        }

        // check if the order number is unique in the table
        if(this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the client exists or not
        Optional<Account> account = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
        if(account.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
        }

        // set clientId
        orderInProcess.setClientID(account.get().getId());

        // set createTime
        orderInProcess.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));

        // save archive order record
        this.orderInHistoryRepository.save(orderInProcess.toOrderInHistory(orderInProcess.getCreateTime()));
        return I18nUtil.getMessage("CREATE_ARCHIVED_ORDER_SUCCESS", lang);
    }

    // Update Order_In_Process()
    @Transactional
    public String updateOrderInProcess(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order exists or not.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(orderInProcess.getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // check if the order number has changed or not
        // check if the order number is unique in the table
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()) && (this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent()))
        {
            // If the order number does not change, there is no need to check whether the order number is unique in the table
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the clientName has changed or not
        if(!order.get().getClientName().equals(orderInProcess.getClientName()))
        {
            // check if client exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
            }
            // set clientId
            orderInProcess.setClientID(optionalAccount.get().getId());
        }
        else
        {
            // If the client name has not changed, set to the original client id
            orderInProcess.setClientID(order.get().getClientID());
        }

        // check if the order number has changed or not
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()))
        {
            // if the orderNumber has changed, update item's orderNumber.
            this.itemInProcessRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
            this.itemInHistoryRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
        }

        // set original createTime
        orderInProcess.setCreateTime(order.get().getCreateTime());

        // update un-archive order record
        this.orderInProcessRepository.save(orderInProcess);
        return I18nUtil.getMessage("UPDATE_ORDER_SUCCESS", lang);
    }

    // Update Order_In_History()
    @Transactional
    public String updateOrderInHistory(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order's status is 'finished' or not.
        if(!OrderState.FINISHED.equals(orderInProcess.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNFINISHED_ORDER", lang);
        }

        // check if the order exists or not.
        Optional<OrderInHistory> order = this.orderInHistoryRepository.findOrderInHistoryById(orderInProcess.getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // check if the order number has changed or not
        // check if the order number is unique in the table
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()) && (this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent()))
        {
            // If the order number does not change, there is no need to check whether the order number is unique in the table
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the clientName has changed or not
        if(!order.get().getClientName().equals(orderInProcess.getClientName()))
        {
            // check if client exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
            }
            // set clientId
            orderInProcess.setClientID(optionalAccount.get().getId());
        }
        else
        {
            // If the client name has not changed, set to the original client id
            orderInProcess.setClientID(order.get().getClientID());
        }

        // check if the order number has changed or not
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()))
        {
            // if the orderNumber has changed, update item's orderNumber.
            this.itemInProcessRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
            this.itemInHistoryRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
        }

        // set original createTime
        orderInProcess.setCreateTime(order.get().getCreateTime());

        // set original archiveTime.
        // update archive order record
        this.orderInHistoryRepository.save(orderInProcess.toOrderInHistory(order.get().getArchiveTime()));
        return I18nUtil.getMessage("UPDATE_ARCHIVED_ORDER_SUCCESS", lang);
    }

    // Archive Order()
    @Transactional
    public String archiveOrder(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order's status is 'finished' or not.
        if(!OrderState.FINISHED.equals(orderInProcess.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNFINISHED_ORDER", lang);
        }

        // check if the order exists or not.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(orderInProcess.getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // check if the order number has changed or not
        // check if the order number is unique in the table
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()) && (this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the clientName has changed or not
        if(!order.get().getClientName().equals(orderInProcess.getClientName()))
        {
            // check if client exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
            }
            // set clientId
            orderInProcess.setClientID(optionalAccount.get().getId());
        }
        else
        {
            // If the client name has not changed, set to the original client id
            orderInProcess.setClientID(order.get().getClientID());
        }

        // check if the order number has changed or not
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()))
        {
            // if the orderNumber has changed, update item's orderNumber.
            this.itemInProcessRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
            this.itemInHistoryRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
        }

        // set original createTime
        orderInProcess.setCreateTime(order.get().getCreateTime());

        // set archiveTime and save order record in order_in_history table.
        this.orderInHistoryRepository.save(orderInProcess.toOrderInHistory(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())));

        // delete order record in order_in_process table.
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("ARCHIVE_ORDER_SUCCESS", lang);
    }

    // Un-archive Order()
    @Transactional
    public String unarchiveOrder(OrderInProcess orderInProcess, String lang)
    {
        // format order fields:
        // remove front and end space;
        orderInProcess.format();

        // check input order is correct or not
        // order must have: id, clientName, oderNumber, oderEmail, oderLink, and storeHouse.
        String check = orderInProcess.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the order exists or not.
        Optional<OrderInHistory> order = this.orderInHistoryRepository.findOrderInHistoryById(orderInProcess.getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // check if the order number has changed or not
        // check if the order number is unique in the table
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()) && (this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderInProcess.getOrderNumber()).isPresent() || this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(orderInProcess.getOrderNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        // check if the clientName has changed or not
        if(!order.get().getClientName().equals(orderInProcess.getClientName()))
        {
            // check if client exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(orderInProcess.getClientName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_CLIENT_NOT_EXIST", lang);
            }
            // set clientId
            orderInProcess.setClientID(optionalAccount.get().getId());
        }
        else
        {
            // If the client name has not changed, set to the original client id
            orderInProcess.setClientID(order.get().getClientID());
        }

        // check if the order number has changed or not
        if(!order.get().getOrderNumber().equals(orderInProcess.getOrderNumber()))
        {
            // if the orderNumber has changed, update item's orderNumber.
            this.itemInProcessRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
            this.itemInHistoryRepository.updateOrderNumber(orderInProcess.getOrderNumber(), order.get().getOrderNumber());
        }

        // set original createTime
        orderInProcess.setCreateTime(order.get().getCreateTime());

        // save order record in order_in_process table.
        this.orderInProcessRepository.save(orderInProcess);

        // delete order record in order_in_history table.
        this.orderInHistoryRepository.delete(order.get());
        return I18nUtil.getMessage("UNARCHIVE_ORDER_SUCCESS", lang);
    }

    // Delete Order_In_Process()
    public String deleteOrderInProcess(Long id, String lang)
    {
        // check if the order exists or not.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // delete un-archive order record in order_in_process table.
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ORDER_SUCCESS", lang);
    }

    // Delete Order_In_Process_All()
    @Transactional
    public String deleteOrderInProcessAll(Long id, String lang)
    {
        // check if the order exists or not.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // delete related item records in item_in_process and item_in_history table.
        this.itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        this.itemInHistoryRepository.deleteAllByOrderNumber(order.get().getOrderNumber());

        // delete un-archive order record in order_in_process table.
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ORDER_SUCCESS", lang);
    }

    // Delete Order_In_History()
    public String deleteOrderInHistory(Long id, String lang)
    {
        // check if the order exists or not.
        Optional<OrderInHistory> order = this.orderInHistoryRepository.findOrderInHistoryById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // delete archive order record in order_in_process table.
        this.orderInHistoryRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ARCHIVED_ORDER_SUCCESS", lang);
    }

    // Delete Order_In_History()
    @Transactional
    public String deleteOrderInHistoryAll(Long id, String lang)
    {
        // check if the order exists or not.
        Optional<OrderInHistory> order = this.orderInHistoryRepository.findOrderInHistoryById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // delete related item records in item_in_process and item_in_history table.
        this.itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        this.itemInHistoryRepository.deleteAllByOrderNumber(order.get().getOrderNumber());

        // delete archive order record in order_in_process table.
        this.orderInHistoryRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ARCHIVED_ORDER_SUCCESS", lang);
    }
}
