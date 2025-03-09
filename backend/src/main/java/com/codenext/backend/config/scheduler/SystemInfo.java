package com.codenext.backend.config.scheduler;

import cn.hutool.system.oshi.CpuInfo;
import cn.hutool.system.oshi.OshiUtil;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;

import java.io.File;

@Component
public class SystemInfo
{
    @Autowired
    private Logger logger;

    public void getSystemInfo()
    {
        // get cpu info
        CpuInfo cpuInfo = OshiUtil.getCpuInfo();
        // get memory info
        GlobalMemory memory = OshiUtil.getMemory();
        // get disk info
        File[] roots = File.listRoots();

        double diskTotal = 0;
        double diskUsage = 0;
        if(roots.length > 0)
        {
            // roots[0]  is the first disk.
            diskTotal = roots[0].getTotalSpace();
            diskUsage = roots[0].getUsableSpace();
        }

        // convert memory from B to GB
        Double memoryTotal = Double.parseDouble(String.valueOf(memory.getTotal())) / 1024 / 1024 / 1024;
        Double memoryUsage = memoryTotal - Double.parseDouble(String.valueOf(memory.getAvailable())) / 1024 / 1024 / 1024;

        logger.info("cpu   :" + Double.parseDouble(String.format("%.2f",100 - cpuInfo.getFree())));
        logger.info("memory:" + Double.parseDouble(String.format("%.2f", memoryUsage/memoryTotal)));
        logger.info("disk  :" + Double.parseDouble(String.format("%.2f", diskUsage/diskTotal)));
    }

}
