import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { enc, MD5 } from "crypto-js";

import { WebSiteConfig            } from "../../../config/webSiteConfig";
import { Account                  } from "../../../model/account";
import { RootMyAccountInfoService } from "./rootMyAccountInfoService";
import { AccountLocalService      } from "../../../tools/accountLocalService";

@Component({
  selector: 'rootMyAccountInfoView',
  templateUrl: './rootMyAccountInfoView.html'
})
export class RootMyAccountInfoView implements OnInit {

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  // Used to store temporary account instance.
  account:Account = new Account();

  constructor(private router: Router, private config: WebSiteConfig, private roleCheck: AccountLocalService, private accountInfoService: RootMyAccountInfoService, private accountLocalService:AccountLocalService)
  {}

  // Initialization page
  // Set the default language setting
  // Get full account information
  ngOnInit(): void
  {
    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }

    // Get the account instance from the local storage
    let account = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);
    if(account == null)
    {
      this.router.navigateByUrl("");
      return;
    }

    // Display pop-up window
    this.openPop();

    // Try to get full information of the account.
    // GET
    // api = "/myAccount/{lang}/info"
    this.accountInfoService.getMyAccountInfo(this.lang).subscribe(
        data =>
        {
          // If the data is obtained successfully,
          if(data != null)
          {
            // The return is a simple object, not ItemInProcess type
            // Convert the object to Account instance
            Object.assign(this.account, data);

            // Close Pop-up window
            this.closePop();
          }
          // If the data is obtained failed,
          else
          {
            // Use the pop-up window to show the error message
            this.resPop("CANNOT_FIND_ACCOUNT", null)
          }
        },
        error =>
        {
          // When an exception occurs, display the error in the pop-up window
          this.resPop(error.message, null);
        })
  }


  /**************************** update my Account ****************************/
  // Update my account information
  update()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("Phone")!.style.borderColor = "";
    window.document.getElementById("Email")!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.account.format();

    let check = this.account.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById(check)!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check + " Is Empty",null);
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
      window.document.getElementById("Phone")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the email is valid or not
    check = this.account.isEmailID();
    if( check != null)
    {
      // If the phone number is not valid, turn the input box border into red.
      window.document.getElementById("Email")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // call backend
    // PUT
    // api = "/myAccount/{lang}/update"
    this.accountInfoService.updateAccount(this.account, this.lang).subscribe(
        data =>
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

  /***************************** reset psaaword *****************************/
  // Open the pop-up window of the reset password
  showResetPasswordView()
  {
    window.document.getElementById("resetPasswordView")!.className = "modal-wrapper-show";
  }

  // Close the pop-up window of the reset password
  closeResetPasswordView()
  {
    window.document.getElementById("resetPasswordView")!.className = "modal-wrapper";
    (window.document.getElementById("oldPass") as HTMLInputElement).value = "";
    (window.document.getElementById("newPass") as HTMLInputElement).value = "";
    (window.document.getElementById("confirm") as HTMLInputElement).value = "";
  }

  // Reset the current account password
  resetPassword()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("oldPass")!.style.borderColor = "";
    window.document.getElementById("newPass")!.style.borderColor = "";
    window.document.getElementById("confirm")!.style.borderColor = "";

    // Get the old password, new password and the confirmed password
    let oldPass = (window.document.getElementById("oldPass") as HTMLInputElement).value;
    let newPass = (window.document.getElementById("newPass") as HTMLInputElement).value;
    let confirm = (window.document.getElementById("confirm") as HTMLInputElement).value;

    // Check if the old password is valid or not
    let check = this.accountLocalService.isPassword(oldPass);
    if(check != null)
    {
      // If the new password is not valid, turn the input box border into red.
      window.document.getElementById("oldPass")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("Account_Old_Pass_Empty",null);
      return;
    }

    // Check if the new password is valid or not
    check = this.accountLocalService.isPassword(newPass);
    if(check != null)
    {
      // If the new password is not valid, turn the input box border into red.
      window.document.getElementById("newPass")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("Account_New_Pass_Empty",null);
      return;
    }

    // Check if the new password is the same as the old password
    check = this.accountLocalService.isPassSame(oldPass,newPass);
    if(check != null)
    {
      // If the new password is not valid, turn the input box border into red.
      window.document.getElementById("newPass")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the new password and the confirmed password match or not
    check = this.accountLocalService.isPassConfirm(newPass,confirm);
    if(check != null)
    {
      // If the new password and the confirmed password do not match, turn the input box border into red.
      window.document.getElementById("confirm")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Use the MD5 algorithm to encrypt the password
    newPass = MD5(newPass).toString(enc.Hex);
    oldPass = MD5(oldPass).toString(enc.Hex);

    // call backend
    // PATCH
    // api = "/myAccount/{lang}/resetPassword"
    this.accountInfoService.resetPassword(oldPass, newPass, this.lang).subscribe(
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
            this.resPop(data, "");
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        });

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
