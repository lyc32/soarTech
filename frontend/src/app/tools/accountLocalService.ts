import {Injectable} from "@angular/core";
import {jwtDecode} from "jwt-decode";
import {Account} from "../model/account";

@Injectable({
  providedIn: 'root'
})
export class AccountLocalService
{
  getSessionAccount(sessionAccount:string)
  {
    return window.sessionStorage.getItem(sessionAccount);
  }
  setSessionAccount(sessionAccount:string, jwt:string)
  {
    window.sessionStorage.setItem(sessionAccount, jwt);
  }

  getCash(sessionCash:string)
  {
    return window.sessionStorage.getItem(sessionCash);
  }

  setCash(sessionCash:string, json:string)
  {
    window.sessionStorage.setItem(sessionCash, json);
  }

  removeCash(sessionCash:string)
  {
    window.sessionStorage.removeItem(sessionCash);
  }

  getAccountEntityByJWT(jwt:string)
  {
    let accountEntity:Account = jwtDecode<Account>(jwt);
    return accountEntity;
  }

  getAccountEntityBySessionAccount(sessionAccount:string)
  {
    let jwt = window.sessionStorage.getItem(sessionAccount);
    if(jwt != null)
    {
      let accountEntity:Account = jwtDecode<Account>(jwt);
      return accountEntity;
    }
    else
    {
      return null;
    }
  }

  getRole(sessionAccount:string)
  {
    let jwt = window.sessionStorage.getItem(sessionAccount);
    if(jwt != null)
    {
      let accountEntity:Account = jwtDecode<Account>(jwt);
      return accountEntity.role;
    }
    else
    {
      return "";
    }
  }

  getHomePageUrl(role:string):any
  {
    return "/" + role + "/home";
  }

  getAccountNameByAccountEntity(account:Account):string
  {
    let name:string = "";
    if(account.firstName != null && account.firstName != undefined && account.firstName != "")
    {
      name = account.firstName;
    }

    if(account.middleName != null && account.middleName != undefined && account.middleName != "")
    {
      if(name != '')
      {
        name = name + " ";
      }
      name = name + account.middleName;
    }

    if(account.lastName != null && account.lastName != undefined && account.lastName != "")
    {
      if(name != '')
      {
        name = name + " ";
      }
      name = name + account.lastName;
    }

    if(name != "")
    {
      return name;
    }
    else
    {
      return account.accountName;
    }
  }

  getUserNameByAccountEntity(account:Account):string
  {
    let name:string = "";
    if(account.firstName != null && account.firstName != undefined && account.firstName != "")
    {
      name = account.firstName;
    }

    if(account.middleName != null && account.middleName != undefined && account.middleName != "")
    {
      if(name != '')
      {
        name = name + " ";
      }
      name = name + account.middleName;
    }

    if(account.lastName != null && account.lastName != undefined && account.lastName != "")
    {
      if(name != '')
      {
        name = name + " ";
      }
      name = name + account.lastName;
    }
    return name;
  }

  cleanSession(sessionAccount:string, sessionCash:string):void
  {
    window.sessionStorage.removeItem(sessionAccount);
    window.sessionStorage.removeItem(sessionCash);
  }

  isPassword(s:string):any
  {
    if(s == null || s == undefined || s == '')
    {
      return 'Account_Pass_Empty';
    }
    return null;
  }

  isPassSame(s1:string, s2:string):any
  {
    if(s1 == s2)
    {
      return 'Account_New_Pass_Same_Error';
    }
    return null;
  }

  isPassConfirm(s1:string, s2:string):any
  {
    if(s1 != s2)
    {
      return 'Account_Pass_Confirm_Error';
    }
    return null;
  }

  public isEmailID(email:string):any
  {
    if(email == null || email == undefined || email == '')
    {
      return 'Email Is Empty';
    }

    let reg = /^\S+@\S+\.\S+$/;
    if(reg.test(email))
    {
      return null
    }
    return "Account_Email_Error";
  }

}
