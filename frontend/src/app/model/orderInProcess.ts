import {CodeNextEntity} from "./codeNextEntity";

export class OrderInProcess implements CodeNextEntity
{
  id          : number;
  clientID    : number;
  clientName  : string = "";
  orderNumber : string = "";
  orderEmail  : string = "";
  orderLink   : string = "";
  message     : string = "";
  totalPrice  : number = 0.0;
  state       : string = "initialize";
  createTime  : string = "";
  storeHouse  : string = "";

  check(): any
  {
    if(this.orderNumber == null || this.orderNumber == "")
    {
      return "OrderNumber";
    }
    if(this.orderEmail == null || this.orderEmail == "")
    {
      return "OrderEmail";
    }
    if(this.orderLink == null || this.orderLink == "")
    {
      return "OrderLink";
    }
    if(this.storeHouse == null || this.storeHouse == "")
    {
      return "StoreHouse";
    }
    return null;
  }

  format(): void
  {
    this.clientName  = this.clientName == null ? "" : this.clientName .trim();
    this.orderNumber = this.orderNumber== null ? "" : this.orderNumber.trim();
    this.orderEmail  = this.orderEmail == null ? "" : this.orderEmail .trim();
    this.orderLink   = this.orderLink  == null ? "" : this.orderLink  .trim();
    this.message     = this.message    == null ? "" : this.message    .trim();
    this.totalPrice  = this.totalPrice == null ?  0 : this.totalPrice        ;
    this.state       = this.state      == null ? "" : this.state      .trim();
    this.createTime  = this.createTime == null ? "" : this.createTime .trim();
    this.storeHouse  = this.storeHouse == null ? "" : this.storeHouse .trim();
  }

  checkOrderLink()
  {
    if(this.orderLink.indexOf(this.orderNumber) < 0)
    {
      return "ORDER_INFO_INCORRECT_ERROR";
    }
    return null;
  }
}
