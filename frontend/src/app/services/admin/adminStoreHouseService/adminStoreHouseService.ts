import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { StoreHouse    } from "../../../model/storehouse";

@Injectable({
  providedIn: 'root'
})
export class AdminStoreHouseService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/admin/{lang}/storehouse/all"
  getAllStoreHouse(lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/storehouse/all");
  }

  // GET
  // api = "/admin/{lang}/storehouse/list/{page}"
  getStoreHouseList(page:number, lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/storehouse/list/" + page);
  }

  // POST
  // api = "/admin/{lang}/storehouse/create"
  createStoreHouse(storeHouse:StoreHouse, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/storehouse/create", storeHouse, { responseType: 'text' as const});
  }

  // PUT
  // api = "/admin/{lang}/storehouse/update"
  updateStoreHouse(storeHouse:StoreHouse, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/storehouse/update", storeHouse, { responseType: 'text' as const})
  }
}
