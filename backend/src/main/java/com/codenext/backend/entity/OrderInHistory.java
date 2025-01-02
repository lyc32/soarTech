package com.codenext.backend.entity;

import com.codenext.backend.config.context.OrderState;
import jakarta.persistence.*;

@Entity
@Table(name="order_in_history", indexes = {@Index(columnList = "order_number"), @Index(columnList = "client_id")})
public class OrderInHistory extends CodeNextEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="id")
    private Long id;
    @Column(name="client_id")
    private Long clientID;
    @Column(name = "client_name")
    private String clientName;
    @Column(name="order_number")
    private String orderNumber;
    @Column(name="order_email")
    private String orderEmail;
    @Column(name="order_link")
    private String orderLink;
    @Column(name="message")
    private String message;
    @Column(name="total_price")
    private Float  totalPrice;
    @Column(name="create_time")
    private String createTime;
    @Column(name="archive_time")
    private String archiveTime;
    @Column(name = "store_house")
    private String storeHouse;

    public OrderInHistory()
    {}

    public OrderInHistory(Long id, Long clientID, String clientName, String orderNumber, String orderEmail, String orderLink, String message, Float totalPrice, String createTime, String archiveTime, String storeHouse) {
        this.id = id;
        this.clientID = clientID;
        this.clientName = clientName;
        this.orderNumber = orderNumber;
        this.orderEmail = orderEmail;
        this.orderLink = orderLink;
        this.message = message;
        this.totalPrice = totalPrice;
        this.createTime = createTime;
        this.archiveTime = archiveTime;
        this.storeHouse = storeHouse;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClientID() {
        return clientID;
    }

    public void setClientID(Long clientID) {
        this.clientID = clientID;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getOrderEmail() {
        return orderEmail;
    }

    public void setOrderEmail(String orderEmail) {
        this.orderEmail = orderEmail;
    }

    public String getOrderLink() {
        return orderLink;
    }

    public void setOrderLink(String orderLink) {
        this.orderLink = orderLink;
    }

    public String getMessage() {
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Float getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Float totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getStoreHouse() {
        return storeHouse;
    }

    public void setStoreHouse(String storeHouseId) {
        this.storeHouse = storeHouseId;
    }

    public String getArchiveTime() {
        return archiveTime;
    }

    public void setArchiveTime(String archiveTime) {
        this.archiveTime = archiveTime;
    }

    public OrderInProcess toOrderInProcessing()
    {
        OrderInProcess orderInProcess = new OrderInProcess();
        orderInProcess.setClientID(this.clientID);
        orderInProcess.setClientName(this.clientName);
        orderInProcess.setOrderNumber(this.orderNumber);
        orderInProcess.setOrderEmail(this.orderEmail);
        orderInProcess.setOrderLink(this.orderLink);
        orderInProcess.setState(OrderState.FINISHED);
        orderInProcess.setCreateTime(this.createTime);
        orderInProcess.setMessage(this.message);
        orderInProcess.setStoreHouse(this.storeHouse);
        orderInProcess.setTotalPrice(this.totalPrice);
        return orderInProcess;
    }

    @Override
    public void format()
    {
        this.clientName  = this.clientName == null ? null : this.clientName .trim();
        this.orderNumber = this.orderNumber== null ? null : this.orderNumber.trim();
        this.orderEmail  = this.orderEmail == null ? null : this.orderEmail .trim();
        this.orderLink   = this.orderLink  == null ? null : this.orderLink  .trim();
        this.message     = this.message    == null ? null : this.message    .trim();
        this.totalPrice  = this.totalPrice == null ?    0 : this.totalPrice        ;
        this.archiveTime = this.archiveTime== null ? null : this.archiveTime.trim();
        this.createTime  = this.createTime == null ? null : this.createTime .trim();
        this.storeHouse  = this.storeHouse == null ? null : this.storeHouse .trim();
    }

    @Override
    public String check()
    {
        if(this.id != null && (this.clientName == null || this.clientName.equals("")))
        {
            return "ERROR_CLIENT_EMPTY";
        }
        if(this.orderEmail == null || this.orderEmail.equals(""))
        {
            return "ERROR_EMAIL_EMPTY";
        }
        if(this.orderNumber == null || this.orderNumber.equals(""))
        {
            return "ERROR_ORDER_NUMBER_EMPTY";
        }
        if(this.orderLink == null || this.orderLink.equals(""))
        {
            return "ERROR_URL_EMPTY";
        }
        if(this.orderLink.indexOf(this.orderNumber) < 0)
        {
            return "ERROR_ORDER_URL_NOT_MATCH";
        }
        if(this.storeHouse == null || this.storeHouse.equals(""))
        {
            return "ERROR_STORE_HOUSE_EMPTY";
        }

        return null;
    }
}
