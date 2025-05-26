# ItemController API 요약

## 기본 정보
- 기본 URL 경로: `/api/v1/items`
- 응답 형식: 모든 API는 `ApiResponseDto<T>` 형식으로 응답합니다.
  ```
  {
    "success": true|false,
    "message": "응답 메시지",
    "data": 데이터 또는 null
  }
  ```

## API 목록

### 1. 모든 품목 조회 API
- **HTTP 메소드**: GET
- **URL**: `/api/v1/items`
- **요청 파라미터**: 없음
- **응답 데이터**: `List<ItemDto>`
- **설명**: 모든 품목을 조회하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 조회 성공",
    "data": [
      {
        "itemId": 1,
        "itemName": "제품A",
        "itemType": "완제품",
        "unit": "EA",
        "salePrice": 10000.0,
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item1.jpg",
        "companyId": 1
      },
      {
        "itemId": 2,
        "itemName": "부품B",
        "itemType": "원자재",
        "unit": "KG",
        "salePrice": 5000.0,
        "createdAt": "2023-01-02T00:00:00",
        "updatedAt": "2023-01-02T00:00:00",
        "itemPhotoUri": null,
        "companyId": 1
      }
    ]
  }
  ```
- **실패 응답 코드**: 500 (Internal Server Error)

### 2. 품목 상세 조회 API
- **HTTP 메소드**: GET
- **URL**: `/api/v1/items/{itemId}`
- **요청 파라미터**: 
  - `itemId` (path variable): 품목 ID (Integer)
- **응답 데이터**: `ItemDto`
- **설명**: 특정 ID의 품목을 조회하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 조회 성공",
    "data": {
      "itemId": 1,
      "itemName": "제품A",
      "itemType": "완제품",
      "unit": "EA",
      "salePrice": 10000.0,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "itemPhotoUri": "https://example.com/photos/item1.jpg",
      "companyId": 1
    }
  }
  ```
- **실패 응답 코드**: 
  - 404 (Not Found): 품목을 찾을 수 없음
  - 500 (Internal Server Error): 기타 오류

### 3. 회사별 품목 조회 API
- **HTTP 메소드**: GET
- **URL**: `/api/v1/items/company/{companyId}`
- **요청 파라미터**: 
  - `companyId` (path variable): 회사 ID (Integer)
- **응답 데이터**: `List<ItemDto>`
- **설명**: 특정 회사의 품목을 조회하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 조회 성공",
    "data": [
      {
        "itemId": 1,
        "itemName": "제품A",
        "itemType": "완제품",
        "unit": "EA",
        "salePrice": 10000.0,
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item1.jpg",
        "companyId": 1
      },
      {
        "itemId": 2,
        "itemName": "부품B",
        "itemType": "원자재",
        "unit": "KG",
        "salePrice": 5000.0,
        "createdAt": "2023-01-02T00:00:00",
        "updatedAt": "2023-01-02T00:00:00",
        "itemPhotoUri": null,
        "companyId": 1
      }
    ]
  }
  ```
- **실패 응답 코드**: 500 (Internal Server Error)

### 4. 품목 타입별 조회 API
- **HTTP 메소드**: GET
- **URL**: `/api/v1/items/type`
- **요청 파라미터**: 
  - `itemType` (query parameter): 품목 타입 (String)
- **응답 데이터**: `List<ItemDto>`
- **설명**: 특정 타입의 품목을 조회하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 조회 성공",
    "data": [
      {
        "itemId": 1,
        "itemName": "제품A",
        "itemType": "완제품",
        "unit": "EA",
        "salePrice": 10000.0,
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item1.jpg",
        "companyId": 1
      },
      {
        "itemId": 3,
        "itemName": "제품C",
        "itemType": "완제품",
        "unit": "EA",
        "salePrice": 15000.0,
        "createdAt": "2023-01-03T00:00:00",
        "updatedAt": "2023-01-03T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item3.jpg",
        "companyId": 1
      }
    ]
  }
  ```
- **실패 응답 코드**: 
  - 400 (Bad Request): 잘못된 요청 파라미터
  - 500 (Internal Server Error): 기타 오류

### 5. 품목 생성 API
- **HTTP 메소드**: POST
- **URL**: `/api/v1/items`
- **요청 본문**: `CreateItemRequest` 객체
- **응답 데이터**: `ItemDto`
- **설명**: 새로운 품목을 생성하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 생성 성공",
    "data": {
      "itemId": 4,
      "itemName": "신규 제품",
      "itemType": "완제품",
      "unit": "EA",
      "salePrice": 20000.0,
      "createdAt": "2023-01-10T00:00:00",
      "updatedAt": "2023-01-10T00:00:00",
      "itemPhotoUri": "https://example.com/photos/item4.jpg",
      "companyId": 1
    }
  }
  ```
- **성공 응답 코드**: 201 (Created)
- **실패 응답 코드**: 
  - 400 (Bad Request): 잘못된 요청 데이터
  - 500 (Internal Server Error): 기타 오류

### 6. 품목 수정 API
- **HTTP 메소드**: PUT
- **URL**: `/api/v1/items/{itemId}`
- **요청 파라미터**: 
  - `itemId` (path variable): 품목 ID (Integer)
- **요청 본문**: `UpdateItemRequest` 객체
- **응답 데이터**: `ItemDto`
- **설명**: 기존 품목을 수정하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 수정 성공",
    "data": {
      "itemId": 1,
      "itemName": "수정된 제품A",
      "itemType": "완제품",
      "unit": "EA",
      "salePrice": 12000.0,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-15T00:00:00",
      "itemPhotoUri": "https://example.com/photos/updated_item1.jpg",
      "companyId": 1
    }
  }
  ```
- **실패 응답 코드**: 
  - 400 (Bad Request): 잘못된 요청 데이터
  - 404 (Not Found): 품목을 찾을 수 없음
  - 500 (Internal Server Error): 기타 오류

### 7. 품목 삭제 API
- **HTTP 메소드**: DELETE
- **URL**: `/api/v1/items/{itemId}`
- **요청 파라미터**: 
  - `itemId` (path variable): 품목 ID (Integer)
- **응답 데이터**: `Boolean`
- **설명**: 특정 ID의 품목을 삭제하는 API입니다.
- **성공 응답 예시**:
  ```json
  {
    "success": true,
    "message": "품목 삭제 성공",
    "data": true
  }
  ```
- **실패 응답 코드**: 
  - 404 (Not Found): 품목을 찾을 수 없음
  - 500 (Internal Server Error): 기타 오류