# Wit.me - 배포 및 설정 가이드

## 빠른 시작 가이드

### 1단계: Firebase 프로젝트 설정

#### Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름: "wit-me" (또는 원하는 이름)
4. 프로젝트 생성

#### Authentication 설정
1. Firebase Console → Authentication 메뉴
2. "시작하기" 클릭
3. 이메일/비밀번호 선택 → 활성화

#### Firestore Database 설정
1. Firebase Console → Firestore Database 메뉴
2. "데이터베이스 만들기" 클릭
3. 위치: "asia-northeast1 (도쿄)" 또는 가까운 지역 선택
4. 보안 규칙: "테스트 모드로 시작" 선택 (나중에 변경)
5. "만들기" 클릭

#### Web App 설정
1. Firebase Console → Project Settings
2. 하단의 "내 앱" 섹션에서 웹 앱 추가
3. "닉네임" 입력: "wit-me-web"
4. "앱 등록" 클릭
5. 제공되는 firebaseConfig 값 복사

### 2단계: 로컬 환경 설정

```bash
# 프로젝트 클론
git clone <repository-url>
cd wit-me

# .env.local 파일 생성
cp .env.local.example .env.local
```

`.env.local` 파일에 다음 값 입력:

```
# Firebase Config (위에서 복사한 값)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx

# OpenAI API Key (선택사항)
OPENAI_API_KEY=sk-xxxxx
```

### 3단계: Firestore 보안 규칙 배포

```bash
# Firebase CLI 설치 (처음 한 번만)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 연결
firebase init firestore

# 규칙 배포
firebase deploy --only firestore:rules
```

또는 Firebase Console에서 수동으로:
1. Firebase Console → Firestore Database → Rules
2. `firestore.rules` 파일 내용 복사
3. Rules 편집기에 붙여넣기
4. Publish

### 4단계: 로컬 개발 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

## 배포하기

### Vercel (권장)

```bash
# GitHub에 푸시
git add .
git commit -m "Initial commit"
git push origin main

# Vercel에서 배포
# 1. https://vercel.com 접속
# 2. GitHub 계정으로 로그인
# 3. 프로젝트 import
# 4. 환경변수 설정 (위의 .env.local 값)
# 5. Deploy
```

### Firebase Hosting

```bash
# 프로젝트 초기화 (처음 한 번만)
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy --only hosting
```

### Docker로 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 빌드 및 실행
docker build -t wit-me .
docker run -e NEXT_PUBLIC_FIREBASE_API_KEY=... -p 3000:3000 wit-me
```

## 테스트하기

### 회원가입 테스트
1. 로그인 페이지에서 "회원가입" 탭 선택
2. 아래 정보로 가입:
   - 이름: "테스트 사용자"
   - 역할: "일반 사용자"
   - 이메일: test@example.com
   - 비밀번호: test123456

### 스터디 생성 테스트 (모임장)
1. 로그인 페이지에서 다른 계정으로 회원가입
2. 역할은 "모임장" 선택
3. "스터디 생성" 버튼 클릭
4. 스터디 정보 입력:
   - 제목: "Python 스터디"
   - 설명: "Python 프로그래밍 배우기"
   - 카테고리: "프로그래밍"
   - 위치: "강남역 카페"
   - 일시: 내일 날짜/시간
   - 최대 참가자: 5명
5. "스터디 생성" 클릭

### 스터디 신청 테스트
1. 일반 사용자 계정으로 로그인
2. 스터디 카드 클릭
3. 신청 메시지 작성
4. "스터디 신청" 클릭

### 신청자 관리 테스트
1. 모임장 계정으로 로그인
2. "내 스터디" → "신청자 관리" 클릭
3. 신청자 "승인" 또는 "거절" 클릭
4. "참가자 명단 다운로드" 클릭 → CSV 파일 다운로드

## 문제 해결

### "인증 오류" 발생
**원인**: Firebase 설정 값이 잘못됨
**해결**:
- `.env.local` 파일의 값 확인
- Firebase Console → Project Settings에서 값 재확인

### "PERMISSION_DENIED" 에러
**원인**: Firestore 규칙이 배포되지 않음
**해결**:
```bash
firebase deploy --only firestore:rules
```

### "OPENAI_API_KEY is not set"
**원인**: OpenAI API 키 미설정
**해결**:
- `.env.local`에 `OPENAI_API_KEY` 추가
- 또는 AI 요약 기능 사용 안 함 (필수 아님)

### CSV 다운로드 시 한글 깨짐
**원인**: Excel이 UTF-8 BOM을 인식하지 못함
**해결**: 자동으로 BOM이 포함되므로 Excel에서 정상 표시됨
- 또는 Google Sheets에서 열기

### "Too many requests" 에러 (OpenAI)
**원인**: API 호출 제한 초과
**해결**: 요청 주기 조정 또는 API 사용량 확인

## 환경변수 참고

### 필수 변수
- `NEXT_PUBLIC_FIREBASE_*`: Firebase 설정 (필수)

### 선택 변수
- `OPENAI_API_KEY`: AI 요약 기능 (선택)

### 주의사항
- `NEXT_PUBLIC_` 접두사는 클라이언트에 노출됨 (Firebase 설정 OK)
- `OPENAI_API_KEY`는 서버에서만 사용 (노출 안됨)
- `.env.local` 파일은 Git에 커밋하지 마세요

## 모니터링

### Firebase Console에서 모니터링
1. Firebase Console → Firestore Database
2. 데이터 및 사용량 확인

### 에러 로깅
1. Firebase Console → Firestore Database → Rules
2. 요청 분석 기능 사용

## 성능 최적화

### Firestore 인덱스
주요 쿼리:
- `studies` WHERE `status == 'open'` (자동 인덱스)
- `applications` WHERE `studyId == X` (자동 인덱스)
- `studies` WHERE `leaderUid == X` (자동 인덱스)

필요 시 Firebase Console에서 복합 인덱스 생성

### 이미지 최적화
현재 이미지 없음. 추후 추가 시:
- Firebase Storage 사용
- next/image 컴포넌트 사용

## 다음 단계

- [ ] 이메일 인증 추가
- [ ] 프로필 이미지 업로드
- [ ] 스터디 지도 표시 (Google Maps API)
- [ ] 실시간 알림 (Firebase Cloud Messaging)
- [ ] 사용자 평점/후기 기능
- [ ] 관리자 대시보드
