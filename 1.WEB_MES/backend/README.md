# Mobile-API-Server

Mobile-API-Server 단기적 목표로 모바일 MES 지원 예정.

- Kotlin + SpringBoot 사용
- JDK 21 사용
- Hexagonal Architecture 사용
- Swagger API Document 사용
- API Versioning 사용
- API 단위 테스트 사용
- API 응답 속성은 아래와 같이 통일
    - ApiResponse< T >
        - T = DTO
- 예외 처리는 AOP 활용
- NoSQL은 Redis 활용
- SQL은 MSSQL 활용