import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {ItemInProcess} from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class AdminItemService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/admin/{lang}/item/{table}/{page}"
  getItemList(table:string, itemName:string, orderNumber:string, serialNumber:string, importerName:string, exporterName:string, storeHouse:string, position:string, carrier:string, trackNumber:string, state:string, page:number, lang:string):Observable<ItemInProcess[]>
  {
    let params = new HttpParams().set("itemName", itemName).set("orderNumber", orderNumber).set("serialNumber", serialNumber).set("importerName", importerName).set("exporterName", exporterName).set('storeHouse', storeHouse).set("position", position).set("carrier", carrier).set("trackNumber", trackNumber);
    if(table == "inProcess")
    {
      params = params.set("state", state);
    }
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/" + table +"/" + page, {params: params});
  }

  // POST
  // api = "/admin/{lang}/item/create"
  createItem(item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/create", item, { responseType: 'text' as const});
  }

  // PUT
  // api = "/admin/{lang}/item/update"
  updateItem(item:ItemInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/update", item, { responseType: 'text' as const});
  }

  // DELETE
  // api = "/admin/{lang}/item/delete/{id}"
  deleteItem(id:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/delete/" + id, { responseType: 'text' as const});
  }


}
