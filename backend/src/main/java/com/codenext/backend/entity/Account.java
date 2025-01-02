package com.codenext.backend.entity;
import jakarta.persistence.*;

@Entity
@Table(name="Account")
public class Account extends CodeNextEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name="id")
    private Long id;
    @Column(name = "account_name")
    private String accountName;
    @Column(name = "password")
    private String password;
    @Column(name = "role")
    private String role;

    // username
    @Column(name = "first_name")
    private String firstName ;
    @Column(name = "middle_name")
    private String middleName;
    @Column(name = "last_name")
    private String lastName  ;

    // contact info
    @Column(name = "phone")
    private String phone;
    @Column(name = "email")
    private String email;

    // Address
    @Column(name = "address_line1")
    private String addressLine1  ;
    @Column(name = "address_line2")
    private String addressLine2  ;
    @Column(name = "address_city")
    private String addressCity   ;
    @Column(name = "address_state")
    private String addressState  ;
    @Column(name = "address_country")
    private String addressCountry;
    @Column(name = "address_zipcode")
    private String addressZipCode;

    // Registration Code
    @Column(name = "registration_code")
    private String registrationCode;

    @Column(name = "state")
    private String state;

    public Account()
    {}

    public Account(long id,
                   String accountName,
                   String role,
                   String firstName,
                   String middleName,
                   String lastName,
                   String phone,
                   String email,
                   String addressLine1,
                   String addressLine2,
                   String addressCity,
                   String addressState,
                   String addressCountry,
                   String addressZipCode,
                   String registrationCode,
                   String state)
    {
        this.id = id;
        this.accountName = accountName;
        this.role             = role;
        this.firstName        = firstName;
        this.middleName       = middleName;
        this.lastName         = lastName;
        this.phone            = phone;
        this.email            = email;
        this.addressLine1     = addressLine1;
        this.addressLine2     = addressLine2;
        this.addressCity      = addressCity;
        this.addressState     = addressState;
        this.addressCountry   = addressCountry;
        this.addressZipCode   = addressZipCode;
        this.registrationCode = registrationCode;
        this.state            = state;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getAddressCity() {
        return addressCity;
    }

    public void setAddressCity(String addressCity) {
        this.addressCity = addressCity;
    }

    public String getAddressState() {
        return addressState;
    }

    public void setAddressState(String addressState) {
        this.addressState = addressState;
    }

    public String getAddressCountry() {
        return addressCountry;
    }

    public void setAddressCountry(String addressCountry) {
        this.addressCountry = addressCountry;
    }

    public String getAddressZipCode() {
        return addressZipCode;
    }

    public void setAddressZipCode(String addressZipCode) {
        this.addressZipCode = addressZipCode;
    }

    public String getRegistrationCode() {
        return registrationCode;
    }

    public void setRegistrationCode(String registrationCode) {
        this.registrationCode = registrationCode;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    @Override
    public void format()
    {
        this.accountName      = this.accountName      == null ? null : this.accountName      .trim();
        this.role             = this.role             == null ? null : this.role             .trim();
        this.firstName        = this.firstName        == null ? null : this.firstName        .trim();
        this.middleName       = this.middleName       == null ? null : this.middleName       .trim();
        this.lastName         = this.lastName         == null ? null : this.lastName         .trim();
        this.phone            = this.phone            == null ? null : this.phone            .trim();
        this.email            = this.email            == null ? null : this.email            .trim();
        this.addressLine1     = this.addressLine1     == null ? null : this.addressLine1     .trim();
        this.addressLine2     = this.addressLine2     == null ? null : this.addressLine2     .trim();
        this.addressCity      = this.addressCity      == null ? null : this.addressCity      .trim();
        this.addressState     = this.addressState     == null ? null : this.addressState     .trim();
        this.addressCountry   = this.addressCountry   == null ? null : this.addressCountry   .trim();
        this.addressZipCode   = this.addressZipCode   == null ? null : this.addressZipCode   .trim();
        this.registrationCode = this.registrationCode == null ? null : this.registrationCode .trim();
        this.state            = this.state            == null ? null : this.state            .trim();
    }

    @Override
    public String check()
    {
        if(this.getAccountName() == null || this.getAccountName().equals(""))
        {
            return "ERROR_ACCOUNT_NAME_EMPTY";
        }
        if(this.getPhone() == null || this.getPhone().equals(""))
        {
            return "ERROR_ACCOUNT_PHONE_EMPTY";
        }
        if(this.getEmail() == null || this.getEmail().equals(""))
        {
            return "ERROR_ACCOUNT_EMAIL_EMPTY";
        }
        if(this.getRole() == null || this.getRole().equals(""))
        {
            return "ERROR_ACCOUNT_ROLE_EMPTY";
        }
        return null;
    }

}
