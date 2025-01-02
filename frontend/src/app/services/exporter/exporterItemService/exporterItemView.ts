import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig             } from "../../../config/webSiteConfig";
import { Account                   } from "../../../model/account";
import { ItemInProcess             } from "../../../model/itemInProcess";
import { StoreHouse                } from "../../../model/storehouse";
import { ExporterItemService       } from "./exporterItemService";
import { ExporterStoreHouseService } from "../exporterStoreHouseService/exporterStoreHouseService";
import { AccountLocalService       } from "../../../tools/accountLocalService";

@Component({
  selector: 'exporterItemView',
  templateUrl: './exporterItemView.html'
})
export class ExporterItemView implements OnInit
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  // StoreHouse List
  storeHouseList:StoreHouse[] = [];

  // page number of search results
  // there are 5 records per page.
  page:number = 1;

  // filter setting
  filterItemName    :string = "-";
  filterSerialNumber:string = "-";
  filterStoreHouse  :string = "all";
  filterPosition    :string = "-";

  // Used to store temporary search results
  itemList:ItemInProcess[] = [];

  // Used to store temporary item instance.
  item:ItemInProcess = new ItemInProcess();

  // Used to store temporary serial number.
  currentSerialNumber:string = "";

  // Used to lock or unlock serial number modification.
  currentLock:boolean = true;

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private itemService:ExporterItemService, private storeHouseService:ExporterStoreHouseService, private accountLocalService:AccountLocalService)
  { }

  // Initialization page
  // Check role permissions
  // Set default language settings
  // Get the default search result
  // The default itemName, serialNumbr, and position are "-".
  // The default StoreHouse is all
  // page = 1
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

    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }

    // Display pop-up window
    this.openPop();

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
            if(this.storeHouseList.length == 0)
            {
              // Use the pop-up window to show the return message
              this.resPop("No StoreHouse Found", null);
              return;
            }
          },
          error =>
          {
            // When an exception occurs, display the error in the pop-up window
            this.resPop(error.message, null);
            return;
          })
    }

    // call backend
    // GET
    // api = "/exporter/{lang}/item/list/{page}"
    this.itemService.getItemList(this.filterItemName, this.filterSerialNumber, this.filterStoreHouse, this.filterPosition, this.page, this.lang).subscribe(
        data=>
        {
          this.itemList = data;
          // Close the pop-up window
          this.closePop();
        },
        error =>
        {
          // When an exception occurs, display the error in the pop-up window
          this.resPop(error.message, null);
        })
  }

  /******************************** main Page ********************************/
  // Go back to home page.
  goBack()
  {
    this.router.navigateByUrl("exporter/home");
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
    // api = "/exporter/{lang}/item/list/{page}"
    this.itemService.getItemList(this.filterItemName, this.filterSerialNumber, this.filterStoreHouse, this.filterPosition, this.page-1, this.lang).subscribe(
        data=>
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
    // api = "/exporter/{lang}/item/list/{page}"
    this.itemService.getItemList(this.filterItemName, this.filterSerialNumber, this.filterStoreHouse, this.filterPosition, this.page + 1, this.lang).subscribe(
        data=>
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

  /******************************* Search item ******************************/
  // Open the pop-up window of the filter (search)
  showFilterView()
  {
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("filterView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the filter (search)
  closeFilterView()
  {
    // The input data in the filter is one-way binding,
    // If there is no new search, the page data remains unchanged
    // Reset the filter input box values
    (window.document.getElementById("filterItemName"    ) as HTMLInputElement).value = this.filterItemName;
    (window.document.getElementById("filterSerialNumber") as HTMLInputElement).value = this.filterSerialNumber;
    (window.document.getElementById("filterPosition"    ) as HTMLInputElement).value = this.filterPosition;
    (window.document.getElementById("filterStoreHouse"  ) as HTMLInputElement).value = this.filterStoreHouse;

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("filterView")!.className = "modal-wrapper";
  }

  // Use the data in the filter view to search
  setFilter()
  {
    // Temporary storage search conditions
    // The input data in the filter is one-way binding,
    // If the search fails, the page data will not be changed
    let itemName     = (window.document.getElementById("filterItemName"    ) as HTMLInputElement).value.trim();
    let serialNumber = (window.document.getElementById("filterSerialNumber") as HTMLInputElement).value.trim();
    let storeHouse   = (window.document.getElementById("filterStoreHouse"  ) as HTMLInputElement).value.trim();
    let position     = (window.document.getElementById("filterPosition"    ) as HTMLInputElement).value.trim();

    // Display pop-up window
    this.openPop();

    // If the input value is empty, set the input to "-"
    itemName     = itemName     == null || itemName     == "" ? "-" : itemName    ;
    serialNumber = serialNumber == null || serialNumber == "" ? "-" : serialNumber;
    position     = position     == null || position     == "" ? "-" : position    ;

    // call backend
    // GET
    // api = "/exporter/{lang}/item/list/{page}"
    this.itemService.getItemList(itemName, serialNumber, storeHouse, position, 1, this.lang).subscribe(
        data=>
        {
          // If fetching data success
          // Update the search conditions to the webpage, reset the page number to 1
          this.itemList = data;
          this.page = 1;

          // Update the current filter values
          this.filterItemName     = itemName;
          this.filterSerialNumber = serialNumber
          this.filterPosition     = position;
          this.filterStoreHouse   = storeHouse;

          // Update the filter input box values
          (window.document.getElementById("filterItemName"    ) as HTMLInputElement).value = this.filterItemName;
          (window.document.getElementById("filterSerialNumber") as HTMLInputElement).value = this.filterSerialNumber;
          (window.document.getElementById("filterPosition"    ) as HTMLInputElement).value = this.filterPosition;
          (window.document.getElementById("filterStoreHouse"  ) as HTMLInputElement).value = this.filterStoreHouse;
          // close pop-up window
          this.closePop();
          // close filter View
          window.document.getElementById("filterView")!.className = "modal-wrapper";
        },
        error =>
        {
          // If fetching data fails, an error is displayed.
          this.resPop(error.message, null);
        })
  }

  /******************************* update Item *******************************/
  // Open the pop-up window to show full item information
  showItemDetailView(i:number)
  {
    // Use the index in accountList to find the item record.
    this.item = this.itemList[i];

    // Locking serial number
    this.currentLock = true;

    // Set current serial number
    this.currentSerialNumber = this.item.serialNumber;

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("itemDetailView")!.className = "modal-wrapper-show";
  }

  // CLose the pop-up window of the item information
  closeItemDetailView()
  {
    // Reset temporary item instance
    this.item = new ItemInProcess();

    // Locking serial number
    this.currentLock = true;

    // Reset current serial number
    this.currentSerialNumber = "";

    // Remove the color of the input box border
    window.document.getElementById("currentItemSerialNumber")!.style.borderColor = "";
    window.document.getElementById("currentItemStoreHouse"  )!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("itemDetailView")!.className = "modal-wrapper";
  }

  // Unlock Serial Number
  unlock()
  {
    this.currentLock = false;
  }

  // Lock Serial Number
  lock()
  {
    this.currentLock = true;
  }

  // Update item
  updateItem()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("currentItemSerialNumber")!.style.borderColor = "";
    window.document.getElementById("currentItemStoreHouse"  )!.style.borderColor = "";

    let newItem = new ItemInProcess();
    newItem.serialNumber = this.currentSerialNumber;
    newItem.price        = Number((window.document.getElementById("currentItemPrice"     ) as HTMLInputElement).value);
    newItem.storeHouse   = (window.document.getElementById("currentItemStoreHouse") as HTMLInputElement).value;
    newItem.position     = (window.document.getElementById("currentItemPosition"  ) as HTMLInputElement).value;
    newItem.id           = this.item.id;
    newItem.itemName     = this.item.itemName;
    newItem.orderNumber  = this.item.orderNumber;
    newItem.state        = this.item.state;

    // format input fields:
    // remove front and end space;
    newItem.format();

    // check input item is correct or not
    // check itemName, serialNumber, orderNumber, and storeHouse are null or empty string
    let check = newItem.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("currentItem" + check)!.style.borderColor = "red";
      this.resPop(check + " Is Empty", null);
      return;
    }

    // call backend
    // PUT
    // api = "/importer/{lang}/item/update"
    this.itemService.updateItem(newItem, this.lang).subscribe(
        data =>
        {
          // Update item failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Update item success
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
