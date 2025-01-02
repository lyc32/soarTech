import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { Account       } from "../../../model/account";

@Injectable({
  providedIn: 'root'
})

export class AdminAccountService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // POST
  // api = "/admin/{lang}/account/create"
  createAccount(accountEntity:Account, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/create", accountEntity,{ responseType: 'text' as const});
  }

  // GET
  // api = "/admin/{lang}/account/list/{page}"
  getAccountList(filterAccountName:string, filterEmail:string, filterRole:string, filterState:string, page:number, lang:string):Observable<Account[]>
  {
    let params = new HttpParams();
    if(filterAccountName != "" || filterAccountName != null || filterAccountName != undefined)
    {
      params = params.set('name', filterAccountName);
    }
    if(filterEmail != ""  || filterEmail!= null || filterEmail != undefined)
    {
      params = params.set('email', filterEmail);
    }

    params = params.set("role", filterRole).set("state", filterState);
    return this.httpClient.get<Account[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/list/" + page, { params: params });
  }

  // PATCH
  // api = "/admin/{lang}/account/suspend/{id}"
  suspendAccount(id:number, lang:string):Observable<any>
  {
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/suspend/" + id,null, { responseType: 'text' as const});
  }

  // PATCH
  // api = "/admin/{lang}/account/active/{id}"
  activeAccount(id:number, lang:string):Observable<any>
  {
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/active/" + id,null,{ responseType: 'text' as const});
  }

  // PATCH
  // api = "/admin/{lang}/account/resetPassword/{id}"
  resetPassword(id:number, password:string, lang:string):Observable<any>
  {
    let params = new HttpParams().set("password", password);
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/resetPassword/" + id,null,{ responseType: 'text' as const,  params: params });
  }

  // DELETE
  // api = "/admin/{lang}/account/delete/{id}"
  deleteAccount(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/account/delete/" + id,{ responseType: 'text' as const});
  }
}
