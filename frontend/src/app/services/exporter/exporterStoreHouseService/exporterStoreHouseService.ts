import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { StoreHouse    } from "../../../model/storehouse";

@Injectable({
  providedIn: 'root'
})
export class ExporterStoreHouseService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/exporter/{lang}/storehouse/all"
  getAllStoreHouse(lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/exporter/" + lang + "/storehouse/all");
  }
}
