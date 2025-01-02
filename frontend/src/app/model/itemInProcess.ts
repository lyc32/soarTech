import {CodeNextEntity} from "./codeNextEntity";

export class ItemInProcess implements CodeNextEntity
{
  id           :number;
  itemName     :string = "";
  serialNumber :string = "";
  price        :number = 0;
  orderNumber  :string = "";
  state        :string = "initialize";
  storeHouse   :string = "";
  position     :string = "";
  importerId   :number;
  importTime   :string = "";
  importerName :string = "";
  exporterId   :number;
  exporterName :string = "";
  exportTime   :string = "";
  carrier      :string = "";
  trackNumber  :string = "";

  public format():void
  {
    this.itemName     = this.itemName     == null ? "" : this.itemName    .trim();
    this.serialNumber = this.serialNumber == null ? "" : this.serialNumber.trim();
    this.orderNumber  = this.orderNumber  == null ? "" : this.orderNumber .trim();
    this.state        = this.state        == null ? "" : this.state       .trim();
    this.storeHouse   = this.storeHouse   == null ? "" : this.storeHouse  .trim();
    this.position     = this.position     == null ? "" : this.position    .trim();
    this.importTime   = this.importTime   == null ? "" : this.importTime  .trim();
    this.importerName = this.importerName == null ? "" : this.importerName.trim();
    this.exporterName = this.exporterName == null ? "" : this.exporterName.trim();
    this.exportTime   = this.exportTime   == null ? "" : this.exportTime  .trim();
    this.carrier      = this.carrier      == null ? "" : this.carrier     .trim();
    this.trackNumber  = this.trackNumber  == null ? "" : this.trackNumber .trim();

  }

  public check():any
  {
    if(this.itemName == null || this.itemName == '')
    {
      return "ItemName";
    }

    if(this.orderNumber == null || this.orderNumber == '')
    {
      return "OrderNumber";
    }

    if(this.state != "initialize" && (this.serialNumber == null || this.serialNumber == ''))
    {
      return "SerialNumber";
    }

    if(this.storeHouse == null || this.storeHouse == '')
    {
      return "StoreHouse";
    }

    return null;
  }

}
