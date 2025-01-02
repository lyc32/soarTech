package com.codenext.backend.service.admin.adminReportService;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

// AdminReportController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/admin/{lang}/report/client/items/{startTime}/to/{endTime}/{page}"
// public List<ItemInProcess> getClientReport(String clientName, String storeHouse, String startTime, String endTime, Long page)
//       According to the accountName, storehouse.name, startTime, and endTime
//       find the list of items in that time range and in that storehouse.
//             accountName : required
//             storehouse  : required, use 'all' stand for all.
//             startTime   : required
//             endTime     : required
//             page        : required
//
// api = "/admin/{lang}/report/client/items/{startTime}/to/{endTime}/toJson"
// public List<ItemInProcess> getClientReportJson(String clientName, String storeHouse, String startTime, String endTime)
//       According to the accountName, storehouse.name, startTime, and endTime
//       find the list of items in that time range and in that storehouse.
//             accountName     : required
//             storehouse.name : required, use 'all' stand for all.
//             startTime       : required
//             endTime         : required

@RestController
@RequestMapping("/admin/{lang}/report")
public class AdminReportController
{
    @Autowired
    private AdminReportService adminReportService;

    @GetMapping("/client/items/{startTime}/to/{endTime}/{page}")
    public List<ItemInProcess> getClientReport(@RequestParam String clientName, @RequestParam String storeHouse, @PathVariable String startTime, @PathVariable String endTime, @PathVariable Long page)
    {
        return this.adminReportService.getClientReport(clientName, storeHouse, startTime, endTime, page);
    }

    @GetMapping("/client/items/{startTime}/to/{endTime}/toJson")
    public List<ItemInProcess> getClientReportJson(@RequestParam String clientName, @RequestParam String storeHouse, @PathVariable String startTime, @PathVariable String endTime)
    {
        return this.adminReportService.getClientReportJson(clientName, storeHouse, startTime, endTime);
    }
}
