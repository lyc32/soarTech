import { Injectable} from '@angular/core';
import { Router } from "@angular/router";
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {AccountLocalService} from "../../../tools/accountLocalService";

@Injectable({
  providedIn: 'root'
})
export class LogoutService
{
  logout(router:Router, webSiteConfig:WebSiteConfig, roleCheck:AccountLocalService)
  {
    // Clear browser local storage data
    roleCheck.cleanSession(webSiteConfig.localSessionName, webSiteConfig.localSessionCash, webSiteConfig.localSessionPath);
    // Jump to root path
    router.navigateByUrl("").then(r => location.reload());
  }
}
