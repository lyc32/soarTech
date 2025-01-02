package com.codenext.backend.service.importer.importerStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// ImporterStoreHouseController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/importer/{lang}/storehouse/all"
// public List<StoreHouse> getStoreHouseList()
//       use to get all storehouse records in store_house table

@RestController
@RequestMapping("/importer/{lang}/storehouse")
public class ImporterStoreHouseController
{
    @Autowired
    private ImporterStoreHouseService importerStoreHouseService;

    @GetMapping("/all")
    public List<StoreHouse> getStoreHouseList()
    {
        return this.importerStoreHouseService.getStoreHouseList();
    }
}
