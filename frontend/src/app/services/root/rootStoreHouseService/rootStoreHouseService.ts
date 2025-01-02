import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { StoreHouse    } from "../../../model/storehouse";

@Injectable({
  providedIn: 'root'
})
export class RootStoreHouseService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  getAllStoreHouse(lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/storehouse/all");
  }

  getStoreHouseList(page:number, lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/storehouse/list/" + page);
  }

  createStoreHouse(storeHouse:StoreHouse, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/storehouse/create", storeHouse, { responseType: 'text' as const});
  }

  updateStoreHouse(storeHouse:StoreHouse, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/storehouse/update", storeHouse, { responseType: 'text' as const})
  }

  deleteStoreHouse(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/storehouse/delete/" + id,{ responseType: 'text' as const});
  }

  deleteStoreHouseAll(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint+"/root/" + lang + "/storehouse/delete/all/" + id,{ responseType: 'text' as const});
  }

}
