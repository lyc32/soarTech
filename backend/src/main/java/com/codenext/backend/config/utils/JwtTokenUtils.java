package com.codenext.backend.config.utils;

import java.security.Key;
import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtTokenUtils
{
    @Value("${token.secretKey}")
    private String jwtSigningKey;

    public String generateToken(Account account)
    {
        return Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .claim("id"         , account.getId()         )
                .claim("accountName", account.getAccountName())
                .claim("firstName"  , account.getFirstName()  )
                .claim("middleName" , account.getMiddleName() )
                .claim("lastName"   , account.getLastName()   )
                .claim("role"       , account.getRole()       )
                .claim("state"      , account.getState()      )
                .signWith(getSigningKey(), SignatureAlgorithm.HS256).compact();
    }

    public Account getAccountEntity(String token)
    {
        final Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return new Account( Long.valueOf(claims.get("id").toString()), claims.get("accountName").toString(), claims.get("role").toString(), null, null, null,null,null,null,null,null,null,null,null,null, claims.get("state").toString());
    }

    private Key getSigningKey()
    {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSigningKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
