# Wit.me - 스터디 모임 매칭 플랫폼

Wit.me는 사용자들이 원하는 스터디를 검색하고, 참여 신청을 할 수 있으며, 모임장이 신청자를 관리하고 참가자 명단을 다운로드할 수 있는 플랫폼입니다.

## 기술 스택

- **프론트엔드**: Next.js 14 + React 18 + TypeScript
- **스타일링**: Tailwind CSS
- **인증**: Firebase Authentication (이메일/비밀번호)
- **데이터베이스**: Firebase Firestore
- **AI**: OpenAI API (gpt-4o-mini)

## 주요 기능

### 일반 사용자
- ✅ 이메일/비밀번호로 회원가입 및 로그인
- ✅ 오픈된 스터디 목록 조회 (카드형)
- ✅ 카테고리별/검색어별 필터링
- ✅ 스터디 상세 정보 조회
- ✅ 스터디 참여 신청 (메시지 포함)
- ✅ 중복 신청 방지

### 모임장
- ✅ 스터디 생성 (최대 5개 제한)
- ✅ 내 스터디 목록 조회
- ✅ 신청자 관리 (대기/승인/거절)
- ✅ 승인된 참가자 명단 CSV 다운로드 (UTF-8 BOM 포함)

## 환경 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화 (이메일/비밀번호)
3. Firestore Database 생성
4. 프로젝트 설정에서 Web App 추가

### 2. OpenAI API 설정

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 생성

### 3. 로컬 환경 설정

```bash
# .env.local 파일 생성
cp .env.local.example .env.local
```

`.env.local` 파일에 다음 값들을 입력하세요:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
OPENAI_API_KEY=your_openai_api_key
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 단위 테스트
npm test

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버는 http://localhost:3000 에서 실행됩니다.

## Firestore 보안 규칙 배포

Firebase Console에서 Firestore Security Rules를 다음과 같이 설정합니다:

1. Firebase Console → Firestore Database → Rules 탭
2. `firestore.rules` 파일의 내용을 복사하여 Rules 편집기에 붙여넣기
3. Publish 클릭

## 데이터 모델

### Users Collection
```
users/{userId}
├── email: string (이메일)
├── displayName: string (이름)
├── role: 'user' | 'leader' (역할)
└── createdAt: timestamp (생성일)
```

### Studies Collection
```
studies/{studyId}
├── title: string (제목)
├── description: string (설명)
├── category: string (카테고리)
├── scheduledDate: timestamp (일시)
├── location: string (위치)
├── maxParticipants: number (정원)
├── currentParticipants: number (현재 참가자)
├── leaderUid: string (모임장 UID)
├── status: 'open' | 'closed' (상태)
├── createdAt: timestamp (생성일)
└── updatedAt: timestamp (수정일)
```

### Applications Collection
```
applications/{appId}
├── studyId: string (스터디 ID)
├── userId: string (사용자 ID)
├── message: string (신청 메시지)
├── status: 'pending' | 'approved' | 'rejected' (상태)
├── appliedAt: timestamp (신청일)
└── respondedAt: timestamp (처리일)
```

## 페이지 구조

- `/` - 스터디 목록 (일반 사용자/모임장)
- `/login` - 로그인/회원가입
- `/studies/[id]` - 스터디 상세 및 신청
- `/leader/studies` - 모임장의 스터디 목록
- `/leader/studies/new` - 스터디 생성
- `/leader/studies/[id]/applicants` - 신청자 관리

## 보안 특징

- 🔐 클라이언트 환경변수는 `NEXT_PUBLIC_` 접두사 사용 (Firebase 설정)
- 🔐 서버 환경변수는 `OPENAI_API_KEY` (OpenAI)
- 🔐 Firestore Security Rules로 권한 관리
- 🔐 모임장만 신청자 관리 가능
- 🔐 사용자는 본인의 신청만 조회 가능
- 🔐 중복 신청 방지
- 🔐 모임장 생성 스터디 5개 제한

## CSV 다운로드

승인된 참가자 명단은 UTF-8 BOM이 포함된 CSV 형식으로 다운로드됩니다. Excel에서 한글이 올바르게 표시됩니다.

CSV 파일에 포함되는 항목:
- 이메일
- 이름
- 신청일

## 단위 테스트

### 테스트 실행

```bash
# 전체 테스트 1회 실행
npm test

# 파일 변경 감지 후 자동 재실행 (개발 중 권장)
npm run test:watch
```

### 테스트 구조

테스트 파일은 `src/lib/__tests__/` 폴더에 위치합니다.

```
src/lib/__tests__/
├── auth-errors.test.ts   # Firebase/Firestore 오류 메시지 변환
├── csv-utils.test.ts     # CSV 생성 및 이스케이프 처리
└── validation.test.ts    # 입력값 유효성 검사 규칙
```

### 테스트 대상 및 케이스

#### auth-errors.test.ts

| 테스트 대상 | 케이스 | 검증 내용 |
|---|---|---|
| `getAuthErrorCode` | Firebase 오류 객체 | `code` 필드를 문자열로 추출 |
| `getAuthErrorCode` | 일반 Error 객체 | `null` 반환 |
| `getFirebaseErrorMessage` | `auth/email-already-in-use` | "이미 사용 중인 이메일" 포함 |
| `getFirebaseErrorMessage` | `auth/weak-password` | "6자 이상" 포함 |
| `getFirebaseErrorMessage` | `auth/operation-not-allowed` | Firebase Console 설정 안내 포함 |
| `getFirestoreErrorMessage` | `permission-denied` | "보안 규칙" 안내 포함 |

#### csv-utils.test.ts

| 테스트 대상 | 케이스 | 검증 내용 |
|---|---|---|
| `escapeCsvCell` | 쉼표 포함 문자열 | 큰따옴표로 감쌈 |
| `escapeCsvCell` | `null` / `undefined` | 빈 문자열 반환 |
| `buildCsvString` | 데이터 배열 | 헤더 + 행 CSV 문자열 생성 |
| `buildCsvString` | 빈 배열 | 빈 문자열 반환 |
| `formatParticipantData` | 참가자 목록 | 이메일/이름/신청일 한글 키로 변환 |

#### validation.test.ts

| 테스트 대상 | 케이스 | 검증 내용 |
|---|---|---|
| `canCreateMoreStudies` | 현재 4개 | `true` (생성 가능) |
| `canCreateMoreStudies` | 현재 5개 | `false` (생성 불가) |
| `isValidEmail` | `user@example.com` | 유효 이메일 통과 |
| `isValidEmail` | `invalid`, `""` | 잘못된 형식 거부 |
| `isValidPassword` | 6자 이상 | 통과 |
| `isValidPassword` | 5자 이하 | 거부 |

### 새 테스트 추가 방법

1. `src/lib/__tests__/` 폴더에 `*.test.ts` 파일 생성
2. 아래 형식으로 작성:

```typescript
import { describe, it, expect } from 'vitest'
import { 테스트할함수 } from '@/lib/모듈명'

describe('함수 이름', () => {
  it('기대 동작을 서술한다', () => {
    expect(테스트할함수(입력)).toBe(기대값)
  })
})
```

> **주의**: Firebase, Firestore, DOM API에 의존하는 코드는 단위 테스트 대상에서 제외합니다. 순수 함수(입력 → 출력)만 단위 테스트로 검증하세요. Firebase 연동 기능은 실제 Firebase 프로젝트와 연결 후 수동으로 확인합니다.

### 테스트 설정 (vitest.config.ts)

- **실행 환경**: `node` (브라우저 API 없음)
- **경로 별칭**: `@/` → `src/`
- **대상 파일**: `src/**/*.test.ts`

---

## 개발 가이드

### 새로운 페이지 추가
```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function NewPage() {
  const { firebaseUser, user, loading } = useAuth()
  const router = useRouter()

  // 인증 확인
  if (loading) return <div>로딩 중...</div>
  if (!firebaseUser) return null

  return <div>페이지 콘텐츠</div>
}
```

### Firestore 데이터 조작
```typescript
import { getFirebaseServices } from '@/lib/firebase'
import { getStudy, createStudy } from '@/lib/study-repo'

// 사용 예
const { db } = getFirebaseServices()
const study = await getStudy(db, studyId)
```

## GitHub 업로드

### 리포지토리 정보

- **URL**: https://github.com/hsh92/wit-me
- **공개 범위**: Public
- **기본 브랜치**: `master`

### 처음 업로드하는 경우 (최초 1회)

```bash
# 1. Git 초기화
git init

# 2. 줄바꿈 설정 (.gitattributes 파일이 이미 포함되어 있음)
git add .

# 3. 첫 커밋
git commit -m "feat: 초기 구현"

# 4. GitHub CLI로 리포지토리 생성 및 push (GitHub CLI 설치 필요)
gh repo create wit-me --public --source=. --remote=origin --push
```

> **주의**: `.env.local`은 `.gitignore`에 등록되어 있어 자동으로 제외됩니다.  
> API 키가 GitHub에 올라가지 않도록 커밋 전 반드시 확인하세요.

### 이후 변경 사항 업로드

```bash
# 변경된 파일 스테이징
git add .

# 커밋
git commit -m "변경 내용 요약"

# push
git push origin master
```

### GitHub CLI 설치 (미설치 시)

```bash
# Windows (winget)
winget install GitHub.cli

# macOS (Homebrew)
brew install gh

# 설치 후 로그인
gh auth login
```

### 업로드 결과 (2026-05-21)

| 항목 | 내용 |
|---|---|
| 커밋 해시 | `57b65bb` |
| 커밋 메시지 | `feat: Wit.me MVP 초기 구현` |
| 파일 수 | 35개 |
| 총 코드 라인 | 7,850줄 |
| 보안 | `.env.local` 제외 확인 완료 |

---

## 배포

### Vercel 배포 (권장)

GitHub 리포지토리 연결 후 아래 순서로 진행합니다.

1. [Vercel](https://vercel.com)에서 GitHub 계정으로 로그인
2. `hsh92/wit-me` 리포지토리 Import
3. Environment Variables 탭에서 아래 값 입력:

| 변수명 | 값 |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase 설정값 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 설정값 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 설정값 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 설정값 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 설정값 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 설정값 |
| `OPENAI_API_KEY` | OpenAI API 키 (선택) |

4. Deploy 클릭
5. 이후 `master` 브랜치에 push 할 때마다 자동 재배포

### Firebase Hosting 배포

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 문제 해결

### ChunkLoadError: Loading chunk app/layout failed

**증상**: 브라우저에서 `ChunkLoadError: Loading chunk app/layout failed (timeout)` 발생

**원인**: `.next` 빌드 캐시 손상, 또는 Firebase SDK가 서버 사이드에서 호출되는 충돌

**해결 순서**:
1. 개발 서버를 종료한다
2. `.next` 폴더를 삭제한다:
   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force .next

   # macOS / Linux
   rm -rf .next
   ```
3. 개발 서버를 다시 시작한다:
   ```bash
   npm run dev
   ```

---

### Firebase 환경 변수 미설정 오류

**증상**: 화면에 "Firebase 설정 오류" 메시지 표시, 또는 콘솔에 아래 오류 출력
```
Firebase 환경 변수가 설정되지 않았습니다: NEXT_PUBLIC_FIREBASE_PROJECT_ID ...
```

**원인**: `.env.local` 파일이 없거나 값이 비어 있음

**해결**:
1. 프로젝트 루트에 `.env.local` 파일이 있는지 확인
2. Firebase Console → 프로젝트 설정 → 웹 앱 → `firebaseConfig` 값과 일치하는지 확인
3. 파일 수정 후 개발 서버 재시작 (환경 변수는 서버 재시작 시에만 반영됨)

---

### auth/operation-not-allowed

**증상**: 회원가입 시 "현재 이메일 회원가입이 비활성화되어 있습니다. Firebase Console에서 이메일/비밀번호 로그인을 활성화해주세요." 메시지

**원인**: Firebase Authentication에서 이메일/비밀번호 공급자가 비활성화 상태

**해결**:
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 해당 프로젝트 선택
3. Authentication → Sign-in method 탭
4. "이메일/비밀번호" 항목 클릭 → **사용 설정** 토글 활성화
5. 저장

---

### permission-denied (Firestore 권한 오류)

**증상**: 회원가입 직후 화면이 멈추거나, 콘솔에 `FirebaseError: permission-denied` 출력

**원인**: Firestore 보안 규칙이 배포되지 않아 모든 쓰기가 차단됨

**해결**:
- Firebase CLI로 배포:
  ```bash
  npm install -g firebase-tools
  firebase login
  firebase deploy --only firestore:rules
  ```
- 또는 Firebase Console에서 수동 적용:
  1. Firestore Database → Rules 탭
  2. `firestore.rules` 파일 내용 전체 복사 후 붙여넣기
  3. Publish 클릭

---

### auth/invalid-credential (로그인 실패)

**증상**: 로그인 시 "이메일 또는 비밀번호가 잘못되었습니다." 메시지

**원인**: Firebase SDK 최신 버전에서 `auth/wrong-password`와 `auth/user-not-found`가 통합된 코드

**해결**: 이메일과 비밀번호를 다시 확인하거나 회원가입 여부를 확인

---

### "프로젝트 ID가 없습니다" 에러
→ `.env.local` 파일의 `NEXT_PUBLIC_FIREBASE_PROJECT_ID` 확인

### "인증 오류" 발생
→ Firebase Console에서 Authentication 활성화 확인

### CSV 다운로드 시 한글이 깨짐
→ UTF-8 BOM이 자동으로 추가되므로 Excel에서 열면 정상 표시됨

### OpenAI 요약 기능이 동작하지 않음

**증상**: "AI로 요약하기" 버튼 클릭 후 오류 메시지 또는 변화 없음

**원인 및 해결**:

| 원인 | 해결 |
|------|------|
| `OPENAI_API_KEY` 미설정 | `.env.local`에 키 추가 후 서버 재시작 |
| API 크레딧 소진 | [OpenAI Platform](https://platform.openai.com/usage)에서 사용량 확인 |
| 설명이 5000자 초과 | 설명을 5000자 이하로 줄임 |
| 네트워크 오류 | 브라우저 개발자 도구 → Network 탭에서 `/api/summarize` 요청 상태 확인 |

## 라이선스

MIT

## 지원

문제가 발생하면 Firebase Console과 브라우저 개발자 도구의 콘솔 탭을 확인하세요.
