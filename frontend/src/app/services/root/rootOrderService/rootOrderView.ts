import {Component, OnInit} from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig         } from "../../../config/webSiteConfig";
import { Account               } from "../../../model/account";
import { OrderInProcess        } from "../../../model/orderInProcess";
import { StoreHouse            } from "../../../model/storehouse";
import { RootOrderService      } from "./rootOrderService";
import { RootStoreHouseService } from "../rootStoreHouseService/rootStoreHouseService";
import { AccountLocalService   } from "../../../tools/accountLocalService";

@Component({
  selector: 'rootOrderView',
  templateUrl: './rootOrderView.html'
})
export class RootOrderView implements OnInit
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

  /*************************** Initialization page ***************************/
  constructor(private router:Router, private accountLocalService:AccountLocalService, private orderService:RootOrderService, private storeHouseService:RootStoreHouseService, public config:WebSiteConfig)
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

    // Get the day after tomorrow's date
    let date = new Date();
    let year = date.getFullYear();
    let mouth = date.getMonth() + 1;
    let day = date.getDate() + 2;

    // Format the date as "yyyy-mm-dd"
    if(mouth < 10)
    {
      this.endTime = year + "-0" + mouth;
    }
    else
    {
      this.endTime = year + "-" + mouth;
    }
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
    // api = "/root/{lang}/order/{table}/{page}"
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
    // api = "/root/{lang}/myOrder/{table}/{page}"
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
    // api = "/root/{lang}/myOrder/{table}/{page}"
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
    // api = "/root/{lang}/order/{table}/{page}"
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

  /******************************* Create Order *******************************/
  // Open the pop-up window of the creation order
  showCreateOrderView()
  {
    // The default storehouse is the first storehouse in the storeHouseList.
    if(this.storeHouseList.length > 0)
    {
      this.order.storeHouse = this.storeHouseList[0].name;
    }

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("addOrderView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the creation order
  closeCreateOrderView()
  {
    // Reset temporary order instance
    this.order = new OrderInProcess();

    // Remove the color of the input box border
    window.document.getElementById('newClientName')!.style.borderColor = "";
    window.document.getElementById("newOrderNumber")!.style.borderColor = "";
    window.document.getElementById("newOrderEmail" )!.style.borderColor = "";
    window.document.getElementById("newOrderLink"  )!.style.borderColor = "";
    window.document.getElementById("newStoreHouse" )!.style.borderColor = "";
    window.document.getElementById('newState'      )!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("addOrderView")!.className = "modal-wrapper";
  }

  // save order to order_in_process table
  saveOrderInProcess()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById('newClientName')!.style.borderColor = "";
    window.document.getElementById("newOrderNumber")!.style.borderColor = "";
    window.document.getElementById("newOrderEmail" )!.style.borderColor = "";
    window.document.getElementById("newOrderLink"  )!.style.borderColor = "";
    window.document.getElementById("newStoreHouse" )!.style.borderColor = "";
    window.document.getElementById('newState'      )!.style.borderColor = "";

    // format input order fields:
    // remove front and end space;
    this.order.format();

    // check clientName is empty or not
    let check = null;
    if(this.order.clientName == null || this.order.clientName == '')
    {
      window.document.getElementById('newClientName')!.style.borderColor = "red";
      this.resPop("Client Name Is Empty",null);
      return;
    }

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    check = this.order.check();
    if(check != null)
    {
      window.document.getElementById('new' + check)!.style.borderColor = "red";
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the order number and link match or not
    check = this.order.checkOrderLink();
    if(check != null)
    {
      window.document.getElementById("newOrderNumber")!.style.borderColor = "red";
      window.document.getElementById("newOrderLink"  )!.style.borderColor = "red";
      this.resPop("Order Link Not Match",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state == null || this.order.state == '')
    {
      window.document.getElementById('newState')!.style.borderColor = "red";
      this.resPop("Order State Is Empty",null);
      return;
    }

    // call backend
    // POST
    // api = "/root/{lang}/order/create/{table}"
    this.orderService.saveItem("inProcess", this.order, this.lang).subscribe(
      data=>
      {
        // Create order failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Create order success
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

  // save order to order_in_history table
  saveOrderInHistory()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById('newClientName')!.style.borderColor = "";
    window.document.getElementById("newOrderNumber")!.style.borderColor = "";
    window.document.getElementById("newOrderEmail" )!.style.borderColor = "";
    window.document.getElementById("newOrderLink"  )!.style.borderColor = "";
    window.document.getElementById("newStoreHouse" )!.style.borderColor = "";
    window.document.getElementById('newState'      )!.style.borderColor = "";

    // format input order fields:
    // remove front and end space;
    this.order.format();

    // check clientName is empty or not
    let check = null;
    if(this.order.clientName == null || this.order.clientName == '')
    {
      window.document.getElementById('newClientName')!.style.borderColor = "red";
      this.resPop("Client Name Is Empty",null);
      return;
    }

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    check = this.order.check();
    if(check != null)
    {
      window.document.getElementById('new' + check)!.style.borderColor = "red";
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the order number and link match or not
    check = this.order.checkOrderLink();
    if(check != null)
    {
      window.document.getElementById("newOrderNumber")!.style.borderColor = "red";
      window.document.getElementById("newOrderLink"  )!.style.borderColor = "red";
      this.resPop("Order Link Not Match",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state == null || this.order.state == '')
    {
      window.document.getElementById('newState')!.style.borderColor = "red";
      this.resPop("Order State Is Empty",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state != this.config.orderState.finished)
    {
      window.document.getElementById('newState')!.style.borderColor = "red";
      this.resPop("Archive Unfinished Order",null);
      return;
    }

    // call backend
    // POST
    // api = "/root/{lang}/order/create/{table}"
    this.orderService.saveItem("inHistory", this.order, this.lang).subscribe(
        data=>
        {
          // Create order failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Create order success
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

  /******************************* Update Order *******************************/
  updateOrder(index:number)
  {
    // Display pop-up window
    this.openPop();

    Object.assign(this.order, this.orderList[index]);

    // format input order fields:
    // remove front and end space;
    this.order.format();

    // check clientName is empty or not
    let check = null;
    if(this.order.clientName == null || this.order.clientName == '')
    {
      window.document.getElementById('newClientName')!.style.borderColor = "red";
      this.resPop("Client Name Is Empty",null);
      return;
    }

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    check = this.order.check();
    if(check != null)
    {
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the order number and link match or not
    check = this.order.checkOrderLink();
    if(check != null)
    {
      this.resPop("Order Link Not Match",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state == null || this.order.state == '')
    {
      this.resPop("Order State Is Empty",null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/order/update/{table}"
    this.orderService.updateOrder(this.table, this.order, this.lang).subscribe(
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

  /******************************* Archive Order *******************************/
  // Open the pop-up window of the archive order
  showArchiveOrderView(index:number)
  {
    Object.assign(this.order, this.orderList[index]);
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmArchiveView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the archive order
  closeArchiveOrderView()
  {
    this.order = new OrderInProcess();
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("confirmArchiveView")!.className = "modal-wrapper";
  }

  // Move this order from Order_In_Process table to Order_In_History table
  archiveOrder()
  {
    // Display pop-up window
    this.openPop();

    // format input order fields:
    // remove front and end space;
    this.order.format();

    // check clientName is empty or not
    let check = null;
    if(this.order.clientName == null || this.order.clientName == '')
    {
      this.resPop("Client Name Is Empty",null);
      return;
    }

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    check = this.order.check();
    if(check != null)
    {
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the order number and link match or not
    check = this.order.checkOrderLink();
    if(check != null)
    {
      this.resPop("Order Link Not Match",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state == null || this.order.state == '')
    {
      this.resPop("Order State Is Empty",null);
      return;
    }

    if(this.order.state != this.config.orderState.finished)
    {
      this.resPop("Archive Unfinished Order",null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/order/archive"
    this.orderService.archiveOrder(this.order, this.lang).subscribe(
      data =>
      {
        // Archive order failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Archive order success
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

  /****************************** unarchive Order ******************************/
  // Open the pop-up window of the unarchive order
  showUnarchiveOrderView(index:number)
  {
    Object.assign(this.order, this.orderList[index]);
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmUnarchiveView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the unarchive order
  closeUnarchiveOrderView()
  {
    this.order = new OrderInProcess();
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmUnarchiveView")!.className = "modal-wrapper";
  }

  // Move this order from Order_In_History table to Order_In_Process table
  unarchiveOrder()
  {
    // Display pop-up window
    this.openPop();

    // format input order fields:
    // remove front and end space;
    this.order.format();

    // check clientName is empty or not
    let check = null;
    if(this.order.clientName == null || this.order.clientName == '')
    {
      this.resPop("Client Name Is Empty",null);
      return;
    }

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    check = this.order.check();
    if(check != null)
    {
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the order number and link match or not
    check = this.order.checkOrderLink();
    if(check != null)
    {
      this.resPop("Order Link Not Match",null);
      return;
    }

    // Check if the order status is empty or not.
    if(this.order.state == null || this.order.state == '')
    {
      this.resPop("Order State Is Empty",null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/order/unarchive"
    this.orderService.unarchiveOrder(this.order, this.lang).subscribe(
      data =>
      {
        // Archive order failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Archive order success
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

  /******************************* Delete Order *******************************/
  // Open pop-up window of the delete confirmation
  showConfirmDeleteView(index:number)
  {
    this.order = this.orderList[index];
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("confirmDeleteView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the delete confirmation
  closeConfirmDeleteView()
  {
    this.order = new OrderInProcess();
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
    // api = "/root/{lang}/order/delete/{table}/{id}"
    this.orderService.deleteOrder(this.table, this.order.id, this.lang).subscribe(
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

  // Delete Order and Item
  deleteOrderAndItem()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/root/{lang}/order/delete/all/{table}/{id}"
    this.orderService.deleteOrderAndItem(this.table, this.order.id, this.lang).subscribe(
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
