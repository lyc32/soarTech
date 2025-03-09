import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig         } from "../../../config/webSiteConfig";
import { Account               } from "../../../model/account";
import { ItemInProcess         } from "../../../model/itemInProcess";
import { StoreHouse            } from "../../../model/storehouse";
import { RootItemService       } from "./rootItemService";
import { RootStoreHouseService } from "../rootStoreHouseService/rootStoreHouseService";
import { AccountLocalService   } from "../../../tools/accountLocalService";

@Component({
  selector: 'rootItemView',
  templateUrl: './rootItemView.html'
})
export class RootItemView implements OnInit
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
  filterOrderNumber :string = "-";
  filterState       :string = "all";
  filterImporterName:string = "-";
  filterSerialNumber:string = "-";
  filterStoreHouse  :string = "all";
  filterPosition    :string = "-";
  filterExporterName:string = "-";
  filterCarrier     :string = "-";
  filterTrackNumber :string = "-";
  filterViewState   :string = "all";
  table:string = "inProcess";

  // Used to store temporary search results
  itemList:ItemInProcess[] = [];

  // Used to store temporary item instance.
  item:ItemInProcess = new ItemInProcess();

  // Used to store temporary serial number.
  currentSerialNumber:string = "";

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private accountLocalService:AccountLocalService, private itemService:RootItemService, private storeHouseService:RootStoreHouseService)
  { }

  // Initialization page
  // Check role permissions
  // Set default language settings
  // Get the default search result
  // The default search criteria are :
  // itemName, orderNumber, serialNumber, importerName, exporterName, position, carrier, and trackNumber are empty.
  // storehouse and state are all.
  // page = 1
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
      // api = "/root/{lang}/storehouse/list/{page}"
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
    // api = "/root/{lang}/item/{table}/{page}"
    this.itemService.getItemList(this.table, this.filterItemName, this.filterOrderNumber, this.filterSerialNumber, this.filterImporterName, this.filterExporterName, this.filterStoreHouse, this.filterPosition, this.filterCarrier, this.filterTrackNumber, this.filterState, this.page, this.lang).subscribe(
        data=>
        {
          // Close the pop-up window after successfully obtaining data from backend
          this.itemList = data;
          this.closePop();
        },
        error =>
        {
          // When an exception occurs, display the error in the pop-up window
          this.resPop(error.message, null);
        })
  }

  /******************************** main Page ********************************/
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
    // api = "/root/{lang}/item/{table}/{page}"
    this.itemService.getItemList(this.table, this.filterItemName, this.filterOrderNumber, this.filterSerialNumber, this.filterImporterName, this.filterExporterName, this.filterStoreHouse, this.filterPosition, this.filterCarrier, this.filterTrackNumber, this.filterState, this.page-1, this.lang).subscribe(
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
    // api = "/root/{lang}/item/{table}/{page}"
    this.itemService.getItemList(this.table, this.filterItemName, this.filterOrderNumber, this.filterSerialNumber, this.filterImporterName, this.filterExporterName, this.filterStoreHouse, this.filterPosition, this.filterCarrier, this.filterTrackNumber, this.filterState, this.page + 1, this.lang).subscribe(
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

  /******************************* Search Item *******************************/
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
    (window.document.getElementById("filterItemName"    ) as HTMLInputElement ).value = this.filterItemName;
    (window.document.getElementById("filterOrderNumber" ) as HTMLInputElement ).value = this.filterOrderNumber;
    (window.document.getElementById("filterState"       ) as HTMLSelectElement).value = this.filterState;
    (window.document.getElementById("filterImporterName") as HTMLInputElement ).value = this.filterImporterName;
    (window.document.getElementById("filterSerialNumber") as HTMLInputElement ).value = this.filterSerialNumber;
    (window.document.getElementById("filterStoreHouse"  ) as HTMLSelectElement).value = this.filterStoreHouse;
    (window.document.getElementById("filterPosition"    ) as HTMLInputElement ).value = this.filterPosition;
    (window.document.getElementById("filterExporterName") as HTMLInputElement ).value = this.filterExporterName;
    (window.document.getElementById("filterCarrier"     ) as HTMLInputElement ).value = this.filterCarrier;
    (window.document.getElementById("filterTrackNumber" ) as HTMLInputElement ).value = this.filterTrackNumber;

    // Reset the filter window mode
    this.filterViewState = this.filterState;

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("filterView")!.className = "modal-wrapper";
  }

  // Set the table to search
  filterSearchTable()
  {
    // Uncheck to search item_in_process table
    // Check to search item_in_history table
    if((window.document.getElementById("type") as HTMLInputElement).checked == true)
    {
      (window.document.getElementById("filterState"       ) as HTMLSelectElement).value = this.config.itemState.exported;
    }
  }

  // Search item
  setFilter()
  {
    // Display pop-up window
    this.openPop();

    // Default to search item_in_process table
    let table = "inProcess";
    // Check to search item_in_history table
    if((window.document.getElementById("type") as HTMLInputElement).checked == true)
    {
      table = "inHistory"
    }

    // Temporary storage search conditions
    // The input data in the filter is one-way binding,
    // If the search fails, the page data will not be changed
    let itemName     = (window.document.getElementById("filterItemName"    ) as HTMLInputElement ).value.trim();
    let orderNumber  = (window.document.getElementById("filterOrderNumber" ) as HTMLInputElement ).value.trim();
    let state        = (window.document.getElementById("filterState"       ) as HTMLSelectElement).value.trim();
    let importerName = (window.document.getElementById("filterImporterName") as HTMLInputElement ).value.trim();
    let serialNumber = (window.document.getElementById("filterSerialNumber") as HTMLInputElement ).value.trim();
    let storeHouse   = (window.document.getElementById("filterStoreHouse"  ) as HTMLSelectElement).value.trim();
    let position     = (window.document.getElementById("filterPosition"    ) as HTMLInputElement ).value.trim();
    let exporterName = (window.document.getElementById("filterExporterName") as HTMLInputElement ).value.trim();
    let carrier      = (window.document.getElementById("filterCarrier"     ) as HTMLInputElement ).value.trim();
    let trackNumber  = (window.document.getElementById("filterTrackNumber" ) as HTMLInputElement ).value.trim();

    // The backend API does not receive an empty string.
    // Use "-" to represent an empty string.
    itemName     = itemName     == null || itemName     == "" ? '-' : itemName     ;
    orderNumber  = orderNumber  == null || orderNumber  == "" ? '-' : orderNumber  ;
    state        = state        == null || state        == "" ? '-' : state        ;
    importerName = importerName == null || importerName == "" ? '-' : importerName ;
    serialNumber = serialNumber == null || serialNumber == "" ? '-' : serialNumber ;
    storeHouse   = storeHouse   == null || storeHouse   == "" ? '-' : storeHouse   ;
    position     = position     == null || position     == "" ? '-' : position     ;
    exporterName = exporterName == null || exporterName == "" ? '-' : exporterName ;
    carrier      = carrier      == null || carrier      == "" ? '-' : carrier      ;
    trackNumber  = trackNumber  == null || trackNumber  == "" ? '-' : trackNumber  ;

    // If the search mode is "initialize", the following fields are empty
    if(this.filterViewState == this.config.itemState.initialize)
    {
      importerName = "-";
      serialNumber = "-";
      position     = "-";
      exporterName = "-";
      carrier      = "-";
      trackNumber  = "-";
    }

    // If the search mode is "imported", the following fields are empty
    if(this.filterViewState == this.config.itemState.imported)
    {
      exporterName = "-";
      carrier      = "-";
      trackNumber  = "-";
    }

    // call backend
    // GET
    // api = "/admin/{lang}/item/{table}/{page}"
    this.itemService.getItemList(table, itemName, orderNumber, serialNumber, importerName, exporterName, storeHouse, position, carrier, trackNumber, state, 1, this.lang).subscribe(
        data=>
        {
          // If fetching data success
          // Update the search conditions to the webpage, reset the page number to 1
          this.itemList = data;
          this.page = 1;

          // Update the current filter values
          this.filterItemName    = itemName     ;
          this.filterOrderNumber = orderNumber  ;
          this.filterState       = state        ;
          this.filterImporterName= importerName ;
          this.filterSerialNumber= serialNumber ;
          this.filterStoreHouse  = storeHouse   ;
          this.filterPosition    = position     ;
          this.filterExporterName= exporterName ;
          this.filterCarrier     = carrier      ;
          this.filterTrackNumber = trackNumber  ;
          this.filterViewState = this.filterState;
          this.table = table;

          // Update the filter input box values
          (window.document.getElementById("filterItemName"    ) as HTMLInputElement ).value = this.filterItemName;
          (window.document.getElementById("filterOrderNumber" ) as HTMLInputElement ).value = this.filterOrderNumber;
          (window.document.getElementById("filterImporterName") as HTMLInputElement ).value = this.filterImporterName;
          (window.document.getElementById("filterSerialNumber") as HTMLInputElement ).value = this.filterSerialNumber;
          (window.document.getElementById("filterPosition"    ) as HTMLInputElement ).value = this.filterPosition;
          (window.document.getElementById("filterExporterName") as HTMLInputElement ).value = this.filterExporterName;
          (window.document.getElementById("filterCarrier"     ) as HTMLInputElement ).value = this.filterCarrier;
          (window.document.getElementById("filterTrackNumber" ) as HTMLInputElement ).value = this.filterTrackNumber;
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

  /******************************* create Item *******************************/
  // Open the pop-up window of the creation item
  showCreateItemView()
  {
    // The default storehouse is the first storehouse in the storeHouseList.
    if(this.storeHouseList.length > 0)
    {
      this.item.storeHouse = this.storeHouseList[0].name;
    }
    // Set item status to imported.
    this.item.state = this.config.itemState.imported;

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("createItemView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the creation item
  closeCreateItemView()
  {
    // Reset temporary account instance
    this.item = new ItemInProcess();

    // Remove the color of the input box border
    window.document.getElementById("newItemName"    )!.style.borderColor = "";
    window.document.getElementById("newOrderNumber" )!.style.borderColor = "";
    window.document.getElementById("newSerialNumber")!.style.borderColor = "";
    window.document.getElementById("newStoreHouse"  )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("createItemView")!.className = "modal-wrapper";
  }

  // When the item status is modified
  changeStatus()
  {
    // If the item is in the initialization state, the following fields must be empty
    if(this.item.state == this.config.itemState.initialize)
    {
      this.item.serialNumber = '';
      this.item.position = '';
      this.item.carrier = '';
      this.item.trackNumber = '';
      this.item.importerName = '';
      this.item.exporterName = '';
    }

    // If the item is in the imported state, the following fields must be empty
    if(this.item.state == this.config.itemState.imported)
    {
      this.item.carrier = '';
      this.item.trackNumber = '';
      this.item.exporterName = '';
    }
  }

  // save item to item_in_process table
  saveItemInProcess()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newItemName"    )!.style.borderColor = "";
    window.document.getElementById("newOrderNumber" )!.style.borderColor = "";
    window.document.getElementById("newSerialNumber")!.style.borderColor = "";
    window.document.getElementById("newStoreHouse"  )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // If the order number is empty, the serial number is used as the order number
    if(this.item.orderNumber == null || this.item.orderNumber == '')
    {
      this.item.orderNumber = this.item.serialNumber;
    }

    if(this.item.state != this.config.itemState.initialize && (this.item.importerName == null || this.item.importerName == ''))
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("newImporter")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("IMPORTER_NAME_EMPTY",null);
      return;
    }

    // check input item is correct or not
    // check itemName, orderNumber, serialNumber and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("new" + check)!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    if(this.item.state == this.config.itemState.exported && (this.item.exporterName == null || this.item.exporterName == ''))
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("newExporter")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("EXPORTER_NAME_EMPTY",null);
      return;
    }

    // call backend
    // POST
    // api = "/root/{lang}/item/create/{table}"
    this.itemService.saveItem("inProcess", this.item, this.lang).subscribe(
        data =>
        {
          // Create item failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Create item success
          else
          {
            // Use the pop-up window to show the return message
            // The page will automatically reload
            this.resPop(data, 1);
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        })
  }

  // save item to item_in_history table
  saveItemInHistory()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newItemName"    )!.style.borderColor = "";
    window.document.getElementById("newOrderNumber" )!.style.borderColor = "";
    window.document.getElementById("newSerialNumber")!.style.borderColor = "";
    window.document.getElementById("newStoreHouse"  )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";
    window.document.getElementById("newImporter"    )!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // If the order number is empty, the serial number is used as the order number
    if(this.item.orderNumber == null || this.item.orderNumber == '')
    {
      this.item.orderNumber = this.item.serialNumber;
    }

    if(this.item.state != this.config.itemState.exported)
    {
      this.resPop("Archive Unfinished Item",null);
      return;
    }

    if(this.item.importerName == null || this.item.importerName == '')
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("newImporter")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("IMPORTER_NAME_EMPTY",null);
      return;
    }

    // check input item is correct or not
    // check itemName, orderNumber, serialNumber and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("new" + check)!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    if(this.item.exporterName == null || this.item.exporterName == '')
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("newExporter")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("EXPORTER_NAME_EMPTY",null);
      return;
    }

    // call backend
    // POST
    // api = "/root/{lang}/item/create/{table}"
    this.itemService.saveItem("inHistory", this.item, this.lang).subscribe(
        data =>
        {
          // Create item failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Create item success
          else
          {
            // Use the pop-up window to show the return message
            // The page will automatically reload
            this.resPop(data, 1);
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        })
  }

  /******************************* Update Item *******************************/
  // update item
  updateItem(index:number)
  {
    // Display pop-up window
    this.openPop();

    Object.assign(this.item, this.itemList[index]);

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // check input item is correct or not
    // check itemName, orderNumber, serialNumber and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    if(this.table == "inHistory" && this.item.state != this.config.itemState.exported)
    {
      this.resPop("Archive Unfinished Item",null);
      return;
    }

    check = this.itemCheck();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/item/update/{table}"
    this.itemService.updateItem(this.table, this.itemList[index], this.lang).subscribe(
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

  /******************************* delete Item *******************************/
  // Open pop-up window of the delete confirmation
  showDeleteItemView(index:number)
  {
    this.item = this.itemList[index];
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmDeleteView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the delete confirmation
  closeDeleteItemView()
  {
    this.item = new ItemInProcess();
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("confirmDeleteView")!.className = "modal-wrapper";
  }

  // delete item
  deleteItem()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/root/{lang}/item/delete/{table}/id"
    this.itemService.deleteItem(this.table, this.item.id, this.lang).subscribe(
      data =>
      {
        // delete item failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // delete item success
        else
        {
          // Use the pop-up window to show the return message
          // The page will automatically reload
          this.resPop(data, 2);
        }
      },
      error =>
      {
        // Request sent failed
        // Use the pop-up window to show the error message
        this.resPop(error.message, null);
      })
  }

  /******************************* Archive Item ********************************/
  // Open the pop-up window of the archive item
  showArchiveItemView(index:number)
  {
    Object.assign(this.item, this.itemList[index]);
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmArchiveView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the archive item
  closeArchiveItemView()
  {
    this.item = new ItemInProcess();
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("confirmArchiveView")!.className = "modal-wrapper";
  }

  // move item from item_in_process table to item_in_history table
  archiveItem()
  {
    // Display pop-up window
    this.openPop();

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // check input item is correct or not
    // check itemName, orderNumber, serialNumber and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    if(this.item.state != this.config.itemState.exported)
    {
      this.resPop("Archive Unfinished Item",null);
      return;
    }

    check = this.itemCheck();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/item/archive/{table}"
    this.itemService.archiveItem(this.item, this.lang).subscribe(
      data =>
      {
        // Archive item failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Archive item success
        else
        {
          // Use the pop-up window to show the return message
          // The page will automatically reload
          this.resPop(data, 3);
        }
      },
      error =>
      {
        // Request sent failed
        // Use the pop-up window to show the error message
        this.resPop(error.message, null);
      })
  }

  /****************************** Unarchive Item *******************************/
  // Open the pop-up window of the unarchive item
  showUnarchiveItemView(index:number)
  {
    Object.assign(this.item, this.itemList[index]);
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmUnarchiveView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the unarchive item
  closeUnarchiveItemView()
  {
    this.item = new ItemInProcess();
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("confirmUnarchiveView")!.className = "modal-wrapper";
  }

  // move item from item_in_history table to item_in_process table
  unarchiveItem()
  {
    // Display pop-up window
    this.openPop();

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // check input item is correct or not
    // check itemName, orderNumber, serialNumber and storeHouse are null or empty string
    let check = this.item.check();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    check = this.itemCheck();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/item/unarchive/{table}"
    this.itemService.unarchiveItem(this.item, this.lang).subscribe(
      data =>
      {
        // Unarchive item failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Unarchive item success
        else
        {
          // Use the pop-up window to show the return message
          // The page will automatically reload
          this.resPop(data, 4);
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
  resPop(res:string, model:any)
  {
    // Set message
    this.message = res;

    // The webpage needs to jump or reload
    if(model != null)
    {
      // Show bottom process bar
      window.document.getElementById("popProcessBar")!.style.cssText = "display:block";
      setTimeout(
          () =>
          {
            if(model == 1)
            {
              this.closeCreateItemView()
            }
            if(model == 2)
            {
              this.closeDeleteItemView()
            }
            if(model == 3)
            {
              this.closeArchiveItemView()
            }
            if(model == 4)
            {
              this.closeUnarchiveItemView()
            }
            this.setFilter();
          }, 3000);
    }
    // Show message content only
    else
    {
      // Show top close button
      window.document.getElementById("popCloseButton")!.style.cssText = "display:block";
    }
  }

  private itemCheck():any
  {
    if(this.item.state == this.config.itemState.initialize)
    {
      if(this.item.importerName != null && this.item.importerName != '')
      {
        return "inti item importer not empty";
      }
      if(this.item.importTime != null && this.item.importTime != '')
      {
        return "inti item import time not empty";
      }
      if(this.item.serialNumber != null && this.item.serialNumber != '')
      {
        return "init item serial not empty";
      }
      if(this.item.position != null && this.item.position != '')
      {
        return "init item position not empty";
      }
      if(this.item.exporterName != null && this.item.exporterName != '')
      {
        return "init item exporter not empty";
      }
      if(this.item.exportTime != null && this.item.exportTime != '')
      {
        return "init item export time not empty";
      }
      if(this.item.carrier != null && this.item.carrier != '')
      {
        return "init item carrier not empty";
      }
      if(this.item.trackNumber != null && this.item.trackNumber != '')
      {
        return "init item track number not empty";
      }
    }

    if(this.item.state == this.config.itemState.imported)
    {
      if(this.item.importerName == null || this.item.importerName == '')
      {
        return "IMPORTER_NAME_EMPTY";
      }
      if(this.item.importTime == null || this.item.importTime == '')
      {
        return "IMPORT_TIME_EMPTY";
      }
      if(this.item.serialNumber == null || this.item.serialNumber == '')
      {
        return "SerialNumber Is Empty";
      }

      if(this.item.exporterName != null && this.item.exporterName != '')
      {
        return "import item exporter not empty";
      }
      if(this.item.exportTime != null && this.item.exportTime != '')
      {
        return "import item export time not empty";
      }
      if(this.item.carrier != null && this.item.carrier != '')
      {
        return "import item carrier not empty";
      }
      if(this.item.trackNumber != null && this.item.trackNumber != '')
      {
        return "import item track number not empty";
      }
    }

    if(this.item.state == this.config.itemState.exported)
    {
      if(this.item.importerName == null || this.item.importerName == '')
      {
        return "IMPORTER_NAME_EMPTY";
      }
      if(this.item.importTime == null || this.item.importTime == '')
      {
        return "IMPORT_TIME_EMPTY";
      }
      if(this.item.serialNumber == null || this.item.serialNumber == '')
      {
        return "SerialNumber Is Empty";
      }
      if(this.item.exporterName == null || this.item.exporterName == '')
      {
        return "IMPORTER_NAME_EMPTY";
      }
      if(this.item.exportTime == null || this.item.exportTime == '')
      {
        return "IMPORT_TIME_EMPTY";
      }
    }
    return null;
  }
}
