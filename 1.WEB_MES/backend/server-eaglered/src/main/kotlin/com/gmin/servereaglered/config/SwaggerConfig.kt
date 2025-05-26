package com.gmin.servereaglered.config

import io.swagger.v3.oas.models.Components
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {

    @Bean
    fun openAPI(): OpenAPI {
        // 보안 요구사항 정의
        val securityRequirement = SecurityRequirement().addList("bearer-jwt")

        return OpenAPI()
            .info(
                Info()
                    .title("MES API Documentation")
                    .description("MES 시스템 API 문서")
                    .version("v1.0.0")
                    .contact(
                        Contact()
                            .name("MES Team")
                            .email("mesadmin@example.com")
                    )
            )
            .components(
                Components()
                    .addSecuritySchemes(
                        "bearer-jwt",
                        SecurityScheme()
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")
                            .description("JWT 토큰을 헤더에 입력하세요")
                    )
            )
            // 모든 API에 보안 요구사항 적용
            // .addSecurityItem(securityRequirement)
    }

    @Bean
    fun customizeOpenAPI(): GroupedOpenApi {
        return GroupedOpenApi.builder()
            .group("api")
            .pathsToMatch("/api/**")
//            .addOpenApiCustomizer { openApi ->
//                openApi.paths.forEach { (path, pathItem) ->
//                    if (path == "/api/v1/user/login" || path == "/api/v1/user/refresh-token") {
//                        pathItem.readOperations().forEach { operation ->
//                            operation.security = null
//                        }
//                    }
//                }
//            }
            .build()
    }
}