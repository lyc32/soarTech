import {  Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

import { WebSiteConfig           } from "../../../config/webSiteConfig";
import { Account                 } from "../../../model/account";
import { ItemInProcess           } from "../../../model/itemInProcess";
import { OrderInProcess          } from "../../../model/orderInProcess";
import { StoreHouse              } from "../../../model/storehouse";
import { ClientOrderService      } from "./clientOrderService";
import { ClientStoreHouseService } from "../clientStoreHouseService/clientStoreHouseService";
import { AccountLocalService     } from "../../../tools/accountLocalService";

@Component({
  selector: 'clientOrderView',
  templateUrl: './clientOrderView.html'
})
export class ClientOrderView implements OnInit
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
  // there are 8 records per page.
  page:number = 1;

  // filter setting
  table:string = "inProcess";
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

  // Marks whether itemList has been edited
  editItem:boolean = false;


  /*************************** Initialization page ***************************/
  constructor(private router:Router, private activeRoute:ActivatedRoute, private accountLocalService:AccountLocalService, private orderService:ClientOrderService, private storeHouseService:ClientStoreHouseService, public config:WebSiteConfig)
  {}

  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get account role
    this.currentAccountRole = account!.role;

    // Check if the role is admin or not
    if(this.currentAccountRole != this.config.accountRole.client)
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

    this.table = this.activeRoute.snapshot.params['state'];

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "client/order/" + this.table);

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
    // api = "/client/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, this.startTime, this.endTime, this.storeHouse, this.state, this.page, this.lang).subscribe(
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
    this.router.navigateByUrl("client/home");
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
    // api = "/client/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, this.startTime, this.endTime, this.storeHouse, this.state, this.page-1, this.lang).subscribe(
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
    // api = "/client/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, this.startTime, this.endTime, this.storeHouse, this.state, this.page + 1, this.lang).subscribe(
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
        })
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
    (window.document.getElementById("startTime"   ) as HTMLInputElement).value = this.startTime;
    (window.document.getElementById("endTime"     ) as HTMLInputElement).value = this.endTime;
    (window.document.getElementById("storeHouseId") as HTMLInputElement).value = this.storeHouse;
    (window.document.getElementById("state"       ) as HTMLInputElement).value = this.state;

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("filterView")!.className = "modal-wrapper";
  }

  // Search order
  setFilter()
  {
    // Display pop-up window
    this.openPop();

    // Temporary storage search conditions
    // The input data in the filter is one-way binding,
    // If the search fails, the page data will not be changed
    let startTime  = (window.document.getElementById("startTime"   ) as HTMLInputElement).value;
    let endTime    = (window.document.getElementById("endTime"     ) as HTMLInputElement).value;
    let storeHouse = (window.document.getElementById("storeHouseId") as HTMLInputElement).value;
    let state      = (window.document.getElementById("state"       ) as HTMLInputElement).value;

    // call backend
    // GET
    // api = "/client/{lang}/myOrder/{table}/{page}"
    this.orderService.getOrderList(this.table, startTime, endTime, storeHouse, state, 1, this.lang).subscribe(
      data=>
      {
        // If fetching data success
        // Update the search conditions to the webpage, reset the page number to 1
        this.orderList = data;
        this.page = 1;

        // Update the current filter values
        this.startTime = startTime;
        this.endTime = endTime;
        this.storeHouse = storeHouse;
        this.state = state;

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
    // 1)
    // The order's status is "error", "initialize", or "processing",
    // but the item's status is "exported" and the record is in item_in_history.
    // Those kinds of items will not show in the order.
    // 2)
    // The order's status is "error", "initialize", or "processing",
    // but the item's status is "imported" and the record is in item_in_process.
    // Normally, the client can not edit "imported" or "exported" items,
    // But, in this case, the client can edit it and its status will reset to "initialize".
    if(this.order.state == this.config.orderState.processing)
    {
      // Display pop-up window
      this.openPop();

      // call backend
      // GET
      // api = "/client/{lang}/myItem/get/by/{orderId}"
      this.orderService.getItemsByOrderId(this.order.id, this.lang).subscribe(
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
    // For the client, the "finished" order is read-only.
    if(this.order.state == this.config.orderState.finished)
    {
      // Display pop-up window
      this.openPop();

      // call backend
      // GET
      // api = "/client/{lang}/myItem/get/{table}/by/{orderId}"
      this.orderService.getAllItemsByOrderId(this.order.id, this.table, this.lang).subscribe(
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
    // api = "/client/{lang}/myItem/get/by/{orderId}"
    this.orderService.getItemsByOrderId(this.order.id, this.lang).subscribe(
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
    // PUT
    // api = "/client/{lang}/myOrder/autoFix/{orderId}"
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
  showAddItemView()
  {
    // set itemName to null
    (window.document.getElementById("newItemName") as HTMLInputElement)!.value = "";
    (window.document.getElementById("newPrice") as HTMLInputElement)!.value = "0";

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("addItemView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the add new item
  closeAddItemView()
  {
    // Display Pop-up window
    // Set CSS display: none
    window.document.getElementById("addItemView")!.className = "modal-wrapper";

    // reset itemName to null
    (window.document.getElementById("newItemName") as HTMLInputElement)!.value = "";
    (window.document.getElementById("newPrice") as HTMLInputElement)!.value = "0";

    // Remove the color of the input box border
    window.document.getElementById("newItemName")!.style.borderColor = "";
  }

  // add item to itemList
  // This method only adds the item in the front end and does not do any database operations.
  addItem()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newItemName")!.style.borderColor = "";

    let newItemName = (window.document.getElementById("newItemName") as HTMLInputElement)!.value.trim();
    let newPrice = Number((window.document.getElementById("newPrice") as HTMLInputElement)!.value);

    if(newItemName == null || newItemName == '')
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("newItemName")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop('ItemName Is Empty',null);
      return;
    }

    let item:ItemInProcess = new ItemInProcess();
    item.itemName = newItemName;
    item.price = newPrice;

    // add item to itemList
    this.itemList.push(item);

    // close add new item View
    window.document.getElementById("addItemView")!.className = "modal-wrapper";

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

  // Update Order_inProcess
  updateOrder()
  {
    // Display pop-up window
    this.openPop();

    // Set order instance
    let newOrder = new OrderInProcess();
    newOrder.id         = this.order.id;
    newOrder.clientID   = this.order.clientID;
    newOrder.createTime = this.order.createTime;
    newOrder.state      = this.order.state;
    newOrder.orderNumber= this.order.orderNumber;
    newOrder.orderEmail = this.order.orderEmail;
    newOrder.orderLink  = this.order.orderLink;
    newOrder.totalPrice = Number((document.getElementById("totalPrice"  ) as HTMLInputElement   ).value);
    newOrder.message    = (document.getElementById("message"      ) as HTMLTextAreaElement).value;
    newOrder.storeHouse = (document.getElementById("StoreHouse"  ) as HTMLSelectElement  ).value;

    // format input order fields:
    // remove front and end space;
    newOrder.format();

    // When the item list in this order is empty, set the order status to "error"
    if(this.itemList.length == 0)
    {
      newOrder.state = this.config.orderState.error;
    }
    // When the item list in this order is not empty, set the order status to "processing"
    else
    {
      newOrder.state = this.config.orderState.processing;
    }

    // If the item list has been edited, both items and order information should be updated
    if(this.editItem == true)
    {
      // call backend
      // PUT
      // api = "/client/{lang}/myOrder/updateAll/{id}"
      this.orderService.updateOrderAndItem(newOrder, this.itemList, this.lang).subscribe(
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
    // If the item list has not been edited,  only the order information needs to update
    else
    {
      // call backend
      // PUT
      // api = "/client/{lang}/myOrder/update"
      this.orderService.updateOrder(newOrder, this.lang).subscribe(
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

  // Delete order_in_process
  deleteOrder()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/client/{lang}/myOrder/delete/{id}"
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
