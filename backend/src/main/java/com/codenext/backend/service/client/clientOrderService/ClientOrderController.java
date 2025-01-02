package com.codenext.backend.service.client.clientOrderService;

import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/client/{lang}/myOrder")
public class ClientOrderController
{
    @Autowired
    private ClientOrderService clientOrderService;

    @GetMapping("/inProcess/{page}")
    public List<OrderInProcess> getMyOrders(@RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String state)
    {
        return this.clientOrderService.getMyOrders(startTime, endTime, page, storeHouse, state);
    }

    @GetMapping("/inHistory/{page}")
    public List<OrderInProcess> getMyHistoryOrders(@RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse)
    {
        return this.clientOrderService.getMyHistoryOrders(startTime, endTime, page, storeHouse);
    }

    @PostMapping("/create")
    public String create(@RequestBody OrderInProcess order, @PathVariable String lang)
    {
        return this.clientOrderService.create(order, lang);
    }

    @PostMapping("/create/init/batches")
    public String createInitOrders(@RequestBody OrderInProcess[] orderList, @PathVariable String lang)
    {
        return this.clientOrderService.createInitOrders(orderList, lang);
    }

    @PostMapping("/create/process")
    public String createProcessOrder(@RequestBody OrderInProcess order, @PathVariable String lang)
    {
        return this.clientOrderService.createProcessOrder(order, lang);
    }

    @PostMapping("/insert/{orderNumber}/items")
    public String createProcessOrders(@PathVariable String orderNumber, @RequestBody ItemInProcess[] itemList, @PathVariable String lang)
    {
        return this.clientOrderService.insertItems(orderNumber, itemList, lang);
    }

    @PutMapping("/update")
    public String updateOrder(@RequestBody OrderInProcess order, @PathVariable String lang)
    {
        return this.clientOrderService.updateOrder(order, lang);
    }

    @PutMapping("/updateAll/{id}")
    public String updateOrderAndItem(@PathVariable Long id, @RequestParam Float totalPrice, @RequestParam(required = false, defaultValue = "")  String storeHouse, @RequestParam(required = false, defaultValue = "")  String message, @RequestBody ItemInProcess[] items, @PathVariable String lang)
    {
        return this.clientOrderService.updateOrderAndItem(id, totalPrice, storeHouse, message, items, lang);
    }

    @PutMapping("/autoFix/{id}")
    public String autoFix(@PathVariable Long id, @PathVariable String lang)
    {
        return this.clientOrderService.autoFix(id, lang);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteOrder(@PathVariable Long id, @PathVariable String lang)
    {
        return this.clientOrderService.deleteOrder(id, lang);
    }
}
