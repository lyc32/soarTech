package com.codenext.backend.service.admin.adminItemService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

// AdminItemController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/admin/{lang}/item/inProcess/{page}"
// public List<ItemInProcess> searchProcessItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, String state)
//       search for item by:
//             itemName     : required, use '-' stand for empty.
//             orderNumber  : required, use '-' stand for empty.
//             serialNumber : required, use '-' stand for empty.
//             importerName : required, use '-' stand for empty.
//             exporterName : required, use '-' stand for empty.
//             storeHouse   : required, use 'all' stand for all.
//             position     : required, use '-' stand for empty.
//             carrier      : required, use '-' stand for empty.
//             trackNumber  : required, use '-' stand for empty.
//             state        : required, use 'all' stand for all.
//       itemName, importerName, exporterName, and position use fuzzy search, you do not need to provide the full string.
//
// api = "/admin/{lang}/item/inHistory/{page}"
// public List<ItemInProcess> searchHistoryItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber)
//       search for item by:
//             itemName     : required, use '-' stand for empty.
//             orderNumber  : required, use '-' stand for empty.
//             serialNumber : required, use '-' stand for empty.
//             importerName : required, use '-' stand for empty.
//             exporterName : required, use '-' stand for empty.
//             storeHouse   : required, use 'all' stand for all.
//             position     : required, use '-' stand for empty.
//             carrier      : required, use '-' stand for empty.
//             trackNumber  : required, use '-' stand for empty.
//       itemName, importerName, exporterName, and position use fuzzy search, you do not need to provide the full string.
//
// api = "/admin/{lang}/item/get/by/{orderNumber}"
// public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
//        return item list for unarchived order
//
// api = "/admin/{lang}/item/get/all/by/{orderNumber}"
// public List<ItemInProcess> getAllItemsByOrderNumber(String orderNumber)
//        return item list for archived order
//
// POST
// api = "/admin/{lang}/item/create"
// public String createNewItem(ItemInProcess item)
//       use to create an item in item_in_process table.
//
// PUT
// api = "/admin/{lang}/item/update"
// public String updateItem(ItemInProcess item)
//       update item info in item_in_process table.
//
// DELETE
// api = "/admin/{lang}/item/delete/{itemId}"
// public String deleteItemInProcess(Long id)
//       delete item record in item_in_process table.

@RestController
@RequestMapping("/admin/{lang}/item")
public class AdminItemController
{
    @Autowired
    private AdminItemService adminItemService;

    @GetMapping("/inProcess/{page}")
    public List<ItemInProcess> searchProcessItem(@RequestParam String itemName, @RequestParam String orderNumber, @RequestParam String serialNumber, @RequestParam String importerName, @RequestParam String exporterName, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String position, @RequestParam String carrier, @RequestParam String trackNumber, @RequestParam String state)
    {
        return this.adminItemService.searchProcessItem(itemName, orderNumber, serialNumber, importerName, exporterName, page, storeHouse, position, carrier, trackNumber, state);
    }

    @GetMapping("/inHistory/{page}")
    public List<ItemInProcess> searchHistoryItem(@RequestParam String itemName, @RequestParam String orderNumber, @RequestParam String serialNumber, @RequestParam String importerName, @RequestParam String exporterName, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String position, @RequestParam String carrier, @RequestParam String trackNumber)
    {
        return this.adminItemService.searchHistoryItem(itemName, orderNumber, serialNumber, importerName, exporterName, page, storeHouse, position, carrier, trackNumber);
    }

    @GetMapping("/get/by/{orderNumber}")
    public List<ItemInProcess> getItemsByOrderNumber(@PathVariable String orderNumber)
    {
        return this.adminItemService.getItemsByOrderNumber(orderNumber);
    }

    @GetMapping("/get/all/by/{orderNumber}")
    public List<ItemInProcess> getAllItemsByOrderNumber(@PathVariable String orderNumber)
    {
        return this.adminItemService.getAllItemsByOrderNumber(orderNumber);
    }

    @PostMapping("/create")
    public String createNewItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.adminItemService.createItem(item, lang);
    }


    @PutMapping("/update")
    public String updateItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.adminItemService.updateItem(item, lang);
    }

    @DeleteMapping("/delete/{itemId}")
    public String deleteItem(@PathVariable Long itemId, @PathVariable String lang)
    {
        return this.adminItemService.deleteItem(itemId, lang);
    }
}
