import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";

import { WebSiteConfig             } from "../../../config/webSiteConfig";
import { Account                   } from "../../../model/account";
import { ItemInProcess             } from "../../../model/itemInProcess";
import { StoreHouse                } from "../../../model/storehouse";
import { AccountLocalService       } from "../../../tools/accountLocalService";
import { ImporterImportItemService } from "./importerImportItemService";
import { ImporterStoreHouseService } from "../ImporterStoreHouseService/importerStoreHouseService";

@Component({
  selector: 'importerImportItemView',
  templateUrl: './importerImportItemView.html'
})

export class ImporterImportItemView implements OnInit, AfterViewInit, OnDestroy
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
  orderNumber:string = "";

  // Used to store temporary search results
  itemList:ItemInProcess[] = [];

  currentIndex:number = -1;

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private accountLocalService:AccountLocalService, private itemService:ImporterImportItemService, private storeHouseService:ImporterStoreHouseService)
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
    if(this.currentAccountRole != this.config.accountRole.importer)
    {
      this.router.navigateByUrl("error");
      return;
    }
    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "importer/import/item");

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
      document.removeEventListener("keydown", this.enterListener);
    }

    // add listener
    document.addEventListener("keydown", this.enterListener);
  }

  // When the page is destroyed, clear the listener
  ngOnDestroy(): void
  {
    console.log("call exportItem Destroy");
    if(this.enterListener != null || this.enterListener != undefined)
    {
      document.removeEventListener("keydown", this.enterListener);
    }
  }

  /******************************** main Page ********************************/
  // Go back to home page.
  goBack()
  {
    this.router.navigateByUrl("importer/home");
  }

  // Get all items by order number
  searchOrder()
  {
    // Display pop-up window
    this.openPop();

    // remove front and end space;
    this.orderNumber = this.orderNumber.trim();

    // check if serial number is empty or not
    if(this.orderNumber == null || this.orderNumber == '')
    {
      this.resPop('Order_Is_Empty', null);
      return;
    }

    // call backend
    // GET
    // api = "/importer/{lang}/item/get/by/{orderNumber}"
    this.itemService.getItemList(this.orderNumber, this.lang).subscribe(
        data=>
        {
          // Search success
          if((data as ItemInProcess[]).length > 0)
          {
            // update itemList list
            this.itemList = data;
            // Close Pop-up window
            this.closePop();
          }
          else
          {
            // Set itemList to empty list.
            this.itemList = [];
            // Use the pop-up window to show the error message
            this.resPop("CANNOT_FIND_ITEMS", null);
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        })
  }

  // remove item from itemList
  removeItem(i:number)
  {
    this.itemList.splice(i, 1);
  }

  // import item
  importItems()
  {
    // Display pop-up window
    this.openPop();

    // Temporarily store a list of items to import
    let importList:ItemInProcess[] = [];

    // Delete items with empty serial numbers
    let i = 0;
    while(i < this.itemList.length)
    {
      // If the serial number is not empty, add item to the importList
      if(this.itemList[i].serialNumber != null && this.itemList[i].serialNumber != undefined && this.itemList[i].serialNumber.trim() != "")
      {
        importList.push(this.itemList[i]);
      }
      i++;
    }

    // When the item list is empty
    if( importList.length <= 0)
    {
      // Use the pop-up window to show the warning message
      this.resPop("Import_Nothing", null);
      return;
    }

    // call backend
    // PUT
    // api = "/importer/{lang}/item/import/{orderNumber}"
    this.itemService.importItems(this.orderNumber, importList, this.lang).subscribe(
        data=>
        {
          // import items failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // import items success
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
            this.orderNumber = "";
            this.itemList = [];
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
      if (this.orderNumber.trim() != "" && this.itemList.length == 0)
      {
        this.searchOrder();
      }
      // When both the serial number and item serial number are not empty.
      // It means it has been searched, but has not submitted it.
      if (this.orderNumber.trim() != "" && this.itemList.length > 0)
      {
        this.importItems();
      }
    }
    // down
    if (event.keyCode == 40 && this.orderNumber.trim() != "" && this.itemList.length > 0)
    {
      // When currentIndex < 0,
      // it means that the item's serial number input box has not been focused yet.
      if(this.currentIndex < 0)
      {
        this.currentIndex = 0;
      }
      else
      {
        this.currentIndex = this.currentIndex + 1 < this.itemList.length ? this.currentIndex + 1 : 0;
      }

      // Focus on the serial number input box
      document.getElementById("item" + this.currentIndex)!.focus();
      // Scroll down
      document.getElementById("itemCard" + this.currentIndex)!.scrollIntoView({behavior: "smooth"});
    }
  }
}
