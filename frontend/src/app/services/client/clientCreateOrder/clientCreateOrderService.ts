import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {OrderInProcess} from "../../../model/orderInProcess";

@Injectable({
  providedIn: 'root'
})
export class ClientCreateOrderService
{
  constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
  {}

  // POST
  // api = "/client/{lang}/myOrder/create"
  createOrder(orderInProcessing:OrderInProcess, lang:string):Observable<any>
  {
    return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/create", orderInProcessing, { responseType: 'text' as const});
  }
}
