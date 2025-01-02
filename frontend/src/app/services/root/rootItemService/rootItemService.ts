import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { ItemInProcess } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class RootItemService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/root/item/{table}/{page}"
  getItemList(type:string, itemName:string, orderNumber:string, serialNumber:string, importerName:string, exporterName:string, storeHouse:string, position:string, carrier:string, trackNumber:string, state:string, page:number, lang:string):Observable<ItemInProcess[]>
  {
    if(type == "inProcess")
    {
      let params = new HttpParams().set("itemName", itemName).set("orderNumber", orderNumber).set("serialNumber", serialNumber).set("importerName", importerName).set("exporterName", exporterName).set('storeHouse', storeHouse).set("position", position).set("carrier", carrier).set("trackNumber", trackNumber).set("state", state);
      return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/" + type +"/" + page, {params: params});
    }
    else
    {
      let params = new HttpParams().set("itemName", itemName).set("orderNumber", orderNumber).set("serialNumber", serialNumber).set("importerName", importerName).set("exporterName", exporterName).set('storeHouse', storeHouse).set("position", position).set("carrier", carrier).set("trackNumber", trackNumber);
      return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/" + type +"/" + page, {params: params});
    }
  }

  // POST
  // api = "/root/{lang}/item/create/{table}"
  saveItem(type:string, item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/create/" + type, item, { responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/item/update/{table}"
  updateItem(type:string, item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/update/" + type, item, { responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/item/archive/{table}"
  archiveItem(item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/archive", item, { responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/item/unarchive/{table}"
  unarchiveItem(item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/unarchive", item, { responseType: 'text' as const});
  }

  // DELETE
  // api = "/root/{lang}/item/delete/{table}/id"
  deleteItem(type:string, id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/item/delete/"+ type + "/" + id, { responseType: 'text' as const});
  }
}
