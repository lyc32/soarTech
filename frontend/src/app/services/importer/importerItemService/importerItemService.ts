import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { ItemInProcess } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class ImporterItemService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/importer/{lang}/item/list/{page}"
  getItemList(itemName:string, serialNumber:string, storeHouse:string, position:string, page:number, lang:string):Observable<ItemInProcess[]>
  {
    let params = new HttpParams().set("itemName", itemName).set('serialNumber', serialNumber).set('storeHouse', storeHouse).set("position", position);
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/importer/" + lang + "/item/list/" + page, {params: params});
  }

  // PUT
  // api = "/importer/{lang}/item/update"
  updateItem(item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/importer/" + lang + "/item/update", item, { responseType: 'text' as const});
  }
}
