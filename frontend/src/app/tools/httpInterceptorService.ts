import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

import { AccountLocalService } from "./accountLocalService";
import { WebSiteConfig       } from "../config/webSiteConfig";

@Injectable({
  providedIn: "root",
})
export class HttpInterceptorService implements HttpInterceptor
{
  constructor(private roleCheck:AccountLocalService, private config:WebSiteConfig) {}

  intercept( req: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>>
  {
    // @ts-ignore
    let jwt:string = this.roleCheck.getSessionAccount(this.config.localSessionName);
    if (jwt != null)
    {
      const authReq = req.clone(
        {
          headers: new HttpHeaders(
            {
              Authorization: `Bearer ${jwt}`,
            }),
        });
      return next.handle(authReq);
    }
    else
    {
      return next.handle(req);
    }
  }
}
