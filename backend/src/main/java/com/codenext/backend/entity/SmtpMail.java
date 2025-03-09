package com.codenext.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="smtp_mail")
public class SmtpMail extends CodeNextEntity
{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private int id;
    @Column(name = "host")
    private String host;
    @Column(name = "port")
    private int port;
    @Column(name = "username")
    private String username;
    @Column(name = "password")
    private String password;
    @Column(name = "protocol")
    private String protocol;

    public SmtpMail() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }


    @Override
    public void format()
    {
        this.host     = this.host == null ? null : this.host.trim();
        this.protocol = this.protocol == null ? null : this.protocol.trim();
        this.username = this.username == null ? null : this.username.trim();
        this.password = this.password == null ? null : this.password.trim();
    }

    @Override
    public String check()
    {
        if(this.host == null || this.host.equals(""))
        {
            return "ERROR_MAIL_HOST_EMPTY";
        }
        if(this.protocol == null || this.protocol.equals(""))
        {
            return "ERROR_MAIL_PROTOCOL_EMPTY";
        }
        if(this.username == null || this.username.equals(""))
        {
            return "ERROR_MAIL_USERNAME_EMPTY";
        }
        if(this.password == null || this.password.equals(""))
        {
            return "ERROR_MAIL_PASSWORD_EMPTY";
        }
        return null;
    }
}
