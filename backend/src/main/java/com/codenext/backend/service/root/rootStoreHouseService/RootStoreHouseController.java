package com.codenext.backend.service.root.rootStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

// RootStoreHouseController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/root/storehouse/all"
// public List<StoreHouse> getAllStoreHouse()
//       use to get all store house.
//
// api = "/root/storehouse/list/{page}"
// public List<StoreHouse> getStoreHouse(int page)
//       use to get store house by page.
//       page is required.
//
// POST
// api = "/root/storehouse/create"
// public String createStoreHouse(StoreHouse storeHouse, String lang)
//       use to create storehouse with active status.
//       those fields are required：storehouse.name
//
// PUT
// api = "/root/storehouse/update"
// public String updateStoreHouse(StoreHouse storeHouse, String lang)
//       use to update storehouse info.
//       those fields are required： storehouse.id, storehouse.name
//
// DELETE
// api = "/root/storehouse/delete/{id}"
// public String deleteStoreHouse(int id, String lang)
//       use to delete storehouse only.
//       those fields are required： id
//
// api = "/root/storehouse/delete/all/{id}"
// public String deleteStoreHouseAll(int id, String lang)
//       use to delete storehouse and all related orders and items.
//       those fields are required： id

@RestController
@RequestMapping("/root/{lang}/storehouse")
public class RootStoreHouseController
{
    @Autowired
    private RootStoreHouseService rootStoreHouseService;

    @GetMapping("/all")
    public List<StoreHouse> getAllStoreHouse()
    {
        return rootStoreHouseService.getAllStoreHouse();
    }

    @GetMapping("/list/{page}")
    public List<StoreHouse> getStoreHouse(@PathVariable int page)
    {
        return this.rootStoreHouseService.getStoreHouse(page);
    }

    @PostMapping("/create")
    public String createStoreHouse(@RequestBody StoreHouse storeHouse, @PathVariable String lang)
    {
        return this.rootStoreHouseService.createStoreHouse(storeHouse, lang);
    }

    @PutMapping("/update")
    public String updateStoreHouse(@RequestBody StoreHouse storeHouse, @PathVariable String lang)
    {
        return this.rootStoreHouseService.updateStoreHouse(storeHouse, lang);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteStoreHouse(@PathVariable int id, @PathVariable String lang)
    {
        return this.rootStoreHouseService.deleteStoreHouse(id, lang);
    }

    @DeleteMapping("/delete/all/{id}")
    public String deleteStoreHouseAll(@PathVariable int id, @PathVariable String lang)
    {
        return this.rootStoreHouseService.deleteStoreHouseAll(id, lang);
    }

}
