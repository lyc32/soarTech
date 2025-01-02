import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { Account             } from "../../../model/account";
import { LogoutService       } from "../../forAllRoles/logoutService/logoutService";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'clientHomePageView',
  templateUrl: './clientHomePageView.html'
})
export class ClientHomePageView implements OnInit
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

    // Check if the role is client or not
    if(this.currentAccountRole != this.config.accountRole.client)
    {
      this.router.navigateByUrl("error");
      return;
    }
  }

  /******************************** main Page ********************************/
  // Jump to create new order view
  goAddNewOrderView()
  {
    this.router.navigateByUrl("client/order/addNewOrder");
  }

  // Jump to Create Orders In Batches View
  goAddOrdersView()
  {
    this.router.navigateByUrl("client/order/addOrders");
  }

  // Jump to my order management view
  // A client can only view his/her orders
  // This page is only for searching unarchived orders
  goOrderInProcessView()
  {
    this.router.navigateByUrl("client/order/inProcess");
  }

  // Jump to my order in history view
  // A client can only view his/her orders
  // This page is only for searching archived orders
  goOrderInHistoryView()
  {
    this.router.navigateByUrl("client/order/inHistory");
  }

  // Jump to My Account Setting View
  goMyAccountInfoView()
  {
    this.router.navigateByUrl("client/accountInfo");
  }

  // Log out
  logOut()
  {
    this.logoutService.logout(this.router, this.config, this.accountLocalService);
  }
}
