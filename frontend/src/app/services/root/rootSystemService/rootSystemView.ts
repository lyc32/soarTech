import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Chart } from "chart.js";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { RootSystemService   } from "./rootSystemService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'rootSystemView',
  templateUrl: './rootSystemView.html'
})
export class RootSystemView implements OnInit, OnDestroy
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message1:string="";
  message2:string="";
  t:string = "";
  message3:string="";

  // System Info
  cpuName      : string   = "CPU INFO";
  coreNumber    : number   = 0;
  processNumber : number   = 0;
  cpuUsage     : number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  memoryUsage   : number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  memoryTotal   : number   = 0;
  mempryAvailable: string = "0.00";
  diskFree      : number   = 0;
  diskTotal     : number   = 0;

  // chart
  myCPUChart    : Chart<"bar", number[], unknown>;
  myMemoryChart : Chart<"line", number[], unknown>;
  myDiskChart   : Chart<"doughnut", number[], unknown>;

  // timer
  interval1:number;
  interval2:number;

  // interval time
  time:number = 5000;

  // stop timer
  isStop = false;

  // bar chart color
  blueColors : string[] = ["#003bbf", "#004bcf", "#005bdf", "#006bef", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#007bff", "#008bff", "#009bff", "#00abff", "#00cbff", "#00dbff", "#00ebff"];

  /*************************** Initialization page ***************************/
  constructor(private router:Router, private rootSystemService:RootSystemService , public config:WebSiteConfig, private accountLocalService:AccountLocalService)
  {}

  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get account role
    this.currentAccountRole = account!.role;

    // Check if the role is admin or not
    if(this.currentAccountRole != this.config.rootRole)
    {
      this.router.navigateByUrl("error");
      return;
    }

    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }

    this.getSystemInfo();
    this.interval1 = setInterval(()=>{this.getSystemInfo();}, this.time);
  }

  ngOnDestroy(): void
  {
    // Clear Timer
    if(this.interval1)
    {
      window.clearInterval(this.interval1);
    }

    if(this.interval2)
    {
      window.clearInterval(this.interval2);
    }
  }

  /************************** Get Sever Information **************************/
  // get System information
  getSystemInfo()
  {
    // call backend
    // GET
    // api = "/root/lang/system/info"
    this.rootSystemService.getSystemInfo(this.lang).subscribe(
      data =>
      {
        // set cpu information
        this.cpuName       = data.cpuName;
        this.coreNumber    = data.coreNumber;
        this.processNumber = data.processNumber;

        // Update CPU chart data
        this.cpuUsage.push(data.cpuUsage);
        this.cpuUsage.shift();

        // set RAM information
        this.memoryTotal     = data.memoryTotal;
        this.mempryAvailable = (this.memoryTotal - data.memoryUsage).toFixed(2);

        // Update Memory chart data
        this.memoryUsage.push(data.memoryUsage);
        this.memoryUsage.shift();

        // set disk information
        this.diskTotal = data.diskTotal;
        this.diskFree = data.diskFree;

        // Update charts
        this.drawChart();
      },
      error =>
      {
        // When data fetch fails, use the last one to update the chart

        // Update CPU chart data
        this.cpuUsage.push(this.cpuUsage[19]);
        this.cpuUsage.shift();

        // Update Memory chart data
        this.memoryUsage.push(this.memoryUsage[19]);
        this.memoryUsage.shift();

        // Update charts
        this.drawChart();
      });
  }

  /******************************* Draw Chart ********************************/
  // draw or update charts
  drawChart()
  {
    if(this.myCPUChart == null || this.myCPUChart == undefined)
    {
      this.drawCPUChart();
    }
    else
    {
      this.myCPUChart.update();
    }

    if(this.myMemoryChart == null || this.myMemoryChart == undefined)
    {
      this.drawMemoryChart();
    }
    else
    {
      this.myMemoryChart.update();
    }

    if(this.myDiskChart == null || this.myMemoryChart == undefined)
    {
      this.drawDiskChart();
    }
    else
    {
      this.myDiskChart.update();
    }
  }

  // draw CPU bar chart
  drawCPUChart()
  {
    const canvas = document.getElementById("CPU") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx)
    {
      this.myCPUChart =
        new Chart(ctx,
        {
          type: "bar",
          data: { labels: this.cpuUsage, datasets: [{ data: this.cpuUsage, backgroundColor: this.blueColors, barPercentage: 0.5, categoryPercentage:1}]},
          options:{plugins:{legend:{display:false}}, scales:{ x: { ticks: { display: false,}}, y:{ min: 0, max: 100, ticks: { stepSize: 20}}}}
        });
    }
  }

  // draw RAM line chart
  drawMemoryChart()
  {
    const canvas = document.getElementById("memory") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx)
    {
      this.myMemoryChart =
        new Chart(ctx,
          {
            type: "line",
            data: { labels: this.memoryUsage, datasets: [{ data: this.memoryUsage}]},
            options:{plugins:{legend:{display:false}}, scales:{ x: { ticks: { display: false,}}, y:{ min: 0, max: this.memoryTotal}}}
          });
    }
  }

  // draw disk doughnut Chart
  drawDiskChart()
  {
    const canvas = document.getElementById("disk") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (ctx)
    {
      this.myDiskChart =
        new Chart(ctx,
          {
            type: "doughnut",
            data: { labels: ["used", "free"], datasets: [{ data: [this.diskTotal - this.diskFree, this.diskFree]}]},
            options: {
              responsive: true,
              }
          });
    }
  }

  /******************************** main page ********************************/
  // stop monitor
  stopMonitor()
  {
    // Stop call backend
    this.isStop = true;
    if(this.interval1)
    {
      window.clearInterval(this.interval1);
    }

    // Set new data as 0 until all data equals = 0
    let i = 0;
    this.interval2 = setInterval(() =>
    {
      this.cpuUsage.push(0);
      this.cpuUsage.shift();
      this.memoryUsage.push(0);
      this.memoryUsage.shift();
      this.drawChart();
      i++;
      if(i == 20)
      {
        clearInterval(this.interval2);
      }
    },this.time)
  }

  // start monitor
  startMonitor()
  {
    // if interval2 is still running
    // then stop interval2.
    this.isStop = false;
    if(this.interval2)
    {
      window.clearInterval(this.interval2);
    }

    // Start call backend
    this.getSystemInfo();
    this.interval1 = setInterval(()=>{this.getSystemInfo();}, this.time);
  }

  // restart backend
  refresh()
  {
    // Display pop-up window
    this.openPop( );

    // call backend
    // POST
    // api = "/root/{lang}/system/refresh"
    this.rootSystemService.refresh(this.lang).subscribe();
    this.message1 = "restart_server";

    // Set to reload the web page after 20 seconds
    let time = 20;
    setInterval(() =>
    {
      this.message2 = "reload_part1";
      this.t = time.toString();
      this.message3 = "reload_part2";
      time = time -1;
      if(time == 0)
      {
        location.reload();
      }
    }, 1000)
  }

  // close SpringBoot applicationContext
  close()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // POST
    // api = "/root/{lang}/system/close"
    this.rootSystemService.close(this.lang).subscribe();
    this.message1 = "close_server";

    // Set to reload the web page after 20 seconds
    let time = 20;
    setInterval(() =>
    {
      this.message2 = "reload_part1";
      this.t = time.toString();
      this.message3 = "reload_part2";
      time = time -1;
      if(time == 0)
      {
        location.reload();
      }
    }, 1000)
  }

  // exit SpringBoot Application
  exit()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // POST
    // api = "/root/{lang}/system/exit"
    this.rootSystemService.exit(this.lang).subscribe();
    this.message1 = "exit_server";

    // Set to reload the web page after 20 seconds
    let time = 20;
    setInterval(() =>
    {
      this.message2 = "reload_part1";
      this.t = time.toString();
      this.message3 = "reload_part2";
      time = time -1;
      if(time == 0)
      {
        location.reload();
      }
    }, 1000)
  }

  /****************************** Pop-up Window ******************************/
  // Open pop-up window
  openPop()
  {
    // set default message
    this.message1 = "PLEASE_WAITING";
    this.message2 = "";
    // Close Pop-up window
    // Set CSS display: block
    window.document.getElementById("messageView")!.className = "modal-wrapper-show";
  }
}
