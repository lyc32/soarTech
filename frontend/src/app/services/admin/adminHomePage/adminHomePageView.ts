import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { LogoutService       } from "../../forAllRoles/logoutService/logoutService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'adminHomePageView',
  templateUrl: './adminHomePageView.html'
})
export class AdminHomePageView implements OnInit
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

    // Check if the role is admin or not
    if(this.currentAccountRole != this.config.accountRole.admin)
    {
      this.router.navigateByUrl("error");
      return;
    }
  }

  /******************************** main Page ********************************/
  // Jump to Account Management View
  goAccountManagementView()
  {
    this.router.navigateByUrl("admin/account/management");
  }

  // Jump to Order Management View
  goOrderManagementView()
  {
    this.router.navigateByUrl("admin/order/management");
  }

  // Jump to ItemInProcess Management View
  goItemManagementView()
  {
    this.router.navigateByUrl("admin/item/management");
  }

  // Jump to Store House Management View
  goRepoManagementView()
  {
    this.router.navigateByUrl("admin/storehouse/management");
  }

  // Jump to Get Report View
  goReportView()
  {
    this.router.navigateByUrl("admin/performanceReport");
  }

  // Jump to My Account Setting View
  goMyAccountInfoView()
  {
    this.router.navigateByUrl("admin/accountInfo");
  }

  // Log out
  logOut()
  {
    this.logoutService.logout(this.router, this.config, this.accountLocalService);
  }
}
