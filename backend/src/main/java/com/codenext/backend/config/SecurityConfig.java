package com.codenext.backend.config;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.codenext.backend.config.filter.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig
{
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(
                        request -> request
                                .requestMatchers("/root/**"    ).hasAnyAuthority("root")
                                // admin
                                .requestMatchers("/admin/**"    ).hasAnyAuthority("admin")
                                // import item
                                .requestMatchers("/importer/**"   ).hasAnyAuthority("importer")
                                // export item
                                .requestMatchers("/exporter/**"   ).hasAnyAuthority("exporter")
                                // client account and order operations.
                                .requestMatchers("/client/**"  ).hasAnyAuthority("client")
                                // for all roles
                                .requestMatchers("/myAccount/**").hasAnyAuthority("client", "importer", "exporter", "admin", "root")
                                .anyRequest().permitAll())
                .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
                .addFilterBefore( jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // This is a useless bean.
    // The reason why I created this bean is just that I don't like to see the tmp_pass in the console when SpringBoot boots;
    @Bean
    public UserDetailsService userDetailsService()
    {
        return new UserDetailsService()
        {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return null;
            }
        };
    }

}
