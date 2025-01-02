package com.codenext.backend.entity;
import com.codenext.backend.config.context.StoreHouseState;
import jakarta.persistence.*;

import java.text.SimpleDateFormat;
import java.util.Date;

@Entity
@Table(name="store_house")
public class StoreHouse extends CodeNextEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private int id;
    @Column(name = "name")
    private String name;
    @Column(name = "create_time")
    private String createTime;
    @Column(name = "status")
    private String status;
    @Column(name = "details")
    private String details;
    @Column(name = "address_line1")
    private String addressLine1;
    @Column(name = "address_line2")
    private String addressLine2;
    @Column(name = "city")
    private String city;
    @Column(name = "state")
    private String state;
    @Column(name = "country")
    private String country;
    @Column(name = "zip_code")
    private String zipCode;

    public StoreHouse() {
    }

    public StoreHouse(int id, String name, String createTime, String status, String details, String addressLine1, String addressLine2, String city, String state, String country, String zipCode) {
        this.id = id;
        this.name = name;
        this.createTime = createTime;
        this.status = status;
        this.details = details;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.country = country;
        this.zipCode = zipCode;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    @Override
    public void format()
    {
        this.name         = this.name         == null ? null : this.name         ;
        this.createTime   = this.createTime   == null ? null : this.createTime   ;
        this.status       = this.status       == null ? null : this.status       ;
        this.details      = this.details      == null ? null : this.details      ;
        this.addressLine1 = this.addressLine1 == null ? null : this.addressLine1 ;
        this.addressLine2 = this.addressLine2 == null ? null : this.addressLine2 ;
        this.city         = this.city         == null ? null : this.city         ;
        this.state        = this.state        == null ? null : this.state        ;
        this.country      = this.country      == null ? null : this.country      ;
        this.zipCode      = this.zipCode      == null ? null : this.zipCode      ;
    }

    @Override
    public String check()
    {
        if(this.name == null || this.name.equals(""))
        {
            return "ERROR_STOREHOUSE_NAME_EMPTY";
        }
        return null;
    }
}
