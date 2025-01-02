package com.codenext.backend.service.admin.adminStoreHouseService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.config.context.StoreHouseState;
import com.codenext.backend.entity.StoreHouse;
import com.codenext.backend.repository.StoreHouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// AdminStoreHouseService
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
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
// public String createStoreHouse(StoreHouse storeHouse, String lang)
//       use to create storehouse record in the store_house table.
//       storeHouse.name is unique in the store_house table.
//       the default status is "active".
//       those fields are required：storehouse.name
//
// PUT
// public String updateStoreHouse(StoreHouse storeHouse, String lang)
//       use to update storehouse record in the store_house table.
//       you can use this method to activate or suspend storehouse.
//       you can not rename storehouse.
//       those fields are required： storehouse.id, storehouse.name
//

@Service
public class AdminStoreHouseService
{
    // storehouse Repository
    @Autowired
    private StoreHouseRepository storeHouseRepository;

    // Get All StoreHouse()
    public List<StoreHouse> getAllStoreHouse()
    {
        return this.storeHouseRepository.findAll();
    }

    // Get StoreHouse()
    public List<StoreHouse> getStoreHouse(int page)
    {
        return this.storeHouseRepository.getStoreHouse((page-1)*8, 8);
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
            return I18nUtil.getMessage(check, lang);
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
            return I18nUtil.getMessage(check, lang);
        }

        // check if the storehouse exists or not
        Optional<StoreHouse> optionalStoreHouse = this.storeHouseRepository.findById(storeHouse.getId());
        if(optionalStoreHouse.isEmpty())
        {
            return I18nUtil.getMessage("ERROR_STOREHOUSE_NOT_EXIST", lang);
        }

        // reset StoreHouse name and create time.
        storeHouse.setName(optionalStoreHouse.get().getName());
        storeHouse.setCreateTime(optionalStoreHouse.get().getCreateTime());

        // update storehouse record
        this.storeHouseRepository.save(storeHouse);
        return I18nUtil.getMessage("UPDATE_REPO_SUCCESS", lang);
    }
}
