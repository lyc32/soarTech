import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {StoreHouse} from "../../../model/storehouse";

@Injectable({
  providedIn: 'root'
})
export class ImporterStoreHouseService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/importer/{lang}/storehouse/all"
  getAllStoreHouse(lang:string):Observable<StoreHouse[]>
  {
    return this.httpClient.get<StoreHouse[]>(this.webSiteConfig.backendEndpoint + "/importer/" + lang + "/storehouse/all");
  }
}
