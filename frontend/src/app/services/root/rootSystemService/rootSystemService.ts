import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { SystemInfo    } from "../../../model/systemInfo";

@Injectable({
  providedIn: 'root'
})

export class RootSystemService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // POST
  // api = "/root/system/refresh"
  refresh(lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/system/refresh", null);
  }

  // POST
  // api = "/root/system/close"
  close(lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/system/close", null);
  }

  // POST
  // api = "/root/system/exit"
  exit(lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/system/exit", null);
  }

  // GET
  // api = "/root/system/info"
  getSystemInfo(lang:string):Observable<SystemInfo>
  {
    return this.httpClient.get<SystemInfo>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/system/info");
  }
}
