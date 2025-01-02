import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { Account       } from "../../../model/account";

@Injectable({
  providedIn: 'root'
})

export class RootAccountService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // POST
  // api = "/root/{lang}/account/create"
  createAccount(accountEntity:Account, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/create", accountEntity,{ responseType: 'text' as const});
  }


  // GET
  // api = "/root/{lang}/account/list/{page}"
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
    return this.httpClient.get<Account[]>(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/list/" + page, { params: params });
  }

  // PUT
  // api = "/root/{lang}/account/update"
  updateAccount(account:Account, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/update", account,{ responseType: 'text' as const});
  }

  // PATCH
  // api = "/root/{lang}/account/resetPassword/{id}"
  resetPassword(id:number, password:string, lang:string):Observable<any>
  {
    let params = new HttpParams().set("password", password);
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/resetPassword/" + id,null,{ responseType: 'text' as const,  params: params });
  }

  // DELETE
  // api = "/root/{lang}/account/delete/{id}"
  deleteAccount(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/delete/" + id,{ responseType: 'text' as const});
  }

  // DELETE
  // api = "/root/{lang}/account/delete/all/{id}"
  deleteAccountAll(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/account/delete/all/" + id,{ responseType: 'text' as const});
  }
}
