package com.codenext.backend.config.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

@Component
public class MainScheduler
{
    public static boolean isMaintain = false;
    @Autowired
    private ArchiveTask archiveTask;

    @Autowired
    private SystemInfo systemInfo;

    @Scheduled(cron="0 0 1 ? * * ")
    public void maintainTask() throws InterruptedException
    {
        isMaintain = true;
        String pattern = "yyyy-MM-dd";
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(pattern);
        Date date = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.MONTH, -1);
        date = calendar.getTime();
        String time = simpleDateFormat.format(date);
        archiveTask.archiveOrder(time);

        archiveTask.archiveItem(time);

        systemInfo.getSystemInfo();

        isMaintain = false;
    }
}
