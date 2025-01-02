package com.codenext.backend.service.admin.adminItemService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.*;
import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.ItemInHistory;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import com.codenext.backend.repository.OrderInProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// AdminItemService
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// public List<ItemInProcess> searchProcessItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, String state)
//       search for un-archive item by:
//             itemName     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'itemName' in the itemName field.
//             orderNumber  : required, use '-' stand for empty.
//                            item's orderNumber. which order contains this item.
//             serialNumber : required, use '-' stand for empty.
//                            item's serialNumber.
//                            If the item status is "exported", you can use serial number to search the item.
//                            serialNumber is unique.
//             importerName : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'importerName' in the importerName field.
//                            If the item status is "imported" or "exported", you can use importer's name to search all the items that imported by this worker.
//             exporterName : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'exporterName' in the exporterName field.
//                            If the item status is "exported", you can use exporter's name to search all the items that exported by this worker.
//             storeHouse   : required, use 'all' stand for all.
//                            item's storehouse.
//                            If the product status is "imported" or "exported", you can use the warehouse name to search for all products imported from there.
//             position     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'position' in the position field.
//             carrier      : required, use '-' stand for empty.
//                            item's carrier.
//                            If the item status is "exported", you can use carrier to search for items that use the same carrier.
//                            such as UPS, Fedex, DHL... etc.
//             trackNumber  : required, use '-' stand for empty.
//                            item's track number.
//                            If the item status is "exported", you can use track number to search for items in the same shipping package.
//             state        : required, use 'all' stand for all.
//                            initialize, imported, exported, and all.
//             page         : page number of search results
//                            there are 8 records per page.
//
// public List<ItemInProcess> searchHistoryItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber)
//       all items in item_in_history's status should be "exported" and general they were exported over month ago.
//       search for archive item by:
//             itemName     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'itemName' in the itemName field.
//             orderNumber  : required, use '-' stand for empty.
//                            item's orderNumber. which order contains this item.
//             serialNumber : required, use '-' stand for empty.
//                            item's serialNumber.
//                            If the item status is "exported", you can use serial number to search the item.
//                            serialNumber is unique.
//             importerName : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'importerName' in the importerName field.
//                            If the item status is "imported" or "exported", you can use importer's name to search all the items that imported by this worker.
//             exporterName : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'exporterName' in the exporterName field.
//                            If the item status is "exported", you can use exporter's name to search all the items that exported by this worker.
//             storeHouse   : required, use 'all' stand for all.
//                            item's storehouse.
//                            If the product status is "imported" or "exported", you can use the warehouse name to search for all products imported from there.
//             position     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'position' in the position field.
//             carrier      : required, use '-' stand for empty.
//                            item's carrier.
//                            If the item status is "exported", you can use carrier to search for items that use the same carrier.
//                            such as UPS, Fedex, DHL... etc.
//             trackNumber  : required, use '-' stand for empty.
//                            item's track number.
//                            If the item status is "exported", you can use track number to search for items in the same shipping package.
//             page         : page number of search results
//                            there are 8 records per page.
//
// public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
//        return item list for unarchived order
//
// public List<ItemInProcess> getAllItemsByOrderNumber(String orderNumber)
//        return item list for archived order
//
// POST
// public String createItem(ItemInProcess item, String lang)
//       use to create an un-archive item record.
//       item will be created in imported status and the importer will be the admin account.
//       item must have: itemName, serialNumber, and storeHouse
//
// PUT
// public String updateItem(ItemInProcess item, String lang)
//       use to update an un-archive item record.
//       admin can not update id, orderNumber, importer info, and exporter info.
//       if item in initialize status, item must have: id, itemName, orderNumber, and storeHouse
//       if item in imported or exported status, item must have: id, itemName, orderNumber, serialNumber, and storeHouse
//
// DELETE
// public String deleteItemInProcess(Long id, String lang)
//       if the order status is not finished, and there is only one item in this order
//       then change order status to 'error'.
//       and then delete this item in item_in_process table
//       those fields are required： id

@Service
public class AdminItemService
{
    // Item Repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // Order Repository
    // when the item status changes, the order status will also be changed
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;

    // Search Process Item()
    public List<ItemInProcess> searchProcessItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, String state)
    {
        return this.itemInProcessRepository.search(itemName, orderNumber, serialNumber, importerName, exporterName, (page-1)*8, storeHouse, position, carrier, trackNumber, state, 8);
    }

    // Search History Item()
    public List<ItemInProcess> searchHistoryItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber)
    {
        List<ItemInProcess> itemInProcessList = new ArrayList<>();
        // get search result and then convert List<ItemInHistory> to List<ItemInProcess>.
        this.itemInHistoryRepository.search(itemName, orderNumber, serialNumber, importerName, exporterName, (page-1)*8, storeHouse, position, carrier, trackNumber, 8)
                .forEach(e -> {ItemInProcess item = e.toItemInProcessing(); item.setId(e.getId()); itemInProcessList.add(item); });
        return itemInProcessList;
    }

    // Get Items By OrderNumber()
    public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
    {
        return this.itemInProcessRepository.findAllByOrderNumber(orderNumber);
    }

    // Get All Items By OrderNumber()
    public List<ItemInProcess> getAllItemsByOrderNumber(String orderNumber)
    {
        // get un-archived item list
        List<ItemInProcess> items = this.itemInProcessRepository.findAllByOrderNumber(orderNumber);
        // get archived items and then add them to the unarchived item list
        this.itemInHistoryRepository.findAllByOrderNumber(orderNumber).forEach(e -> items.add(e.toItemInProcessing()));
        return items;
    }

    // Create Item()
    @Transactional
    public String createItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check input item is correct or not
        // item must have: itemName, orderNumber, serialNumber, and storeHouse
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the serial number is unique in the table
        if(!ItemState.INITIALIZE.equals(item.getState()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        // get account info
        Account account = ((Account) authentication.getPrincipal());

        // When the item status is initialized
        if(item.getState().equals(ItemState.INITIALIZE))
        {
            item.setSerialNumber(null);
            item.setImporterId(null);
            item.setImporterName(null);
            item.setImportTime(null);
            item.setPosition(null);
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }

        // when the item status is imported
        if(item.getState().equals(ItemState.IMPORTED))
        {
            // set admin as importer
            item.setImporterId(account.getId());
            item.setImporterName(account.getAccountName());
            item.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }

        // when the item status is exported
        if(item.getState().equals(ItemState.EXPORTED))
        {
            // set admin as importer and exporter
            item.setImporterId(account.getId());
            item.setImporterName(account.getAccountName());
            item.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            item.setExporterId(account.getId());
            item.setExporterName(account.getAccountName());
            item.setExportTime(item.getImportTime());
        }

        // When the order number and serial number are the same,
        // it means that the item was created directly by the admin.
        String orderNumber = item.getOrderNumber();
        if(!orderNumber.equals(item.getSerialNumber()))
        {
            // check if the order exists or not
            Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
            if(order.isPresent() && !order.get().getState().equals(OrderState.FINISHED))
            {
                // if you add an initialization item
                if( item.getState().equals(ItemState.INITIALIZE))
                {
                    List<ItemInProcess> itemInProcessList = this.itemInProcessRepository.findAllByOrderNumber(item.getOrderNumber());
                    List<ItemInHistory> itemInHistoryList = this.itemInHistoryRepository.findAllByOrderNumber(item.getOrderNumber());

                    // change the order status to finished when there is at least one record in item_in_history.
                    if(itemInHistoryList.size() > 0)
                    {
                        // normally, this situation will not occur.
                        // when there is an item in the order that exists in the item_in_history table,
                        // it means that the item has been exported and the order status should be finished.
                        order.get().setState(OrderState.FINISHED);
                        this.orderInProcessRepository.save(order.get());
                    }
                    // if there is no record in the item_in_history table
                    else
                    {
                        // get the list of products whose status is not initialized
                        itemInProcessList = itemInProcessList.stream().filter(e -> !e.getState().equals(ItemState.INITIALIZE)).toList();

                        // there are some items in imported or exported status in this order
                        if(itemInProcessList.size() > 0)
                        {
                            // normally, this situation will not occur.
                            // when there is an item in imported or exported status,
                            // the order status should be finished.
                            order.get().setState(OrderState.FINISHED);
                            this.orderInProcessRepository.save(order.get());
                        }
                        // there are no items in imported or exported status in this order
                        else
                        {
                            // all items in this order are in the initialization state
                            order.get().setState(OrderState.PROCESSING);
                            this.orderInProcessRepository.save(order.get());
                        }
                    }
                }

                // If you add an imported or exported item to an order that is in an unfinished state,
                // the order status will change to finished.
                if( !item.getState().equals(ItemState.INITIALIZE))
                {
                    // if the order exists, then set the order status to "finished"
                    order.get().setState(OrderState.FINISHED);
                    // update order record in order_in_process table
                    this.orderInProcessRepository.save(order.get());
                }
            }
        }

        // save un-archive item record in item_in_process table.
        this.itemInProcessRepository.save(item);
        return I18nUtil.getMessage("CREATE_ITEM_SUCCESS", lang);
    }

    // Update Item()
    @Transactional
    public String updateItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check input item is correct or not
        // item must have: itemName, orderNumber, serialNumber, and storeHouse
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if item exists or not
        Optional<ItemInProcess> oItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
        if(oItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check order number match item id
        if(!oItem.get().getOrderNumber().equals(item.getOrderNumber()))
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_MATCH", lang);
        }

        // check if the serial number is unique in the table
        if(!ItemState.INITIALIZE.equals(item.getState()) && !item.getSerialNumber().equals(oItem.get().getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        // get account info
        Account account = ((Account) authentication.getPrincipal());

        // When the item status is initialized
        // id, itemName, and storeHouse
        if(item.getState().equals(ItemState.INITIALIZE))
        {
            item.setSerialNumber(null);
            item.setImporterId(null);
            item.setImporterName(null);
            item.setImportTime(null);
            item.setPosition(null);
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }

        // when the item status is imported
        if(item.getState().equals(ItemState.IMPORTED))
        {
            // if the item has importer info
            // use current importer info
            if(oItem.get().getImporterId() == null )
            {
                item.setImporterId(account.getId());
                item.setImporterName(account.getAccountName());
                item.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            // if the item does not have importer info
            // set admin as importer
            else
            {
                item.setImporterId(oItem.get().getImporterId());
                item.setImporterName(oItem.get().getImporterName());
                item.setImportTime(oItem.get().getImportTime());
            }

            // set exporter fields to null
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }

        // when the item status is exported
        if(item.getState().equals(ItemState.EXPORTED))
        {
            // if the item has importer info
            // use current importer info
            if(oItem.get().getImporterId() == null )
            {
                item.setImporterId(account.getId());
                item.setImporterName(account.getAccountName());
                item.setImportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            }
            // if the item does not have importer info
            // set admin as importer
            else
            {
                item.setImporterId(oItem.get().getImporterId());
                item.setImporterName(oItem.get().getImporterName());
                item.setImportTime(oItem.get().getImportTime());
            }

            // if the item has exporter info
            // use current exporter info
            if(oItem.get().getExporterId() == null )
            {
                item.setExporterId(account.getId());
                item.setExporterName(account.getAccountName());
                item.setExportTime(item.getImportTime());
            }
            // if the item does not have exporter info
            // set admin as exporter
            else
            {
                item.setExporterId(oItem.get().getExporterId());
                item.setExporterName(oItem.get().getExporterName());
                item.setExportTime(oItem.get().getExportTime());
            }
        }

        // When the order number and serial number are the same,
        // it means that the item was created directly by the admin.
        // keep the order number and serial number the same
        String orderNumber = oItem.get().getOrderNumber();
        if( orderNumber.equals(oItem.get().getSerialNumber()) )
        {
            item.setOrderNumber(item.getSerialNumber());
        }
        else
        {
            // check if the order exists or not
            Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
            if(order.isPresent() && !order.get().getState().equals(OrderState.FINISHED))
            {
                // if you change the init status to initialization
                if(item.getState().equals(ItemState.INITIALIZE))
                {
                    List<ItemInProcess> itemInProcessList = this.itemInProcessRepository.findAllByOrderNumber(item.getOrderNumber());
                    List<ItemInHistory> itemInHistoryList = this.itemInHistoryRepository.findAllByOrderNumber(item.getOrderNumber());

                    // change the order status to finished when there is at least one record in item_in_history.
                    if(itemInHistoryList.size() > 0)
                    {
                        // normally, this situation will not occur.
                        // when there is an item in the order that exists in the item_in_history table,
                        // it means that the item has been exported and the order status should be finished.
                        order.get().setState(OrderState.FINISHED);
                        this.orderInProcessRepository.save(order.get());
                    }
                    // if there is no record in the item_in_history table
                    else
                    {
                        // get the list of products whose status is not initialized
                        itemInProcessList = itemInProcessList.stream().filter(e -> !e.getState().equals(ItemState.INITIALIZE)).toList();

                        // there are some items in imported or exported status in this order
                        if(itemInProcessList.size() > 0)
                        {
                            // normally, this situation will not occur.
                            // when there is an item in imported or exported status,
                            // the order status should be finished.
                            order.get().setState(OrderState.FINISHED);
                            this.orderInProcessRepository.save(order.get());
                        }
                        // there are no items in imported or exported status in this order
                        else
                        {
                            // all items in this order are in the initialization state
                            order.get().setState(OrderState.PROCESSING);
                            this.orderInProcessRepository.save(order.get());
                        }
                    }
                }

                // if you change the item status to imported or exported
                // the order status will change to finished.
                if( !item.getState().equals(ItemState.INITIALIZE))
                {
                    // if the order exists, then set the order status to "finished"
                    order.get().setState(OrderState.FINISHED);
                    // update order record in order_in_process table
                    this.orderInProcessRepository.save(order.get());
                }
            }
        }

        // update un-archive item record in item_in_process table.
        itemInProcessRepository.save(item);
        return I18nUtil.getMessage("UPDATE_ITEM_SUCCESS", lang);
    }

    // Delete Item()
    @Transactional
    public String deleteItem(Long id, String lang)
    {
        // check if item exists or not
        Optional<ItemInProcess> item = this.itemInProcessRepository.findItemInProcessById(id);
        if(item.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check if order exists or not
        // check if the order status is finished or not
        // if the order status is finished, no modification is required.
        Optional<OrderInProcess> order = this.orderInProcessRepository.findOrderInProcessByOrderNumber(item.get().getOrderNumber());
        if(order.isPresent() && !order.get().getState().equals(OrderState.FINISHED))
        {
            // if the order status is incomplete, then:

            // get how many items belong to this order.
            List<ItemInProcess> itemInProcessList = this.itemInProcessRepository.findAllByOrderNumber(item.get().getOrderNumber());
            List<ItemInHistory> itemInHistoryList = this.itemInHistoryRepository.findAllByOrderNumber(item.get().getOrderNumber());

            // change the order status to finished when there is at least one record in item_in_history.
            if(itemInHistoryList.size() > 0)
            {
                // normally, this situation will not occur.
                // when there is an item in the order that exists in the item_in_history table,
                // it means that the item has been exported and the order status should be finished.
                order.get().setState(OrderState.FINISHED);
                this.orderInProcessRepository.save(order.get());
            }
            // if there is no record in the item_in_history table
            else
            {
                // get the list after removing the items to be deleted
                itemInProcessList = itemInProcessList.stream().filter(e -> !e.getId().equals(id)).toList();
                // there are items in the list besides those you want to delete.
                if(itemInProcessList.size() > 0)
                {
                    // get the list of products whose status is not initialized
                    itemInProcessList = itemInProcessList.stream().filter(e -> !e.getState().equals(ItemState.INITIALIZE)).toList();

                    // there are other items in imported or exported status in this order
                    if(itemInProcessList.size() > 0)
                    {
                        // normally, this situation will not occur.
                        // when there is an item in imported or exported status,
                        // the order status should be finished.
                        order.get().setState(OrderState.FINISHED);
                        this.orderInProcessRepository.save(order.get());
                    }
                    // there are no items in imported or exported status in this order
                    else
                    {
                        // all items in this order are in the initialization state
                        order.get().setState(OrderState.PROCESSING);
                        this.orderInProcessRepository.save(order.get());
                    }
                }
                // there are no other items in the list besides the one you want to delete.
                else
                {
                    // if the order exists, then set the order status to "Processing"
                    order.get().setState(OrderState.ERROR);
                    // update order record in order_in_process table
                    this.orderInProcessRepository.save(order.get());
                }
            }
        }

        // delete un-archive item in item_in_process table.
        this.itemInProcessRepository.delete(item.get());
        return I18nUtil.getMessage("DELETE_ITEM_SUCCESS", lang);
    }
}
