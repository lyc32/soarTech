import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { Account       } from "../../../model/account";

@Injectable({
  providedIn: 'root'
})
export class LogInService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // POST
  // api = "/login/{lang}"
  login(user:Account, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/login/" + lang, user, { responseType: 'text' as const});
  }

  // POST
  // api = "/register/{lang}/root"
  register(user:Account, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/register/" + lang + "/root", user, { responseType: 'text' as const});
  }

  // POST
  // api = "/email/{lang}/forgot/password"
  forgetPassword(email:string, lang:string):Observable<any>
  {
    let params = new HttpParams().set("email", email);
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/email/" + lang + "/forgot/password", null, { responseType: 'text' as const, params: params});
  }
}
