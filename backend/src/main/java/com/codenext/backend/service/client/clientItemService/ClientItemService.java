package com.codenext.backend.service.client.clientItemService;

import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInHistory;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import com.codenext.backend.repository.OrderInHistoryRepository;
import com.codenext.backend.repository.OrderInProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// ClientItemController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// public List<StoreHouse> getMyItemsFromOrderId(Long orderId)
//       use to get all un-archive item records in this order.
//
// public List<StoreHouse> getMyAllItemsFromOrderId(Long orderId)
//       use to get all un-archive and archive item records in this order.
//       when type = 'inHistory', the order is archived.
//       when type = 'inProcess', the order is un-archived.

@Service
public class ClientItemService
{
    // item repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // order repository
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;

    // Get My Items From Order.id()
    public List<ItemInProcess> getMyItemsByOrderId(Long orderId)
    {
        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return null;
        }

        // check if order is exist or not.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(orderId, ((Account) authentication.getPrincipal()).getId());
        if(order.isEmpty())
        {
            return null;
        }

        // convert List<Item_in_process> to List<String>
        return this.itemInProcessRepository.findAllByOrderNumber(order.get().getOrderNumber());
    }

    // Get My All Items By Order.id()
    public List<ItemInProcess> getMyAllItemsByOrderId(Long orderId, String table)
    {
        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return null;
        }

        // if the order is archived
        String orderNumber = null;
        if(!table.equals("inHistory"))
        {
            Optional<OrderInProcess> orderInProcessing = this.orderInProcessRepository.findOrderInProcessByIdAndClientID(orderId, ((Account) authentication.getPrincipal()).getId());
            if(orderInProcessing.isPresent())
            {
                orderNumber = orderInProcessing.get().getOrderNumber();
            }
        }
        // if the order is un-archive
        else
        {
            Optional<OrderInHistory> orderInHistory = this.orderInHistoryRepository.findOrderInHistoryByIdAndClientID(orderId, ((Account) authentication.getPrincipal()).getId());
            if(orderInHistory.isPresent())
            {
                orderNumber = orderInHistory.get().getOrderNumber();
            }
        }

        // check if order is exist or not.
        if(orderNumber == null)
        {
            return null;
        }

        // convert List<Item_in_process> to List<String>
        List<ItemInProcess> result = this.itemInProcessRepository.findAllByOrderNumber(orderNumber);
        this.itemInHistoryRepository.findAllByOrderNumber(orderNumber).forEach(e -> result.add(e.toItemInProcessing()));
        return result;
    }

}
