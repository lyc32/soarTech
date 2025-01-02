import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { StoreHouse    } from "../../../model/storehouse";

@Injectable({
  providedIn: 'root'
})
export class ClientStoreHouseService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/client/{lang}/storehouse/all"
  getAllStoreHouse(lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/storehouse/all");
  }
}
