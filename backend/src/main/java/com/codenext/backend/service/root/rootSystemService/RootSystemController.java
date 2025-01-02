package com.codenext.backend.service.root.rootSystemService;

import com.codenext.backend.entity.SystemInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// RootSystemController
//
// GET
// api = "/root/system/info"
// public SystemInfo getSystemReport()
//       get current system information:
//       cpu usage, memory usage, and storage usage.
//
// POST
// api = "/root/system/refresh"
// public void refreshServer()
//       restart backend service
//
// api = "/root/system/close"
// public void closeServer()
//       stop backend service
//
// api = "/root/system/exit"
// public void exitServer()
//       exit backend service

@RestController
@RequestMapping("/root/{lang}/system")
public class RootSystemController
{
    @Autowired
    private RootSystemService rootSystemService;

    @GetMapping("/info")
    public SystemInfo getSystemReport()
    {
        return this.rootSystemService.getSystemInfo();
    }

    @PostMapping("/refresh")
    public void reStartServer()
    {
        this.rootSystemService.refreshServer();
    }

    @PostMapping("/close")
    public void stopServer()
    {
        this.rootSystemService.closeServer();
    }

    @PostMapping("/exit")
    public void terminateServer()
    {
        this.rootSystemService.exitServer();
    }


}
