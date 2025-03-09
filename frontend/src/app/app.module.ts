import { NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserModule } from '@angular/platform-browser';
import { NgParticlesModule } from 'ng-particles';
import { NgConfettiModule } from 'ng-confetti';
import { NgFireworksModule } from 'ng-fireworks';
import { ModalModule } from 'ngx-bootstrap/modal';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {APP_BASE_HREF, HashLocationStrategy, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import { HttpInterceptorService } from "./tools/httpInterceptorService";
import { NgChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// For all users
import { LogInView             } from "./services/forAllRoles/logInService/logInView";
import { AccountInfoView       } from './services/forAllRoles/accountInfoService/accountInfoView';
import { ErrorPageView         } from './services/forAllRoles/errorPageView/errorPageView';
// Client
import { ClientHomePageView    } from "./services/client/clientHomePage/clientHomePageView";
import { ClientCreateOrderView } from './services/client/clientCreateOrder/clientCreateOrderView';
import { ClientOrderView       } from './services/client/clientOrderService/clientOrderView';
import { ClientCreateOrdersView} from './services/client/clientCreateOrders/clientCreateOrdersView';
// Importer
import { ImporterHomePageView  } from "./services/importer/importerHomePage/importerHomePageView";
import { ImporterItemView      } from "./services/importer/importerItemService/importerItemView";
import { ImporterImportItemView} from "./services/importer/importImportItemService/importerImportItemView";
// Exporter
import { ExporterHomePageView  } from './services/exporter/exporterHomePage/exporterHomePageView';
import { ExporterExportItemView} from './services/exporter/exporterExportItemService/exporterExportItemView';
import { ExporterItemView      } from './services/exporter/exporterItemService/exporterItemView';
// Admin
import { AdminHomePageView     } from './services/admin/adminHomePage/adminHomePageView';
import { AdminOrderView        } from './services/admin/adminOrderService/adminOrderView';
import { AdminAccountView      } from './services/admin/adminAccountService/adminAccountView';
import { AdminItemView         } from './services/admin/adminItemService/adminItemView';
import { AdminStoreHouseView   } from './services/admin/adminStoreHouseService/adminStoreHouseView';
import { AdminReportView       } from './services/admin/adminReportService/adminReportView';
// Root
import { RootHomePageView     } from './services/root/rootHomePage/rootHomePageView';
import { RootAccountView      } from './services/root/rootAccountService/rootAccountView';
import { RootOrderView        } from './services/root/rootOrderService/rootOrderView';
import { RootItemView         } from './services/root/rootItemService/rootItemView';
import { RootStoreHouseView   } from './services/root/rootStoreHouseService/rootStoreHouseView';
import { RootMyAccountInfoView} from './services/root/rootMyAccountInfo/rootMyAccountInfoView';
import { RootSystemView       } from './services/root/rootSystemService/rootSystemView';
import { RootMailConfigView } from './services/root/rootMailConfig/rootMailConfigView';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
        ErrorPageView,
        LogInView,
        AccountInfoView,
        ClientCreateOrderView,
        ClientOrderView,
        ClientHomePageView,
        ImporterHomePageView,
        ImporterImportItemView,
        ImporterItemView,
        ExporterHomePageView,
        ExporterItemView,
        ExporterExportItemView,
        AdminHomePageView,
        AdminOrderView,
        AdminAccountView,
        AdminItemView,
        AdminStoreHouseView,
        AdminReportView,
        RootHomePageView,
        RootAccountView,
        RootItemView,
        RootOrderView,
        RootStoreHouseView,
        RootMyAccountInfoView,
        RootSystemView,
        ClientCreateOrdersView,
        RootMailConfigView
    ],
  imports: [
      TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: (createTranslateLoader),
              deps: [HttpClient]
          }
      }),
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      RouterOutlet,
      FormsModule,
      ModalModule.forRoot(),
      NgParticlesModule,
      NgConfettiModule,
      NgFireworksModule,
      BsDatepickerModule.forRoot(),
      BrowserAnimationsModule,
      ReactiveFormsModule,
      NgChartsModule
  ],
    providers: [
        { provide: LocationStrategy, useClass:  HashLocationStrategy},
        { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true}
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
