import {Component, OnInit} from '@angular/core';
import {OrderInProcess} from "../../../model/orderInProcess";
import {StoreHouse} from "../../../model/storehouse";
import {Router} from "@angular/router";
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {ClientCreateOrdersService} from "../clientCreateOrders/clientCreateOrdersService";
import {ClientStoreHouseService} from "../clientStoreHouseService/clientStoreHouseService";
import {AccountLocalService} from "../../../tools/accountLocalService";
import {Account} from "../../../model/account";
import * as XLSX from 'xlsx';
import {ItemInProcess} from "../../../model/itemInProcess";

@Component({
  selector: 'clientCreateOrdersView',
  templateUrl: './clientCreateOrdersView.html'
})
export class ClientCreateOrdersView  implements OnInit
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  orderList1:OrderInProcess[] = [];
  orderList2:OrderInProcess[] = [];
  itemList :ItemInProcess[] = [];
  errorList :string[] = []
  errorIndex:number[] = []

  check:boolean = false;
  storeHouseName:string = ""
  storeHouseList:StoreHouse[] = [];

  log:string = "";

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private createOrdersService:ClientCreateOrdersService, private storeHouseService:ClientStoreHouseService, private accountLocalService:AccountLocalService)
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

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "client/order/addOrders");

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
        this.storeHouseName = this.storeHouseList[0].name;
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
                this.storeHouseName = this.storeHouseList[0].name;
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

  async analyzeFile(event:any)
  {
    this.check = true;

    this.orderList1 = [];
    this.orderList2 = [];
    this.itemList   = [];

    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1)
    {
      this.openPop();
      this.resPop('please select file', null);
      this.check = false;
      return;
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) =>
    {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const CONFIG = { header:["orderNumber", "orderEmail", "orderLink", "totalPrice", "itemName", "price"]};
      const data = XLSX.utils.sheet_to_json(ws, CONFIG);

      // @ts-ignore
      if(data[0].orderNumber != "orderNumber" || data[0].orderEmail != "appleID" || data[0].orderLink != "url" || data[0].totalPrice != "totalPrice" || data[0].itemName != "itemName" || data[0].price != "price")
      {
        this.openPop();
        this.resPop('excel format error', null);
        return;
      }

      for(let i = 1; i < data.length; i++)
      {
        // @ts-ignore
        if(data[i].orderNumber == null || data[i].orderNumber.trim() == "")
        {
          // @ts-ignore
          data[i].orderNumber = "null"
          this.errorIndex.push(i+1);
          this.errorList.push("OrderNumber Is Empty") ;
          this.check = false;
        }
        // @ts-ignore
        else if(data[i].itemName == null || data[i].itemName.trim() == "")
        {
          for(let j = 0; j < this.orderList1.length; j++)
          {
            // @ts-ignore
            if(this.orderList1[j].orderNumber == data[i].orderNumber.trim())
            {
              this.errorIndex.push(i+1);
              this.errorList.push("reAdd Order Number") ;
              this.check = false;
              break;
            }
          }

          for(let j = 0; j < this.orderList2.length; j++)
          {
            // @ts-ignore
            if(this.orderList2[j].orderNumber == data[i].orderNumber.trim())
            {
              this.errorIndex.push(i+1);
              this.errorList.push("reAdd Order Number") ;
              this.check = false;
              break;
            }
          }
        }

        // @ts-ignore
        if(data[i].itemName != null && data[i].itemName.trim() != "")
        {
          // @ts-ignore
          if(data[i].orderEmail == null || data[i].orderEmail.trim() == "")
          {
            // @ts-ignore
            data[i].orderEmail = "soarTechClientEmail@system.com";
          }
          // @ts-ignore
          if(data[i].orderLink == null || data[i].orderLink.trim() == "")
          {
            // @ts-ignore
            data[i].orderLink  = "host://" + data[i].orderNumber;
          }
        }

        // @ts-ignore
        if(data[i].orderEmail == null || data[i].orderEmail.trim() == "")
        {
          this.errorIndex.push(i+1);
          this.errorList.push("OrderEmail Is Empty");
          this.check = false;
        }

        // @ts-ignore
        if(data[i].orderLink == null || data[i].orderLink.trim() == "")
        {
          this.errorIndex.push(i+1);
          this.errorList.push("OrderLink Is Empty");
          this.check = false;
        }

        // @ts-ignore
        if(data[i].orderLink != null && data[i].orderNumber != null && data[i].orderLink.indexOf(data[i].orderNumber) < 0)
        {
          this.errorIndex.push(i+1);
          this.errorList.push("Order Link Not Match");
          this.check = false;
        }

        let order = new OrderInProcess();
        // @ts-ignore
        order.orderNumber = data[i].orderNumber != null ? data[i].orderNumber.trim()  : "";
        // @ts-ignore
        order.orderEmail  = data[i].orderEmail  != null ? data[i].orderEmail .trim()  : "";
        // @ts-ignore
        order.orderLink   = data[i].orderLink   != null ? data[i].orderLink  .trim()  : "";
        // @ts-ignore
        order.totalPrice  = data[i].totalPrice  != null ? Number(data[i].totalPrice)  : 0 ;
        order.storeHouse  = this.storeHouseName;

        // @ts-ignore
        if(data[i].itemName == null || data[i].itemName.trim() == "")
        {
          let uniqueOrder = true;
          for(let j = 0; j < this.orderList1.length; j++)
          {
            // @ts-ignore
            if(this.orderList1[j].orderNumber == data[i].orderNumber.trim())
            {
              uniqueOrder = false;
              break;
            }
          }
          for(let j = 0; j < this.orderList2.length; j++)
          {
            // @ts-ignore
            if(this.orderList2[j].orderNumber == data[i].orderNumber.trim())
            {
              uniqueOrder = false;
              break;
            }
          }

          if( uniqueOrder)
          {
            this.orderList1.push(order);
          }
        }
        else
        {
          let uniqueOrder = true;

          for(let j = 0; j < this.orderList1.length; j++)
          {
            // @ts-ignore
            if(this.orderList1[j].orderNumber == data[i].orderNumber.trim())
            {
              uniqueOrder = false;
              break
            }
          }
          for(let j = 0; j < this.orderList2.length; j++)
          {
            // @ts-ignore
            if(this.orderList2[j].orderNumber == data[i].orderNumber.trim())
            {
              uniqueOrder = false;
              break
            }
          }
          if( uniqueOrder)
          {
            this.orderList2.push(order);
          }
        }

        // @ts-ignore
        if(data[i].itemName != null && data[i].itemName.trim() != "")
        {
          let item = new ItemInProcess();
          // @ts-ignore
          item.orderNumber = data[i].orderNumber.trim()
          // @ts-ignore
          item.itemName = data[i].itemName.trim();
          // @ts-ignore
          item.price    = data[i].price != null ? Number(data[i].price) : 0;
          this.itemList.push(item);
        }
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  async createOrders()
  {
    this.openLog();
    this.log="";

    if(this.orderList1.length > 0)
    {
      await this.createOrdersService.createInitOrders(this.orderList1, this.lang).subscribe(
          data =>
          {
            this.log = this.log + data + "\n";
          },
          error =>
          {
            this.log = this.log + error.message + "\n";
          });
    }

    for(let i = 0; i < this.orderList2.length; i++)
    {
      let tmpList:ItemInProcess[] = [];
      for(let j = 0; j < this.itemList.length; j++)
      {
        if(this.itemList[j].orderNumber == this.orderList2[i].orderNumber)
        {
          tmpList.push(this.itemList[j]);
        }
      }
      await this.createOrdersService.createProcessOrder(this.orderList2[i], this.lang).subscribe(
          data =>
          {
            this.log = this.log + "\n[" + this.orderList2[i].orderNumber + "] " + data + "\n";
            if((data as string).includes("[ERROR]"))
            {
              for(let j = 0; j < tmpList.length; j++)
              {
                this.log = this.log + "  [SKIP] " + tmpList[j].itemName + "\n";
              }
              (document.getElementById("logText") as HTMLTextAreaElement).scrollTop = (document.getElementById("logText") as HTMLTextAreaElement).scrollHeight;
            }
            else
            {
              this.createOrdersService.createItems(this.orderList2[i].orderNumber, tmpList, this.lang).subscribe(
                  data =>
                  {
                    this.log = this.log + "[" + this.orderList2[i].orderNumber + "] " + data + "\n";
                    (document.getElementById("logText") as HTMLTextAreaElement).scrollTop = (document.getElementById("logText") as HTMLTextAreaElement).scrollHeight;
                  },
                  error =>
                  {
                    this.log = this.log + "[" + this.orderList2[i].orderNumber + "] " + data+ "\n";
                    (document.getElementById("logText") as HTMLTextAreaElement).scrollTop = (document.getElementById("logText") as HTMLTextAreaElement).scrollHeight;
                  })
            }
          },
          error =>
          {
            this.log = this.log + "\n[" + this.orderList2[i].orderNumber + "] " + error.message + "\n";
            for(let j = 0; j < tmpList.length; j++)
            {
              this.log = this.log + "  [SKIP] " + tmpList[j].itemName + "\n";
            }
            (document.getElementById("logText") as HTMLTextAreaElement).scrollTop = (document.getElementById("logText") as HTMLTextAreaElement).scrollHeight;
          });
    }
    window.document.getElementById("logCloseButton")!.style.cssText = "display:block";
  }


  /******************************* log Window ********************************/
  openLog()
  {
    this.log = "";
    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("logView"   )!.className     = "modal-wrapper-show";
  }

  closeLog()
  {
    location.reload();
    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("logView"   )!.className     = "modal-wrapper";
  }

  /****************************** Pop-up Window ******************************/
  // Open pop-up window
  openPop()
  {
    // set default message
    this.message = "PLEASE_WAITING";

    // hide top close button
    window.document.getElementById("logCloseButton")!.style.cssText = "display:none";

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
            location.reload();
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
