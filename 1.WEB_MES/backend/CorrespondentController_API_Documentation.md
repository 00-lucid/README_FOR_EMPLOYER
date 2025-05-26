# 거래처 API 문서 (Correspondent API Documentation)

이 문서는 거래처(Correspondent) 관련 API 엔드포인트에 대한 정보를 제공합니다.

## 기본 정보

- **기본 URL**: `/api/v1/correspondents`
- **설명**: 거래처 관련 API

## API 엔드포인트

### 1. 모든 거래처 조회

- **URL**: `/api/v1/correspondents`
- **Method**: `GET`
- **설명**: 모든 거래처를 조회하는 API입니다.
- **응답**:
  - **성공 응답 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "거래처 조회 성공",
      "data": [
        {
          "correspondentId": 1,
          "name": "거래처명",
          "type": "매입",
          "ceo": "대표자명",
          "businessNumber": "123-45-67890",
          "phoneNumber": "02-1234-5678",
          "email": "example@company.com",
          "address": "서울시 강남구",
          "detailAddress": "테헤란로 123",
          "note": "주요 원자재 공급업체",
          "correspondentPhotoUri": "/images/correspondent/1.jpg",
          "createdAt": "2023-01-01T09:00:00",
          "updatedAt": "2023-01-01T09:00:00"
        }
      ]
    }
    ```
  - **실패 응답 (500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 조회 실패: {오류 메시지}",
      "data": null
    }
    ```

### 2. 거래처 상세 조회

- **URL**: `/api/v1/correspondents/{correspondentId}`
- **Method**: `GET`
- **파라미터**:
  - `correspondentId` (path): 조회할 거래처 ID
- **설명**: 특정 ID의 거래처를 조회하는 API입니다.
- **응답**:
  - **성공 응답 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "거래처 조회 성공",
      "data": {
        "correspondentId": 1,
        "name": "거래처명",
        "type": "매입",
        "ceo": "대표자명",
        "businessNumber": "123-45-67890",
        "phoneNumber": "02-1234-5678",
        "email": "example@company.com",
        "address": "서울시 강남구",
        "detailAddress": "테헤란로 123",
        "note": "주요 원자재 공급업체",
        "correspondentPhotoUri": "/images/correspondent/1.jpg",
        "createdAt": "2023-01-01T09:00:00",
        "updatedAt": "2023-01-01T09:00:00"
      }
    }
    ```
  - **실패 응답 (404 Not Found / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 조회 실패: {오류 메시지}",
      "data": null
    }
    ```

### 3. 거래처 타입별 조회

- **URL**: `/api/v1/correspondents/type?type={type}`
- **Method**: `GET`
- **파라미터**:
  - `type` (query): 조회할 거래처 타입
- **설명**: 특정 타입의 거래처를 조회하는 API입니다.
- **응답**:
  - **성공 응답 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "거래처 조회 성공",
      "data": [
        {
          "correspondentId": 1,
          "name": "거래처명",
          "type": "매입",
          "ceo": "대표자명",
          "businessNumber": "123-45-67890",
          "phoneNumber": "02-1234-5678",
          "email": "example@company.com",
          "address": "서울시 강남구",
          "detailAddress": "테헤란로 123",
          "note": "주요 원자재 공급업체",
          "correspondentPhotoUri": "/images/correspondent/1.jpg",
          "createdAt": "2023-01-01T09:00:00",
          "updatedAt": "2023-01-01T09:00:00"
        }
      ]
    }
    ```
  - **실패 응답 (400 Bad Request / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 조회 실패: {오류 메시지}",
      "data": null
    }
    ```

### 4. 거래처 생성

- **URL**: `/api/v1/correspondents`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "name": "신규 거래처명",
    "type": "매입",
    "ceo": "대표자명",
    "businessNumber": "123-45-67890",
    "phoneNumber": "02-1234-5678",
    "email": "example@company.com",
    "address": "서울시 강남구",
    "detailAddress": "테헤란로 123",
    "note": "주요 원자재 공급업체",
    "correspondentPhotoUri": "/images/correspondent/new.jpg"
  }
  ```
- **설명**: 새로운 거래처를 생성하는 API입니다.
- **응답**:
  - **성공 응답 (201 Created)**:
    ```json
    {
      "success": true,
      "message": "거래처 생성 성공",
      "data": {
        "correspondentId": 1,
        "name": "신규 거래처명",
        "type": "매입",
        "ceo": "대표자명",
        "businessNumber": "123-45-67890",
        "phoneNumber": "02-1234-5678",
        "email": "example@company.com",
        "address": "서울시 강남구",
        "detailAddress": "테헤란로 123",
        "note": "주요 원자재 공급업체",
        "correspondentPhotoUri": "/images/correspondent/new.jpg",
        "createdAt": "2023-01-01T09:00:00",
        "updatedAt": "2023-01-01T09:00:00"
      }
    }
    ```
  - **실패 응답 (400 Bad Request / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 생성 실패: {오류 메시지}",
      "data": null
    }
    ```

### 5. 거래처 수정

- **URL**: `/api/v1/correspondents/{correspondentId}`
- **Method**: `PUT`
- **파라미터**:
  - `correspondentId` (path): 수정할 거래처 ID
- **요청 본문**:
  ```json
  {
    "name": "수정된 거래처명",
    "type": "매출/매입",
    "ceo": "수정된 대표자명",
    "businessNumber": "123-45-67890",
    "phoneNumber": "02-1234-5678",
    "email": "updated@company.com",
    "address": "서울시 강남구",
    "detailAddress": "테헤란로 456",
    "note": "거래처 정보 수정됨",
    "correspondentPhotoUri": "/images/correspondent/updated.jpg"
  }
  ```
- **설명**: 기존 거래처를 수정하는 API입니다.
- **응답**:
  - **성공 응답 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "거래처 수정 성공",
      "data": {
        "correspondentId": 1,
        "name": "수정된 거래처명",
        "type": "매출/매입",
        "ceo": "수정된 대표자명",
        "businessNumber": "123-45-67890",
        "phoneNumber": "02-1234-5678",
        "email": "updated@company.com",
        "address": "서울시 강남구",
        "detailAddress": "테헤란로 456",
        "note": "거래처 정보 수정됨",
        "correspondentPhotoUri": "/images/correspondent/updated.jpg",
        "createdAt": "2023-01-01T09:00:00",
        "updatedAt": "2023-01-01T10:30:00"
      }
    }
    ```
  - **실패 응답 (400 Bad Request / 404 Not Found / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 수정 실패: {오류 메시지}",
      "data": null
    }
    ```

### 6. 거래처 삭제

- **URL**: `/api/v1/correspondents/{correspondentId}`
- **Method**: `DELETE`
- **파라미터**:
  - `correspondentId` (path): 삭제할 거래처 ID
- **설명**: 특정 ID의 거래처를 삭제하는 API입니다.
- **응답**:
  - **성공 응답 (200 OK)**:
    ```json
    {
      "success": true,
      "message": "거래처 삭제 성공",
      "data": true
    }
    ```
  - **실패 응답 (404 Not Found / 500 Internal Server Error)**:
    ```json
    {
      "success": false,
      "message": "거래처 삭제 실패: {오류 메시지}",
      "data": null
    }
    ```

## 오류 코드

- **400 Bad Request**: 잘못된 요청 형식이나 유효하지 않은 데이터
- **404 Not Found**: 요청한 리소스를 찾을 수 없음
- **500 Internal Server Error**: 서버 내부 오류
