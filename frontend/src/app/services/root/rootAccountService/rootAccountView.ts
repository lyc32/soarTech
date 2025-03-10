import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { enc, MD5 } from "crypto-js";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { RootAccountService  } from "./rootAccountService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'rootAccountView',
  templateUrl: './rootAccountView.html'
})
export class RootAccountView implements OnInit
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

  // filter setting
  filterAccountName = "";
  filterAccountEmail = "";
  filterAccountRole = "all";
  filterAccountState = "all";

  // Used to store temporary account instance.
  account:Account = new Account();

  // search result
  accountList:Account[] = [];

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private accountService:RootAccountService, private accountLocalService:AccountLocalService)
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

    // Display pop-up window
    this.openPop();

    // call backend
    // GET
    // api = "/admin/{lang}/account/list/{page}"
    this.accountService.getAccountList(this.filterAccountName, this.filterAccountEmail, this.filterAccountRole, this.filterAccountState,1, this.lang).subscribe(
        data=>
        {
          // Close the pop-up window after successfully obtaining data from backend
          this.accountList = data;
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
    // api = "/admin/{lang}/account/list/{page}"
    this.accountService.getAccountList(this.filterAccountName, this.filterAccountEmail, this.filterAccountRole, this.filterAccountState, this.page -1 , this.lang).subscribe(
        data=>
        {
          // If the data is obtained successfully, update accountList and set page = page - 1;
          this.accountList = data;
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
    // api = "/admin/{lang}/account/list/{page}"
    this.accountService.getAccountList(this.filterAccountName, this.filterAccountEmail, this.filterAccountRole, this.filterAccountState, this.page+1, this.lang).subscribe(
        data=>
        {
          // If the array.length > 0， then the data is obtained successfully.
          // update accountList and set page = page + 1;
          if((data as Account[]).length > 0)
          {
            this.page = this.page + 1;
            this.accountList = data;
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

  /***************************** create account ******************************/
  // Open the pop-up window of the creation account
  showCreateView()
  {
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("createAccountView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the creation account
  closeCreateView()
  {
    // Reset temporary account instance
    this.account = new Account();

    // Remove the color of the input box border
    window.document.getElementById("newAccountName" )!.style.borderColor = "";
    window.document.getElementById("newPhone"       )!.style.borderColor = "";
    window.document.getElementById("newEmail"       )!.style.borderColor = "";
    window.document.getElementById("newRole"        )!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("createAccountView")!.className = "modal-wrapper";
  }

  // Create Account
  createAccount()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newAccountName" )!.style.borderColor = "";
    window.document.getElementById("newPhone"       )!.style.borderColor = "";
    window.document.getElementById("newEmail"       )!.style.borderColor = "";
    window.document.getElementById("newRole"        )!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.account.format();

    // check input account is correct or not
    // check accountName, email, phone and role are null or empty string
    let check = this.account.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("new" + check)!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the account name is valid or not
    // Account name can use uppercase or lowercase letters, numbers, and '_'
    check = this.account.isAccountName();
    if(check != null)
    {
      // If the account name is not valid, turn the input box border into red.
      window.document.getElementById("newAccountName")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the phone number is valid or not
    // phone number can be:
    // xxxxxxxxxx
    // +xxx xxx xxxx xxxx
    // +xxx xxx xxxx xxxxx
    check = this.account.isPhoneNumber();
    if(check != null)
    {
      // If the phone number is not valid, turn the input box border into red.
      window.document.getElementById("newPhone")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the email is valid or not
    check = this.account.isEmailID();
    if(check != null)
    {
      // If the email is not valid, turn the input box border into red.
      window.document.getElementById("newEmail")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // POST
    // api = "/root/{lang}/account/create"
    this.accountService.createAccount(this.account, this.lang).subscribe(
        data=>
        {
          // Create account failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Create account success
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

  /***************************** Search account ******************************/
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
    (window.document.getElementById("filterAccountName" ) as HTMLInputElement).value = this.filterAccountName;
    (window.document.getElementById("filterAccountEmail") as HTMLInputElement).value = this.filterAccountEmail;
    (window.document.getElementById("filterAccountRole" ) as HTMLInputElement).value = this.filterAccountRole;
    (window.document.getElementById("filterAccountState") as HTMLInputElement).value = this.filterAccountState;

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
    let filterAccountName  = (window.document.getElementById("filterAccountName" ) as HTMLInputElement).value.trim();
    let filterAccountEmail = (window.document.getElementById("filterAccountEmail") as HTMLInputElement).value.trim();
    let filterAccountRole  = (window.document.getElementById("filterAccountRole" ) as HTMLInputElement).value.trim();
    let filterAccountState = (window.document.getElementById("filterAccountState") as HTMLInputElement).value.trim();

    // Display pop-up window
    this.openPop();

    // call backend
    // GET
    // api = "/root/{lang}/account/list/{page}"
    this.accountService.getAccountList(filterAccountName, filterAccountEmail, filterAccountRole, filterAccountState, 1, this.lang).subscribe(
        data=>
        {
          // If fetching data success
          // Update the search conditions to the webpage, reset the page number to 1
          this.accountList = data;
          this.page = 1;

          // Update the current filter values
          this.filterAccountName = filterAccountName ;
          this.filterAccountEmail= filterAccountEmail;
          this.filterAccountRole = filterAccountRole ;
          this.filterAccountState= filterAccountState;

          // Update the filter input box values
          (window.document.getElementById("filterAccountName" ) as HTMLInputElement).value = this.filterAccountName;
          (window.document.getElementById("filterAccountEmail") as HTMLInputElement).value = this.filterAccountEmail;
          (window.document.getElementById("filterAccountRole" ) as HTMLInputElement).value = this.filterAccountRole;
          (window.document.getElementById("filterAccountState") as HTMLInputElement).value = this.filterAccountState;
          // close pop-up window
          this.closePop();
          // close filter View
          window.document.getElementById("filterView")!.className = "modal-wrapper";
        },
        error =>
        {
          // If fetching data fails, an error is displayed.
          this.resPop(error.message, null);
        }
    )
  }

  /***************************** Update account ******************************/
  // Update Account
  updateAccount(index:number)
  {
    // Display pop-up window
    this.openPop();

    Object.assign(this.account, this.accountList[index]);

    // format input account fields:
    // remove front and end space;
    this.account.format();

    // check input account is correct or not
    // check accountName, email, phone and role are null or empty string
    let check = this.account.check();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
      return;
    }

    // Check if the account name is valid or not
    // Account name can use uppercase or lowercase letters, numbers, and '_'
    check = this.account.isAccountName();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the phone number is valid or not
    // phone number can be:
    // xxxxxxxxxx
    // +xxx xxx xxxx xxxx
    // +xxx xxx xxxx xxxxx
    check = this.account.isPhoneNumber();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the email is valid or not
    check = this.account.isEmailID();
    if(check != null)
    {
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // PUT
    // api = "/root/{lang}/account/update"
    this.accountService.updateAccount(this.account, this.lang).subscribe(
        data=>
        {
          // Update account failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Update account success
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

  /***************************** Reset Password ******************************/
  // Open the pop-up window of the reset password
  showResetAccountPasswordView(index:number)
  {
    this.account = this.accountList[index];
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("resetAccountPasswordView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the reset password
  closeResetAccountPasswordView()
  {
    this.account = new Account();
    // Reset input box value.
    (document.getElementById("newPassword"    ) as HTMLInputElement)!.value = "";
    (document.getElementById("confirmPassword") as HTMLInputElement)!.value = "";

    // Remove the color of the input box border
    window.document.getElementById("newPassword"    )!.style.borderColor = "";
    window.document.getElementById("confirmPassword")!.style.borderColor = "";

    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("resetAccountPasswordView")!.className = "modal-wrapper";
  }

  // Reset the current account password
  resetAccountPassword()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("newPassword"    )!.style.borderColor = "";
    window.document.getElementById("confirmPassword")!.style.borderColor = "";

    // Get the new password and the confirmed password
    let newPass = (document.getElementById("newPassword"    ) as HTMLInputElement)!.value;
    let confirm = (document.getElementById("confirmPassword") as HTMLInputElement)!.value;

    // Check if the new password is valid or not
    let check = this.accountLocalService.isPassword(newPass);
    if(check != null)
    {
      // If the new password is not valid, turn the input box border into red.
      window.document.getElementById("newPassword")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the new password and the confirmed password match or not
    check = this.accountLocalService.isPassConfirm(newPass,confirm);
    if(check != null)
    {
      // If the new password and the confirmed password do not match, turn the input box border into red.
      window.document.getElementById("confirmPassword")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Use the MD5 algorithm to encrypt the password
    newPass = MD5(newPass).toString(enc.Hex);

    // call backend
    // PATCH
    // api = "/root/{lang}/account/resetPassword/{id}"
    this.accountService.resetPassword(this.account.id, newPass, this.lang).subscribe(
        data =>
        {
          // Reset password failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Reset password success
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

  /****************************** Delete Account *****************************/
  // Open pop-up window of the delete confirmation
  showDeleteConfirmView(index:number)
  {
    this.account = this.accountList[index];
    // Display Pop-up window
    // Set CSS display: block
    window.document.getElementById("deleteConfirmView")!.className = "modal-wrapper-show";
  }

  // Close pop-up window of the delete confirmation
  closeDeleteConfirmView()
  {
    this.account = new Account();
    // Close Pop-up window
    // Set CSS display: none
    window.document.getElementById("deleteConfirmView")!.className = "modal-wrapper";
  }

  // Delete current account
  deleteAccount()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/root/{lang}/account/delete/{id}"
    this.accountService.deleteAccount(this.account.id, this.lang).subscribe(
        data=>
        {
          // Delete account failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Delete account success
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

  // Delete current account, it's orders, and it's items
  deleteAccountAll()
  {
    // Display pop-up window
    this.openPop();

    // call backend
    // DELETE
    // api = "/root/{lang}/account/delete/all/{id}"
    this.accountService.deleteAccountAll(this.account.id, this.lang).subscribe(
      data=>
      {
        // Delete account failed
        if((data as string).includes("[ERROR]"))
        {
          // Use the pop-up window to show the return message
          this.resPop(data, null);
        }
        // Delete account success
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
              this.closeCreateView();
            }
            if(model == 2)
            {
              this.closeResetAccountPasswordView()
            }
            if(model == 3)
            {
              this.closeDeleteConfirmView();
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
