import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { ItemInProcess } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class ImporterImportItemService
{
  constructor(private httpClient: HttpClient, private webSiteConfig: WebSiteConfig)
  {}

  // GET
  // api = "/importer/{lang}/item/get/by/{orderNumber}"
  getItemList(orderNumber: string, lang:string): Observable<ItemInProcess[]>
  {
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/importer/" + lang + "/item/get/by/" + orderNumber);
  }

  // PUT
  // api = "/importer/{lang}/item/import/{orderNumber}"
  importItems(orderNumber:string, items:ItemInProcess[], lang:string): Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/importer/" + lang + "/item/import/" + orderNumber, items, { responseType: 'text' as const});
  }

}
