import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {OrderInProcess} from "../../../model/orderInProcess";
import {ClientCreateOrderService} from "./clientCreateOrderService";
import {StoreHouse} from "../../../model/storehouse";
import {ClientStoreHouseService} from "../clientStoreHouseService/clientStoreHouseService";
import {Account} from "../../../model/account";
import {AccountLocalService} from "../../../tools/accountLocalService";
import {WebSiteConfig} from "../../../config/webSiteConfig";

@Component({
  selector: 'clientCreateOrderView',
  templateUrl: './clientCreateOrderView.html'
})
export class ClientCreateOrderView implements OnInit
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  newOrder:OrderInProcess = new OrderInProcess();
  storeHouseList:StoreHouse[] = [];

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private clientAddNewOrderService:ClientCreateOrderService, private storeHouseService:ClientStoreHouseService, private accountLocalService:AccountLocalService)
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

    // Try to get the storehouse list from the local storage
    let storehouseList = this.accountLocalService.getCash(this.config.localSessionCash);
    if (storehouseList != null || storehouseList != undefined)
    {
      // convert JSON to StoreHouse[]
      this.storeHouseList = JSON.parse(storehouseList);
    }

    // Display pop-up window
    this.openPop();

    // If the storehouse list is empty, try to get the storehouse list
    if (this.storeHouseList.length > 0)
    {
      // Get all active storehouses from the whole storeHouse List.
      let tStoreHouseList:StoreHouse[] = []
      for(let i = 0; i < this.storeHouseList.length; i++)
      {
        if(this.storeHouseList[i].status == this.config.storeHouseState.active)
        {
          tStoreHouseList.push(this.storeHouseList[i]);
        }
      }

      // The default storehouse is the first active storehouse in the storeHouseList.
      this.storeHouseList = tStoreHouseList;
      if(this.storeHouseList.length > 0)
      {
        this.newOrder.storeHouse = this.storeHouseList[0].name;
        this.closePop();
      }
      else
      {
        // Use the pop-up window to show the return message
        this.resPop("No StoreHouse Found", null);
      }

    }
    else
    {
      // call backend
      // GET
      // api = "/client/{lang}/storehouse/all"
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
            else
            {
              // Get all active storehouses from the whole storeHouse List.
              let tStoreHouseList:StoreHouse[] = []
              for(let i = 0; i < this.storeHouseList.length; i++)
              {
                if(this.storeHouseList[i].status == this.config.storeHouseState.active)
                {
                  tStoreHouseList.push(this.storeHouseList[i]);
                }
              }

              // The default storehouse is the first active storehouse in the storeHouseList.
              this.storeHouseList = tStoreHouseList;
              if(this.storeHouseList.length > 0)
              {
                this.newOrder.storeHouse = this.storeHouseList[0].name;
                // Close the pop-up window
                this.closePop();
              }
              else
              {
                // Use the pop-up window to show the return message
                this.resPop("No StoreHouse Found", null);
              }
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
    this.router.navigateByUrl("client/home");
  }

  // create item_in_process
  createOrder()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("OrderNumber")!.style.borderColor = "";
    window.document.getElementById("OrderEmail" )!.style.borderColor = "";
    window.document.getElementById("OrderLink"  )!.style.borderColor = "";
    window.document.getElementById("StoreHouse" )!.style.borderColor = "";

    // format input order fields:
    // remove front and end space;
    this.newOrder.format();

    // check input order is correct or not
    // check orderNumber, orderEmail, orderLink and storeHouse are null or empty string
    let check = this.newOrder.check();
    if(check != null)
    {
      window.document.getElementById(check)!.style.borderColor = "red";
      this.resPop(check + " Is Empty",null);
      return;
    }

    //Check if the order number and link match or not
    check = this.newOrder.checkOrderLink();
    if(check != null)
    {
      window.document.getElementById("OrderNumber")!.style.borderColor = "red";
      window.document.getElementById("OrderLink"  )!.style.borderColor = "red";
      this.resPop("Order Link Not Match",null);
      return;
    }

    // call backend
    // POST
    // api = "/client/{lang}/myOrder/create"
    this.clientAddNewOrderService.createOrder(this.newOrder, this.lang).subscribe(
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
