package com.codenext.backend.service.root.rootSystemService;

import com.codenext.backend.BackendApplication;
import com.codenext.backend.entity.SystemInfo;
import jakarta.annotation.Resource;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Service;
import cn.hutool.system.oshi.CpuInfo;
import cn.hutool.system.oshi.OshiUtil;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import java.io.File;

// RootSystemService
//
// GET
// public SystemInfo getSystemReport()
//       get current system information:
//             cpuName       : the name of cpu
//             coreNumber    : how many core in this cpu
//             processNumber : how many processor in this cpu
//             cpuUsage      : cpu usage percentage
//             memoryTotal   : the total size of memory
//             memoryUsage   : how many memory has been used
//             diskTotal     : total size of system disk
//             diskFree      : Available space on system disk
//
// POST
// public void refreshServer()
//       use to restart SpringBoot application.
//       this method will create a user Thread.
//       this Thread will close ApplicationContext and restart it.
//
// public void closeServer()
//       use to close ApplicationContext.
//       when the ApplicationContext is closed, the program should stop.
//
// public void exitServer()
//       use to exit SpringBoot Application
//       it will close ApplicationContext
//       and then call System.exit().


@Service
public class RootSystemService
{
    // use to get application context
    @Resource
    private ApplicationContext applicationContext;

    // Get System Info()
    public SystemInfo getSystemInfo()
    {

        // get processor info
        CentralProcessor processor = OshiUtil.getProcessor();
        // get processor name
        CentralProcessor.ProcessorIdentifier processorIdentifier = processor.getProcessorIdentifier();
        // get cpu info
        CpuInfo cpuInfo = OshiUtil.getCpuInfo();
        // get memory info
        GlobalMemory memory = OshiUtil.getMemory();
        // get disk info
        File[] roots = File.listRoots();

        long diskTotal = 0;
        long diskUsage = 0;
        if(roots.length > 0)
        {
            // roots[0]  is the first disk.
            diskTotal = roots[0].getTotalSpace();
            diskUsage = roots[0].getUsableSpace();
        }

        // convert memory from B to GB
        Double memoryTotal = Double.parseDouble(String.valueOf(memory.getTotal())) / 1024 / 1024 / 1024;
        Double memoryUsage = memoryTotal - Double.parseDouble(String.valueOf(memory.getAvailable())) / 1024 / 1024 / 1024;

        return new SystemInfo(
                processorIdentifier.getName(), //  the name of cpu
                processor.getPhysicalProcessorCount(), // how many core in this cpu
                processor.getLogicalProcessorCount(), // how many processor in this cpu
                Double.parseDouble(String.format("%.2f",100 - cpuInfo.getFree())), //cpu usage
                memoryTotal, // the total size of memory
                memoryUsage, // how many memory has been used
                diskTotal, // total size of system disk
                diskUsage  // Available space on system disk
        );
    }

    // Refresh Server()
    public void refreshServer()
    {
        // get arguments from main class
        ApplicationArguments args = applicationContext.getBean(ApplicationArguments.class);

        // create a thread
        Thread thread = new Thread(() ->
        {
            // close ApplicationContext
            ((ConfigurableApplicationContext) applicationContext).close();
            // start SpringApplication
            SpringApplication.run(BackendApplication.class, args.getSourceArgs());
        });

        // set Thread type as user Thread
        // make sure this thread can still run after the main Thread exits.
        thread.setDaemon(false);

        // thread run
        thread.start();
    }

    // Close Server()
    public void closeServer()
    {
        // close ApplicationContext
        ((ConfigurableApplicationContext) applicationContext).close();
    }

    // Exit Server()
    public void exitServer()
    {
        // exit application
       System.exit(SpringApplication.exit(applicationContext));
    }




}
