import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class WebSiteConfig
{
  // account role
  rootRole : string = "root";
  accountRole = {admin:"admin", client:"client", importer:"importer", exporter:"exporter"};

  // order, item, account, storehouse status
  orderState = {initialize:"initialize", processing:"processing", error:"error", finished:"finished"};
  itemState = {initialize:"initialize", imported:"imported", exported:"exported"};
  accountState = {active:"active", suspend:"suspend"};
  storeHouseState = {active:"active", suspend:"suspend"};

  // local storage setting
  localSessionName : string = "soarTechAccount";
  localSessionCash : string = "soarTechCash";
  localSessionPath : string = "soarTechPath";

  // html title
  webPageTitle     : string = "soarTech";

  // Show create root account view
  rootRegister : string = "register";
  rootPassword : string = "root";


  // for live environment
  backendEndpoint  : string = "";
  phpMyAdmin       : string = "http://www.soartechsales.com/phpmyadmin";

  // for development environment
  //backendEndpoint  : string = "https://localhost:9527";
  //phpMyAdmin       : string = "http://localhost/phpmyadmin";
}
