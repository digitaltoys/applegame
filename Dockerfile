# Dockerfile

# --- 1단계: 빌드 환경 (Builder) ---
# Node.js 이미지를 기반으로 React 앱을 빌드합니다.
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치를 위해 package.json 파일을 먼저 복사
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# 전체 소스 코드를 복사
COPY . .

# React 앱 빌드
RUN npm run build

# --- 2단계: 프로덕션 환경 (Production) ---
# 가벼운 Nginx 이미지를 기반으로 최종 이미지를 만듭니다.
FROM nginx:1.23-alpine

# 1단계(builder)에서 생성된 빌드 결과물(/app/build)을
# Nginx의 기본 웹 루트 폴더로 복사합니다.
COPY --from=builder /app/dist /usr/share/nginx/html

# 위에서 작성한 커스텀 Nginx 설정 파일을 복사합니다.
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# 컨테이너가 80 포트를 노출하도록 명시
EXPOSE 80

# Nginx를 실행
CMD ["nginx", "-g", "daemon off;"]
