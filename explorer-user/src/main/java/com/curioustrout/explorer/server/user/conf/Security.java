package com.curioustrout.explorer.server.user.conf;

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.keycloak.adapters.springsecurity.KeycloakConfiguration;
import org.keycloak.adapters.springsecurity.config.KeycloakWebSecurityConfigurerAdapter;
import org.keycloak.adapters.springsecurity.management.HttpSessionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.session.HttpSessionEventPublisher;


//@EnableWebSecurity
//@Configuration
@KeycloakConfiguration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
//@ComponentScan(basePackageClasses = KeycloakSecurityComponents.class)
public class Security extends KeycloakWebSecurityConfigurerAdapter {


    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        var authProvider = keycloakAuthenticationProvider();
        authProvider.setGrantedAuthoritiesMapper(new SimpleAuthorityMapper());
        auth.authenticationProvider(authProvider);
    }

    @Bean
    public KeycloakSpringBootConfigResolver KeycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }

/*    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(
                new SessionRegistryImpl());
    }*/

    @Bean
    @Override
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new RegisterSessionAuthenticationStrategy(buildSessionRegistry());
    }

    @Bean
    protected SessionRegistry buildSessionRegistry() {
        return new SessionRegistryImpl();
    }
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);

        http.cors().and().csrf().disable()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                    .sessionAuthenticationStrategy(sessionAuthenticationStrategy())
                .and()
                .authorizeRequests()
                    .antMatchers("/secured/user/**").hasRole("explorer-user")
                    .antMatchers("/public/**").permitAll()
                    .anyRequest().authenticated();
    }

//    @Bean
//    public FilterRegistrationBean<?> keycloakAuthenticationProcessingFilterRegistrationBean(
//            KeycloakAuthenticationProcessingFilter filter
//    ) {
//        var regBean = new FilterRegistrationBean<>(filter);
//        regBean.setEnabled(false);
//        return regBean;
//    }

//    @Bean
//    public FilterRegistrationBean<?> keycloakPreAuthActionsFilterRegistrationBean(
//            KeycloakPreAuthActionsFilter filter) {

//        FilterRegistrationBean<?> registrationBean = new FilterRegistrationBean<>(filter);
//        registrationBean.setEnabled(false);
//        return registrationBean;
//    }

//    @Bean
//    public FilterRegistrationBean<?> keycloakAuthenticatedActionsFilterBean(
//            KeycloakAuthenticatedActionsFilter filter) {

//        FilterRegistrationBean<?> registrationBean = new FilterRegistrationBean<>(filter);

//        registrationBean.setEnabled(false);
//        return registrationBean;
//    }

//    @Bean
//    public FilterRegistrationBean<?> keycloakSecurityContextRequestFilterBean(
//            KeycloakSecurityContextRequestFilter filter) {

//        FilterRegistrationBean<?> registrationBean = new FilterRegistrationBean<>(filter);

//        registrationBean.setEnabled(false);

//        return registrationBean;
//    }

        @Bean
        @Override
        @ConditionalOnMissingBean(HttpSessionManager.class)
        protected HttpSessionManager httpSessionManager() {
            return new HttpSessionManager();
        }

/*        @Bean
        public HttpSessionEventPublisher httpSessionEventPublisher() {
            return new HttpSessionEventPublisher();
        }*/

    @Bean
    public ServletListenerRegistrationBean<HttpSessionEventPublisher> httpSessionEventPublisher() {
        return new ServletListenerRegistrationBean<>(new HttpSessionEventPublisher());
    }

}
