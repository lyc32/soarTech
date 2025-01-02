import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// For all roles
import { AccountInfoView       } from "./services/forAllRoles/accountInfoService/accountInfoView";
import { ErrorPageView         } from "./services/forAllRoles/errorPageView/errorPageView";
// Client
import { ClientHomePageView    } from "./services/client/clientHomePage/clientHomePageView";
import { ClientOrderView       } from "./services/client/clientOrderService/clientOrderView";
import { ClientCreateOrderView } from "./services/client/clientCreateOrder/clientCreateOrderView";
import { ClientCreateOrdersView} from './services/client/clientCreateOrders/clientCreateOrdersView';
// Importer
import { ImporterHomePageView  } from "./services/importer/importerHomePage/importerHomePageView";
import { ImporterItemView      } from "./services/importer/importerItemService/importerItemView";
import { ImporterImportItemView} from "./services/importer/importImportItemService/importerImportItemView";
// Exporter
import { ExporterHomePageView  } from "./services/exporter/exporterHomePage/exporterHomePageView";
import { ExporterItemView      } from "./services/exporter/exporterItemService/exporterItemView";
import { ExporterExportItemView} from "./services/exporter/exporterExportItemService/exporterExportItemView";
// Admin
import { AdminHomePageView     } from "./services/admin/adminHomePage/adminHomePageView";
import { AdminAccountView      } from "./services/admin/adminAccountService/adminAccountView";
import { AdminOrderView        } from "./services/admin/adminOrderService/adminOrderView";
import { AdminItemView         } from "./services/admin/adminItemService/adminItemView";
import { AdminStoreHouseView   } from "./services/admin/adminStoreHouseService/adminStoreHouseView";
import { AdminReportView       } from "./services/admin/adminReportService/adminReportView";
// Root
import { RootHomePageView      } from "./services/root/rootHomePage/rootHomePageView";

const routes: Routes = [
  { path:":role/accountInfo"          ,  component:AccountInfoView       },

  { path:"client/home"                ,  component:ClientHomePageView    },
  { path:"client/order/addNewOrder"   ,  component:ClientCreateOrderView },
  { path:"client/order/addOrders"     ,  component:ClientCreateOrdersView},
  { path:"client/order/:state"        ,  component:ClientOrderView       },

  { path:"importer/home"              ,  component:ImporterHomePageView  },
  { path:"importer/import/item"       ,  component:ImporterImportItemView},
  { path:"importer/item/management"   ,  component:ImporterItemView      },

  { path:"exporter/home"              ,  component:ExporterHomePageView  },
  { path:"exporter/export/item"       ,  component:ExporterExportItemView},
  { path:"exporter/item/management"   ,  component:ExporterItemView      },

  { path:"admin/home"                 ,  component:AdminHomePageView     },
  { path:"admin/account/management"   ,  component:AdminAccountView      },
  { path:"admin/order/management"     ,  component:AdminOrderView        },
  { path:"admin/item/management"      ,  component:AdminItemView         },
  { path:"admin/storehouse/management",  component:AdminStoreHouseView   },
  { path:"admin/performanceReport"    ,  component:AdminReportView       },

  { path:"root/:workspace"            ,  component:RootHomePageView      },

  { path:"error"                      , component:ErrorPageView          }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:false})],
  exports: [RouterModule]
})
export class AppRoutingModule
{}
