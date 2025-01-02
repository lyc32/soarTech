package com.codenext.backend.service.exporter.exporterItemService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// ExporterItemController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/exporter/{lang}/item/list/{page}"
// public List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, Long page)
//       search for un-archive item by:
//             itemName     : required, use '-' stand for empty.
//             serialNumber : required, use '-' stand for empty.
//             storeHouse   : required, use 'all' stand for all.
//             position     : required, use '-' stand for empty.
//
// api = "/exporter/{lang}/get/by/{serialNumber}"
// public ItemInProcess getItemBySerialNumber(String serialNumber)
//       use to get "export" item by serial number
//
// PUT
// api = "/exporter/{lang}/item/export"
// public String exportItem(ItemInProcess item, String lang)
//       use to export item.
//       item muse be in "imported" status
//
// api = "/exporter/{lang}/item/update"
// public String updateImportItem(ItemInProcess item, String lang)
//       update item info in item_in_process table.

@RestController
@RequestMapping("/exporter/{lang}/item")
public class ExporterItemController
{
    @Autowired
    private ExporterItemService exporterItemService;

    @GetMapping("/list/{page}")
    public List<ItemInProcess> searchItem(@RequestParam String itemName, @RequestParam String serialNumber, @RequestParam String storeHouse, @RequestParam String position, @PathVariable Long page)
    {
        return this.exporterItemService.searchItem(itemName, serialNumber, storeHouse, position, page);
    }

    @GetMapping("/get/by/{serialNumber}")
    public ItemInProcess getItemsBySerialNumber(@PathVariable String serialNumber)
    {
        return this.exporterItemService.getItemBySerialNumber(serialNumber);
    }

    @PutMapping("/export")
    public String importItems(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.exporterItemService.exportItem(item, lang);
    }

    @PutMapping("/update")
    public String updateImportItem(@RequestBody ItemInProcess item, @PathVariable String lang)
    {
        return this.exporterItemService.updateImportItem(item, lang);
    }
}
