# BOM API 문서

## 개요
이 문서는 BOM(Bill of Materials) 관리를 위한 API를 설명합니다. BOM은 제품 구성에 필요한 모든 부품과 자재의 목록을 계층적으로 관리하는 시스템입니다.

## 기본 URL
```
/api/boms
```

## 인증
모든 API 요청은 JWT 토큰을 통한 인증이 필요합니다. 인증 토큰은 요청 헤더의 `Authorization` 필드에 `Bearer {token}` 형식으로 포함되어야 합니다.

## 표준 응답 형식
모든 API 응답은 다음과 같은 표준 형식을 따릅니다:

```json
{
  "success": true,
  "message": "응답 메시지",
  "data": {}
}
```

또는 실패 시:

```json
{
  "success": false,
  "message": "오류 메시지",
  "data": null
}
```

- `success`: 요청 성공 여부
- `message`: 응답에 대한 설명 메시지
- `data`: 실제 응답 데이터 (요청 실패 시 null)

## API 엔드포인트

### 1. 모든 BOM 조회

#### 요청
```
GET /api/boms
```

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": [
    {
      "bomId": 1,
      "bomStatus": "활성",
      "bomVersion": "1.0",
      "remark": "메인 제품 BOM",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    },
    {
      "bomId": 2,
      "bomStatus": "비활성",
      "bomVersion": "1.1",
      "remark": "부품 BOM",
      "createdAt": "2023-01-02T00:00:00",
      "updatedAt": "2023-01-02T00:00:00"
    }
  ]
}
```

### 2. 특정 BOM 조회

#### 요청
```
GET /api/boms/{bomId}
```

#### 경로 변수
- `bomId`: BOM ID (정수)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": {
    "bomId": 1,
    "bomStatus": "활성",
    "bomVersion": "1.0",
    "remark": "메인 제품 BOM",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00"
  }
}
```

#### 오류 응답
```json
{
  "success": false,
  "message": "ID가 {bomId}인 BOM을 찾을 수 없습니다.",
  "data": null
}
```

### 3. 상태별 BOM 조회

#### 요청
```
GET /api/boms/status/{bomStatus}
```

#### 경로 변수
- `bomStatus`: BOM 상태 (문자열, "임시저장", "비활성", "활성" 중 하나)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": [
    {
      "bomId": 1,
      "bomStatus": "활성",
      "bomVersion": "1.0",
      "remark": "메인 제품 BOM",
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00"
    },
    {
      "bomId": 3,
      "bomStatus": "활성",
      "bomVersion": "2.0",
      "remark": "다른 제품 BOM",
      "createdAt": "2023-01-03T00:00:00",
      "updatedAt": "2023-01-03T00:00:00"
    }
  ]
}
```

### 4. BOM 품목 목록 조회

#### 요청
```
GET /api/boms/{bomId}/items
```

#### 경로 변수
- `bomId`: BOM ID (정수)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": [
    {
      "bomId": 1,
      "itemId": 101,
      "quantity": 2.0,
      "remark": "필수 부품",
      "parentItemId": null,
      "item": {
        "itemId": 101,
        "itemName": "부품 A",
        "itemType": "원자재",
        "unit": "EA",
        "salePrice": 1000.0,
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item101.jpg",
        "companyId": 1
      },
      "parentItem": null
    },
    {
      "bomId": 1,
      "itemId": 102,
      "quantity": 3.0,
      "remark": "보조 부품",
      "parentItemId": null,
      "item": {
        "itemId": 102,
        "itemName": "부품 B",
        "itemType": "원자재",
        "unit": "EA",
        "salePrice": 500.0,
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "itemPhotoUri": "https://example.com/photos/item102.jpg",
        "companyId": 1
      },
      "parentItem": null
    }
  ]
}
```

### 5. BOM 품목 트리 조회

#### 요청
```
GET /api/boms/{bomId}/tree
```

#### 경로 변수
- `bomId`: BOM ID (정수)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": [
    {
      "itemBom": {
        "bomId": 1,
        "itemId": 100,
        "quantity": 1.0,
        "remark": "최상위 품목",
        "parentItemId": null,
        "item": {
          "itemId": 100,
          "itemName": "완제품 X",
          "itemType": "완제품",
          "unit": "EA",
          "salePrice": 10000.0,
          "createdAt": "2023-01-01T00:00:00",
          "updatedAt": "2023-01-01T00:00:00",
          "itemPhotoUri": "https://example.com/photos/item100.jpg",
          "companyId": 1
        },
        "parentItem": null
      },
      "children": [
        {
          "itemBom": {
            "bomId": 1,
            "itemId": 101,
            "quantity": 2.0,
            "remark": "필수 부품",
            "parentItemId": 100,
            "item": {
              "itemId": 101,
              "itemName": "부품 A",
              "itemType": "원자재",
              "unit": "EA",
              "salePrice": 1000.0,
              "createdAt": "2023-01-01T00:00:00",
              "updatedAt": "2023-01-01T00:00:00",
              "itemPhotoUri": "https://example.com/photos/item101.jpg",
              "companyId": 1
            },
            "parentItem": {
              "itemId": 100,
              "itemName": "완제품 X",
              "itemType": "완제품",
              "unit": "EA",
              "salePrice": 10000.0,
              "createdAt": "2023-01-01T00:00:00",
              "updatedAt": "2023-01-01T00:00:00",
              "itemPhotoUri": "https://example.com/photos/item100.jpg",
              "companyId": 1
            }
          },
          "children": []
        }
      ]
    }
  ]
}
```

### 6. BOM 생성

#### 요청
```
POST /api/boms
```

#### 요청 본문
```json
{
  "bomStatus": "임시저장",
  "bomVersion": "1.0",
  "remark": "신규 제품 BOM"
}
```

#### 요청 필드
- `bomStatus`: BOM 상태 (필수, "임시저장", "비활성", "활성" 중 하나)
- `bomVersion`: BOM 버전 (필수)
- `remark`: 비고 (선택)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": {
    "bomId": 2,
    "bomStatus": "임시저장",
    "bomVersion": "1.0",
    "remark": "신규 제품 BOM",
    "createdAt": "2023-01-02T00:00:00",
    "updatedAt": "2023-01-02T00:00:00"
  }
}
```

### 7. BOM 수정

#### 요청
```
PUT /api/boms/{bomId}
```

#### 경로 변수
- `bomId`: 수정할 BOM ID (정수)

#### 요청 본문
```json
{
  "bomStatus": "활성",
  "bomVersion": "1.1",
  "remark": "업데이트된 BOM"
}
```

#### 요청 필드
- `bomStatus`: BOM 상태 (필수, "임시저장", "비활성", "활성" 중 하나)
- `bomVersion`: BOM 버전 (필수)
- `remark`: 비고 (선택)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": {
    "bomId": 2,
    "bomStatus": "활성",
    "bomVersion": "1.1",
    "remark": "업데이트된 BOM",
    "createdAt": "2023-01-02T00:00:00",
    "updatedAt": "2023-01-02T12:00:00"
  }
}
```

### 8. BOM 삭제

#### 요청
```
DELETE /api/boms/{bomId}
```

#### 경로 변수
- `bomId`: 삭제할 BOM ID (정수)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": true
}
```

### 9. BOM에 품목 추가

#### 요청
```
POST /api/boms/{bomId}/items
```

#### 경로 변수
- `bomId`: BOM ID (정수)

#### 요청 본문
```json
{
  "itemId": 102,
  "quantity": 5.0,
  "remark": "추가 부품",
  "parentItemId": 100
}
```

#### 요청 필드
- `itemId`: 품목 ID (필수, 양수)
- `quantity`: 수량 (필수, 양수)
- `remark`: 비고 (선택)
- `parentItemId`: 상위 품목 ID (선택, 계층 구조를 위한 필드)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": true
}
```

### 10. BOM 내 품목 수정

#### 요청
```
PUT /api/boms/{bomId}/items/{itemId}
```

#### 경로 변수
- `bomId`: BOM ID (정수)
- `itemId`: 품목 ID (정수)

#### 요청 본문
```json
{
  "quantity": 3.0,
  "remark": "수정된 비고",
  "parentItemId": 101
}
```

#### 요청 필드
- `quantity`: 수량 (필수, 양수)
- `remark`: 비고 (선택)
- `parentItemId`: 상위 품목 ID (선택, 계층 구조를 위한 필드)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": true
}
```

### 11. BOM에서 품목 제거

#### 요청
```
DELETE /api/boms/{bomId}/items/{itemId}
```

#### 경로 변수
- `bomId`: BOM ID (정수)
- `itemId`: 품목 ID (정수)

#### 응답
```json
{
  "success": true,
  "message": "성공적으로 처리되었습니다.",
  "data": true
}
```

## 오류 코드

| HTTP 상태 코드 | 설명 |
|--------------|------|
| 400 | 잘못된 요청 (요청 본문 유효성 검사 실패) |
| 401 | 인증 실패 (유효하지 않은 토큰) |
| 404 | 리소스를 찾을 수 없음 |
| 500 | 서버 내부 오류 |

## 데이터 모델

### BomDto
```
{
  "bomId": Integer,
  "bomStatus": String,
  "bomVersion": String,
  "remark": String (nullable),
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

### ItemBomDto
```
{
  "bomId": Integer,
  "itemId": Integer,
  "quantity": Double,
  "remark": String (nullable),
  "parentItemId": Integer (nullable),
  "item": ItemDto (nullable),
  "parentItem": ItemDto (nullable)
}
```

### ItemBomTreeDto
```
{
  "itemBom": ItemBomDto,
  "children": [ItemBomTreeDto]
}
```

### ItemDto
```
{
  "itemId": Integer,
  "itemName": String,
  "itemType": String,
  "unit": String,
  "salePrice": Double,
  "createdAt": DateTime,
  "updatedAt": DateTime,
  "itemPhotoUri": String (nullable),
  "companyId": Integer
}
```