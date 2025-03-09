import { Component } from '@angular/core';
import {SmtpMail} from "../../../model/smtpMail";
import {Router} from "@angular/router";
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {AccountLocalService} from "../../../tools/accountLocalService";
import {RootMailConfigService} from "./rootMailConfigService";

@Component({
  selector: 'rootMailConfigView',
  templateUrl: './rootMailConfigView.html'
})
export class RootMailConfigView
{

  // Web page language settings
  lang:string = "en-US"

  // warning, error, response message
  message:string="";

  smtpMail:SmtpMail = new SmtpMail();

  constructor(private router: Router,
              private config: WebSiteConfig,
              private rootMailConfigService:RootMailConfigService,
              private accountLocalService:AccountLocalService)
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
    this.rootMailConfigService.getMailConfig(this.lang).subscribe(
        data =>
        {
          // If the data is obtained successfully,
          if(data != null)
          {
            // The return is a simple object, not ItemInProcess type
            // Convert the object to Account instance
            Object.assign(this.smtpMail, data);

          }
          // If the data is obtained failed,
          else
          {
            this.smtpMail = new SmtpMail();
          }

          // Close Pop-up window
          this.closePop();
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

    // call backend
    // PUT
    // api = "/myAccount/{lang}/update"
    this.rootMailConfigService.setMailConfig(this.smtpMail, this.lang).subscribe(
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
