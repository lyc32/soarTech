import { Component, Input, OnInit } from '@angular/core';
import { Account } from "../../../model/account";
import { Router } from "@angular/router";

import { WebSiteConfig       } from "../../../config/webSiteConfig";
import { AccountLocalService } from "../../../tools/accountLocalService";

@Component({
  selector: 'errorPageView',
  templateUrl: './errorPageView.html'
})
export class ErrorPageView implements OnInit
{
  accountName = "";
  constructor(private router:Router, public config:WebSiteConfig, private accountLocalService:AccountLocalService)
  {}
  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);
    if(account != null)
    {
      // Get username and role
      this.accountName = this.accountLocalService.getAccountNameByAccountEntity(account);
    }
  }
}
