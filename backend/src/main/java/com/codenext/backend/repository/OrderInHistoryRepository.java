package com.codenext.backend.repository;

import com.codenext.backend.entity.OrderInHistory;
import com.codenext.backend.entity.OrderInProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderInHistoryRepository extends JpaRepository<OrderInHistory,Long>
{
    Optional<OrderInHistory> findOrderInHistoryById(Long id);
    Optional<OrderInHistory> findOrderInHistoryByIdAndClientID(Long id, Long clientId);
    Optional<OrderInHistory> findOrderInHistoryByOrderNumber(String orderNumber);

    List<OrderInHistory> findOrderInHistoriesByClientID(Long clientId);
    List<OrderInHistory> findOrderInHistoriesByStoreHouse(String storeHouse);

    @Query(value = "SELECT * FROM order_in_history WHERE if(?1 != '', client_id=?1 ,1=1) AND if(?2 !='', create_time >= ?2, 1=1) AND if(?3 !='', create_time <= ?3, 1=1) AND if(?5 != 'all', store_house = ?5, 1=1) ORDER BY create_time desc limit ?4,8", nativeQuery = true)
    List<OrderInHistory> searchMyHistoryOrder(Long clientId, String startTime, String endTime, Long page, String storeHouse);
    @Query(value = "SELECT * FROM order_in_history WHERE if(?1 != '-', order_number=?1 ,1=1) AND if(?2 != '-', client_name like %?2% ,1=1) AND if(?3 !='', create_time >= ?3, 1=1) AND if(?4 !='', create_time <= ?4, 1=1) AND if(?6 != 'all', store_house = ?6, 1=1) ORDER BY create_time desc limit ?5,?7", nativeQuery = true)
    List<OrderInHistory> searchOrder(String orderNumber, String client_name, String startTime, String endTime, Long page, String storeHouse, int rows);


    @Query(value = "SELECT client_name, count(client_id) FROM order_in_history WHERE if(?1 !='all', store_house = ?1, 1=1)  AND create_time <= ?3 AND create_time >= ?2 GROUP BY client_name ORDER BY  count(client_id) desc", nativeQuery = true)
    List<Object[]> getClientReport(String storeHouse, String startTime, String endTime);

    @Query(value = "SELECT date_format(create_time, ?3) AS time, count(client_id) FROM order_in_history WHERE client_name = ?1 AND if(?2 !='all', store_house = ?2, 1=1)  AND create_time <= ?5 AND create_time >= ?4 GROUP BY time asc", nativeQuery = true)
    List<Object[]> getSingleClientReport(String clientName, String storeHouse, String T, String startTime, String endTime);

    @Query(value = "SELECT store_house, count(client_id) FROM order_in_history WHERE if(?1 !='-', client_name = ?1, 1=1)  AND create_time <= ?3 AND create_time >= ?2 GROUP BY store_house", nativeQuery = true)
    List<Object[]> getStoreHouseReport(String clientName, String startTime, String endTime);

    @Query(value = "SELECT date_format(create_time, ?3) AS time, count(client_id) FROM order_in_history WHERE if(?1 !='-', client_name = ?1, 1=1) AND store_house = ?2 AND create_time <= ?5 AND create_time >= ?4 GROUP BY time asc", nativeQuery = true)
    List<Object[]> getSingleStoreHouseReport(String clientName, String store_house, String T, String startTime, String endTime);




    @Modifying
    @Query(value = "UPDATE order_in_history SET client_name=?2 WHERE client_id=?1", nativeQuery = true)
    void updateClientName(Long clientId, String clientName);
    @Modifying
    @Query(value = "UPDATE order_in_history SET store_house=?1 WHERE store_house=?2", nativeQuery = true)
    void updateStorehouse(String newStorehouse, String oldStorehouse);



    void deleteAllByClientID(Long clientId);
    void deleteAllByStoreHouse(String storehouse);

}
