import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { ItemInProcess } from "../../../model/itemInProcess";

@Injectable({
  providedIn: 'root'
})
export class ExporterExportItemService
{
  constructor(private httpClient: HttpClient, private webSiteConfig: WebSiteConfig)
  {}

  // GET
  // api = "/exporter/{lang}/item/get/by/{serialNumber}"
  getItem(serialNumber: string, lang:string): Observable<ItemInProcess>
  {
    return this.httpClient.get<ItemInProcess>(this.webSiteConfig.backendEndpoint + "/exporter/" + lang + "/item/get/by/" + serialNumber);
  }

  // PUT
  // api = "/exporter/{lang}/item/export/{serialNumber}"
  exportItem(item:ItemInProcess, lang:string): Observable<any>
  {
    return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/exporter/" + lang + "/item/export", item, { responseType: 'text' as const});
  }

}
