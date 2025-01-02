import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { OrderInProcess } from "../../../model/orderInProcess";
import {ItemInProcess} from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class ClientOrderService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // GET
  // api = "/client/{lang}/myOrder/{table}/{page}"
  getOrderList(table:string, startTime:string, endTime:string, storeHouse:string, state:string, page:number, lang:string):Observable<OrderInProcess[]>
  {
    if(table == "inProcess")
    {
      let params = new HttpParams().set('startTime', startTime).set('endTime', endTime).set("storeHouse", storeHouse).set("state", state);
      return this.httpClient.get<OrderInProcess[]>(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/" + table + "/" + page, { params: params });
    }
    else
    {
      let params = new HttpParams().set('startTime', startTime).set('endTime', endTime).set("storeHouse", storeHouse);
      return this.httpClient.get<OrderInProcess[]>(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/" + table + "/" + page, { params: params });
    }
  }

  // GET
  // api = "/client/{lang}/myItem/get/by/{orderId}"
  getItemsByOrderId(orderId:number, lang:string):Observable<ItemInProcess[]>
  {
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myItem/get/by/" + orderId);
  }

  // GET
  // api = "/client/{lang}/myItem/get/{table}/by/{orderId}"
  getAllItemsByOrderId(orderId:number, table:string, lang:string):Observable<ItemInProcess[]>
  {
    return this.httpClient.get<ItemInProcess[]>(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myItem/get/"+table+"/by/" + orderId);
  }

  // PUT
  // api = "/client/{lang}/myOrder/autoFix/{orderId}"
  autoFix(id:number, lang:string)
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/autoFix/" + id, null, { responseType: 'text' as const});
  }

  // PUT
  // api = "/client/{lang}/myOrder/update"
  updateOrder(order:OrderInProcess, lang:string):Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/update", order, { responseType: 'text' as const});
  }

  // PUT
  // api = "/client/{lang}/myOrder/updateAll/{id}"
  updateOrderAndItem(order:OrderInProcess, items:ItemInProcess[], lang:string):Observable<any>
  {
    let params = new HttpParams();
    if(order.totalPrice == null || order.totalPrice == undefined)
    {
      params = params.set('totalPrice', 0);
    }
    else
    {
      params = params.set('totalPrice', order.totalPrice);
    }

    if(order.storeHouse != null  || order.storeHouse != "")
    {
      params = params.set('storeHouse', order.storeHouse);
    }

    if(order.message != null  || order.message != "")
    {
      params = params.set('message', order.message);
    }

    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/updateAll/" + order.id, items, { params: params, responseType: 'text' as const});
  }

  // PUT
  // api = "/client/{lang}/myOrder/delete/{id}"
  deleteOrder(orderId:number, lang:string):Observable<any>
  {
    return this.httpClient.delete(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/delete/" + orderId, { responseType: 'text' as const});
  }
}
