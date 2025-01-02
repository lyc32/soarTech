import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig  } from "../../../config/webSiteConfig";
import { OrderInProcess } from "../../../model/orderInProcess";
import { ItemInProcess  } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  constructor(private httpClient: HttpClient, private webSiteConfig: WebSiteConfig)
  {}

  // GET
  // api = "/admin/{lang}/order/{table}/{page}"
  getOrderList(table:string, clientName:string, orderNumber: string, startTime: string, endTime: string, storeHouse: string, state:string, page: number, lang:string): Observable<OrderInProcess[]>
  {
    let params = new HttpParams().set("orderNumber", orderNumber).set("clientName", clientName).set('startTime', startTime).set('endTime', endTime).set("storeHouse", storeHouse).set("state", state);
    return this.httpClient.get<OrderInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/" + table + "/" + page, {params: params});
  }

  // GET
  // api = "/admin/{lang}/item/get/by/{orderNumber}"
  getItemsByOrderNumber(orderNumber:string, lang:string):Observable<ItemInProcess[]>
  {
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/get/by/" + orderNumber)
  }

  // GET
  // api = "/admin/{lang}/item/get/all/by/{orderNumber}"
  getAllItemsByOrderNumber(orderNumber:string, lang:string):Observable<ItemInProcess[]>
  {
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/item/get/all/by/" + orderNumber)
  }

  // POST
  // api = "/admin/{lang}/order/autoFix/{orderId}"
  autoFix(orderId: number, lang: string): Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/autoFix/" + orderId, null, {responseType: 'text' as const});
  }

  // PATCH
  // api = "/admin/{lang}/order/update/{orderId}"
  updateOrder(orderId:number, orderState:string, lang:string): Observable<any>
  {
    let params = new HttpParams().set('state', orderState);
    return this.httpClient.patch(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/update/" + orderId, null, { params: params, responseType: 'text' as const});
  }

  // PUT
  // api = "/admin/{lang}/order/updateAll/{orderId}"
  updateOrderAndItem(orderId:number, orderState:string, items:ItemInProcess[], lang:string): Observable<any>
  {
    let params = new HttpParams().set('state', orderState);
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/updateAll/" + orderId, items, { params: params, responseType: 'text' as const});
  }

  // DELETE
  // api = "/admin/{lang}/order/delete/{orderId}"
  deleteOrder(orderId: number, lang:string): Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/delete/" + orderId, {responseType: 'text' as const});
  }

  // DELETE
  // api = "/admin/{lang}/order/deleteAll/{orderId}"
  deleteOrderAndItem(orderId: number, lang:string): Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/admin/" + lang + "/order/deleteAll/" + orderId, {responseType: 'text' as const});
  }
}
