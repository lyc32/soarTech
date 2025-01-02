package com.codenext.backend.entity;

public class SystemInfo
{
    private String cpuName;
    private int    coreNumber;
    private int    processNumber;
    private Double cpuUsage;
    private Double memoryTotal;
    private Double memoryUsage;
    private Long   diskTotal;
    private Long   diskFree;

    public SystemInfo()
    {}

    public SystemInfo(String cpuName, int coreNumber, int processNumber, Double cpuUsage, Double memoryTotal, Double memoryUsage, Long diskTotal, Long diskFree) {
        this.cpuName = cpuName;
        this.coreNumber = coreNumber;
        this.processNumber = processNumber;
        this.cpuUsage = cpuUsage;
        this.memoryTotal = memoryTotal;
        this.memoryUsage = memoryUsage;
        this.diskTotal = diskTotal;
        this.diskFree = diskFree;
    }

    public String getCpuName() {
        return cpuName;
    }

    public void setCpuName(String cpuName) {
        this.cpuName = cpuName;
    }

    public int getCoreNumber() {
        return coreNumber;
    }

    public void setCoreNumber(int coreNumber) {
        this.coreNumber = coreNumber;
    }

    public int getProcessNumber() {
        return processNumber;
    }

    public void setProcessNumber(int processNumber) {
        this.processNumber = processNumber;
    }

    public Double getCpuUsage() {
        return cpuUsage;
    }

    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }

    public Double getMemoryTotal() {
        return memoryTotal;
    }

    public void setMemoryTotal(Double memoryTotal) {
        this.memoryTotal = memoryTotal;
    }

    public Double getMemoryUsage() {
        return memoryUsage;
    }

    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }

    public Long getDiskTotal() {
        return diskTotal;
    }

    public void setDiskTotal(Long diskTotal) {
        this.diskTotal = diskTotal;
    }

    public Long getDiskFree() {
        return diskFree;
    }

    public void setDiskFree(Long diskFree) {
        this.diskFree = diskFree;
    }
}
