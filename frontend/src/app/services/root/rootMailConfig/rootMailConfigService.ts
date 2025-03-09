import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { WebSiteConfig } from "../../../config/webSiteConfig";
import { SmtpMail      } from "../../../model/smtpMail";

@Injectable({
    providedIn: 'root'
})
export class RootMailConfigService
{
    constructor(private httpClient:HttpClient, private webSiteConfig:WebSiteConfig)
    {}

    // GET
    // api = "/root/mail/{lang}/get"
    getMailConfig(lang:string):Observable<SmtpMail>
    {
        return this.httpClient.get<SmtpMail>(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/mail/get");
    }

    // PUT
    // api = "/root/mail/{lang}/save"
    setMailConfig(smtpMail:SmtpMail, lang:string):Observable<any>
    {
        return this.httpClient.put(this.webSiteConfig.backendEndpoint + "/root/" + lang + "/mail/save", smtpMail, { responseType: 'text' as const});
    }

}
