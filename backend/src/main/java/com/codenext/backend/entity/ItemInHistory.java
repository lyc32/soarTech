package com.codenext.backend.entity;

import com.codenext.backend.config.context.ItemState;
import jakarta.persistence.*;

@Entity
@Table(name="item_in_history", indexes = {@Index(columnList = "order_number"), @Index(columnList = "serial_number")})
public class ItemInHistory extends CodeNextEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
    @Column(name = "item_name")
    private String itemName;
    @Column(name = "serial_number")
    private String serialNumber;
    @Column(name = "order_number")
    private String orderNumber;

    @Column(name = "store_house")
    private String storeHouse;
    @Column(name = "position")
    private String position;
    @Column(name = "price")
    private Float price;
    @Column(name = "importer_id")
    private Long importerId;
    @Column(name = "importer_name")
    private String importerName;
    @Column(name = "import_time")
    private String importTime;


    @Column(name = "exporter_id")
    private Long exporterId;
    @Column(name = "exporter_name")
    private String exporterName;
    @Column(name = "export_time")
    private String exportTime;
    @Column(name = "carrier")
    private String carrier;
    @Column(name = "track_number")
    private String trackNumber;
    @Column(name="archive_time")
    private String archiveTime;

    public ItemInHistory()
    {
    }

    public ItemInHistory(Long id, String itemName, String serialNumber, String orderNumber, String storeHouse, String position, Float price, Long importerId, String importerName, String importTime, Long exporterId, String exporterName, String exportTime, String carrier, String trackNumber, String archiveTime) {
        this.id = id;
        this.itemName = itemName;
        this.serialNumber = serialNumber;
        this.orderNumber = orderNumber;
        this.storeHouse = storeHouse;
        this.position = position;
        this.price = price;
        this.importerId = importerId;
        this.importerName = importerName;
        this.importTime = importTime;
        this.exporterId = exporterId;
        this.exporterName = exporterName;
        this.exportTime = exportTime;
        this.carrier = carrier;
        this.trackNumber = trackNumber;
        this.archiveTime = archiveTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getStoreHouse() {
        return storeHouse;
    }

    public void setStoreHouse(String storeHouse) {
        this.storeHouse = storeHouse;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public Float getPrice() {
        return price;
    }

    public void setPrice(Float price) {
        this.price = price;
    }

    public Long getImporterId() {
        return importerId;
    }

    public void setImporterId(Long importerId) {
        this.importerId = importerId;
    }

    public String getImporterName() {
        return importerName;
    }

    public void setImporterName(String importerName) {
        this.importerName = importerName;
    }

    public String getImportTime() {
        return importTime;
    }

    public void setImportTime(String importTime) {
        this.importTime = importTime;
    }

    public Long getExporterId() {
        return exporterId;
    }

    public void setExporterId(Long exporterId) {
        this.exporterId = exporterId;
    }

    public String getExporterName() {
        return exporterName;
    }

    public void setExporterName(String exporterName) {
        this.exporterName = exporterName;
    }

    public String getExportTime() {
        return exportTime;
    }

    public void setExportTime(String exportTime) {
        this.exportTime = exportTime;
    }

    public String getCarrier() {
        return carrier;
    }

    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }

    public String getTrackNumber() {
        return trackNumber;
    }

    public void setTrackNumber(String trackNumber) {
        this.trackNumber = trackNumber;
    }

    public String getArchiveTime() {
        return archiveTime;
    }

    public void setArchiveTime(String archiveTime) {
        this.archiveTime = archiveTime;
    }

    public ItemInProcess toItemInProcessing()
    {
        ItemInProcess item = new ItemInProcess();
        item.setItemName(this.itemName);
        item.setSerialNumber(this.serialNumber);
        item.setOrderNumber(this.orderNumber);
        item.setStoreHouse(this.storeHouse);
        item.setPosition(this.position);
        item.setPrice(this.price);
        item.setImporterId(this.importerId);
        item.setImporterName(this.importerName);
        item.setImportTime(this.importTime);
        item.setExporterId(this.exporterId);
        item.setExporterName(this.exporterName);
        item.setExportTime(this.exportTime);
        item.setCarrier(this.carrier);
        item.setTrackNumber(this.trackNumber);
        item.setState(ItemState.EXPORTED);
        return item;
    }

    @Override
    public void format()
    {
        this.itemName     = this.itemName    == null ? null : this.itemName.trim();
        this.orderNumber  = this.orderNumber == null ? null : this.orderNumber.trim();
        this.importerId   = this.importerId   == null ? null : this.importerId;
        this.importTime   = this.importTime   == null ? null : this.importTime.trim();
        this.importerName = this.importerName == null ? null : this.importerName.trim();
        this.serialNumber = this.serialNumber == null ? null : this.serialNumber.trim();
        this.storeHouse   = this.storeHouse   == null ? null : this.storeHouse.trim();
        this.position     = this.position     == null ? null : this.position.trim();
        this.price        = this.price        == null ? 0    : this.price;

        this.exporterId   = this.exporterId   == null ? null : this.exporterId;
        this.exporterName = this.exporterName == null ? null : this.exporterName.trim();
        this.exportTime   = this.exportTime   == null ? null : this.exportTime.trim();
        this.carrier      = this.carrier      == null ? null : this.carrier.trim();
        this.trackNumber  = this.trackNumber  == null ? null : this.trackNumber.trim();
    }

    @Override
    public String check()
    {
        if(this.getItemName() == null || this.getItemName().equals(""))
        {
            return "ERROR_ITEM_NAME_EMPTY";
        }
        if(this.getOrderNumber() == null || this.getOrderNumber().equals(""))
        {
            return "ERROR_ORDER_NUMBER_EMPTY";
        }
        if(this.getSerialNumber() == null || this.getSerialNumber().equals(""))
        {
            return "ERROR_SERIAL_NUMBER_EMPTY";
        }
        if(this.getStoreHouse() == null || this.getStoreHouse().equals(""))
        {
            return "ERROR_STORE_HOUSE_EMPTY";
        }
        return null;
    }
}
