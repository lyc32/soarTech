export class StoreHouse
{
  id           : number;
  name         : string = "";
  createTime   : string = "";
  status       : string = "";
  details      : string = "";
  addressLine1 : string = "";
  addressLine2 : string = "";
  city         : string = "";
  state        : string = "";
  country      : string = "";
  zipCode      : string = "";

  public format()
  {
    this.name          = this.name         .trim();
    this.createTime    = this.createTime   .trim();
    this.status        = this.status       .trim();
    this.details       = this.details      .trim();
    this.addressLine1  = this.addressLine1 .trim();
    this.addressLine2  = this.addressLine2 .trim();
    this.city          = this.city         .trim();
    this.state         = this.state        .trim();
    this.country       = this.country      .trim();
    this.zipCode       = this.zipCode      .trim();
  }
  public check()
  {
    if(this.name == null || this.name == undefined || this.name == "")
    {
      return 'Repo_Name';
    }
    return null;
  }

  public isStoreHouseName()
  {
    //let reg = /^\w+$/;
    let reg = /^[A-Za-z][\s\w]+$/;
    if(!reg.test(this.name))
    {
      return "Repo_Name_Error";
    }
    return null;
  }
}
