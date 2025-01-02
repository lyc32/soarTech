package com.codenext.backend.service.root.rootItemService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// RootItemController
//
// GET
// api = "/root/item/inProcess/{page}"
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
// api = "/root/item/inHistory/{page}"
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
// POST
// api = "/root/item/create/inProcess"
// public String createItemInProcess(ItemInProcess item)
//       use to create an item with initialize, imported, exported status in item_in_process table.
//
// api = "/root/item/create/inHistory"
// public String createItemInHistory(ItemInProcess item)
//       use to create an item with exported status in item_in_history table.
//
// PUT
// api = "/root/item/update/inProcess"
// public String updateItemInProcess(ItemInProcess item)
//       update item info in item_in_process table.
//
// api = "/root/item/update/inHistory"
// public String updateItemInHistory(ItemInProcess item)
//       update item info in item_in_history table.
//
// api = "/root/item/archive"
// public String archiveItem(ItemInProcess item)
//       update item info and move item from item_in_process to item_in_history table.
//
// api = "/root/item/unarchive"
// public String unarchiveItem(ItemInProcess item)
//       update item info and move item from item_in_history to item_in_process table.
//
// DELETE
// api = "/root/item/delete/inProcess/{itemId}"
// public String deleteItemInProcess(Long id)
//       delete item record in item_in_process table.
//
// api = "/root/item/delete/inHistory/{itemId}"
// public String deleteItemInHistory(Long id)
//       delete item record in item_in_history table.

@RestController
@RequestMapping("/root/{lang}/item")
public class RootItemController
{
    @Autowired
    private RootItemService rootItemService;

    @GetMapping("/inProcess/{page}")
    public List<ItemInProcess> searchProcessItem(@RequestParam String itemName, @RequestParam String orderNumber, @RequestParam String serialNumber, @RequestParam String importerName, @RequestParam String exporterName, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String position, @RequestParam String carrier, @RequestParam String trackNumber, @RequestParam String state)
    {
        return this.rootItemService.searchProcessItem(itemName, orderNumber, serialNumber, importerName, exporterName, page, storeHouse, position, carrier, trackNumber, state);
    }

    @GetMapping("/inHistory/{page}")
    public List<ItemInProcess> searchHistoryItem(@RequestParam String itemName, @RequestParam String orderNumber, @RequestParam String serialNumber, @RequestParam String importerName, @RequestParam String exporterName, @PathVariable Long page, @RequestParam String storeHouse, @RequestParam String position, @RequestParam String carrier, @RequestParam String trackNumber)
    {
        return this.rootItemService.searchHistoryItem(itemName, orderNumber, serialNumber, importerName, exporterName, page, storeHouse, position, carrier, trackNumber);
    }

    @PostMapping("/create/inProcess")
    public String createItemInProcess(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.createItemInProcess(item, lang);
    }

    @PostMapping("/create/inHistory")
    public String createItemInHistory(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.createItemInHistory(item, lang);
    }

    @PutMapping("/update/inProcess")
    public String updateItemInProcess(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.updateItemInProcess(item, lang);
    }

    @PutMapping("/update/inHistory")
    public String updateItemInHistory(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.updateItemInHistory(item, lang);
    }

    @PutMapping("/archive")
    public String archiveItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.archiveItem(item, lang);
    }

    @PutMapping("/unarchive")
    public String unarchiveItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.rootItemService.unarchiveItem(item, lang);
    }

    @DeleteMapping("/delete/inProcess/{itemId}")
    public String deleteItemInProcess(@PathVariable Long itemId, @PathVariable String lang)
    {
        return this.rootItemService.deleteItemInProcess(itemId, lang);
    }

    @DeleteMapping("/delete/inHistory/{itemId}")
    public String deleteItemInHistory(@PathVariable Long itemId, @PathVariable String lang)
    {
        return this.rootItemService.deleteItemInHistory(itemId, lang);
    }

}
