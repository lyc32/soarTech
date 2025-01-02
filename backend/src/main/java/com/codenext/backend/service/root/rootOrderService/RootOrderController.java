package com.codenext.backend.service.root.rootOrderService;

import com.codenext.backend.entity.OrderInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// RootItemController
//
// GET
// api = "/root/order/inProcess/{page}"
// public List<OrderInProcess> searchProcessOrder(String orderNumber, String clientName, String startTime, String endTime, Long page, String storeHouse, String state)
//       search for item by:
//             orderNumber  : required, use '-' stand for empty.
//             clientName   : required, use '-' stand for empty.
//             startTime    : required
//             endTime      : required
//             storeHouse   : required, use 'all' stand for all.
//             state        : required, use 'all' stand for all.
//             page         : required
//       clientName uses fuzzy search, you do not need to provide the full string.
//
// api = "/root/order/inHistory/{page}"
// public List<OrderInProcess> searchHistoryOrder(String orderNumber, String startTime, String endTime, Long page, String storeHouse)
//       search for item by:
//             orderNumber  : required, use '-' stand for empty.
//             clientName   : required, use '-' stand for empty.
//             startTime    : required
//             endTime      : required
//             storeHouse   : required, use 'all' stand for all.
//             page         : required
//       clientName uses fuzzy search, you do not need to provide the full string.
//
// POST
// api = "/root/order/create/inProcess"
// public String createOrderInProcess(OrderInProcess orderInProcess)
//       use to create an order with initialize, error, processing, finished status in order_in_process table.
//
// api = "/root/order/create/inHistory"
// public String createOrderInHistory(OrderInProcess orderInProcess)
//       use to create an item with finished status in order_in_history table.
//
// PUT
// api = "/root/order/update/inProcess"
// public String updateOrderInProcess(OrderInProcess orderInProcess)
//       update order info in order_in_process table.
//
// api = "/root/order/update/inHistory"
// public String updateOrderInHistory(OrderInProcess orderInProcess)
//       update order info in order_in_history table.
//
// api = "/root/order/archive"
// public String archiveOrder(OrderInProcess orderInProcess)
//       update order info and move order from order_in_process to order_in_history table.
//
// api = "/root/order/unarchive"
// public String unarchiveOrder(OrderInProcess orderInProcess)
//       update order info and move order from order_in_history to order_in_process table.
//
// DELETE
// api = "/root/order/delete/inProcess/{itemId}"
// public String deleteOrderInProcess(Long id)
//       delete order record in order_in_process table.
//
// api = "/root/order/delete/all/inProcess/{itemId}"
// public String deleteOrderInProcessAll(Long id)
//       delete order record in order_in_process table.
//       and also delete related items in item_in_process and item_in_history tables.
//
// api = "/root/order/delete/inHistory/{itemId}"
// public String deleteOrderInHistory(Long id)
//       delete order record in order_in_history table.
//
// api = "/root/order/delete/all/inHistory/{itemId}"
// public String deleteOrderInHistoryAll(Long id)
//       delete order record in order_in_history table.
//       and also delete related items in item_in_history and item_in_process tables.
//

@RestController
@RequestMapping("/root/{lang}/order")
public class RootOrderController
{

    @Autowired
    private RootOrderService rootOrderService;

    @GetMapping("/inProcess/{page}")
    public List<OrderInProcess> searchProcessOrder(@RequestParam String orderNumber, @RequestParam String clientName, @RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String state)
    {
        return this.rootOrderService.searchProcessOrder(orderNumber, clientName,  startTime, endTime, page, storeHouse, state);
    }

    @GetMapping("/inHistory/{page}")
    public List<OrderInProcess> searchHistoryOrder(@RequestParam String orderNumber, @RequestParam String clientName, @RequestParam String startTime, @RequestParam String endTime, @PathVariable Long page, @RequestParam String storeHouse)
    {
        return this.rootOrderService.searchHistoryOrder(orderNumber,clientName, startTime, endTime, page, storeHouse);
    }

    @PostMapping("/create/inProcess")
    public String createOrderInProcess(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.createOrderInProcess(orderInProcess, lang);
    }

    @PostMapping("/create/inHistory")
    public String createOrderInHistory(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.createOrderInHistory(orderInProcess, lang);
    }

    @PutMapping("/update/inProcess")
    public String updateOrderInProcess(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.updateOrderInProcess(orderInProcess, lang);
    }

    @PutMapping("/update/inHistory")
    public String updateOrderInHistory(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.updateOrderInHistory(orderInProcess, lang);
    }

    @PutMapping("/archive")
    public String archiveOrder(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.archiveOrder(orderInProcess, lang);
    }

    @PutMapping("/unarchive")
    public String unarchiveOrder(@RequestBody OrderInProcess orderInProcess, @PathVariable String lang)
    {
        return this.rootOrderService.unarchiveOrder(orderInProcess, lang);
    }

    @DeleteMapping("/delete/inProcess/{id}")
    public String deleteOrderInProcess(@PathVariable Long id, @PathVariable String lang)
    {
        return this.rootOrderService.deleteOrderInProcess(id, lang);
    }

    @DeleteMapping("/delete/all/inProcess/{id}")
    public String deleteOrderInProcessAll(@PathVariable Long id, @PathVariable String lang)
    {
        return this.rootOrderService.deleteOrderInProcessAll(id, lang);
    }

    @DeleteMapping("/delete/inHistory/{id}")
    public String deleteOrderInHistory(@PathVariable Long id, @PathVariable String lang)
    {
        return this.rootOrderService.deleteOrderInHistory(id, lang);
    }

    @DeleteMapping("/delete/all/inHistory/{id}")
    public String deleteOrderInHistoryAll(@PathVariable Long id, @PathVariable String lang)
    {
        return this.rootOrderService.deleteOrderInHistoryAll(id, lang);
    }
}
