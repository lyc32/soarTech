import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { LogoutService       } from "../../forAllRoles/logoutService/logoutService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'importerHomePageView',
  templateUrl: './importerHomePageView.html'
})
export class ImporterHomePageView implements OnInit
{
  // current username or account name
  currentAccountName:string = "";
  // current account's role
  currentAccountRole:string = "";

  /*************************** Initialization page ***************************/
  constructor(private router:Router, public config:WebSiteConfig, private accountLocalService:AccountLocalService, private logoutService:LogoutService)
  {}

  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get username and role
    this.currentAccountName = this.accountLocalService.getAccountNameByAccountEntity(account!);
    this.currentAccountRole = account!.role;

    // Check if the role is admin or not
    if(this.currentAccountRole != this.config.accountRole.importer)
    {
      this.router.navigateByUrl("error");
      return;
    }

    // set position
    this.accountLocalService.setPath(this.config.localSessionPath, "importer/home");

  }

  /******************************** main Page ********************************/
  // Jump to import item view
  goImportItemView()
  {
    this.router.navigateByUrl("importer/import/item");
  }

  // Jump to item management view
  // The exporter can only edit those items that are in imported status.
  goItemManagementView()
  {
    this.router.navigateByUrl("importer/item/management");
  }

  // Jump to My Account Setting View
  goMyAccountInfoView()
  {
    this.router.navigateByUrl("importer/accountInfo");
  }

  // Log out
  logOut()
  {
    this.logoutService.logout(this.router, this.config, this.accountLocalService);
  }
}
