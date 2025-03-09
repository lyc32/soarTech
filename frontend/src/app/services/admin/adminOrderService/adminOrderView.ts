import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig          } from "../../../config/webSiteConfig";
import { Account                } from "../../../model/account";
import { ItemInProcess          } from "../../../model/itemInProcess";
import { OrderInProcess         } from "../../../model/orderInProcess";
import { StoreHouse             } from "../../../model/storehouse";
import { AdminOrderService      } from "./adminOrderService";
import { AdminStoreHouseService } from "../adminStoreHouseService/adminStoreHouseService";
import { AccountLocalService    } from "../../../tools/accountLocalService";

@Component({
  selector: 'adminOrderView',
  templateUrl: './adminOrderView.html',
})
export class AdminOrderView implements OnInit
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
  table:string = "inProcess";
  clientName:string = "-"
  orderNumber:string = "-";
  startTime:string = "2024-09-01";
  endTime:string = "2024-09-01";
  storeHouse:string = "all";
  state:string = "all";

  // search result
  orderList:OrderInProcess[] = [];

  // Used to store temporary order instance.
  order:OrderInProcess = new OrderInProcess();

  // Used to store temporary itemList in current order.
  itemList:ItemInProcess[] = [];

  item:ItemInProcess = new ItemInProcess();

  // Used to store temporary serial number.
  currentSerialNumber:string = "";

  // Used to store temporary serial number.
  currentStatus:string = "";

  // Used to lock or unlock serial number modification.
  currentLock:boolean = true;

  currentIndex:number = -1;

  // Marks whether itemList has been edited
  editItem:boolean = false;

  warning:string = "";

  /*************************** Initialization page ***************************/
  constructor(private router:Router, private accountLocalService:AccountLocalService, private orderService:AdminOrderService, private storeHouseService:AdminStoreHouseService, public config:WebSiteConfig)
  {}

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

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "admin/order/management");

    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }

    // Get the day after tomorrow's date
    let date = new Date();
    let year = date.getFullYear();
    let mouth = date.getMonth() + 1;
    let day = date.getDate() + 2;

    // Format the date as "yyyy-mm-dd"
    if(mouth < 10)
    {
      this.startTime = year + "-0" + mouth;
      this.endTime = year + "-0" + mouth;
    }
    else
    {
      this.startTime = year + "-" + mouth;
      this.endTime = year + "-" + mouth;
    }
    this.startTime = this.endTime + "-01";
    if(day < 10)
    {
      this.endTime = this.endTime + "-0" +day;
    }
    else
    {
      this.endTime = this.endTime + "-" +day;
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
    // api = "/admin/{lang}/order/{table}/{page}"
    this.orderService.getOrderList(this.table, this.clientName, this.orderNumber, this.startTime, this.endTime, this.storeHouse, this.state, this.page, this.lang).subscribe(
        data=>
        {
          // Close the pop-up window after successfully obtaining data from backend
          this.orderList = data;
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
    // api = "/admin/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, this.clientName, this.orderNumber, this.startTime, this.endTime, this.storeHouse, this.state, this.page-1, this.lang).subscribe(
        data=>
        {
          // If the data is obtained successfully, update itemList and set page = page - 1;
          this.orderList = data;
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

    // Try to get the next page of data
    // GET
    // api = "/admin/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, this.clientName, this.orderNumber, this.startTime, this.endTime, this.storeHouse, this.state, this.page + 1, this.lang).subscribe(
      data=>
      {
        // If the array.length > 0， then the data is obtained successfully.
        // update orderList and set page = page + 1;
        if ((data as OrderInProcess[]).length > 0)
        {
          this.page = this.page + 1;
          this.orderList = data;
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
      }
    )
  }

  /******************************* Search Order *******************************/
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
    (window.document.getElementById("orderNumber" ) as HTMLInputElement).value = this.orderNumber;
    (window.document.getElementById("startTime"   ) as HTMLInputElement).value = this.startTime;
    (window.document.getElementById("endTime"     ) as HTMLInputElement).value = this.endTime;
    (window.document.getElementById("storeHouseId") as HTMLInputElement).value = this.storeHouse;
    (window.document.getElementById("state"       ) as HTMLInputElement).value = this.state;

    // Uncheck to search order_in_process table
    // Check to search order_in_history table
    if(this.table == "inHistory")
    {
      (window.document.getElementById("type") as HTMLInputElement).checked = true;
    }
    else
    {
      (window.document.getElementById("type") as HTMLInputElement).checked = false;
    }

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("filterView")!.className = "modal-wrapper";
  }

  // Search order
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
    let clientName = (window.document.getElementById("clientName"  ) as HTMLInputElement).value.trim();
    let orderNumber= (window.document.getElementById("orderNumber" ) as HTMLInputElement).value.trim();
    let startTime  = (window.document.getElementById("startTime"   ) as HTMLInputElement).value.trim();
    let endTime    = (window.document.getElementById("endTime"     ) as HTMLInputElement).value.trim();
    let storeHouse = (window.document.getElementById("storeHouseId") as HTMLInputElement).value.trim();
    let state      = (window.document.getElementById("state"       ) as HTMLInputElement).value.trim();

    // The backend API does not receive an empty string.
    // Use "-" to represent an empty string.
    clientName   = clientName   == null || clientName   == "" ? '-' : clientName ;
    orderNumber  = orderNumber  == null || orderNumber  == "" ? '-' : orderNumber;

    // call backend
    // GET
    // api = "/admin/{lang}/order/{table}/{page}"
    this.orderService.getOrderList(table, clientName,  orderNumber, startTime, endTime, storeHouse, state, 1, this.lang).subscribe(
      data=>
      {
        // If fetching data success
        // Update the search conditions to the webpage, reset the page number to 1
        this.orderList = data;
        this.page = 1;

        // Update the current filter values
        this.clientName = clientName;
        this.orderNumber = orderNumber;
        this.startTime = startTime;
        this.endTime = endTime;
        this.storeHouse = storeHouse;
        this.state = state;
        this.table = table;

        // Update the filter input box values
        (window.document.getElementById("clientName" ) as HTMLInputElement).value = this.clientName;
        (window.document.getElementById("orderNumber" ) as HTMLInputElement).value = this.orderNumber;
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

  /******************************* Update Order *******************************/
  // Open the pop-up window to show full order information
  showOrderDetailView(index:number)
  {
    // Use the index in orderList to find the order record.
    this.order = this.orderList[index];

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("orderDetailView")!.className = "modal-wrapper-show";

    // Try to get all item records belonging to this order.
    // When the order's status is 'processing'
    // All items' status should be "initialize"
    // Thus, the item records should be only in item_in_process table.
    // If there are some errors in this order
    // The order's status is "error", "initialize", or "processing",
    // but the item's status is "exported" and the record is in item_in_history.
    // Those kinds of items will not show in the order.
    if(this.order.state != this.config.orderState.finished)
    {
      // Display pop-up window
      this.openPop();

      // call backend
      // GET
      // api = "/admin/{lang}/item/get/by/{orderNumber}"
      this.orderService.getItemsByOrderNumber(this.order.orderNumber, this.lang).subscribe(
        data=>
        {
          // If fetching data success
          this.itemList = data;
          // Mark item list status as unedited
          this.editItem = false;
          // close pop-up window
          this.closePop();
        },
        error =>
        {
          // If fetching data fails, an error is displayed.
          this.resPop(error.message, null);
        })
    }


    // When the order's status is 'finished'
    // The, order may be in item_in_process or item_in_history.
    // and the item records may be in item_in_process or item_in_history.
    // For the admin, the "archived" order is read-only.
    if(this.order.state == this.config.orderState.finished)
    {
      // Display pop-up window
      this.openPop();

      // call backend
      // GET
      // api = "/admin/{lang}/item/get/all/by/{orderNumber}"
      this.orderService.getAllItemsByOrderNumber(this.order.orderNumber, this.lang).subscribe(
        data=>
        {
          // If fetching data success
          this.itemList = data;
          // Mark item list status as unedited
          this.editItem = false;
          // close pop-up window
          this.closePop();
        },
        error =>
        {
          // If fetching data fails, an error is displayed.
          this.resPop(error.message, null);
        })
    }
  }

  // CLose the pop-up window of the order information
  closeOrderDetailView()
  {
    // Reset temporary order instance
    this.order = new OrderInProcess();

    // Reset itemList
    this.itemList = [];

    // Reset item list status as unedited
    this.editItem = false;

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("orderDetailView")!.className = "modal-wrapper";
  }

  // Reset itemList
  reloadItem()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // GET
    // api = "/admin/{lang}/item/get/by/{orderNumber}"
    this.orderService.getItemsByOrderNumber(this.order.orderNumber, this.lang).subscribe(
        data=>
        {
          // Mark item list status as unedited
          this.editItem = false;
          // If fetching data success
          this.itemList = data;
          // close pop-up window
          this.closePop();
        },
        error =>
        {
          // If fetching data fails, an error is displayed.
          this.resPop(error.message, null);
        })
  }

  // Try to re-get the list of items in the order
  autoFix()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // POST
    // api = "/admin/{lang}/order/autoFix/{orderId}"
    this.orderService.autoFix(this.order.id, this.lang).subscribe(
        data=>
        {
          // Re-get item list failed
          if((data as string).includes("[ERROR]"))
          {
            this.resPop(data, null);
          }
          // Re-get item list success
          else
          {
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

  // Open pop-up window of the add new item
  showCreateItemView()
  {
    // reset item
    this.item = new ItemInProcess();
    this.item.orderNumber = this.order.orderNumber;
    this.item.storeHouse  = this.order.storeHouse;

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("createItemView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the add new item
  closeCreateItemView()
  {
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("createItemView")!.className = "modal-wrapper";

    // reset item
    this.item = new ItemInProcess();

    // Remove the color of the input box border
    window.document.getElementById("newItemName"    )!.style.borderColor = "";
    window.document.getElementById("newSerialNumber")!.style.borderColor = "";
    window.document.getElementById("newStoreHouse"  )!.style.borderColor = "";
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
    }

    // If the item is in the imported state, the following fields must be empty
    if(this.item.state == this.config.itemState.imported)
    {
      this.item.carrier = '';
      this.item.trackNumber = '';
    }
  }

  // add item to itemList
  // This method only adds the item in the front end and does not do any database operations.
  addItem()
  {
    // Remove the color of the input box border
    window.document.getElementById("newItemName"    )!.style.borderColor = "";
    window.document.getElementById("newSerialNumber")!.style.borderColor = "";
    window.document.getElementById("newStoreHouse"  )!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.item.format();

    // If the order number is empty, the serial number is used as the order number
    if(this.item.orderNumber == null || this.item.orderNumber == '')
    {
      this.item.orderNumber = this.item.serialNumber;
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

    // add item to itemList
    this.itemList.push(this.item);

    // close add new item View
    window.document.getElementById("createItemView")!.className = "modal-wrapper";

    // Close the pop-up window
    this.closePop();

    // Mark item list status as edited
    this.editItem = true;
  }

  // Delete item from itemList
  // This method only deletes the item in the front end and does not do any database operations.
  removeItem(index:number)
  {
    // Use the index in itemList to find the target item
    this.itemList.splice(index, 1);

    // Mark item list status as edited
    this.editItem = true;
  }

  // Open the pop-up window to show full item information
  showItemDetailView(index:number)
  {
    // Use the index in accountList to find the item record.
    this.item = this.itemList[index];

    this.currentIndex = index;

    // Locking serial number
    this.currentLock = true;

    // Set current serial number
    this.currentSerialNumber = this.item.serialNumber;

    // Set current item state
    this.currentStatus = this.item.state;

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("itemDetailView")!.className = "modal-wrapper-show";
  }

  // CLose the pop-up window of the item information
  closeItemDetailView()
  {
    // Reset temporary item instance
    this.item = new ItemInProcess();

    this.currentIndex = -1;

    // Locking serial number
    this.currentLock = true;

    // Reset current serial number
    this.currentSerialNumber = "";

    // Reset current item state
    this.currentStatus = "";

    // Remove the color of the input box border
    window.document.getElementById("currentItemItemName"    )!.style.borderColor = "";
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

  // update item to itemList
  // This method only updates the item in the front end and does not do any database operations.
  saveItem()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("currentItemItemName"    )!.style.borderColor = "";
    window.document.getElementById("currentItemSerialNumber")!.style.borderColor = "";
    window.document.getElementById("currentItemStoreHouse"  )!.style.borderColor = "";

    let newItem = new ItemInProcess();
    newItem.id           = this.item.id;
    newItem.itemName     = (window.document.getElementById("currentItemItemName"    ) as HTMLInputElement ).value;
    newItem.serialNumber = (window.document.getElementById("currentItemSerialNumber") as HTMLInputElement).value;
    newItem.orderNumber  = this.item.orderNumber;
    newItem.storeHouse   = (window.document.getElementById("currentItemStoreHouse"  ) as HTMLSelectElement).value;
    newItem.state        = this.currentStatus;
    newItem.importerId   = this.item.importerId;
    newItem.importerName = this.item.importerName;
    newItem.importTime   = this.item.importTime;
    newItem.exporterId   = this.item.exporterId;
    newItem.exporterName = this.item.exporterName;
    newItem.exportTime   = this.item.exportTime;
    newItem.position     = (window.document.getElementById("currentItemPosition"    ) as HTMLInputElement).value;
    newItem.price        = Number((window.document.getElementById("currentItemPrice") as HTMLInputElement).value);
    newItem.carrier      = (window.document.getElementById("currentItemCarrier"     ) as HTMLInputElement).value;
    newItem.trackNumber  = (window.document.getElementById("currentItemTrackNumber" ) as HTMLInputElement).value;

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
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    this.itemList[this.currentIndex] = newItem;
    this.editItem = true;
    this.closePop();
    this.closeItemDetailView();
  }

  // update Order
  updateOrder()
  {
    // Display pop-up window
    this.openPop();

    // Set order status
    this.order.state = (window.document.getElementById("currentOrderState") as HTMLSelectElement).value;

    // If the order is in the initialization or error state, there should be no items in the order.
    if((this.order.state == this.config.orderState.error || this.order.state == this.config.orderState.initialize) && this.itemList.length > 0)
    {
      this.resPop("AddItemToErrorOrder",null);
      return;
    }

    //  If the order is in the processing state, ther should be no imported or exported items in the order.
    if(this.order.state == this.config.orderState.processing)
    {
      for(let i = 0; i < this.itemList.length; i++)
      {
        if(this.itemList[i].state != this.config.itemState.initialize)
        {
          this.resPop("AddImportedItemToProcessOrder",null);
          return;
        }
      }
    }

    // If the item list has been edited, both items and order information should be updated
    if(this.editItem == true)
    {
      // call backend
      // PATCH
      // api = "/client/{lang}/order/updateAll/{id}"
      this.orderService.updateOrderAndItem(this.order.id, this.order.state, this.itemList, this.lang).subscribe(
          data=>
          {
            // Update order failed
            if((data as string).includes("[ERROR]"))
            {
              // Use the pop-up window to show the return message
              this.resPop(data, null);
            }
            // Update order success
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
    else
    {
      // call backend
      // PATCH
      // api = "/client/{lang}/order/update/{id}"
      this.orderService.updateOrder(this.order.id, this.order.state, this.lang).subscribe(
          data=>
          {
            // Update order failed
            if((data as string).includes("[ERROR]"))
            {
              // Use the pop-up window to show the return message
              this.resPop(data, null);
            }
            // Update order success
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
  }

  /******************************* Delete Order *******************************/
  // Open pop-up window of the delete confirmation
  showConfirmDeleteView()
  {
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmDeleteView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the delete confirmation
  closeConfirmDeleteView()
  {
    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("confirmDeleteView")!.className = "modal-wrapper";
  }

  // Delete Order
  deleteOrder()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/admin/{lang}/order/delete/{id}"
    this.orderService.deleteOrder(this.order.id, this.lang).subscribe(
      data=>
      {
        // Delete order failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Delete order success
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

  // Delete Order and Item
  deleteOrderAndItem()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/admin/{lang}/order/deleteAll/{id}"
    this.orderService.deleteOrderAndItem(this.order.id, this.lang).subscribe(
      data=>
      {
        // Delete order failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Delete order success
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
              this.closeOrderDetailView()
            }
            if(model == 2)
            {
              this.closeConfirmDeleteView()
              this.closeOrderDetailView()
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
}
