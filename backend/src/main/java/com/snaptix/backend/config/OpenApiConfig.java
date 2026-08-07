package com.snaptix.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SnapTix Backend REST API")
                        .version("2.0.0")
                        .description("SnapTix Anti-Scalping Ticket Engine with 15-second Rotating HMAC Passes & Escrow Resale")
                        .contact(new Contact()
                                .name("SnapTix Engineering")
                                .email("dev@snaptix.io")));
    }
}
