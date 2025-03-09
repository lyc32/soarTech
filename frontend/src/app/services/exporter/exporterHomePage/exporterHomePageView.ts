import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { LogoutService       } from "../../forAllRoles/logoutService/logoutService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'exporterHomePageView',
  templateUrl: './exporterHomePageView.html'
})
export class ExporterHomePageView implements OnInit
{
  // current username or account name
  currentAccountName:string = "";
  // current account's role
  currentAccountRole:string = "";

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private accountLocalService:AccountLocalService, private logoutService:LogoutService)
  {}

  // Initialization page
  // Check role permissions
  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get username and role
    this.currentAccountName = this.accountLocalService.getAccountNameByAccountEntity(account!);
    this.currentAccountRole = account!.role;

    // Check if the role is export or not
    if(this.currentAccountRole != this.config.accountRole.exporter)
    {
      this.router.navigateByUrl("error");
      return;
    }

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "exporter/home");
  }

  /******************************** main Page ********************************/
  // Jump to export item view
  goExportItemView()
  {
    this.router.navigateByUrl("exporter/export/item");
  }

  // Jump to item management view
  // The exporter can only edit those items that are in imported status.
  goItemManagementView()
  {
    this.router.navigateByUrl("exporter/item/management");
  }

  // Jump to My Account Setting View
  goMyAccountInfoView()
  {
    this.router.navigateByUrl("exporter/accountInfo");
  }

  // Log out
  logOut()
  {
    this.logoutService.logout(this.router, this.config, this.accountLocalService);
  }
}
