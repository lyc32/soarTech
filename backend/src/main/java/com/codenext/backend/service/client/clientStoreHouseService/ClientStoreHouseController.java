package com.codenext.backend.service.client.clientStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

// ClientStoreHouseController
//
// {lang} is the language setting, zh-CN means return Chinese, and the default is en-US
//
// GET
// api = "/client/{lang}/storehouse/all"
// public List<StoreHouse> getStoreHouseList()
//       use to get all storehouse records in store_house table

@RestController
@RequestMapping("/client/{lang}/storehouse")
public class ClientStoreHouseController
{
    @Autowired
    private ClientStoreHouseService clientStoreHouseService;
    @GetMapping("/all")
    public List<StoreHouse> getAllStoreHouse()
    {
        return clientStoreHouseService.getStoreHouseList();
    }
}
