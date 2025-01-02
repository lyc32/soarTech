package com.codenext.backend.service.client.clientOrderService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.*;
import com.codenext.backend.config.utils.OrderNumberUntils;
import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.entity.OrderInHistory;
import com.codenext.backend.repository.ItemInProcessRepository;
import com.codenext.backend.repository.OrderInHistoryRepository;
import com.codenext.backend.repository.OrderInProcessRepository;
import com.gargoylesoftware.htmlunit.WebClient;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutorService;

@Service
public class ClientOrderService
{
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private OrderNumberUntils orderNumberUntils;
    @Autowired
    private ExecutorService executorService;
    @Autowired
    private WebClient webClient;

    public List<OrderInProcess> getMyOrders(String startTime, String endTime, Long page, String storeHouse, String state)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return null;
        }

        return this.orderInProcessRepository.searchMyOrder(((Account) authentication.getPrincipal()).getId(), startTime, endTime, (page-1)*8, storeHouse, state);
    }

    public List<OrderInProcess> getMyHistoryOrders(String startTime, String endTime, Long page, String storeHouse)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return null;
        }

        List<OrderInHistory> orderInHistoryList = this.orderInHistoryRepository.searchMyHistoryOrder(((Account) authentication.getPrincipal()).getId(), startTime, endTime, (page-1)*8, storeHouse);
        List<OrderInProcess> orderInProcessList = new ArrayList<>();
        orderInHistoryList.forEach(e -> orderInProcessList.add(e.toOrderInProcessing()));
        return orderInProcessList;
    }

    public String create(OrderInProcess order, String lang)
    {
        // format input order fields:
        // remove front and end space
        order.format();

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = order.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        if(this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(order.getOrderNumber()).isPresent()
                ||
                this.orderInProcessRepository.findOrderInProcessByOrderNumber(order.getOrderNumber()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        order.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        order.setClientID(((Account) authentication.getPrincipal()).getId());
        order.setClientName(((Account) authentication.getPrincipal()).getAccountName());
        order.setState(OrderState.INITIALIZE);

        orderInProcessRepository.saveAndFlush(order);
        this.executorService.execute(() -> getItemsFromOrderLink(order.getOrderNumber()));
        return I18nUtil.getMessage("CREATE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String createInitOrders(OrderInProcess[] orderList, String lang)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        List<String> successList = new ArrayList<>();
        int success = 0;
        int failed  = 0;
        String failedMessage = "";

        String systemTime = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        for(int i = 0; i < orderList.length; i++)
        {
            OrderInProcess order = orderList[i];
            // format input order fields:
            // remove front and end space
            order.format();

            // check input account is correct or not
            // check accountName, email, phone and role are null or empty string.
            String check = order.check();
            if(check != null)
            {
                failed++;
                failedMessage = failedMessage + "[" + order.getOrderNumber() + "] " + I18nUtil.getMessage(check, lang) + "\n";
            }
            // check orderNumber is unique or not
            else if(this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(order.getOrderNumber()).isPresent()
                    ||
                    this.orderInProcessRepository.findOrderInProcessByOrderNumber(order.getOrderNumber()).isPresent())
            {
                failed++;
                failedMessage = failedMessage + "[" + order.getOrderNumber() + "] " + I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang) + "\n";
            }
            else
            {
                order.setCreateTime(systemTime);
                order.setClientID(((Account) authentication.getPrincipal()).getId());
                order.setClientName(((Account) authentication.getPrincipal()).getAccountName());
                order.setState(OrderState.INITIALIZE);
                orderInProcessRepository.saveAndFlush(order);
                successList.add(order.getOrderNumber());
                success++;
            }
        }

        successList.forEach( e -> this.executorService.execute(() -> this.getItemsFromOrderLink(e)));

        return failedMessage + "\n" + I18nUtil.getMessage("CREATE_ORDERS_SUCCESS", lang)
                .replace("{number1}", String.valueOf(success))
                .replace("{number2}", String.valueOf(failed));
    }

    public String createProcessOrder(OrderInProcess order, String lang)
    {
        // format input order fields:
        // remove front and end space
        order.format();

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = order.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        if(this.orderInHistoryRepository.findOrderInHistoryByOrderNumber(order.getOrderNumber()).isPresent()
                ||
                this.orderInProcessRepository.findOrderInProcessByOrderNumber(order.getOrderNumber()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NUMBER_EXIST", lang);
        }

        order.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        order.setClientID(((Account) authentication.getPrincipal()).getId());
        order.setClientName(((Account) authentication.getPrincipal()).getAccountName());
        order.setState(OrderState.ERROR);

        orderInProcessRepository.saveAndFlush(order);
        return I18nUtil.getMessage("CREATE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String insertItems(String orderNumber, ItemInProcess[] itemList, String lang)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        Optional<OrderInProcess> orderInProcess = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
        if(orderInProcess.isEmpty() || orderInProcess.get().getClientID() != ((Account) authentication.getPrincipal()).getId())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }
        if(orderInProcess.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_UPDATE_FINISHED_ORDER", lang);
        }

        int total = itemList.length;
        itemList = Arrays.stream(itemList).filter(s -> (s.getItemName() == null || !s.getItemName().equals(""))).toArray(ItemInProcess[]::new);
        int success = itemList.length;

        if(itemList.length == 0)
        {
            orderInProcess.get().setState(OrderState.ERROR);
        }
        else
        {
            orderInProcess.get().setState(OrderState.PROCESSING);
            for (ItemInProcess item: itemList)
            {
                item.format();
                item.setState(ItemState.INITIALIZE);
                item.setItemName(item.getItemName());
                item.setOrderNumber(orderInProcess.get().getOrderNumber());
                item.setStoreHouse(orderInProcess.get().getStoreHouse());
                item.setPrice(item.getPrice());
            }
            this.itemInProcessRepository.saveAll(Arrays.stream(itemList).toList());
        }
        return I18nUtil.getMessage("INSERT_ITEMS_SUCCESS", lang)
                .replace("{number1}", String.valueOf(success))
                .replace("{number2}", String.valueOf(total - success));
    }

    public String updateOrder(OrderInProcess order, String lang)
    {
        // format input order fields:
        // remove front and end space
        order.format();

        // check input account is correct or not
        // check accountName, email, phone and role are null or empty string.
        String check = order.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        Optional<OrderInProcess> orderInProcess = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(order.getId(), ((Account) authentication.getPrincipal()).getId());
        if(orderInProcess.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(orderInProcess.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_UPDATE_FINISHED_ORDER", lang);
        }

        if( !orderInProcess.get().getOrderNumber().equals(order.getOrderNumber()) ||
            !orderInProcess.get().getOrderEmail().equals(order.getOrderEmail()) ||
            !orderInProcess.get().getOrderLink().equals(order.getOrderLink()) ||
            !orderInProcess.get().getState().equals(order.getState()))
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_MATCH", lang);
        }

        order.setClientName(orderInProcess.get().getClientName());
        order.setCreateTime(orderInProcess.get().getCreateTime());

        this.orderInProcessRepository.save(order);
        return I18nUtil.getMessage("UPDATE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String updateOrderAndItem(Long id, Float totalPrice, String storeHouse, String message,  ItemInProcess[] items, String lang)
    {
        storeHouse = storeHouse.trim();
        message = message.trim();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        Optional<OrderInProcess> orderInProcess = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(id, ((Account) authentication.getPrincipal()).getId());
        if(orderInProcess.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(orderInProcess.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_UPDATE_FINISHED_ORDER", lang);
        }

        orderInProcess.get().setStoreHouse(storeHouse);
        orderInProcess.get().setTotalPrice(totalPrice);
        orderInProcess.get().setMessage(message);

        items = Arrays.stream(items).filter(s -> (s.getItemName() == null || !s.getItemName().equals(""))).toArray(ItemInProcess[]::new);

        if(items.length == 0)
        {
            orderInProcess.get().setState(OrderState.ERROR);
        }
        else
        {
            orderInProcess.get().setState(OrderState.PROCESSING);
            this.itemInProcessRepository.deleteAllByOrderNumber(orderInProcess.get().getOrderNumber());
            List<ItemInProcess> itemList = new ArrayList<>();
            for (ItemInProcess item: items)
            {
                item.setState(ItemState.INITIALIZE);
                item.setItemName(item.getItemName());
                item.setOrderNumber(orderInProcess.get().getOrderNumber());
                item.setStoreHouse(orderInProcess.get().getStoreHouse());
                item.setPrice(item.getPrice());
                itemList.add(item);
            }
            this.itemInProcessRepository.saveAll(itemList);
        }

        this.orderInProcessRepository.save(orderInProcess.get());
        return I18nUtil.getMessage("UPDATE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String autoFix(Long id, String lang)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(id, ((Account) authentication.getPrincipal()).getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(order.get().getState().equals(OrderState.PROCESSING) || order.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_CANNOT_AUTO_FIX", lang);
        }

        itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());

        List<String> itemStringList = orderNumberUntils.getProductName(this.webClient, order.get().getOrderLink());
        if(itemStringList == null || itemStringList.size() == 0)
        {
            order.get().setState(OrderState.ERROR);
            orderInProcessRepository.save(order.get());
            return I18nUtil.getMessage("ERROR_AUTO_LOAD_ITEM_FAILED", lang);
        }

        List<ItemInProcess> itemInProcessList = new ArrayList<>();
        itemStringList.forEach(itemName ->
        {
            ItemInProcess item = new ItemInProcess();
            item.setStoreHouse(order.get().getStoreHouse());
            item.setOrderNumber(order.get().getOrderNumber());
            item.setItemName(itemName);
            item.setState(ItemState.INITIALIZE);
            itemInProcessList.add(item);
        });

        itemInProcessRepository.saveAllAndFlush(itemInProcessList);

        order.get().setState(OrderState.PROCESSING);
        orderInProcessRepository.save(order.get());
        return I18nUtil.getMessage("AUTO_LOAD_ITEM_SUCCESS", lang);
    }

    @Transactional
    public String deleteOrder(Long id, String lang)
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(id, ((Account) authentication.getPrincipal()).getId());
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(order.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_DELETE_FINISHED_ORDER", lang);
        }

        this.itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ORDER_SUCCESS", lang);
    }

    @Transactional
    @SneakyThrows
    void getItemsFromOrderLink(String orderNumber)
    {
        // There is a bug
        // if you update this order in a short time.
        // second time will be over write by first time.
        // if first time take longer time.
        Thread.sleep(2000);
        Optional<OrderInProcess> orderInProcessing = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
        if(orderInProcessing.isPresent() && orderInProcessing.get().getState().equals(OrderState.INITIALIZE))
        {
            List<String> itemStringList = orderNumberUntils.getProductName(this.webClient, orderInProcessing.get().getOrderLink());
            if(itemStringList != null && itemStringList.size() > 0)
            {
                String storeHouse = orderInProcessing.get().getStoreHouse();
                List<ItemInProcess> itemInProcessList = new ArrayList<>();
                itemStringList.forEach(itemName -> {
                    ItemInProcess item = new ItemInProcess();
                    item.initItem(itemName, orderNumber, storeHouse);
                    itemInProcessList.add(item);
                });
                itemInProcessRepository.saveAllAndFlush(itemInProcessList);
                orderInProcessing.get().setState(OrderState.PROCESSING);
                orderInProcessRepository.save(orderInProcessing.get());
            }
            else
            {
                orderInProcessing.get().setState(OrderState.ERROR);
                orderInProcessRepository.save(orderInProcessing.get());
            }
        }
    }

}
