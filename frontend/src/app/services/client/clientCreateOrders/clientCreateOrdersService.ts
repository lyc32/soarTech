import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {WebSiteConfig} from "../../../config/webSiteConfig";
import {OrderInProcess} from "../../../model/orderInProcess";
import {ItemInProcess} from "../../../model/itemInProcess";

@Injectable({
    providedIn: 'root'
})

export class ClientCreateOrdersService
{
    constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
    {}

    createInitOrders(orderList:OrderInProcess[], lang:string)
    {
        return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/create/init/batches", orderList, { responseType: 'text' as const});
    }

    createProcessOrder(order:OrderInProcess, lang:string)
    {
        return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/create/process", order, { responseType: 'text' as const});
    }

    createItems(orderNumber:string, itemList:ItemInProcess[], lang:string)
    {

        return this.httpClient.post(this.webSiteConfig.backendEndpoint + "/client/" + lang + "/myOrder/insert/" + orderNumber + "/items", itemList, { responseType: 'text' as const});
    }
}
