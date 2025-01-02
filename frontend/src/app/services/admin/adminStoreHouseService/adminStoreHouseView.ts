import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig          } from "../../../config/webSiteConfig";
import { Account                } from "../../../model/account";
import { StoreHouse             } from "../../../model/storehouse";
import { AdminStoreHouseService } from "./adminStoreHouseService";
import { AccountLocalService    } from "../../../tools/accountLocalService";

@Component({
  selector: 'adminStoreHouseView',
  templateUrl: './adminStoreHouseView.html',
})
export class AdminStoreHouseView implements OnInit
{
  // current account's role
  currentAccountRole:string = "";

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  // page number of search results
  // there are 5 records per page.
  page:number = 1;

  // storehouse list
  storeHouseList:StoreHouse[] = [];

  // Used to store temporary storehouse instance.
  storeHouse:StoreHouse = new StoreHouse();

  currentStoreHouseStatus:string = 'suspend';

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private storeHouseService:AdminStoreHouseService, private accountLocalService:AccountLocalService)
  {}

  // Initialization page
  // Check role permissions
  // Set default language settings
  // Get the first 8 storehouses in database
  // page = 1,
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

    // Display pop-up window
    this.openPop();

    // call backend
    // GET
    // api = "/admin/{lang}/storehouse/list/{page}"
    this.storeHouseService.getStoreHouseList(this.page, this.lang).subscribe(
      data=>
      {
        // Close the pop-up window after successfully obtaining data from backend
        this.storeHouseList = data;
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
    this.openPop( );

    // When the page is the first page.
    // Stay on the current page.
    if(this.page == 1)
    {
      this.resPop('ALREADY_FIRST_PAGE', null);
      return;
    }

    // Try to get the previous page of data
    // GET
    // api = "/admin/{lang}/storehouse/list/{page}"
    this.storeHouseService.getStoreHouseList(this.page-1, this.lang).subscribe(
        data=>
        {
          // If the data is obtained successfully, update storeHouseList and set page = page - 1;
          this.storeHouseList = data;
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
    // api = "/admin/{lang}/storehouse/list/{page}"
    this.storeHouseService.getStoreHouseList(this.page + 1, this.lang).subscribe(
      data=>
      {
        // If the array.length > 0， then the data is obtained successfully.
        // update storeHouseList and set page = page + 1;
        if((data as StoreHouse[]).length > 0)
        {
          this.page = this.page + 1;
          this.storeHouseList = data;
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

  /**************************** create StoreHouse ****************************/
  // Open the pop-up window of creat store house view
  showCreateStoreHouseView()
  {
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("createStoreHouseView")!.className = "modal-wrapper-show";
  }

  // close the pop-up window of creat store house view
  closeCreateStoreHouseView()
  {
    // Remove the color of the input box border
    window.document.getElementById("newRepo_Name")!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("createStoreHouseView")!.className = "modal-wrapper";

    // Reset temporary store house instance
    this.storeHouse = new StoreHouse();
  }

  // Create Store House
  createStoreHouse()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newRepo_Name")!.style.borderColor = "";

    // format input storehouse fields:
    // remove front and end space;
    this.storeHouse.format();

    // check input storehouse is correct or not
    // check storehouse.name is null or empty string
    let check = this.storeHouse.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("new" + check)!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the storehouse name is valid or not
    // storehouse name can use uppercase or lowercase letters, numbers, space, and '_'
    // The first character must be a letter.
    check = this.storeHouse.isStoreHouseName();
    if(check != null)
    {
      // If the account name is not valid, turn the input box border into red.
      window.document.getElementById("newRepo_Name")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // POST
    // api = "/admin/{lang}/storehouse/create"
    this.storeHouseService.createStoreHouse(this.storeHouse, this.lang).subscribe(
        data=>
        {
          // Create storehouse failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          else
          {
            // delete the storehouse list from the local storage
            this.accountLocalService.removeCash(this.config.localSessionCash)
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

  /**************************** update StoreHouse ****************************/
  // Open the pop-up window to show full store house information
  showStoreHouseDetailView(index:number)
  {
    // Use the index in storeHouseList to find the storeHouse record.
    this.storeHouse = this.storeHouseList[index];

    // set current store house status
    this.currentStoreHouseStatus = this.storeHouse.status;

    // base on current store house status to update web page
    if(this.storeHouse.status == this.config.storeHouseState.active)
    {
      (document.getElementById("activeSwitchButton") as HTMLInputElement).checked = true;
    }

    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("storeHouseDetailView")!.className = "modal-wrapper-show";
  }

  // CLose the pop-up window of the store house information
  closeStoreHouseDetailView()
  {
    // Reset temporary store house instance
    this.storeHouse = new StoreHouse();

    // Reset current store house status
    this.currentStoreHouseStatus = this.config.storeHouseState.suspend;

    // Reset web page
    (document.getElementById("activeSwitchButton") as HTMLInputElement).checked = false;

    // Remove the color of the input box border
    window.document.getElementById("currentStoreHouseName")!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("storeHouseDetailView")!.className = "modal-wrapper";
  }

  // Update storehouse switch button UI
  changeStoreHouseStatus()
  {
    if(this.currentStoreHouseStatus == this.config.storeHouseState.suspend)
    {
      this.currentStoreHouseStatus = this.config.storeHouseState.active;
    }
    else
    {
      this.currentStoreHouseStatus = this.config.storeHouseState.suspend;
    }
  }

  // Update Store House
  updateStoreHouse()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("currentStoreHouseName")!.style.borderColor = "";

    // Temporary storage the store house details
    // The input data in the filter is one-way binding,
    // If the update store house fails, the page data will not be changed
    this.storeHouse.details      = (document.getElementById("currentStoreHouseDetails") as HTMLInputElement).value.trim();
    this.storeHouse.addressLine1 = (document.getElementById("currentAddressLine1"  ) as HTMLInputElement).value.trim();
    this.storeHouse.addressLine2 = (document.getElementById("currentAddressLine2"  ) as HTMLInputElement).value.trim();
    this.storeHouse.city         = (document.getElementById("currentAddressCity"   ) as HTMLInputElement).value.trim();
    this.storeHouse.state        = (document.getElementById("currentAddressState"  ) as HTMLInputElement).value.trim();
    this.storeHouse.country      = (document.getElementById("currentAddressCountry") as HTMLInputElement).value.trim();
    this.storeHouse.zipCode      = (document.getElementById("currentAddressZipcode") as HTMLInputElement).value.trim();
    this.storeHouse.status       = this.currentStoreHouseStatus;

    // call backend
    // POST
    // api = "/admin/{lang}/storehouse/update"
    this.storeHouseService.updateStoreHouse(this.storeHouse, this.lang).subscribe(
        data=>
        {
          // Update store house failed
          if((data as string).includes("[ERROR]"))
          {
            this.resPop(data, null);
          }
          // Update store house success
          else
          {
            // delete the storehouse list from the local storage
            this.accountLocalService.removeCash(this.config.localSessionCash)
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
