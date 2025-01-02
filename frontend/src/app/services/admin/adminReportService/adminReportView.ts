import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import * as XLSX from 'xlsx';

import { WebSiteConfig          } from "../../../config/webSiteConfig";
import { Account                } from "../../../model/account";
import { ItemInProcess          } from "../../../model/itemInProcess";
import { StoreHouse             } from "../../../model/storehouse";
import { AdminReportService     } from "./adminReportService";
import { AdminStoreHouseService } from "../adminStoreHouseService/adminStoreHouseService";
import { AccountLocalService    } from "../../../tools/accountLocalService";

@Component({
  selector: 'adminReportView',
  templateUrl: './adminReportView.html'
})
export class AdminReportView implements OnInit
{
    // current account's role
    currentAccountRole:string = "";

    // Web page language settings
    lang:string = "en-US"

    // warning, error, response message
    message:string="";

    // StoreHouse List
    storeHouseList: StoreHouse[] = [];

    // page number of search results
    // there are 8 records per page.
    page: number = 1;

    // Report Setting
    startTime: string = "";
    endTime: string = "";
    clientName: string = "";
    storeHouse: string = "all";

    // report list
    itemList: ItemInProcess[] = []

    /*************************** Initialization page ***************************/
    constructor(private router: Router, public config: WebSiteConfig, private storeHouseService:AdminStoreHouseService, private reportService: AdminReportService, private accountLocalService:AccountLocalService)
    {}

    // Initialization page
    // Check role permissions
    // Set default language settings
    // The default report result is empty
    // The default start and end times are today.
    // The default StoreHouse is all
    // page = 1
    ngOnInit(): void
    {
        // Get the account instance from the local storage
        let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

        // Get account role
        this.currentAccountRole = account!.role;

        // Check if the role is admin or not
        if(this.currentAccountRole != this.config.accountRole.admin)
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

        // Get today's date
        let date = new Date();
        let year = date.getFullYear();
        let mouth = date.getMonth() + 1;
        let day = date.getDate();

        // Format the date as "yyyy-mm-dd"
        if (mouth < 10)
        {
            this.endTime = year + "-0" + mouth;
        }
        else
        {
            this.endTime = year + "-" + mouth;
        }
        if (day < 10)
        {
            this.endTime = this.endTime + "-0" + day;
        }
        else
        {
            this.endTime = this.endTime + "-" + day;
        }

        // Set startTime =  endTime.
        this.startTime = this.endTime;

        // Try to get the storehouse list from the local storage
        let storehouseList = this.accountLocalService.getCash(this.config.localSessionCash);
        if (storehouseList != null || storehouseList != undefined)
        {
            // convert JSON to StoreHouse[]
            this.storeHouseList = JSON.parse(storehouseList);
        }
        // If the storehouse list is empty, try to get the storehouse list
        if (this.storeHouseList.length == 0)
        {
            // Display pop-up window
            this.openPop();

            // call backend
            // GET
            // api = "/admin/{lang}/storehouse/list/{page}"
            this.storeHouseService.getAllStoreHouse(this.lang).subscribe(
                data =>
                {
                    // update storehouse list
                    this.storeHouseList = data;
                    // Save storehouse list in localstorage
                    this.accountLocalService.setCash(this.config.localSessionCash, JSON.stringify(data));

                    // When there is no store house record in the database.
                    if(this.storeHouseList.length <= 0)
                    {
                        // Use the pop-up window to show the return message
                        this.resPop("No StoreHouse Found", null);
                    }
                    else
                    {
                        // Close the pop-up window
                        this.closePop();
                    }
                },
                error =>
                {
                    // When an exception occurs, display the error in the pop-up window
                    this.resPop(error.message, null);
                })
        }
    }

    /******************************** main Page ********************************/
    // Go back to home page.
    goBack()
    {
        this.router.navigateByUrl("admin/home");
    }

    // Go to the previous page
    prePage()
    {
        // Display pop-up window
        this.openPop();

        // When the page is the first page.
        // Stay on the current page.
        if (this.page == 1)
        {
            this.resPop('ALREADY_FIRST_PAGE', null);
            return;
        }

        // Try to get the previous page of data
        // GET
        // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/{page}"
        this.reportService.getReport(this.clientName, this.storeHouse, this.startTime, this.endTime, this.page, this.lang).subscribe(
            data =>
            {
                // If the data is obtained successfully, update itemList and set page = page - 1;
                this.itemList = data;
                this.page = this.page - 1;

                // Close Pop-up window
                this.closePop();
            },
            error =>
            {
                // If fetching data fails, an error is displayed.
                this.resPop(error.message, null);
            })
    }

    // Go to the Next page
    nextPage()
    {
        // Display pop-up window
        this.openPop();

        // Try to get the previous page of data
        // GET
        // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/{page}"
        this.reportService.getReport(this.clientName, this.storeHouse, this.startTime, this.endTime, this.page + 1, this.lang).subscribe(
            data =>
            {
                // If the array.length > 0， then the data is obtained successfully.
                // update itemList and set page = page + 1;
                if ((data as ItemInProcess[]).length > 0)
                {
                    this.page = this.page + 1;
                    this.itemList = data;
                    // Close Pop-up window
                    this.closePop();
                }
                else
                {
                    // If the array.length = 0, that means the page is the last page.
                    // Stay on the current page.
                    this.resPop('IS_LAST_PAGE', null)
                }
            },
            error =>
            {
                // If fetching data fails, an error is displayed.
                this.resPop(error.message, null);
            })
    }

    /******************************* get report ********************************/
    // Open the pop-up window of the Report Setting
    showReportView()
    {
        // Display Pop-up window
        // Set CSS display: block
        window.document.getElementById("reportView")!.className = "modal-wrapper-show";
    }

    // Close the pop-up window of the creation account
    closeReportView()
    {
        // Close Pop-up window
        // Set CSS display: none
        window.document.getElementById("reportView")!.className = "modal-wrapper";
    }

    // Use the data in the report setting view to search
    getReport()
    {
        // Display pop-up window
        this.openPop();

        // Remove the color of the input box border
        window.document.getElementById("clientName" )!.style.borderColor = "";

        // remove front and end space;
        this.clientName = this.clientName.trim();

        // Check if clientName is empty or not
        if (this.clientName == null || this.clientName == undefined || this.clientName == '')
        {
            // If the input content is empty, turn the input box border into red.
            window.document.getElementById("clientName" )!.style.borderColor = "red";
            // Use the pop-up window to show the error message
            this.resPop('CLIENT_NAME_EMPTY', null);
            return;
        }

        // call backend
        // GET
        // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/{page}"
        this.reportService.getReport(this.clientName, this.storeHouse, this.startTime, this.endTime, this.page, this.lang).subscribe(
            data =>
            {
                // If fetching data success
                // update itemList and set page = 1
                this.itemList = data;
                this.page = 1;
                // close pop-up window
                this.closePop();
                // close report setting View
                window.document.getElementById("reportView")!.className = "modal-wrapper";
            },
            error =>
            {
                // If fetching data fails, an error is displayed.
                this.resPop(error.message, null);
            })
    }


    // Use the data in the report setting view to search
    // All data will be returned at once.
    // The browser will download the generated Excel sheet.
    getExcel()
    {
        // Display pop-up window
        this.openPop();

        // Remove the color of the input box border
        window.document.getElementById("clientName" )!.style.borderColor = "";

        // remove front and end space;
        this.clientName = this.clientName.trim();

        // Check if clientName is empty or not
        if (this.clientName == null || this.clientName == undefined || this.clientName == '')
        {
            // If the input content is empty, turn the input box border into red.
            window.document.getElementById("clientName" )!.style.borderColor = "red";
            // Use the pop-up window to show the error message
            this.resPop('CLIENT_NAME_EMPTY', null);
            return;
        }

        // call backend
        // GET
        // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/toJson"
        this.reportService.getReportJson(this.clientName, this.storeHouse, this.startTime, this.endTime, this.lang).subscribe(
            data =>
            {
                // Convert itemInProcss to Object
                let objectList: Object[] = []
                data.forEach(row =>
                {
                    // Remove unnecessary data
                    let object: object ={
                            'Item Name': row.itemName,
                            'Serial Number': row.serialNumber,
                            'Order Number': row.orderNumber,
                            'Price': row.price,
                            'Store House': row.storeHouse,
                            'Import Time': row.importTime,
                            'Status': row.state };
                    objectList.push(object);
                });

                // Create an Excel table
                const worksheet = XLSX.utils.json_to_sheet(objectList);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

                // Writing data to a file
                // The file name is client name + timestamp
                XLSX.writeFile(workbook, this.clientName + "_" + new Date().getTime() + '.xlsx');
                // close pop-up window
                this.closePop();
            },
            error =>
            {
                // If fetching data fails, an error is displayed.
                this.resPop(error.message, null);
            })
    }

    /****************************** Pop-up Window ******************************/
    // Open pop-up window
    openPop()
    {
        // set default message
        this.message = "PLEASE_WAITING";

        // Close Pop-up window
        // Set CSS display: block
        window.document.getElementById("messageView")!.className = "modal-wrapper-show";
    }

    // Close pop-up window
    closePop()
    {
        // Close Pop-up window
        // Set CSS display: none
        window.document.getElementById("messageView"   )!.className     = "modal-wrapper";
        // Hide bottom process bar
        window.document.getElementById("popProcessBar" )!.style.cssText = "display:none";
        // Hide top close button
        window.document.getElementById("popCloseButton")!.style.cssText = "display:none";
        // Clear message content
        this.message = "";
    }

    // Set Pop-up window
    resPop(res:string, targetURL:any)
    {
        // Set message
        this.message = res;

        // The webpage needs to jump or reload
        if(targetURL != null)
        {
            // Show bottom process bar
            window.document.getElementById("popProcessBar")!.style.cssText = "display:block";
            setTimeout(
                function ()
                {
                    // Reload current page
                    if(targetURL == '')
                    {
                        location.reload();
                    }
                    // Jump to target URL
                    else
                    {
                        location.replace(targetURL);
                        location.reload();
                    }
                }, 3000);
        }
        // Show message content only
        else
        {
            // Show top close button
            window.document.getElementById("popCloseButton")!.style.cssText = "display:block";
        }
    }
}
