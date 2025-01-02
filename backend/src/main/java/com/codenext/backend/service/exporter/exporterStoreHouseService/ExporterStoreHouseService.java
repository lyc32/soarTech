package com.codenext.backend.service.exporter.exporterStoreHouseService;

import com.codenext.backend.entity.StoreHouse;
import com.codenext.backend.repository.StoreHouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

// ExporterStoreHouseService
//
// GET
// public List<StoreHouse> getStoreHouseList()
//       use to get all storehouse records in store_house table
//       this method will return all storehouses whether the storehouse is suspended or activated.

@Service
public class ExporterStoreHouseService
{
    // store house Repository
    @Autowired
    private StoreHouseRepository storeHouseRepository;

    // Get StoreHouse List()
    public List<StoreHouse> getStoreHouseList()
    {
        return this.storeHouseRepository.findAll();
    }
}
