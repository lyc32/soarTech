package com.codenext.backend.service.admin.adminOrderService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.*;
import com.codenext.backend.config.utils.OrderNumberUntils;
import com.codenext.backend.entity.*;

import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import com.codenext.backend.repository.OrderInHistoryRepository;
import com.codenext.backend.repository.OrderInProcessRepository;
import com.gargoylesoftware.htmlunit.WebClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class AdminOrderService
{
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;
    @Autowired
    private WebClient webClient;
    @Autowired
    private OrderNumberUntils orderNumberUntils;


    public List<OrderInProcess> searchProcessOrder(String orderNumber, String clientName, String startTime, String endTime, Long page, String storeHouse, String state)
    {
        return this.orderInProcessRepository.searchOrder(orderNumber, clientName, startTime,endTime,(page-1)*8,storeHouse, state, 8);
    }


    public List<OrderInProcess> searchHistoryOrder(String orderNumber, String clientName, String startTime, String endTime, Long page, String storeHouse)
    {
        List<OrderInHistory> historyList = this.orderInHistoryRepository.searchOrder(orderNumber, clientName, startTime, endTime, (page-1)*8, storeHouse, 8);
        List<OrderInProcess> orderInProcessList = new ArrayList<>();
        historyList.forEach(e -> orderInProcessList.add(e.toOrderInProcessing()));
        return orderInProcessList;
    }

    @Transactional
    public String autoFix(Long orderId, String lang)
    {
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(orderId);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(order.get().getState().equals(OrderState.PROCESSING) || order.get().getState().equals(OrderState.FINISHED))
        {
            return I18nUtil.getMessage("ERROR_CANNOT_AUTO_FIX", lang);
        }

        List<String> itemStringList = orderNumberUntils.getProductName(this.webClient, order.get().getOrderLink());
        if(itemStringList == null || itemStringList.size() == 0)
        {
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

        itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        itemInProcessRepository.saveAllAndFlush(itemInProcessList);

        order.get().setState(OrderState.PROCESSING);
        orderInProcessRepository.save(order.get());
        return I18nUtil.getMessage("AUTO_LOAD_ITEM_SUCCESS", lang);
    }

    public String updateOrder(Long id, String state, String lang)
    {
        state = state == null ? null : state.trim();
        if(state == null || state.equals(""))
        {
            return I18nUtil.getMessage("ERROR_ORDER_STATUS_EMTPY", lang);
        }

        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if(state.equals(OrderState.ERROR) || state.equals(OrderState.INITIALIZE))
        {
            List<ItemInProcess> itemList = this.itemInProcessRepository.findAllByOrderNumber(order.get().getOrderNumber());
            if(itemList.size() > 0)
            {
                return I18nUtil.getMessage("ERROR_HAS_ITEM_IN_ERROR_ORDER", lang);
            }
        }

        if(state.equals(OrderState.PROCESSING))
        {
            List<ItemInProcess> itemList = this.itemInProcessRepository.findAllByOrderNumber(order.get().getOrderNumber());
            if(itemList.size() == 0)
            {
                return I18nUtil.getMessage("ERROR_NO_ITEM_IN_PROCESS_ORDER", lang);
            }

            List<ItemInProcess> itemInProcessList = itemList.stream().filter(e -> !e.getState().equals(ItemState.INITIALIZE)).toList();
            if(itemInProcessList.size() > 0)
            {
                return I18nUtil.getMessage("ERROR_HAS_IMPORTED_ITEM_IN_PROCESS_ORDER", lang);
            }
        }

        order.get().setState(state);
        this.orderInProcessRepository.save(order.get());
        return I18nUtil.getMessage("UPDATE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String updateOrderAndItem(Long id, String state, ItemInProcess[] items, String lang)
    {
        state = state == null ? null : state.trim();
        if(state == null || state.equals(""))
        {
            return I18nUtil.getMessage("ERROR_ORDER_STATUS_EMTPY", lang);
        }

        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        if((state.equals(OrderState.INITIALIZE) || state.equals(OrderState.ERROR)) && items.length != 0)
        {
            return I18nUtil.getMessage("ERROR_HAS_ITEM_IN_ERROR_ORDER", lang);
        }

        if(state.equals(OrderState.PROCESSING) && items.length == 0)
        {
            return I18nUtil.getMessage("ERROR_NO_ITEM_IN_PROCESS_ORDER", lang);
        }

        if(state.equals(OrderState.PROCESSING) && Arrays.stream(items).filter(e -> !e.getState().equals(ItemState.INITIALIZE)).toList().size() > 0)
        {
            return I18nUtil.getMessage("ERROR_HAS_IMPORTED_ITEM_IN_PROCESS_ORDER", lang);
        }


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        Account account = ((Account) authentication.getPrincipal());

        HashSet<String> serialNumberSet = new HashSet<>();
        for (ItemInProcess e : items)
        {
            e.format();
            String check = e.check();

            if(check != null)
            {
                return I18nUtil.getMessage(check, lang) + " [" + e.getItemName() + "]";
            }

            if(!e.getOrderNumber().equals(order.get().getOrderNumber()))
            {
                return I18nUtil.getMessage("ERROR_ITEMS_NOT_IN_ORDER", lang).replace("{item}", "[" + e.getItemName() + "]");
            }

            if(!e.getState().equals(ItemState.INITIALIZE))
            {
                if(serialNumberSet.contains(e.getSerialNumber()))
                {
                    return I18nUtil.getMessage("ERROR_ITEMS_SERIAL_EXIST", lang).replace("{item}", "[" + e.getItemName() + "]");
                }
                else
                {
                    serialNumberSet.add(e.getSerialNumber());
                }

                Optional<ItemInProcess> item1 = this.itemInProcessRepository.findItemInProcessBySerialNumber(e.getSerialNumber());
                Optional<ItemInHistory> item2 = this.itemInHistoryRepository.findItemInHistoryBySerialNumber(e.getSerialNumber());
                if ( (item1.isPresent() && !item1.get().getOrderNumber().equals(order.get().getOrderNumber())) || (item2.isPresent() && !item2.get().getOrderNumber().equals(order.get().getOrderNumber())))
                {
                    return I18nUtil.getMessage("ERROR_ITEMS_SERIAL_EXIST", lang).replace("{item}", "[" + e.getItemName() + "]");
                }
            }

            if (e.getState().equals(ItemState.INITIALIZE))
            {
                e.setSerialNumber(null);
                e.setImporterId(null);
                e.setImporterName(null);
                e.setImportTime(null);
                e.setPosition(null);
                e.setExporterId(null);
                e.setExporterName(null);
                e.setExportTime(null);
                e.setCarrier(null);
                e.setTrackNumber(null);
            }

            else if (e.getState().equals(ItemState.IMPORTED))
            {
                e.setExporterId(null);
                e.setExporterName(null);
                e.setExportTime(null);
                e.setCarrier(null);
                e.setTrackNumber(null);

                if (e.getImporterId() == null)
                {
                    e.setImporterId(account.getId());
                    e.setImporterName(account.getAccountName());
                    e.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                }
            }
            else
            {
                if(e.getImporterId() == null)
                {
                    e.setImporterId(account.getId());
                    e.setImporterName(account.getAccountName());
                    e.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                }

                if(e.getExporterId() == null)
                {
                    e.setExporterId(account.getId());
                    e.setExporterName(account.getAccountName());
                    e.setExportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                }
            }
        }


        this.itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        this.itemInProcessRepository.saveAll(Arrays.asList(items));

        order.get().setState(state);
        this.orderInProcessRepository.save(order.get());

        return I18nUtil.getMessage("UPDATE_ORDER_SUCCESS", lang);
    }


    public String deleteOrder(Long id, String lang)
    {
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ORDER_SUCCESS", lang);
    }

    @Transactional
    public String deleteOrderAndItem(Long id, String lang)
    {
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessById(id);
        if(order.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        this.itemInProcessRepository.deleteAllByOrderNumber(order.get().getOrderNumber());
        this.orderInProcessRepository.delete(order.get());
        return I18nUtil.getMessage("DELETE_ORDER_SUCCESS", lang);
    }

}
