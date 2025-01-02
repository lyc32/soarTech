import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {AccountLocalService} from "../../../tools/accountLocalService";
import {LogoutService} from "../../forAllRoles/logoutService/logoutService";
import {Account} from "../../../model/account";

@Component({
  selector: 'rootHomePageView',
  templateUrl: './rootHomePageView.html'
})
export class RootHomePageView implements OnInit
{
  currentAccountName:string = "";
  currentAccountRole:string = "";
  workspace:string = "";

  constructor(private router:Router, private activeRoute:ActivatedRoute, public config:WebSiteConfig, private accountLocalService:AccountLocalService, private logoutService:LogoutService)
  {}

  ngOnInit(): void
  {
    // Get the account instance from the local storage
    let account:Account | null = this.accountLocalService.getAccountEntityBySessionAccount(this.config.localSessionName);

    // Get username and role
    this.currentAccountName = this.accountLocalService.getAccountNameByAccountEntity(account!);
    this.currentAccountRole = account!.role;

    // Check if the role is admin or not
    if(this.currentAccountRole != this.config.rootRole)
    {
      this.router.navigateByUrl("error");
      return;
    }
    else
    {
      this.workspace = this.activeRoute.snapshot.params['workspace'];
    }
  }

  goAccountManagementView()
  {
    this.router.navigateByUrl("root/account");
    this.workspace = "account";
  }

  goOrderManagementView()
  {
    this.router.navigateByUrl("root/order");
    this.workspace = "order";
  }

  goItemManagementView()
  {
    this.router.navigateByUrl("root/item");
    this.workspace = "item";
  }

  goRepoManagementView()
  {
    this.router.navigateByUrl("root/storehouse");
    this.workspace = "storehouse";
  }

  goMyAccountInfoView()
  {
    this.router.navigateByUrl("root/home");
    this.workspace = "home";
  }

  goPhpMyAdmin()
  {
    window.open(this.config.phpMyAdmin,"blank");
  }

  checkServer()
  {
    this.router.navigateByUrl("root/system");
    this.workspace = "system";
  }
  logOut()
  {
    this.logoutService.logout(this.router, this.config, this.accountLocalService);
  }

}
