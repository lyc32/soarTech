import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { Account       } from "../../../model/account";

@Injectable({
  providedIn: 'root'
})
export class RootMyAccountInfoService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/myAccount/{lang}/info"
  getMyAccountInfo(lang:string):Observable<Account>
  {
    return this.httpClient.get<Account>(this.webSiteConfig.backendEndpoint + "/myAccount/" + lang + "/info");
  }

  // PUT
  // api = "/myAccount/{lang}/update"
  updateAccount(user:Account, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/myAccount/" + lang + "/update", user, { responseType: 'text' as const});
  }

  // PATCH
  // api = "/myAccount/{lang}/resetPassword"
  resetPassword(oldPass:string, newPass:string, lang:string):Observable<any>
  {
    let params = new HttpParams().set('oldPassword', oldPass).set('newPassword', newPass);
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint + "/myAccount/" + lang + "/resetPassword", params, { responseType: 'text' as const});
  }

}
