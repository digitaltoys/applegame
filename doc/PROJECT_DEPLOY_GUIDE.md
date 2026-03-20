# 프로젝트 GitOps 배포 가이드

> 이 문서는 프로젝트 repo에서 GitOps 배포 파일을 생성할 때 참고하는 가이드입니다.
> "배포용 파일 만들어줘" 요청 시 이 문서를 기반으로 파일을 생성합니다.

---

## 개요

이 프로젝트의 GitOps 배포는 **Rancher Fleet** 기반으로 동작합니다.

```
[프로젝트 Repo]                   [rke2-gitops Repo]              [RKE2 클러스터]
deploy/<project-name>/    →   projects/<project-name>/   →   Fleet 자동 배포
  fleet.yaml                    gitrepo.yaml (등록만)
  Chart.yaml
  values.yaml
  templates/
```

- 프로젝트 repo의 `deploy/<project-name>/` 경로에 Helm chart + `fleet.yaml`을 작성
- rke2-gitops repo의 `projects/<project-name>/gitrepo.yaml`이 이 경로를 감시하여 자동 배포

---

## ⚠️ 배포 방식 정책: Helm 전용

> **모든 배포는 Helm chart 방식만 사용합니다.**

- Kustomize / Raw manifest 방식은 신규 추가 금지입니다.
- 기존 Kustomize 앱은 부득이한 경우가 아니라면 Helm으로 전환합니다.
- 예외(POC, 긴급 핫픽스)는 제한된 기간에만 허용하며, 종료 시점과 전환 계획을 문서로 남겨야 합니다.


## 생성해야 할 파일 목록

```
프로젝트 Repo
└── deploy/
    └── <project-name>/
        ├── fleet.yaml          ← Fleet 번들 정의 (필수)
        ├── Chart.yaml          ← Helm chart 메타 (필수)
        ├── values.yaml         ← 배포 설정값 (필수)
        └── templates/
            ├── deployment.yaml ← 앱 Pod 정의 (필수)
            ├── service.yaml    ← 내부 서비스 (필수)
            ├── ingress.yaml    ← 외부 도메인 노출 (도메인 있을 때)
            └── pvc.yaml        ← 영구 볼륨 (데이터 저장 필요 시)
```

---

## 파일별 템플릿

### 1. `fleet.yaml` (필수)

Fleet가 이 디렉터리를 Helm 번들로 인식하게 합니다.

```yaml
defaultNamespace: <namespace>   # 배포할 네임스페이스 (예: default, platform)
helm:
  releaseName: <project-name>   # Helm release 이름
  chart: .                      # 현재 디렉터리를 chart로 사용
```

**예시:**
```yaml
defaultNamespace: default
helm:
  releaseName: myapp
  chart: .
```

---

### 2. `Chart.yaml` (필수)

Helm chart 메타데이터입니다.

```yaml
apiVersion: v2
name: <project-name>
description: <앱 설명>
type: application
version: 0.1.0
appVersion: "<이미지 태그 또는 앱 버전>"
```

**예시:**
```yaml
apiVersion: v2
name: myapp
description: My application service
type: application
version: 0.1.0
appVersion: "1.0.0"
```

---

### 3. `values.yaml` (필수)

배포 설정값입니다. 환경마다 다른 값을 여기서 관리합니다.

```yaml
# 이미지
image:
  repository: ghcr.io/<org>/<project-name>
  tag: "latest"

# 레플리카
replicaCount: 1

# 서비스 포트
service:
  port: <컨테이너 포트>  # 예: 8080, 3000

# 인그레스 (외부 도메인 노출 시)
ingress:
  enabled: true
  className: nginx
  host: <project-name>.ioplug.net
  tlsSecretName: <project-name>-tls
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod

# 영구 볼륨 (데이터 저장 필요 시)
persistence:
  enabled: false
  size: 5Gi
  storageClass: longhorn
  accessModes:
    - ReadWriteOnce
  mountPath: /data

# 리소스 제한
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"

# 추가 환경변수
extraEnv: []
# 예:
# extraEnv:
#   - name: DATABASE_URL
#     valueFrom:
#       secretKeyRef:
#         name: myapp-secret
#         key: database-url
```

---

### 4. `templates/deployment.yaml` (필수)

앱 컨테이너 정의입니다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
  namespace: {{ .Release.Namespace }}
spec:
  replicas: {{ .Values.replicaCount | default 1 }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
        - name: {{ .Release.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
          env:
            {{- with .Values.extraEnv }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
          {{- if .Values.persistence.enabled }}
          volumeMounts:
            - name: data
              mountPath: {{ .Values.persistence.mountPath | quote }}
          {{- end }}
          resources:
            requests:
              memory: {{ .Values.resources.requests.memory | quote }}
              cpu: {{ .Values.resources.requests.cpu | quote }}
            limits:
              memory: {{ .Values.resources.limits.memory | quote }}
              cpu: {{ .Values.resources.limits.cpu | quote }}
      {{- if .Values.persistence.enabled }}
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: {{ .Release.Name }}-data
      {{- end }}
```

---

### 5. `templates/service.yaml` (필수)

클러스터 내부 서비스 정의입니다.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}
  namespace: {{ .Release.Namespace }}
spec:
  type: ClusterIP
  selector:
    app: {{ .Release.Name }}
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: http
```

---

### 6. `templates/ingress.yaml` (외부 도메인 노출 시)

외부 도메인으로 앱을 노출할 때 사용합니다.

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}
  namespace: {{ .Release.Namespace }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className | quote }}
  {{- end }}
  rules:
    - host: {{ .Values.ingress.host | quote }}
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: {{ .Release.Name }}
                port:
                  number: {{ .Values.service.port }}
  {{- if .Values.ingress.tlsSecretName }}
  tls:
    - hosts:
        - {{ .Values.ingress.host | quote }}
      secretName: {{ .Values.ingress.tlsSecretName | quote }}
  {{- end }}
{{- end }}
```

---

### 7. `templates/pvc.yaml` (데이터 영구 저장 필요 시)

Longhorn 기반 영구 볼륨 정의입니다.

```yaml
{{- if .Values.persistence.enabled }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ .Release.Name }}-data
  namespace: {{ .Release.Namespace }}
spec:
  accessModes:
    {{- toYaml .Values.persistence.accessModes | nindent 4 }}
  resources:
    requests:
      storage: {{ .Values.persistence.size | quote }}
  storageClassName: {{ .Values.persistence.storageClass | quote }}
{{- end }}
```

---

## Secret 처리 규칙

> **중요**: Secret은 이 방법으로만 처리합니다.

- DB 비밀번호, API 키 등 앱별 Secret은 **이 프로젝트 repo에서 SOPS로 암호화** 후 관리
- `extraEnv`에서 `secretKeyRef`로 참조
- rke2-gitops repo의 `helmSecretName: sops-age`가 복호화를 담당

Secret 파일 예시 (SOPS 암호화 전):
```yaml
# templates/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Release.Name }}-secret
  namespace: {{ .Release.Namespace }}
type: Opaque
stringData:
  database-url: {{ .Values.secret.databaseUrl | quote }}
```

---

## 배포 파일 생성 체크리스트

```
[ ] deploy/<project-name>/fleet.yaml         → defaultNamespace, releaseName 설정
[ ] deploy/<project-name>/Chart.yaml         → name, description, appVersion 설정
[ ] deploy/<project-name>/values.yaml        → image, service.port, ingress.host 설정
[ ] deploy/<project-name>/templates/
    [ ] deployment.yaml                       → 컨테이너 정의
    [ ] service.yaml                          → 내부 서비스
    [ ] ingress.yaml (도메인 있을 때)         → 외부 노출
    [ ] pvc.yaml (데이터 저장 필요 시)        → 영구 볼륨
```

---

## 자주 쓰는 설정 조합

### 단순 웹앱 (DB 없음, 도메인 있음)
```
fleet.yaml + Chart.yaml + values.yaml
templates/deployment.yaml + service.yaml + ingress.yaml
```
- `persistence.enabled: false`
- `ingress.enabled: true`

### 스테이트풀 앱 (DB 포함, 영구 저장)
```
fleet.yaml + Chart.yaml + values.yaml
templates/deployment.yaml + service.yaml + ingress.yaml + pvc.yaml
```
- `persistence.enabled: true`
- `persistence.size`, `persistence.mountPath` 설정

### 내부 서비스 (도메인 없음)
```
fleet.yaml + Chart.yaml + values.yaml
templates/deployment.yaml + service.yaml
```
- `ingress.enabled: false`

---

## rke2-gitops 등록 (별도 작업)

프로젝트 배포 파일 생성 후, rke2-gitops repo에 아래 파일도 생성해야 합니다.
(이 작업은 rke2-gitops repo에서 수행)

```yaml
# rke2-gitops/projects/<project-name>/gitrepo.yaml
apiVersion: fleet.cattle.io/v1alpha1
kind: GitRepo
metadata:
  name: <project-name>
  namespace: fleet-local
spec:
  repo: https://github.com/digitaltoys/<project-name>.git
  branch: main
  clientSecretName: <git-auth-secret-name>
  paths:
    - deploy/<project-name>
  targets:
    - clusterName: local
      name: local
  # helmSecretName: sops-age  ← SOPS Secret 사용 시 주석 해제
```
