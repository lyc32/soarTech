package com.codenext.backend.service.client.clientItemService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// ClientItemController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/client/{lang}/myItem/get/by/{orderId}"
// public List<StoreHouse> getMyItemsByOrderId(Long orderId)
//       use to get all un-archive item records in this order
//
// api = "/client/{lang}/myItem/get/{type}/by/{orderId}"
// public List<StoreHouse> getMyAllItemsByOrderId(Long orderId)
//       use to get all un-archive and archive item records in this order.
//       when type = 'inHistory', the order is archived.
//       when type = 'inProcess', the order is un-archived.

@RestController
@RequestMapping("/client/{lang}/myItem")
public class ClientItemController
{
    @Autowired
    private ClientItemService clientItemService;

    @GetMapping("/get/by/{orderId}")
    public List<ItemInProcess> getMyItemsByOrderId(@PathVariable Long orderId)
    {
        return clientItemService.getMyItemsByOrderId(orderId);
    }

    @GetMapping("/get/{type}/by/{orderId}")
    public List<ItemInProcess> getMyAllItemsByOrderId(@PathVariable Long orderId, @PathVariable String type)
    {
        return clientItemService.getMyAllItemsByOrderId(orderId, type);
    }
}
