# 🐨 쿼카 서버 Quokka Server

### ⌨️ 커밋 메시지 규칙

---

```js
(Gitmoji): JIRA_TICKET_NUMBER 작업내용
```

#### 허용된 커밋 깃모지

- `:sparkles:` ✨ feat (새로운 기능 구현 및 수정)
- `:lipstick:` 💄 style (UI 구현 및 업데이트와 스타일 파일 작성 및 수정)
- `:bug:` 🐛 fix (버그 픽스)
- `:memo:` 📝 docs (Readme를 비롯한 문서 파일 작성)
- `:recycle:` ♻️ refactor (리팩토링 작업)
- `:test_tube:` 🧪 test (테스트 파일 작성 및 수정)
- `:pencil2:` ✏️ chore (주석 관련 작업 및 콘솔 로그 삭제를 비롯한 단순 작업)

#### 커밋 메시지 예시

```md
✨ QKK-111 소셜 로그인 기능 구현
💄 QKK-222 메인 대쉬보드 컴포넌트 구현
```

### 🪵 브랜치 전략

---

#### 브랜치 네이밍

- `main` 브랜치: 프로덕션으로 배포될 작업 (linear한 형태로 로그 관리)
- `release` 브랜치: 스프린트 단위로 브랜치 생성 후 스프린트 종료 시 메인으로 머지
- `feature` 브랜치: 지라 티켓과 매칭되는 기능 구현 브랜치, 작업 완료 후 release로 머지
  (\*참고: feature에서 release로 머지 시 `squash and merge`, release에서 main으로 머지 시 `rebase and merge`)

#### 브랜치 네이밍 예시

```md
release/v0.1 // release 브랜치
feature/QKK-111 // feature 브랜치
```
