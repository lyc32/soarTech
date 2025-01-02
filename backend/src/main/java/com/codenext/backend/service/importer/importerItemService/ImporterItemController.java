package com.codenext.backend.service.importer.importerItemService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// ImporterItemController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/importer/{lang}/item/list/{page}}"
// public List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, Long page)
//       search for un-archive item by:
//             itemName     : required, use '-' stand for empty.
//             serialNumber : required, use '-' stand for empty.
//             storeHouse   : required, use 'all' stand for all.
//             position     : required, use '-' stand for empty.
//
// api = "/importer/{lang}/item/get/by/{orderNumber}"
// public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
//       use to get all "initialize" status items in the "processing" order.
//
// PUT
// api = "/importer/{lang}/item/import/{orderNumber}"
// public String importItems(String orderNumber, ItemInProcess[] items, String lang)
//       use to import items in this order.
//
// api = "/importer/{lang}/item/update"
// public String updateImportItem(ItemInProcess item, String lang)
//       update item info in item_in_process table.

@RestController
@RequestMapping("/importer/{lang}/item")
public class ImporterItemController
{
    @Autowired
    private ImporterItemService importerItemService;

    @GetMapping("/list/{page}")
    public List<ItemInProcess> searchItem(@RequestParam String itemName, @RequestParam String serialNumber, @RequestParam String storeHouse, @RequestParam String position, @PathVariable Long page)
    {
        return this.importerItemService.searchItem(itemName, serialNumber, storeHouse, position, page);
    }

    @GetMapping("/get/by/{orderNumber}")
    public List<ItemInProcess> getItemsByOrderNumber(@PathVariable String orderNumber)
    {
        return this.importerItemService.getItemsByOrderNumber(orderNumber);
    }

    @PutMapping("/import/{orderNumber}")
    public String importItems(@PathVariable String orderNumber, @RequestBody ItemInProcess[] items, @PathVariable String lang)
    {
        return this.importerItemService.importItems(orderNumber, items, lang);
    }

    @PutMapping("/update")
    public String updateImportItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.importerItemService.updateImportItem(item, lang);
    }

}
