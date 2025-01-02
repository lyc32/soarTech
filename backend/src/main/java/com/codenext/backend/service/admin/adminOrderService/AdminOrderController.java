package com.codenext.backend.service.admin.adminOrderService;

import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;


//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US

@RestController
@RequestMapping("/admin/{lang}/order")
public class AdminOrderController
{

    @Autowired
    private AdminOrderService adminOrderService;

    @GetMapping("/inProcess/{page}")
    public List<OrderInProcess> searchProcessOrder(@RequestParam String orderNumber, @RequestParam String clientName, @RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String state)
    {
        return adminOrderService.searchProcessOrder(orderNumber, clientName, startTime, endTime, page, storeHouse, state);
    }

    @GetMapping("/inHistory/{page}")
    public List<OrderInProcess> searchHistoryOrder(@RequestParam String orderNumber, @RequestParam String clientName, @RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse)
    {
        return adminOrderService.searchHistoryOrder(orderNumber, clientName, startTime, endTime, page, storeHouse);
    }

    @PatchMapping("/update/{orderId}")
    public String updateOrder(@PathVariable Long orderId, @RequestParam String state, @PathVariable String lang)
    {
        return this.adminOrderService.updateOrder(orderId, state, lang);
    }

    @PutMapping("/updateAll/{orderId}")
    public String updateOrderAndItem(@PathVariable Long orderId, @RequestParam String state, @RequestBody ItemInProcess[] items, @PathVariable String lang)
    {
        return this.adminOrderService.updateOrderAndItem(orderId, state, items, lang);
    }

    @PostMapping("/autoFix/{orderId}")
    public String autoFix(@PathVariable Long orderId, @PathVariable String lang)
    {
        return adminOrderService.autoFix(orderId, lang);
    }

    @DeleteMapping("/delete/{orderId}")
    public String deleteOrder(@PathVariable Long orderId, @PathVariable String lang)
    {
        return adminOrderService.deleteOrder(orderId, lang);
    }

    @DeleteMapping("/deleteAll/{orderId}")
    public String deleteOrderAndItem(@PathVariable Long orderId, @PathVariable String lang)
    {
        return this.adminOrderService.deleteOrderAndItem(orderId, lang);
    }

}
