# OrganizationController API Documentation

## Overview
This document provides detailed information about the Organization API endpoints available in the system.

Base URL: `/api/v1/organizations`

## Table of Contents
1. [Get All Organizations](#1-get-all-organizations)
2. [Get Organization by ID](#2-get-organization-by-id)
3. [Get Organizations by Company ID](#3-get-organizations-by-company-id)
4. [Get Organizations by User ID](#4-get-organizations-by-user-id)
5. [Create Organization](#5-create-organization)
6. [Update Organization](#6-update-organization)
7. [Delete Organization](#7-delete-organization)
8. [Add User to Organization](#8-add-user-to-organization)
9. [Remove User from Organization](#9-remove-user-from-organization)
10. [Get Root Organizations](#10-get-root-organizations)
11. [Get Child Organizations](#11-get-child-organizations)

## 1. Get All Organizations
Retrieves a list of all organizations.

- **URL**: `/api/v1/organizations`
- **Method**: `GET`
- **Description**: 모든 조직 목록을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "조직 목록 조회 성공",
  "data": [
    {
      "organizationId": 1,
      "organizationName": "개발팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": [
        {
          "companyId": 100,
          "userId": 1,
          "username": "홍길동",
          "email": "user@example.com",
          "createdAt": "2023-01-01T00:00:00",
          "updatedAt": "2023-01-01T00:00:00",
          "positionId": 1,
          "employmentStatus": "ACTIVE",
          "phoneNumber": "010-1234-5678"
        }
      ]
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "조직 목록 조회 실패: 서버 오류",
  "data": null
}
```

## 2. Get Organization by ID
Retrieves a specific organization by its ID.

- **URL**: `/api/v1/organizations/{organizationId}`
- **Method**: `GET`
- **Path Parameters**:
  - `organizationId` (Integer): The ID of the organization to retrieve
- **Description**: 특정 ID의 조직을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "조직 조회 성공",
  "data": {
    "organizationId": 1,
    "organizationName": "개발팀",
    "companyId": 100,
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00",
    "parentOrganizationId": null,
    "users": [
      {
        "companyId": 100,
        "userId": 1,
        "username": "홍길동",
        "email": "user@example.com",
        "createdAt": "2023-01-01T00:00:00",
        "updatedAt": "2023-01-01T00:00:00",
        "positionId": 1,
        "employmentStatus": "ACTIVE",
        "phoneNumber": "010-1234-5678"
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "조직 조회 실패: 해당 ID의 조직을 찾을 수 없습니다",
  "data": null
}
```

## 3. Get Organizations by Company ID
Retrieves all organizations belonging to a specific company.

- **URL**: `/api/v1/organizations/company/{companyId}`
- **Method**: `GET`
- **Path Parameters**:
  - `companyId` (Integer): The ID of the company
- **Description**: 특정 회사의 조직 목록을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "회사별 조직 목록 조회 성공",
  "data": [
    {
      "organizationId": 1,
      "organizationName": "개발팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": []
    },
    {
      "organizationId": 2,
      "organizationName": "영업팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": []
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "회사별 조직 목록 조회 실패: 서버 오류",
  "data": null
}
```

## 4. Get Organizations by User ID
Retrieves all organizations that a specific user belongs to.

- **URL**: `/api/v1/organizations/user/{userId}`
- **Method**: `GET`
- **Path Parameters**:
  - `userId` (Integer): The ID of the user
- **Description**: 특정 사용자가 속한 조직 목록을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "사용자별 조직 목록 조회 성공",
  "data": [
    {
      "organizationId": 1,
      "organizationName": "개발팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": []
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "사용자별 조직 목록 조회 실패: 서버 오류",
  "data": null
}
```

## 5. Create Organization
Creates a new organization.

- **URL**: `/api/v1/organizations`
- **Method**: `POST`
- **Request Body**: `CreateOrganizationRequest`
- **Description**: 새로운 조직을 생성하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "조직 생성 성공",
  "data": {
    "organizationId": 3,
    "organizationName": "인사팀",
    "companyId": 100,
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-01T00:00:00",
    "parentOrganizationId": null,
    "users": []
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "조직 생성 실패: 유효하지 않은 요청입니다",
  "data": null
}
```

## 6. Update Organization
Updates an existing organization.

- **URL**: `/api/v1/organizations/{organizationId}`
- **Method**: `PUT`
- **Path Parameters**:
  - `organizationId` (Integer): The ID of the organization to update
- **Request Body**: `UpdateOrganizationRequest`
- **Description**: 기존 조직을 수정하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "조직 수정 성공",
  "data": {
    "organizationId": 1,
    "organizationName": "개발1팀",
    "companyId": 100,
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2023-01-02T00:00:00",
    "parentOrganizationId": null,
    "users": []
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "조직 수정 실패: 해당 ID의 조직을 찾을 수 없습니다",
  "data": null
}
```

## 7. Delete Organization
Deletes an organization by its ID.

- **URL**: `/api/v1/organizations/{organizationId}`
- **Method**: `DELETE`
- **Path Parameters**:
  - `organizationId` (Integer): The ID of the organization to delete
- **Description**: 특정 ID의 조직을 삭제하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "조직 삭제 성공",
  "data": true
}
```

### Error Response
```json
{
  "success": false,
  "message": "조직 삭제 실패: 해당 ID의 조직을 찾을 수 없습니다",
  "data": null
}
```

## 8. Add User to Organization
Adds a user to an organization.

- **URL**: `/api/v1/organizations/{organizationId}/users/{userId}`
- **Method**: `POST`
- **Path Parameters**:
  - `organizationId` (Integer): The ID of the organization
  - `userId` (Integer): The ID of the user to add
- **Description**: 조직에 사용자를 추가하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "사용자 추가 성공",
  "data": true
}
```

### Error Response
```json
{
  "success": false,
  "message": "사용자 추가 실패: 해당 ID의 조직 또는 사용자를 찾을 수 없습니다",
  "data": null
}
```

## 9. Remove User from Organization
Removes a user from an organization.

- **URL**: `/api/v1/organizations/{organizationId}/users/{userId}`
- **Method**: `DELETE`
- **Path Parameters**:
  - `organizationId` (Integer): The ID of the organization
  - `userId` (Integer): The ID of the user to remove
- **Description**: 조직에서 사용자를 제거하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "사용자 제거 성공",
  "data": true
}
```

### Error Response
```json
{
  "success": false,
  "message": "사용자 제거 실패: 해당 ID의 조직 또는 사용자를 찾을 수 없습니다",
  "data": null
}
```

## 10. Get Root Organizations
Retrieves all root organizations (organizations without a parent).

- **URL**: `/api/v1/organizations/root`
- **Method**: `GET`
- **Description**: 부모 조직이 없는 최상위 조직 목록을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "루트 조직 목록 조회 성공",
  "data": [
    {
      "organizationId": 1,
      "organizationName": "개발팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": []
    },
    {
      "organizationId": 2,
      "organizationName": "영업팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": null,
      "users": []
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "루트 조직 목록 조회 실패: 서버 오류",
  "data": null
}
```

## 11. Get Child Organizations
Retrieves all child organizations of a specific parent organization.

- **URL**: `/api/v1/organizations/parent/{parentOrganizationId}`
- **Method**: `GET`
- **Path Parameters**:
  - `parentOrganizationId` (Integer): The ID of the parent organization
- **Description**: 특정 부모 조직 ID를 가진 자식 조직 목록을 조회하는 API입니다.

### Response
```json
{
  "success": true,
  "message": "자식 조직 목록 조회 성공",
  "data": [
    {
      "organizationId": 3,
      "organizationName": "백엔드팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": 1,
      "users": []
    },
    {
      "organizationId": 4,
      "organizationName": "프론트엔드팀",
      "companyId": 100,
      "createdAt": "2023-01-01T00:00:00",
      "updatedAt": "2023-01-01T00:00:00",
      "parentOrganizationId": 1,
      "users": []
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "자식 조직 목록 조회 실패: 서버 오류",
  "data": null
}
```