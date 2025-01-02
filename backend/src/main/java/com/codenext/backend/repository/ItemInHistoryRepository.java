package com.codenext.backend.repository;

import com.codenext.backend.entity.ItemInHistory;
import com.codenext.backend.entity.ItemInProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemInHistoryRepository extends JpaRepository<ItemInHistory, Long>
{
    Optional<ItemInHistory> findItemInHistoryById(Long id);
    Optional<ItemInHistory> findItemInHistoryBySerialNumber(String serialNumber);
    List<ItemInHistory> findAllByOrderNumber(String orderNumber);

    @Query(value = "SELECT * FROM item_in_history WHERE if(?1 != '-', item_name like %?1% ,1=1) AND if(?2 != '-', order_number=?2 ,1=1) AND if(?3 != '-', serial_number=?3 ,1=1) AND if(?4 != '-', importer_name like %?4% ,1=1) AND if(?5 != '-', exporter_name like %?5% ,1=1) AND if(?7 != 'all', store_house=?7, 1=1) AND if(?8 != '-', position like %?8%, 1=1) AND if(?9 != '-', carrier=?9, 1=1) AND if(?10 != '-', track_number=?10, 1=1) ORDER BY id desc limit ?6,?11", nativeQuery = true)
    List<ItemInHistory> search(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, int rows);

    @Modifying
    @Query(value = "UPDATE item_in_history SET order_number=?1 WHERE order_number=?2", nativeQuery = true)
    void updateOrderNumber(String newOrderNumber, String oldOrderNumber);
    @Modifying
    @Query(value = "UPDATE item_in_history SET importer_name=?2 WHERE importer_id=?1", nativeQuery = true)
    void updateImporter(Long importerId, String importerName);
    @Modifying
    @Query(value = "UPDATE item_in_history SET exporter_name=?2 WHERE exporter_id=?1", nativeQuery = true)
    void updateExporter(Long exporterId, String exporterName);
    @Modifying
    @Query(value = "UPDATE item_in_history SET store_house=?1 WHERE store_house=?2", nativeQuery = true)
    void updateStorehouse(String newStorehouse, String oldStorehouse);

    void deleteAllByOrderNumber(String orderNumber);
    void deleteAllByStoreHouse(String storehouse);
}
