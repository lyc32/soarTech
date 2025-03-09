package com.codenext.backend.config.scheduler;

import com.codenext.backend.config.context.ItemState;
import com.codenext.backend.config.context.OrderState;
import com.codenext.backend.entity.ItemInProcess;
import com.codenext.backend.entity.OrderInProcess;
import com.codenext.backend.repository.ItemInHistoryRepository;
import com.codenext.backend.repository.ItemInProcessRepository;
import com.codenext.backend.repository.OrderInHistoryRepository;
import com.codenext.backend.repository.OrderInProcessRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
public class ArchiveTask
{

    @Autowired
    private Logger logger;
    @Autowired
    private OrderInProcessRepository orderInProcessRepository;
    @Autowired
    private OrderInHistoryRepository orderInHistoryRepository;

    @Autowired
    private ItemInProcessRepository itemInProcessRepository;
    @Autowired
    private ItemInHistoryRepository itemInHistoryRepository;


    @Transactional
    public void archiveOrder(String time)
    {
        List<OrderInProcess> orderInProcessList = orderInProcessRepository.getOldOrder(time, OrderState.FINISHED);
        orderInProcessList.forEach(e ->
        {
            orderInHistoryRepository.save(e.toOrderInHistory(time));
            orderInProcessRepository.delete(e);
        });

        logger.info("Archive Order Successful");
    }

    @Transactional
    public void archiveItem(String time)
    {
        List<ItemInProcess> itemInProcessList = itemInProcessRepository.getOldItem(time, ItemState.EXPORTED);
        itemInProcessList.forEach(e ->
        {
            itemInHistoryRepository.save(e.toItemInHistory(time));
            itemInProcessRepository.delete(e);
        });

        logger.info("Archive Item Successful");
    }


}
