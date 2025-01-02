import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { ItemInProcess } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class AdminReportService {
  constructor(private httpClient: HttpClient, private webSiteConfig: WebSiteConfig)
  {}

  // GET
  // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/{page}"
  getReport(clientName:string, storeHouse:string, startTime:string, endTime:string, page:number, lang:string):Observable<ItemInProcess[]>
  {
    let params = new HttpParams();
    params = params.set("clientName", clientName).set("storeHouse", storeHouse);
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/report/client/items/" + startTime + "/to/" + endTime + "/" + page, { params: params });
  }

  // GET
  // api = "/admin/{lang}/client/items/{startTime}/to/{endTime}/toJson"
  getReportJson(clientName:string, storeHouse:string, startTime:string, endTime:string, lang:string):Observable<ItemInProcess[]>
  {
    let params = new HttpParams();
    params = params.set("clientName", clientName).set("storeHouse", storeHouse);
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/report/client/items/" + startTime + "/to/" + endTime + "/toJson", { params: params });
  }
}
