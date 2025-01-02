package com.codenext.backend.service.admin.adminStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

// AdminStoreHouseController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/admin/{lang}/storehouse/all"
// public List<StoreHouse> getAllStoreHouse()
//       use to get all store house.
//
// api = "/admin/{lang}/storehouse/list/{page}"
// public List<StoreHouse> getStoreHouse(int page)
//       use to get store house by page.
//       page is required.
//
// POST
// api = "/admin/{lang}/storehouse/create"
// public String createStoreHouse(StoreHouse storeHouse, String lang)
//       use to create storehouse with active status.
//       those fields are required：storehouse.name
//
// PUT
// api = "/admin/{lang}/storehouse/update"
// public String updateStoreHouse(StoreHouse storeHouse, String lang)
//       use to update storehouse info.
//       admin cannot rename the storehouse.
//       those fields are required： storehouse.id, storehouse.name

@RestController
@RequestMapping("/admin/{lang}/storehouse")
public class AdminStoreHouseController
{
    @Autowired
    private AdminStoreHouseService adminStoreHouseService;

    @GetMapping("/all")
    public List<StoreHouse> getAllStoreHouse()
    {
        return adminStoreHouseService.getAllStoreHouse();
    }

    @GetMapping("/list/{page}")
    public List<StoreHouse> getStoreHouse(@PathVariable int page)
    {
        return this.adminStoreHouseService.getStoreHouse(page);
    }

    @PostMapping("/create")
    public String createStoreHouse(@RequestBody StoreHouse storeHouse, @PathVariable String lang)
    {
        return this.adminStoreHouseService.createStoreHouse(storeHouse, lang);
    }

    @PutMapping("/update")
    public String updateStoreHouse(@RequestBody StoreHouse storeHouse, @PathVariable String lang)
    {
        return this.adminStoreHouseService.updateStoreHouse(storeHouse, lang);
    }
}

