import { AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig             } from "../../../config/webSiteConfig";
import { Account                   } from "../../../model/account";
import { ItemInProcess             } from "../../../model/itemInProcess";
import { StoreHouse                } from "../../../model/storehouse";
import { ExporterStoreHouseService } from "../exporterStoreHouseService/exporterStoreHouseService";
import { ExporterExportItemService } from "./exporterExportItemService";
import { AccountLocalService       } from "../../../tools/accountLocalService";

@Component({
  selector: 'exporterExportItemView',
  templateUrl: './exporterExportItemView.html'
})

export class ExporterExportItemView implements OnInit, AfterViewInit, OnDestroy
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  // StoreHouse List
  storeHouseList:StoreHouse[] = [];

  // Used to store the serial number waiting to search
  serialNumber:string = "";

  // Used to store temporary search results
  item:ItemInProcess = new ItemInProcess();

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private storeHouseService:ExporterStoreHouseService, private exporterExportItemService:ExporterExportItemService, private accountLocalService:AccountLocalService)
  { }

  // Initialization page
  // Check role permissions
  // Set default language settings
  // Get the list of storehouses
  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get account role
    this.currentAccountRole = account!.role;

    // Check if the role is exporter or not
    if(this.currentAccountRole != this.config.accountRole.exporter)
    {
      this.router.navigateByUrl("error");
      return;
    }

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "exporter/export/item");

    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }

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
      // api = "/export/{lang}/storehouse/list/{page}"
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

  // After initializing the page, add the listener.
  ngAfterViewInit()
  {
    // clear listener
    if(this.enterListener != null || this.enterListener != undefined)
    {
      document.removeEventListener("keypress", this.enterListener);
    }

    // add listener
    document.addEventListener("keypress", this.enterListener);
  }

  // When the page is destroyed, clear the listener
  ngOnDestroy(): void
  {
    console.log("call exportItem Destroy");
    if(this.enterListener != null || this.enterListener != undefined)
    {
      document.removeEventListener("keypress", this.enterListener);
    }
  }

  /******************************** main Page ********************************/
  // Go back to home page.
  goBack()
  {
    this.router.navigateByUrl("exporter/home");
  }

  // Use the serial number to search for the item.
  searchItem()
  {
    // Reset search results
    this.item = new ItemInProcess();

    // Display pop-up window
    this.openPop();

    // remove front and end space;
    this.serialNumber.trim();

    // check if serial number is empty or not
    if(this.serialNumber == null || this.serialNumber == '')
    {
      // Use the pop-up window to show the error message
      this.resPop('Serial_Is_Empty', null);
      return;
    }

    // call backend
    // GET
    // api = "/exporter/{lang}/item/get/by/{serialNumber}
    this.exporterExportItemService.getItem(this.serialNumber, this.lang).subscribe(
        data=>
        {
          // Search success
          if(data != null)
          {
            // The return is a simple object, not ItemInProcess type
            // Convert the object to ItemInProcess instance
            Object.assign(this.item, data);
            // Close Pop-up window
            this.closePop();
          }
          // Search failed
          else
          {
            // Use the pop-up window to show the error message
            this.resPop('CANNOT_FIND_ITEM', null);
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        })
  }

  // export the current item.
  exportItem()
  {
    // Display pop-up window
    this.openPop();

    // format input fields:
    // remove front and end space;
    this.item.format();

    // check input item is correct or not
    // check itemName, serialNumber, orderNumber, and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      this.resPop(check + " Is Empty", null);
      return;
    }

    // call backend
    // PUT
    // api = "/exporter/{lang}/item/export/{serialNumber}
    this.exporterExportItemService.exportItem(this.item, this.lang).subscribe(
        data =>
        {
          // Export item failed
          if ((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Export item success
          else
          {
            // Use the pop-up window to show the return message
            // The page will automatically reload
            this.resPop(data, "");
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
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
          () =>
          {
            this.serialNumber = "";
            this.item = new ItemInProcess();
            this.closePop();
          }, 3000);
    }
    // Show message content only
    else
    {
      // Show top close button
      window.document.getElementById("popCloseButton")!.style.cssText = "display:block";
    }
  }

  /********************************* Listener ********************************/
  enterListener = (event: KeyboardEvent) =>
  {
    // Determine whether it is the Enter key
    if (event.keyCode == 13)
    {
      // When the serial number is not empty, but the item serial number is empty.
      // It means the serial number has just been entered but has not been searched.
      if (this.serialNumber.trim() != "" && this.item.serialNumber == "")
      {
        this.searchItem();
      }
      // When both the serial number and item serial number are not empty.
      // It means it has been searched, but has not submitted it.
      if (this.serialNumber.trim() != "" && this.item.serialNumber != "")
      {
        this.exportItem();
      }
    }
  }

}
