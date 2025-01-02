import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig  } from "../../../config/webSiteConfig";
import { OrderInProcess } from "../../../model/orderInProcess";

@Injectable({
  providedIn: 'root'
})
export class RootOrderService {
  constructor(private httpClient: HttpClient, private webSiteConfig: WebSiteConfig) {
  }

  // GET
  // api = "/root/{lang}/order/{table}/{page}"
  getOrderList(type:string, clientName:string, orderNumber: string, startTime: string, endTime: string, storeHouse: string, state:string, page: number, lang:string): Observable<OrderInProcess[]>
  {
    let params = new HttpParams().set("orderNumber", orderNumber).set("clientName", clientName).set('startTime', startTime).set('endTime', endTime).set("storeHouse", storeHouse).set("state", state);
    return this.httpClient.get<OrderInProcess[]>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/" + type + "/" + page, {params: params});
  }

  // POST
  // api = "/root/{lang}/order/create/{table}"
  saveItem(type:string, order:OrderInProcess, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/create/" + type, order, { responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/order/update/{table}"
  updateOrder(type:string, order:OrderInProcess, lang:string): Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/update/" + type, order, {responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/order/archive"
  archiveOrder(order:OrderInProcess, lang:string): Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/archive", order, { responseType: 'text' as const});
  }

  // PUT
  // api = "/root/{lang}/order/unarchive"
  unarchiveOrder(order:OrderInProcess, lang:string): Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/unarchive", order, { responseType: 'text' as const});
  }

  // DELETE
  // api = "/root/{lang}/order/delete/{table}/{id}"
  deleteOrder(type:string, orderId: number, lang:string): Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/delete/" + type + "/" + orderId, {responseType: 'text' as const});
  }

  // DELETE
  // api = "/root/{lang}/order/delete/all/{table}/{id}"
  deleteOrderAndItem(type:string, orderId: number, lang:string): Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/order/delete/all/" + type + "/" + orderId, {responseType: 'text' as const});
  }


}
