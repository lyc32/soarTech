package com.codenext.backend.repository;

import com.codenext.backend.entity.ItemInProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemInProcessRepository extends JpaRepository<ItemInProcess, Long>
{
    Optional<ItemInProcess> findItemInProcessById(Long id);
    Optional<ItemInProcess> findItemInProcessBySerialNumber(String serialNumber);
    Optional<ItemInProcess> findItemInProcessBySerialNumberAndState(String serialNumber, String state);
    List<ItemInProcess> findAllByOrderNumberAndState(String orderNumber, String state);
    List<ItemInProcess> findAllByOrderNumber(String orderNumber);
    @Query(value = "SELECT * FROM item_in_process WHERE if(?1 != '-', item_name like %?1% ,1=1) AND if(?2 !='-', serial_number=?2, 1=1) AND if(?3 !='all', store_house=?3, 1=1) AND if(?4 != '-', position like %?4%, 1=1) AND if(?5 != '', state = ?5, 1=1) ORDER BY import_time desc limit ?6,8", nativeQuery = true)
    List<ItemInProcess> searchItem(String itemName, String serialNumber, String storeHouse, String position, String state, Long page);

    @Query(value = "SELECT * FROM item_in_process WHERE if(?1 != '-', item_name like %?1% ,1=1) AND if(?2 != '-', order_number=?2 ,1=1) AND if(?3 != '-', serial_number=?3 ,1=1) AND if(?4 != '-', importer_name like %?4% ,1=1) AND if(?5 != '-', exporter_name like %?5% ,1=1) AND if(?7 != 'all', store_house=?7, 1=1) AND if(?8 != '-', position like %?8%, 1=1) AND if(?9 != '-', carrier=?9, 1=1) AND if(?10 != '-', track_number=?10, 1=1) AND if(?11 != 'all', state = ?11, 1=1) ORDER BY id desc limit ?6,?12", nativeQuery = true)
    List<ItemInProcess> search(String itemName, String orderNumber, String serialNumber, String importerName, String exporterName, Long page, String storeHouse, String position, String carrier, String trackNumber, String state, int rows);

    @Query(value = "SELECT * FROM item_in_process WHERE if(?1 != '', export_time <= ?1 ,1=1) AND if(?2 !='', state = ?2, 1=1) ", nativeQuery = true)
    List<ItemInProcess> getOldItem(String time, String state);

    @Query(value = "SELECT i.* FROM item_in_process i, order_in_process o WHERE o.client_name=?1 AND if(?2 !='all', i.store_house=?2, 1=1) AND date_format(i.import_time, '%Y-%m-%d')>=?3 AND date_format(i.import_time, '%Y-%m-%d')<=?4 AND o.order_number = i.order_number ORDER BY i.state, i.item_name, i.import_time desc limit ?5,?6", nativeQuery = true)
    List<ItemInProcess> getClientReport(String clientName, String storeHouse, String time1, String time2, Long page, int rows);

    @Query(value = "SELECT i.* FROM item_in_process i, order_in_process o WHERE o.client_name=?1 AND if(?2 !='all', i.store_house=?2, 1=1) AND date_format(i.import_time, '%Y-%m-%d')>=?3 AND date_format(i.import_time, '%Y-%m-%d')<=?4 AND o.order_number = i.order_number ORDER BY i.state, i.item_name, i.import_time desc", nativeQuery = true)
    List<ItemInProcess> getClientReportJson(String clientName, String storeHouse, String time1, String time2);

    @Modifying
    @Query(value = "UPDATE item_in_process SET order_number=?1 WHERE order_number=?2", nativeQuery = true)
    void updateOrderNumber(String newOrderNumber, String oldOrderNumber);
    @Modifying
    @Query(value = "UPDATE item_in_process SET importer_name=?2 WHERE importer_id=?1", nativeQuery = true)
    void updateImporter(Long importerId, String importerName);
    @Modifying
    @Query(value = "UPDATE item_in_process SET exporter_name=?2 WHERE exporter_id=?1", nativeQuery = true)
    void updateExporter(Long exporterId, String exporterName);
    @Modifying
    @Query(value = "UPDATE item_in_process SET store_house=?1 WHERE store_house=?2", nativeQuery = true)
    void updateStorehouse(String newStorehouse, String oldStorehouse);

    void deleteAllByOrderNumber(String orderNumber);
    void deleteAllByStoreHouse(String storehouse);






}
