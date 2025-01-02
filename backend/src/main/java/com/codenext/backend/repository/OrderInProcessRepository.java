package com.codenext.backend.repository;

import com.codenext.backend.entity.OrderInProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface OrderInProcessRepository extends JpaRepository<OrderInProcess, Long>
{
    Optional<OrderInProcess> findOrderInProcessById(Long id);
    Optional<OrderInProcess> findOrderInProcessByOrderNumber(String orderNumber);
    Optional<OrderInProcess> findOrderInProcessByIdAndClientID(Long id, Long clientId);
    List<OrderInProcess> findOrderInProcessesByClientID(Long clientId);
    List<OrderInProcess> findOrderInProcessesByStoreHouse(String storeHouse);

    @Query(value = "SELECT * FROM order_in_process WHERE if(?1 != '', client_id=?1 ,1=1) AND if(?2 !='', create_time >= ?2, 1=1) AND if(?3 !='', create_time <= ?3, 1=1) AND if(?5 != 'all', store_house = ?5, 1=1) AND if(?6 != 'all', state = ?6, 1=1) ORDER BY create_time desc limit ?4,8", nativeQuery = true)
    List<OrderInProcess> searchMyOrder(Long clientId, String startTime, String endTime, Long page, String storeHouse, String state);
    @Query(value = "SELECT * FROM order_in_process WHERE if(?1 != '-', order_number = ?1 ,1=1) AND if(?2 != '-', client_name like %?2% ,1=1) AND if(?3 !='', create_time >= ?3, 1=1) AND if(?4 !='', create_time <= ?4, 1=1) AND if(?6 != 'all', store_house = ?6, 1=1) AND if(?7 != 'all', state = ?7, 1=1) ORDER BY create_time desc limit ?5,?8", nativeQuery = true)
    List<OrderInProcess> searchOrder(String orderNumber, String clientName, String startTime, String endTime, Long page, String storeHouse, String state, int rows);
    @Query(value = "SELECT * FROM order_in_process WHERE if(?1 != '', create_time <= ?1 ,1=1) AND if(?2 !='', state = ?2, 1=1) ", nativeQuery = true)
    List<OrderInProcess> getOldOrder(String time, String state);

    @Modifying
    @Query(value = "UPDATE order_in_process SET client_name=?2 WHERE client_id=?1", nativeQuery = true)
    void updateClientName(Long clientId, String clientName);
    @Modifying
    @Query(value = "UPDATE order_in_process SET store_house=?1 WHERE store_house=?2", nativeQuery = true)
    void updateStorehouse(String newStorehouse, String oldStorehouse);




    void deleteAllByClientID(Long clientId);
    void deleteAllByStoreHouse(String storehouse);



}
