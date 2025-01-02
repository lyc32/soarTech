import { Component, OnInit } from '@angular/core';
import { MD5, enc } from "crypto-js";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { LogInService        } from "./logInService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'logInView',
  templateUrl: './logInView.html'
})
export class LogInView implements OnInit
{
  // Web page language settings
  lang:string = "en_US"

  // Used to store temporary account instance.
  account:Account = new Account();

  // Page setting
  type:string = "login";

  // warning, error, response message
  message:string="";

  // account username
  userName:string="";

  /*************************** Initialization page ***************************/
  constructor(private logInService:LogInService, private config:WebSiteConfig, private accountLocalService:AccountLocalService)
  { }

  // Initialization page
  // Set the default language setting
  ngOnInit(): void
  {
    // default language is en_US
    this.lang = "en-US";

    // If the browser language is Chinese, change language to zh-CN
    if((navigator.language).includes('zh'))
    {
      this.lang = "zh-CN";
    }
  }

  /********************************* go back *********************************/
  // Jump to login page
  goBack()
  {
    this.type = "login";

    // reset account instance
    this.account = new Account();

    // Jump from create root account view
    if(window.document.getElementById("resetEmail") != null)
    {
      window.document.getElementById("resetEmail")!.style.borderColor = "";
    }
  }

  /******************************** login page *******************************/
  // login
  logIn()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("username")!.style.borderColor = "";
    window.document.getElementById("password")!.style.borderColor = "";

    // format input account fields:
    // remove front and end space;
    this.account.format();

    // Check if the account name is empty or not
    if(this.account.accountName == null || this.account.accountName == '')
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("username")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("Account_Name_Empty",null);
      return;
    }

    // Check if the password is empty or not
    if(this.account.password == null || this.account.password == '')
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById("password")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop("Account_Pass_Empty",null);
      return;
    }

    // If accountName = register, password = root
    // then jump to create root account view
    if(this.account.accountName == this.config.rootRegister && this.account.password == this.config.rootPassword)
    {
      this.account = new Account();
      this.type = "register";
      // Close the pop-up window
      this.closePop();
      return;
    }

    // call backend
    // POST
    // api = "/login/{lang}"
    this.account.password =  MD5(this.account.password).toString(enc.Hex);
    this.openPop()
    this.logInService.login(this.account, this.lang).subscribe(
        data =>
        {
          // login  failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // login success
          else
          {
            // Save the JWT token to local storage
            this.accountLocalService.setSessionAccount(this.config.localSessionName, data);

            // Get the account instance from the JWT token
            // Get the username from the account instance
            let accountEntity:Account = this.accountLocalService.getAccountEntityByJWT(data);
            this.userName = " " + this.accountLocalService.getAccountNameByAccountEntity(accountEntity)

            // Use the pop-up window to show the return message
            // The page will automatically jump to home page
            this.resPop("Welcome Back", "/#/" + accountEntity.role + "/home");
          }
        },
        error =>
        {
          // Request sent failed
          // Use the pop-up window to show the error message
          this.resPop(error.message, null);
        })
  }

  // Reset the value of the input box
  reset()
  {
    this.account = new Account();
  }

  /**************************** create root account **************************/
  // Create root account
  createRoot()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("AccountName")!.style.borderColor = "";
    window.document.getElementById("Phone"      )!.style.borderColor = "";
    window.document.getElementById("Email"      )!.style.borderColor = "";
    window.document.getElementById("newPass"    )!.style.borderColor = "";
    window.document.getElementById("confirm"    )!.style.borderColor = "";

    // Get the new password and the confirmed password
    let newPass = (window.document.getElementById("newPass") as HTMLInputElement).value;
    let confirm = (window.document.getElementById("confirm") as HTMLInputElement).value;

    this.account.role = this.config.rootRole;

    // check input account is correct or not
    // check accountName, email, phone and role are null or empty string
    let check = this.account.check();
    if(check != null)
    {
      // If the input content is empty, turn the input box border into red.
      window.document.getElementById(check)!.style.borderColor = "red";
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
      window.document.getElementById("AccountName")!.style.borderColor = "red";
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
      window.document.getElementById("Phone")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the email is valid or not
    check = this.account.isEmailID();
    if(check != null)
    {
      // If the email is not valid, turn the input box border into red.
      window.document.getElementById("Email")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check,null);
      return;
    }

    // Check if the new password is valid or not
    check = this.accountLocalService.isPassword(newPass);
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
    this.account.password =  MD5(newPass).toString(enc.Hex);

    // call backend
    // POST
    // api = "/register/{lang}/root"
    this.logInService.register(this.account, this.lang).subscribe(
        data=>
        {
          // Create root account failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Create root account success
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

  /****************************** forgot Password *****************************/
  // Jump to forgot password view
  forgotPass()
  {
    this.type = "forgotPass";
  }

  // Reset password and send to email
  requestNewPass()
  {
    // Display pop-up window
    this.openPop();

    // Remove the color of the input box border
    window.document.getElementById("resetEmail")!.style.borderColor = "";

    // Get input email
    let email = (window.document.getElementById("resetEmail") as HTMLInputElement).value.trim();

    // Check if the email is valid or not
    let check = this.accountLocalService.isEmailID(email);
    if( check != null)
    {
      // If the email is not valid, turn the input box border into red.
      window.document.getElementById("resetEmail")!.style.borderColor = "red";
      // Use the pop-up window to show the error message
      this.resPop(check, null);
      return;
    }

    // call back
    // POST
    // api = "/email/{lang}/forgot/password"
    this.logInService.forgetPassword(email, this.lang).subscribe(
        data=>
        {
          // Sent email to reset password failed
          if((data as string).includes("[ERROR]"))
          {
            // Use the pop-up window to show the return message
            this.resPop(data, null);
          }
          // Sent email to reset password success
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
