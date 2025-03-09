import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";

import type { Container, Engine, ISourceOptions } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { AccountLocalService} from "./tools/accountLocalService";
import { WebSiteConfig} from "./config/webSiteConfig";
import { Router} from "@angular/router";
import { LogoutService} from "./services/forAllRoles/logoutService/logoutService";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy
{
    isLogin:boolean = false;
    timer:number;
    timeStamp:number = 0;
    public currentLanguage: string = '';
    constructor(private accountLocalService:AccountLocalService,
                private config:WebSiteConfig,
                private title:Title,
                private logoutServer:LogoutService,
                private router:Router,
                public translate: TranslateService)
    {}

    particlesOptions: ISourceOptions =
    {
      background: { color: { value: "#000", }, },
      fpsLimit: 30,
      interactivity:
        {
          events:
            {
              onClick:
                {
                  enable: true,
                  mode: ["repulse"],
                },
              onHover:
                {
                  enable: true,
                  mode: ["attract"],
                },
              resize: true,
            },
          modes:
            {
              repulse:
                {
                  distance: 200,
                  duration: 0.4,
                  speed:1
                },
              attract:
                {
                  distance: 200,
                  duration: 0.4,
                  speed:2
                }
            },
        },
      particles:
        {
          color: { value: "#4ff",},
          links:
            {
              color: "#4ff",
              distance: 200,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
          collisions: { enable: false,},
          move:
            {
              direction: "none",
              enable: true,
              outModes: { default: "bounce",},
              random: true,
              speed: 1,
              straight: true,
            },
          number:
            {
              density:
                {
                  enable: true,
                  area: 800,
                },
              value: 100,
            },
          opacity: { value: 0.5, },
          shape: { type:  "circle", },
          size: { value: { min: 1, max: 5}, },
        },
      detectRetina: true,
    }

    async particlesInit(engine: Engine): Promise<void>
    {
        await loadFull(engine);
    }
    public particlesLoaded(container: Container): void
    {}

    ngOnInit()
    {
        let lang = (navigator.language).includes('zh') ? 'zh' : 'en';

        switch(lang)
        {
            case 'zh': this.currentLanguage = 'zh-CN'; break;
            default: this.currentLanguage = 'en-US'; break;
        }

        this.translate.setDefaultLang('en-US'); // 默认英文
        this.translate.use(this.currentLanguage); // 使用当前语言

        this.timeStamp = new Date().getTime();
        this.title.setTitle(this.config.webPageTitle);
        let role = this.accountLocalService.getRole(this.config.localSessionName);
        if(role != "")
        {
            this.isLogin = true;
            if(!this.timer)
            {
                this.timer = window.setTimeout(() => {this.logoutServer.logout(this.router, this.config, this.accountLocalService)}, 1800000);
            }
            else
            {
                clearInterval(this.timer);
                this.timer = window.setTimeout(() => {this.logoutServer.logout(this.router, this.config, this.accountLocalService)}, 1800000);
            }
            document.addEventListener("click",
                ()=>
                {
                    let t = new Date().getTime();
                    if(t - this.timeStamp > 1200000)
                    {
                        this.timeStamp = t;
                        window.clearTimeout(this.timer);
                        this.timer = window.setTimeout(() => {this.logoutServer.logout(this.router, this.config, this.accountLocalService)}, 1800000);
                    }
                });
            document.addEventListener("mousemove",
                ()=>
                {
                    let t = new Date().getTime();
                    if(t - this.timeStamp > 1200000)
                    {
                        this.timeStamp = t;
                        window.clearTimeout(this.timer);
                        this.timer = window.setTimeout(() => {this.logoutServer.logout(this.router, this.config, this.accountLocalService)}, 1800000);
                    }
                });
            document.addEventListener("keypress",
                ()=>
                {
                    console.log("app.component listener");
                    let t = new Date().getTime();
                    if(t - this.timeStamp > 1200000)
                    {
                        this.timeStamp = t;
                        window.clearTimeout(this.timer);
                        this.timer = window.setTimeout(() => {this.logoutServer.logout(this.router, this.config, this.accountLocalService)}, 1800000);
                    }
                });

            let path = this.accountLocalService.getPath(this.config.localSessionPath);
            if(path != null && path != "")
            {
                this.router.navigateByUrl(path);
            }
            else
            {
                this.router.navigateByUrl(role + "/home");
            }
        }
    }

    ngOnDestroy(): void
    {
        document.removeEventListener("click"     ,()=>{});
        document.removeEventListener("mousemove" ,()=>{});
        document.removeEventListener("keypress"  ,()=>{});
        this.logoutServer.logout(this.router, this.config, this.accountLocalService);
    }
}
