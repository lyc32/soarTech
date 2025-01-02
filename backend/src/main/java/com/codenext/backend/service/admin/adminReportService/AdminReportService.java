package com.codenext.backend.service.admin.adminReportService;

import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.repository.ItemInProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// AdminReportService
//
// GET
// public List<ItemInProcess> getClientReport(String clientName, String storeHouse, String startTime, String endTime, Long page)
//       According to the accountName, storehouse.name, startTime, and endTime
//       find the list of items in that time range and in that storehouse.
//             accountName : required
//                           accountName is the clientName in the order_in_process table
//             storehouse  : required, use 'all' stand for all.
//                           Search by storehouse in item_in_process table
//                           input full storehouse name or use 'all'
//             startTime   : required
//                           Search by importTime in item_in_process table
//                           this is the minimum createTime
//             endTime     : required
//                           Search by importTime in item_in_process table
//                           this is the maximum createTime
//             page        : page number of search results
//                           there are 8 records per page.
//       This method joins the item_in_process table and the order_in_process table.
//
// public List<ItemInProcess> getClientReportJson(String clientName, String storeHouse, String startTime, String endTime)
//       According to the accountName, storehouse.name, startTime, and endTime
//       find the list of items in that time range and in that storehouse.
//             accountName     : required
//             storehouse.name : required, use 'all' stand for all.
//             startTime       : required
//             endTime         : required
//       This method joins the item_in_process table and the order_in_process table.
//       This method will return all records at one time.

@Service
public class AdminReportService
{
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;

    // Get Client Report()
    public List<ItemInProcess> getClientReport(String clientName, String storeHouse, String startTime, String endTime, Long page)
    {
        return this.itemInProcessRepository.getClientReport(clientName, storeHouse, startTime, endTime,(page-1)*8 , 8);
    }

    // Get Client Report JSON()
    public List<ItemInProcess> getClientReportJson(String clientName, String storeHouse, String startTime, String endTime)
    {
        return this.itemInProcessRepository.getClientReportJson(clientName, storeHouse, startTime, endTime);
    }
}
