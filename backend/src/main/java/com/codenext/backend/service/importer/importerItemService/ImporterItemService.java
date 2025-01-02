package com.codenext.backend.service.importer.importerItemService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.*;
import com.codenext.backend.entity.Account;
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
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// ImporterItemService
//
// lang is the language type of the return value.
//
// GET
// public List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, Long page)
//       search for un-archive item by:
//             itemName     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'itemName' in the itemName field.
//             serialNumber : required, use '-' stand for empty.
//                            item's serialNumber.
//                            If the item status is "exported", you can use serial number to search the item.
//                            serialNumber is unique.
//             storeHouse   : required, use 'all' stand for all.
//                            item's storehouse.
//                            If the product status is "imported" or "exported", you can use the warehouse name to search for all products imported from there.
//             position     : required, use '-' stand for empty.
//                            Search using the LIKE keyword.
//                            Search for all records containing the token 'position' in the position field.
//             page         : page number of search results
//                            there are 8 records per page.
//
// public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
//       use to get all "initialize" status items in this order.
//       the order must be in "processing" status.
//
// PUT
// public String importItems(String orderNumber, ItemInProcess[] items, String lang)
//       use to import items in this order.
//       all items must be in "initialize" status.
//       these fields are required: id, itemName, orderNumber, serialNumber, storeHouse.
//       those fields are optional: price and position
//       those fields will not be used: importerId, importerName, importTime, exporterId, exporterName, exportTime, carrier, trackNumber, and state.
//
// public String updateImportItem(ItemInProcess item, String lang)
//       use to update the item info.
//       item must be in "imported" status.
//       these fields are required: id, itemName, orderNumber, serialNumber, storeHouse.
//       those fields are optional: price and position
//       those fields will not be used: importerId, importerName, importTime, exporterId, exporterName, exportTime, carrier, trackNumber, and state.
//       these fields can be edited: serialNumber, storeHouse, position, and price.
//       these fields can not be edited: id, itemName, orderNumber, importerId, importerName, importTime, exporterId, exporterName, exportTime, carrier, trackNumber, and state.

@Service
public class ImporterItemService
{
    // Item Repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // Order Repository
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;

    // Search Item()
    public List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, Long page)
    {
        return this.itemInProcessRepository.searchItem(itemName, serialNumber, storeHouse, position, ItemState.IMPORTED, (page-1)*8);
    }

    // Get Items By Order Number()

    public List<ItemInProcess> getItemsByOrderNumber(String orderNumber)
    {
        /*
        // check if order exists or not
        Optional<OrderInProcess> optionalOrder = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
        if(optionalOrder.isEmpty())
        {
            return null;
        }*/

        // return all "initialize" status items.
        return this.itemInProcessRepository.findAllByOrderNumberAndState(orderNumber, ItemState.INITIALIZE);
    }

    // Import Items()
    @Transactional
    public String importItems(String orderNumber, ItemInProcess[] items, String lang)
    {
        if(items.length == 0)
        {
            return I18nUtil.getMessage("ERROR_ITEM_LIST_EMPTY", lang);
        }

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        // get account info
        Account account = ((Account) authentication.getPrincipal());

        // check if order exists or not
        Optional<OrderInProcess> optionalOrder = this.orderInProcessRepository.findOrderInProcessByOrderNumber(orderNumber);
        if(optionalOrder.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ORDER_NOT_EXIST", lang);
        }

        // get system time
        String time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

        // temporary save item list check result
        String check = null;

        // check item information is correct or not
        // all items must come from the same order
        // itemName and orderNumber must be consistent with the database
        // item status must be "initialize"
        // serialNumber is unique in the table
        // orderNumber, serialNumber, itemName, and storeHouse cannot be empty.
        for (ItemInProcess item : items)
        {
            // check if the item's order number is the same as the order's order number.
            if (!orderNumber.equals(item.getOrderNumber()))
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_NOT_IN_ORDER", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // check if item exists or not
            Optional<ItemInProcess> optionalItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
            if(optionalItem.isEmpty())
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_NOT_EXIST", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // check if item status is "initialize" or not
            if(!optionalItem.get().getState().equals(ItemState.INITIALIZE))
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_IMPORTED", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // Check whether the itemName and orderNumber are consistent with the database record
            if( !optionalItem.get().getItemName().equals(item.getItemName()) || !optionalItem.get().getOrderNumber().equals(item.getOrderNumber()))
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_NOT_MATCH", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // set importer info
            item.setImporterId(account.getId());
            item.setImporterName(account.getAccountName());
            item.setImportTime(time);
            item.setState(ItemState.IMPORTED);

            // set export part to null
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);

            // check if the store house is empty or not
            if(item.getStoreHouse() == null || item.getStoreHouse().equals(""))
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_REPO_EMPTY", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // check if the serial number is empty or not
            if(item.getSerialNumber() == null || item.getSerialNumber().equals(""))
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_SERIAL_EMPTY", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }

            // check if the serial number is unique in the table
            if (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent())
            {
                check = I18nUtil.getMessage("ERROR_ITEMS_SERIAL_EXIST", lang).replace("{item}", "[" + item.getItemName() + "]");
                break;
            }
        }

        // if check != null, return the check result
        if(check != null)
        {
            return check;
        }

        // set order status to "finished"
        optionalOrder.get().setState(OrderState.FINISHED);
        // update order records in order_in_process table
        this.orderInProcessRepository.save(optionalOrder.get());

        // update item records in item_in_process table
        this.itemInProcessRepository.saveAll(Arrays.stream(items).toList());
        return I18nUtil.getMessage("IMPORT_ITEMS_SUCCESS", lang).replace("{number}", String.valueOf(items.length));
    }

    // Update Import_Item()
    public String updateImportItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check item status is 'imported' or not.
        if(!ItemState.IMPORTED.equals(item.getState()))
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_IMPORTED", lang);
        }

        // check input item is correct or not
        // item must have: itemName, orderNumber, serialNumber, and storeHouse
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check item exists ot not.
        Optional<ItemInProcess> oItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
        if(oItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check item status is 'imported' or not.
        if(!oItem.get().getState().equals(ItemState.IMPORTED))
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_IMPORTED", lang);
        }

        // for import operations, item name and order number should not be changed
        if( !oItem.get().getItemName().equals(item.getItemName()) || !oItem.get().getOrderNumber().equals(item.getOrderNumber()) )
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_MATCH", lang);
        }

        // set export part to null
        item.setExporterId(null);
        item.setExporterName(null);
        item.setExportTime(null);
        item.setCarrier(null);
        item.setTrackNumber(null);

        // reset importer info
        item.setImporterId(oItem.get().getImporterId());
        item.setImporterName(oItem.get().getImporterName());
        item.setImportTime(oItem.get().getImportTime());
        item.setState(ItemState.IMPORTED);

        // if the order and serial number are the same, it means that the product was created by the admin.
        // the order number of this type of product is the same as the serial number.
        if(oItem.get().getSerialNumber().equals(oItem.get().getOrderNumber()))
        {
            item.setOrderNumber(item.getSerialNumber());
        }

        // check if the serial number has changed or not.
        // check if the serial number is unique in the table
        if( !item.getSerialNumber().equals(oItem.get().getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }

        // update item record in item_in_process table
        itemInProcessRepository.save(item);
        return I18nUtil.getMessage("UPDATE_ITEM_SUCCESS", lang);
    }
}
