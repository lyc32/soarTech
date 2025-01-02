package com.codenext.backend.service.exporter.exporterItemService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.ItemState;
import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// ExporterItemService
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
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
// public ItemInProcess getItemBySerialNumber(String serialNumber)
//       use to get "export" item by serial number
//       if the serial number exists then return item
//       if the serial number does not exist then return null
//
// PUT
// public String exportItem(ItemInProcess item, String lang)
//       use to export item.
//       item muse be in "imported" status
//       these fields are required: id, itemName, orderNumber, serialNumber, storeHouse.
//       those fields are optional: price, position, carrier, and trackNumber
//       those fields will not be used: importerId, importerName, importTime, exporterId, exporterName, and exportTime.
//       these fields can be edited: storeHouse, price, position, carrier, and trackNumber
//       these fields can not be edited: id, itemName, orderNumber, serialNumber, importerId, importerName, importTime, exporterId, exporterName, and exportTime.
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
public class ExporterItemService
{
    // Item Repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // Search Item()
    public List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, Long page)
    {
        return this.itemInProcessRepository.searchItem(itemName, serialNumber, storeHouse, position, ItemState.IMPORTED, (page-1)*8);
    }

    // Get Item By Serial Number()
    public ItemInProcess getItemBySerialNumber(String serialNumber)
    {
        // if the serial number exists then return item
        // if the serial number does not exist then return null
        Optional<ItemInProcess> item = this.itemInProcessRepository.findItemInProcessBySerialNumberAndState(serialNumber, ItemState.IMPORTED);
        // return item
        return item.orElse(null);
    }

    // Export Item()
    public String exportItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check authentication info
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null)
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }
        // get account info
        Account account = ((Account) authentication.getPrincipal());

        // check if item exists or not
        Optional<ItemInProcess> oItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
        if(oItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check item status is 'imported' or not.
        if(!ItemState.IMPORTED.equals(oItem.get().getState()))
        {
            return I18nUtil.getMessage("ERROR_EXPORT_UN_IMPORTED_ITEM", lang);
        }

        // for export operations, item name, serial number, and order number should not be changed
        if( !oItem.get().getItemName().equals(item.getItemName()) || !oItem.get().getOrderNumber().equals(item.getOrderNumber()) || !oItem.get().getSerialNumber().equals(item.getSerialNumber()))
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_MATCH", lang);
        }

        // check if storehouse is empty or not
        if(item.getStoreHouse() == null || item.getStoreHouse().equals(""))
        {
            return I18nUtil.getMessage("ERROR_STORE_HOUSE_EMPTY", lang);
        }

        // set exporter info
        item.setExporterId(account.getId());
        item.setExporterName(account.getAccountName());
        item.setExportTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));

        // reset importer info
        item.setImporterId(oItem.get().getImporterId());
        item.setImporterName(oItem.get().getImporterName());
        item.setImportTime(oItem.get().getImportTime());

        // set status as exported
        item.setState(ItemState.EXPORTED);

        // update item record in item_in_process table
        this.itemInProcessRepository.save(item);
        return I18nUtil.getMessage("EXPORT_ITEM_SUCCESS", lang);
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
