package com.codenext.backend.service.root.rootStoreHouseService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.StoreHouseState;
import com.codenext.backend.entity.OrderInHistory;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.entity.StoreHouse;
import com.codenext.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// RootStoreHouseService
//
// GET
// public List<StoreHouse> getAllStoreHouse()
//       use to get all store house.
//
// public List<StoreHouse> getStoreHouse(int page)
//       use to get store house by page.
//       page is required.
//
// POST
// public String createStoreHouse(StoreHouse storeHouse)
//       use to create storehouse record in the store_house table.
//       storeHouse.name is unique in the store_house table.
//       the default status is "active".
//       those fields are required：storehouse.name
//
// PUT
// public String updateStoreHouse(StoreHouse storeHouse)
//       use to update storehouse record in the store_house table.
//       you can use this method to activate or suspend storehouse.
//       and also rename storehouse.
//       those fields are required： storehouse.id, storehouse.name
//
// DELETE
// public String deleteStoreHouse(int id)
//       used to delete this storeHouse record in the store_house table only.
//       this method does not change any data in other tables.
//       those fields are required： id
//
// public String deleteStoreHouseAll(int id)
//       used to delete this storeHouse record in the store_house table.
//       And delete all orders in that storeHouse.
//       And delete all items belonging to those orders.
//       And delete all items whose last position was in that storeHouse.
//       those fields are required： id

@Service
public class RootStoreHouseService
{
    // storehouse Repository
    @Autowired
    private StoreHouseRepository storeHouseRepository;

    // when the storeHouse.name is changed, the related orders' storehouse and items' storehouse also need to be changed.
    // when the storeHouse is deleted, the related orders and items also need to be deleted.
    // order Repository
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;

    // item Repository
    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;

    // Get All StoreHouse()
    public List<StoreHouse> getAllStoreHouse()
    {
        return this.storeHouseRepository.findAll();
    }

    // Get StoreHouse()
    public List<StoreHouse> getStoreHouse(int page)
    {
        return this.storeHouseRepository.getStoreHouse((page-1)*15, 15);
    }

    // Create StoreHouse()
    public String createStoreHouse(StoreHouse storeHouse, String lang)
    {
        // format storeHouse fields:
        // remove front and end space;
        storeHouse.format();

        // check input storeHouse is correct or not
        // storeHouse must have: storeHouse.name.
        String check = storeHouse.check();
        if(check != null)
        {
            return check;
        }

        // check if the storehouse name has been used or not
        Optional<StoreHouse> optionalStoreHouse = this.storeHouseRepository.findStoreHouseByName(storeHouse.getName());
        if(optionalStoreHouse.isPresent())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NAME_EXIST", lang);
        }

        // set createTime and set status as 'active'
        storeHouse.setCreateTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        storeHouse.setStatus(StoreHouseState.ACTIVE);

        // save storeHouse record
        this.storeHouseRepository.save(storeHouse);
        return I18nUtil.getMessage("CREATE_REPO_SUCCESS", lang);
    }

    // Update StoreHouse()
    @Transactional
    public String updateStoreHouse(StoreHouse storeHouse, String lang)
    {
        // format storeHouse fields:
        // remove front and end space;
        storeHouse.format();

        // check input storeHouse is correct or not
        // order must have: id, storeHouse.name.
        String check = storeHouse.check();
        if(check != null)
        {
            return check;
        }

        // check if the storehouse exists or not
        Optional<StoreHouse> optionalStoreHouse = this.storeHouseRepository.findById(storeHouse.getId());
        if(optionalStoreHouse.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NOT_EXIST", lang);
        }

        // check if the storehouse name has changed ot noy
        // check if the storehouse name has been used or not
        if( !storeHouse.getName().equals(optionalStoreHouse.get().getName()) && this.storeHouseRepository.findStoreHouseByName(storeHouse.getName()).isPresent())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NAME_EXIST", lang);
        }

        // if the storehouse name changed.
        if( !storeHouse.getName().equals(optionalStoreHouse.get().getName()))
        {
            // change orders and items' storehouse name
            this.orderInProcessRepository.updateStorehouse(storeHouse.getName(), optionalStoreHouse.get().getName());
            this.orderInHistoryRepository.updateStorehouse(storeHouse.getName(), optionalStoreHouse.get().getName());
            this.itemInProcessRepository.updateStorehouse(storeHouse.getName(), optionalStoreHouse.get().getName());
            this.itemInHistoryRepository.updateStorehouse(storeHouse.getName(), optionalStoreHouse.get().getName());
            // set new name
            optionalStoreHouse.get().setName(storeHouse.getName());
        }

        // reset create time.
        storeHouse.setCreateTime(optionalStoreHouse.get().getCreateTime());

        // update storehouse record
        this.storeHouseRepository.save(storeHouse);
        return I18nUtil.getMessage("UPDATE_REPO_SUCCESS", lang);
    }


    // Delete StoreHouse()
    public String deleteStoreHouse(int id, String lang)
    {
        // check if the storehouse exists or not
        Optional<StoreHouse> optionalStoreHouse = this.storeHouseRepository.findById(id);
        if(optionalStoreHouse.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NOT_EXIST", lang);
        }

        // delete storehouse record
        this.storeHouseRepository.delete(optionalStoreHouse.get());
        return I18nUtil.getMessage("DELETE_REPO_SUCCESS", lang);
    }

    // Delete StoreHouse All()
    @Transactional
    public String deleteStoreHouseAll(int id, String lang)
    {
        // check if the storehouse exists or not
        Optional<StoreHouse> optionalStoreHouse = this.storeHouseRepository.findById(id);
        if(optionalStoreHouse.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NOT_EXIST", lang);
        }

        // get all order records in this storehouse.
        List<OrderInProcess> orderInProcessList = this.orderInProcessRepository.findOrderInProcessesByStoreHouse(optionalStoreHouse.get().getName());
        List<OrderInHistory> orderInHistoryList = this.orderInHistoryRepository.findOrderInHistoriesByStoreHouse(optionalStoreHouse.get().getName());
        orderInProcessList.forEach(e ->
        {
            // delete all item records in this order.
            this.itemInProcessRepository.deleteAllByOrderNumber(e.getOrderNumber());
            this.itemInHistoryRepository.deleteAllByOrderNumber(e.getOrderNumber());
        });
        orderInHistoryList.forEach(e ->
        {
            // delete all item records in this order.
            this.itemInProcessRepository.deleteAllByOrderNumber(e.getOrderNumber());
            this.itemInHistoryRepository.deleteAllByOrderNumber(e.getOrderNumber());
        });

        // delete all order records in the storehouse.
        this.orderInProcessRepository.deleteAllByStoreHouse(optionalStoreHouse.get().getName());
        this.orderInHistoryRepository.deleteAllByStoreHouse(optionalStoreHouse.get().getName());

        // delete all item records in the storehouse.
        this.itemInProcessRepository.deleteAllByStoreHouse(optionalStoreHouse.get().getName());
        this.itemInHistoryRepository.deleteAllByStoreHouse(optionalStoreHouse.get().getName());

        // delete the storehouse record
        this.storeHouseRepository.delete(optionalStoreHouse.get());
        return I18nUtil.getMessage("DELETE_REPO_SUCCESS", lang);
    }
}
