package com.codenext.backend.repository;


import com.codenext.backend.entity.StoreHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.*;


@Repository
public interface StoreHouseRepository extends JpaRepository<StoreHouse, Integer>
{
    List<StoreHouse> findAll();

    @Query(value = "SELECT * FROM store_house ORDER BY create_time desc limit ?1,?2", nativeQuery = true)
    List<StoreHouse> getStoreHouse(int page, int row);
    Optional<StoreHouse> findStoreHouseByName(String name);
}
