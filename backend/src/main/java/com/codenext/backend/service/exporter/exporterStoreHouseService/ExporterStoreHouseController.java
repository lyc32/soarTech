package com.codenext.backend.service.exporter.exporterStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

// ExporterStoreHouseController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/exporter/{lang}/storehouse/all"
// public List<StoreHouse> getStoreHouseList()
//       use to get all storehouse records in store_house table

@RestController
@RequestMapping("/exporter/{lang}/storehouse")
public class ExporterStoreHouseController
{
    @Autowired
    private ExporterStoreHouseService exporterStoreHouseService;

    @GetMapping("/all")
    public List<StoreHouse> getStoreHouseList()
    {
        return this.exporterStoreHouseService.getStoreHouseList();
    }
}
