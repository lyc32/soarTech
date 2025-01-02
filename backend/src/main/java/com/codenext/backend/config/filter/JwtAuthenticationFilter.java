package com.codenext.backend.config.filter;

import java.io.IOException;
import java.util.ArrayList;
import com.codenext.backend.config.scheduler.MainScheduler;
import com.codenext.backend.config.utils.JwtTokenUtils;
import com.codenext.backend.entity.Account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter
{
    @Value("${token.header}")
    private String prefix;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException
    {
        final String authHeader = request.getHeader("Authorization");

        if(MainScheduler.isMaintain)
        {
            filterChain.doFilter(request, response);
            return;
        }

        if (StringUtils.isEmpty(authHeader) || !StringUtils.startsWith(authHeader, prefix))
        {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(prefix.length());
        if (SecurityContextHolder.getContext().getAuthentication() == null)
        {
            Account account;
            try
            {
                account = jwtTokenUtils.getAccountEntity(jwt);
            }
            catch (Exception e)
            {
                account = null;
            }

            if(account != null)
            {
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                ArrayList authorities =  new ArrayList<GrantedAuthority>();
                authorities.add(new SimpleGrantedAuthority(account.getRole()));
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        account, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                context.setAuthentication(authToken);
                SecurityContextHolder.setContext(context);
            }
        }
        filterChain.doFilter(request, response);
    }
}
