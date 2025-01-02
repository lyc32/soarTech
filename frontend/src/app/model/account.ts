import {CodeNextEntity} from "./codeNextEntity";

export class Account implements CodeNextEntity
{
  id         : number;
  accountName: string = "";
  password   : string = "";
  role       : string = "";
  firstName  : string = "";
  middleName : string = "";
  lastName   : string = "";
  phone      : string = "";
  email      : string = "";
  addressLine1   : string = "";
  addressLine2   : string = "";
  addressCity    : string = "";
  addressState   : string = "";
  addressCountry : string = "";
  addressZipCode : string = "";
  registrationCode : string = "";
  state:string = "";

  public format():void
  {
    this.accountName      = this.accountName      == null ? "" : this.accountName      .trim();
    this.role             = this.role             == null ? "" : this.role             .trim();
    this.firstName        = this.firstName        == null ? "" : this.firstName        .trim();
    this.middleName       = this.middleName       == null ? "" : this.middleName       .trim();
    this.lastName         = this.lastName         == null ? "" : this.lastName         .trim();
    this.phone            = this.phone            == null ? "" : this.phone            .trim();
    this.email            = this.email            == null ? "" : this.email            .trim();
    this.addressLine1     = this.addressLine1     == null ? "" : this.addressLine1     .trim();
    this.addressLine2     = this.addressLine2     == null ? "" : this.addressLine2     .trim();
    this.addressCity      = this.addressCity      == null ? "" : this.addressCity      .trim();
    this.addressState     = this.addressState     == null ? "" : this.addressState     .trim();
    this.addressCountry   = this.addressCountry   == null ? "" : this.addressCountry   .trim();
    this.addressZipCode   = this.addressZipCode   == null ? "" : this.addressZipCode   .trim();
    this.registrationCode = this.registrationCode == null ? "" : this.registrationCode .trim();
    this.state            = this.state            == null ? "" : this.state            .trim();
  }
  public check():any
  {
    if(this.accountName == null || this.accountName == undefined || this.accountName == "")
    {
      return 'AccountName';
    }
    if(this.phone == null || this.phone == undefined || this.phone == "")
    {
      return 'Phone';
    }
    if(this.email == null || this.email == undefined || this.email == "")
    {
      return 'Email';
    }
    if(this.role == null || this.role == undefined || this.role == "")
    {
      return 'Role';
    }
    return null;
  }
  public isPhoneNumber():any
  {
    let reg= /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    // Only number Input
    // XXX-XXX-XXXX
    // XXX.XXX.XXXX
    // XXX XXX XXXX
    if (!reg.test(this.phone))
    {
      reg = /^\+?([0-9]{1,3})\)?[-. ]([0-9]{3})[-. ]?([0-9]{3,4})[-. ]?([0-9]{4})$/
      // +xxx xxx-xxx-xxx
      // +xxx xxx.xxx.xxx
      // +xxx xxx xxx xxx
      if(reg.test(this.phone))
      {
        return null;
      }
      return "Account_Phone_Error";
    }
    else
    {
      return null;
    }
  }
  public isEmailID():any
  {
    let reg = /^\S+@\S+\.\S+$/;
    if(reg.test(this.email))
    {
      return null
    }

    return "Account_Email_Error";
  }
  public isAccountName():any
  {
    let reg = /^\w+$/;
    if(!reg.test(this.accountName))
    {
      return "Account_Name_Error";
    }
    return null;
  }

}
