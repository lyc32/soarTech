package com.codenext.backend.service.root.rootItemService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.*;
import com.codenext.backend.entity.Account;
import com.codenext.backend.entity.ItemInHistory;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.repository.AccountRepository;
import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.*;

// RootItemController
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
//                            there are 15 records per page.
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
//                            there are 15 records per page.
//
// POST
// public String createItemInProcess(ItemInProcess item)
//       use to create an un-archive item record.
//       if item in initialize status, item must have: itemName, oderNumber, and storeHouse
//          and other fields must empty.
//       if item in imported status,
//          item must have: itemName, serialNumber, importerName, and storeHouse
//          those fields must empty: exporterName, carrier, trackNumber
//          those fields are optional: position and orderNumber
//       if item in exported status,
//          item must have: itemName, serialNumber,importerName, and exporterName
//          those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//
// public String createItemInHistory(ItemInProcess item)
//       use to create an archive item record.
//       item status must be exported.
//       item must have: itemName, serialNumber, importerName, and exporterName
//       those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//
// PUT
// public String updateItemInProcess(ItemInProcess item)
//       user to update un-archive item record.
//       if item in initialize status, item must have: id, itemName, oderNumber, and storeHouse
//          and other fields must empty.
//       if item in imported status,
//          item must have: id, itemName, serialNumber, importerName, importerTime, and storeHouse
//          those fields must empty: exporterName, exporterTime, carrier, and trackNumber
//          those fields are optional: position and orderNumber
//       if item in exported status,
//          item must have: id, itemName, serialNumber, importerName, importerTime, exporterName, and exporterTime
//          those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//
// public String updateItemInHistory(ItemInProcess item)
//       user to update archive item record.
//       item status must be exported.
//       item must have: id, itemName, serialNumber, importerName, importerTime, exporterName, and exporterTime
//       those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//
// public String archiveItem(ItemInProcess item)
//       used to update and enforce archive item.
//       item status must be exported.
//       item must have: id, itemName, serialNumber, importerName, importerTime, exporterName, and exporterTime
//       those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//       this method will update item and them move item from item_in_process to item_in_history table.
//
// public String unarchiveItem(ItemInProcess item)
//       used to update and enforce un-archive item.
//       if item in initialize status, item must have: id, itemName, oderNumber, and storeHouse
//          and other fields must empty.
//       if item in imported status,
//          item must have: id, itemName, serialNumber, importerName, importerTime, and storeHouse
//          those fields must empty: exporterName, exporterTime, carrier, and trackNumber
//          those fields are optional: position and orderNumber
//       if item in exported status,
//          item must have: id, itemName, serialNumber, importerName, importerTime, exporterName, and exporterTime
//          those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
//       this method will update item and them move item from item_in_history to item_in_process table.
//
// DELETE
// public String deleteItemInProcess(Long id)
//       use to delete un-archive item record in item_in_process table.
//       this method will only delete the item and will not change the order status.
//       those fields are required： id
//
// public String deleteItemInHistory(Long id)
//       use to delete archive item record in item_in_history table.
//       this method will only delete the item and will not change the order status.
//       those fields are required： id

@Service
public class RootItemService
{
    // item repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // account repository
    // when change or add importer name or exporter name.
    // use account repository to search account info.
    @Autowired
    private AccountRepository accountRepository;

    // Search Process Item()
    public List<ItemInProcess> searchProcessItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, String state)
    {
        return this.itemInProcessRepository.search(itemName, orderNumber, serialNumber, importerName, exporterName, (page-1)*15, storeHouse, position, carrier, trackNumber, state, 15);
    }

    // Search History Item()
    public List<ItemInProcess> searchHistoryItem(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber)
    {
        List<ItemInProcess> itemInProcessList = new ArrayList<>();
        // get search result and then convert List<ItemInHistory> to List<ItemInProcess>.
        this.itemInHistoryRepository.search(itemName, orderNumber, serialNumber, importerName, exporterName, (page-1)*15, storeHouse, position, carrier, trackNumber, 15)
                .forEach(e -> {ItemInProcess item = e.toItemInProcessing(); item.setId(e.getId()); itemInProcessList.add(item); });
        return itemInProcessList;
    }

    // Create Item_In_Process()
    public String createItemInProcess(ItemInProcess item, String lang)
    {
        // format item fields:
        // remove front and end space;
        item.format();

        // check input item is correct or not
        // item must have: itemName, orderNumber, serialNumber, and storeHouse
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        if(ItemState.INITIALIZE.equals(item.getState()))
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
        else if(ItemState.IMPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent())
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }

            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }

            // check if the importer exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
            }
            // get system time
            String time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
            // set importerId and importTime
            item.setImportTime(time);
            item.setImporterId(optionalAccount.get().getId());
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }
        else if(ItemState.EXPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent())
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }
            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }
            // check if the importer exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
            }
            // get system time
            String time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
            // set importerId and importTime
            item.setImportTime(time);
            item.setImporterId(optionalAccount.get().getId());

            // check if exporter is empty or not
            if(item.getExporterName() == null || item.getExporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
            }
            // check if the importer exists or not
            optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
            }
            // set exporterId and exportTime
            item.setExportTime(time);
            item.setExporterId(optionalAccount.get().getId());
        }
        else
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // save un-archive item record
        this.itemInProcessRepository.save(item);
        return I18nUtil.getMessage("CREATE_ITEM_SUCCESS", lang);
    }

    // Create Item_In_History()
    public String createItemInHistory(ItemInProcess item, String lang)
    {
        // format item fields:
        // remove front and end space;
        item.format();

        // check item status is exported or not.
        if(!ItemState.EXPORTED.equals(item.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNEXPORTED_ITEM", lang);
        }

        // item status must be exported.
        // item must have: itemName, serialNumber, importerName, and exporterName
        // those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check if the serial number is unique in the table
        if(this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }
        // check if importer is empty or not
        if(item.getImporterName() == null || item.getImporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
        }
        // check if the importer exists or not
        Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
        if(optionalAccount.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
        }
        // get system time
        String time = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        // set importerId and importTime
        item.setImportTime(time);
        item.setImporterId(optionalAccount.get().getId());

        // check if exporter is empty or not
        if(item.getExporterName() == null || item.getExporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
        }
        // check if the importer exists or not
        optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
        if(optionalAccount.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
        }
        // set exporterId and exportTime
        item.setExportTime(time);
        item.setExporterId(optionalAccount.get().getId());

        // save archive item record
        this.itemInHistoryRepository.save(item.toItemInHistory(time));
        return I18nUtil.getMessage("CREATE_ARCHIVED_ITEM_SUCCESS", lang);
    }

    // Update Item_In_Process()
    public String updateItemInProcess(ItemInProcess item, String lang)
    {
        // format item fields:
        // remove front and end space;
        item.format();

        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check item exists or not
        Optional<ItemInProcess> optionalItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
        if(optionalItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        if(ItemState.INITIALIZE.equals(item.getState()))
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
        else if(ItemState.IMPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }

            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }

            // check if import date is empty or not
            if(item.getImportTime() == null || item.getImportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
            }

            if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
            {
                // check if the importer exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setImporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setImporterId(optionalItem.get().getImporterId());
            }
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }
        else if(ItemState.EXPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }

            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }
            // check if import date is empty or not
            if(item.getImportTime() == null || item.getImportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
            }
            if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
            {
                // check if the importer exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setImporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setImporterId(optionalItem.get().getImporterId());
            }

            // check if exporter is empty or not
            if(item.getExporterName() == null || item.getExporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
            }
            // check if import date is empty or not
            if(item.getExportTime() == null || item.getExportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_EXPORT_TIME_EMPTY", lang);
            }

            if(!optionalItem.get().getExporterName().equals(item.getExporterName()))
            {
                // check if the exporter exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setExporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setExporterId(optionalItem.get().getExporterId());
            }
        }
        else
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // update un-archive item record
        this.itemInProcessRepository.save(item);
        return I18nUtil.getMessage("UPDATE_ITEM_SUCCESS", lang);
    }

    // Update Item_In_History()
    public String updateItemInHistory(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check input item status is exported or not
        if(!ItemState.EXPORTED.equals(item.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNEXPORTED_ITEM", lang);
        }

        // check input item is correct or not
        // item must have: id, itemName, serialNumber, importerName, importTime, exporterName, and exportTime
        // those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check item exists or not
        Optional<ItemInHistory> optionalItem = this.itemInHistoryRepository.findItemInHistoryById(item.getId());
        if(optionalItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check if the serial number is unique in the table
        if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }

        // check if importer is empty or not
        if(item.getImporterName() == null || item.getImporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
        }
        // check if import date is empty or not
        if(item.getImportTime() == null || item.getImportTime().equals(""))
        {
            return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
        }
        if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
        {
            // check if the importer exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
            }
            else
            {
                item.setImporterId(optionalAccount.get().getId());
            }
        }
        else
        {
            item.setImporterId(optionalItem.get().getImporterId());
        }

        // check if exporter is empty or not
        if(item.getExporterName() == null || item.getExporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
        }
        // check if import date is empty or not
        if(item.getExportTime() == null || item.getExportTime().equals(""))
        {
            return I18nUtil.getMessage("ERROR_EXPORT_TIME_EMPTY", lang);
        }

        if(!optionalItem.get().getExporterName().equals(item.getExporterName()))
        {
            // check if the exporter exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
            }
            else
            {
                item.setExporterId(optionalAccount.get().getId());
            }
        }
        else
        {
            item.setExporterId(optionalItem.get().getExporterId());
        }

        // update archive item record
        this.itemInHistoryRepository.save(item.toItemInHistory(optionalItem.get().getArchiveTime()));
        return I18nUtil.getMessage("UPDATE_ARCHIVED_ITEM_SUCCESS", lang);
    }

    // Archive Item()
    @Transactional
    public String archiveItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        // check input item status is exported or not
        // only exported status items can be archived.
        if(!ItemState.EXPORTED.equals(item.getState()))
        {
            return I18nUtil.getMessage("ERROR_ARCHIVED_UNEXPORTED_ITEM", lang);
        }

        // check input item is correct or not
        // item must have: id, itemName, serialNumber, importerName, importTime, exporterName, and exportTime
        // those fields are optional: storeHouse, position, carrier, trackNumber, and orderNumber
        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        // check item exists or not
        Optional<ItemInProcess> optionalItem = this.itemInProcessRepository.findItemInProcessById(item.getId());
        if(optionalItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // check if the serial number is unique in the table
        if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
        {
            return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
        }

        // check if importer is empty or not
        if(item.getImporterName() == null || item.getImporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
        }
        // check if import date is empty or not
        if(item.getImportTime() == null || item.getImportTime().equals(""))
        {
            return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
        }
        if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
        {
            // check if the importer exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
            }
            else
            {
                item.setImporterId(optionalAccount.get().getId());
            }
        }
        else
        {
            item.setImporterId(optionalItem.get().getImporterId());
        }

        // check if exporter is empty or not
        if(item.getExporterName() == null || item.getExporterName().equals(""))
        {
            return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
        }
        // check if import date is empty or not
        if(item.getExportTime() == null || item.getExportTime().equals(""))
        {
            return I18nUtil.getMessage("ERROR_EXPORT_TIME_EMPTY", lang);
        }

        if(!optionalItem.get().getExporterName().equals(item.getExporterName()))
        {
            // check if the exporter exists or not
            Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
            if(optionalAccount.isEmpty())
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
            }
            else
            {
                item.setExporterId(optionalAccount.get().getId());
            }
        }
        else
        {
            item.setExporterId(optionalItem.get().getExporterId());
        }

        // remove id
        item.setId(null);
        // set archiveTime, and then add item in item_in_history table
        this.itemInHistoryRepository.save(item.toItemInHistory(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())));
        // delete item from item_in_process table
        this.itemInProcessRepository.delete(optionalItem.get());
        return I18nUtil.getMessage("ARCHIVE_ITEM_SUCCESS", lang);
    }

    // Archive Item()
    @Transactional
    public String unarchiveItem(ItemInProcess item, String lang)
    {
        // format input item fields:
        // remove front and end space;
        item.format();

        String check = item.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check,lang);
        }

        // check item exists or not
        Optional<ItemInHistory> optionalItem = this.itemInHistoryRepository.findItemInHistoryById(item.getId());
        if(optionalItem.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        if(ItemState.INITIALIZE.equals(item.getState()))
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
        else if(ItemState.IMPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }

            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }

            // check if import date is empty or not
            if(item.getImportTime() == null || item.getImportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
            }

            if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
            {
                // check if the importer exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setImporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setImporterId(optionalItem.get().getImporterId());
            }
            item.setExporterId(null);
            item.setExporterName(null);
            item.setExportTime(null);
            item.setCarrier(null);
            item.setTrackNumber(null);
        }
        else if(ItemState.EXPORTED.equals(item.getState()))
        {
            // check if the serial number is unique in the table
            if(!optionalItem.get().getSerialNumber().equals(item.getSerialNumber()) && (this.itemInProcessRepository.findItemInProcessBySerialNumber(item.getSerialNumber()).isPresent() || this.itemInHistoryRepository.findItemInHistoryBySerialNumber(item.getSerialNumber()).isPresent()))
            {
                return I18nUtil.getMessage("ERROR_SERIAL_NUMBER_EXIST", lang);
            }

            // check if importer is empty or not
            if(item.getImporterName() == null || item.getImporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORTER_EMPTY", lang);
            }
            // check if import date is empty or not
            if(item.getImportTime() == null || item.getImportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_IMPORT_TIME_EMPTY", lang);
            }
            if(!optionalItem.get().getImporterName().equals(item.getImporterName()))
            {
                // check if the importer exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getImporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_IMPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setImporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setImporterId(optionalItem.get().getImporterId());
            }

            // check if exporter is empty or not
            if(item.getExporterName() == null || item.getExporterName().equals(""))
            {
                return I18nUtil.getMessage("ERROR_EXPORTER_EMPTY", lang);
            }
            // check if import date is empty or not
            if(item.getExportTime() == null || item.getExportTime().equals(""))
            {
                return I18nUtil.getMessage("ERROR_EXPORT_TIME_EMPTY", lang);
            }

            if(!optionalItem.get().getExporterName().equals(item.getExporterName()))
            {
                // check if the exporter exists or not
                Optional<Account> optionalAccount = this.accountRepository.findAccountEntityByAccountName(item.getExporterName());
                if(optionalAccount.isEmpty())
                {
                    return I18nUtil.getMessage("ERROR_EXPORTER_NOT_EXIST", lang);
                }
                else
                {
                    item.setExporterId(optionalAccount.get().getId());
                }
            }
            else
            {
                item.setExporterId(optionalItem.get().getExporterId());
            }
        }
        else
        {
            return I18nUtil.getMessage("ERROR_AUTHORIZATION", lang);
        }

        // remove id
        item.setId(null);
        // add item in item_in_process table
        this.itemInProcessRepository.save(item);
        // delete item from item_in_history table
        this.itemInHistoryRepository.delete(optionalItem.get());
        return I18nUtil.getMessage("UNARCHIVE_ITEM_SUCCESS", lang);
    }

    // Delete Item_In_Process()
    public String deleteItemInProcess(Long id, String lang)
    {
        // check item exists or not
        Optional<ItemInProcess> item = this.itemInProcessRepository.findItemInProcessById(id);
        if(item.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // delete archive item record
        this.itemInProcessRepository.delete(item.get());
        return I18nUtil.getMessage("DELETE_ITEM_SUCCESS", lang);
    }

    // Delete Item_In_History()
    public String deleteItemInHistory(Long id, String lang)
    {
        // check item exists or not
        Optional<ItemInHistory> item = this.itemInHistoryRepository.findItemInHistoryById(id);
        if(item.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_ITEM_NOT_EXIST", lang);
        }

        // delete archive item record
        this.itemInHistoryRepository.delete(item.get());
        return I18nUtil.getMessage("DELETE_ARCHIVED_ITEM_SUCCESS", lang);
    }
}
