# GitHub 설정 가이드

> 이 문서는 GitOps 배포 구조가 동작하기 위해 GitHub에서 설정해야 할 사항들을 정리합니다.
> 신규 프로젝트 등록 시 이 체크리스트를 기반으로 진행합니다.

---

## 설정 체크리스트

```
[ ] 1. Fleet 접근용 인증 (PAT 또는 Deploy Key)
[ ] 2. 클러스터에 Git 인증 Secret 등록
[ ] 3. GHCR 패키지 가시성 설정
[ ] 4. GitHub Actions 워크플로우 작성
[ ] 5. Actions Secrets 등록
[ ] 6. (권장) main 브랜치 보호 설정
```

---

## 1. Fleet 접근용 인증

Fleet가 프로젝트 repo를 감시하려면 GitHub 인증 정보가 필요합니다.
`gitrepo.yaml`의 `clientSecretName`이 이 Secret을 참조합니다.

### 방법 A — Fine-grained PAT (권장)

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. 신규 토큰 생성:
   - **Resource owner**: `digitaltoys` 조직
   - **Repository access**: 해당 프로젝트 repo만 선택
   - **Permissions**: `Contents → Read-only`
3. 생성된 토큰을 클러스터에 Secret으로 등록:

```bash
kubectl create secret generic <clientSecretName> \
  --from-literal=username=git \
  --from-literal=password=<PAT 토큰값> \
  -n fleet-local
```

### 방법 B — Deploy Key

1. GitHub → 프로젝트 repo → **Settings → Deploy keys → Add deploy key**
2. 공개키 등록 (읽기 전용, Allow write access 체크 안 함)
3. 클러스터에 SSH 키 Secret 등록:

```bash
kubectl create secret generic <clientSecretName> \
  --from-file=ssh-privatekey=<개인키 파일 경로> \
  -n fleet-local
```

> `gitrepo.yaml`의 `spec.repo`를 SSH URL(`git@github.com:digitaltoys/<repo>.git`)로 설정해야 합니다.

---

## 2. GHCR (GitHub Container Registry) 설정

빌드된 Docker 이미지를 `ghcr.io/digitaltoys/<project-name>`에 push할 때 설정합니다.

### 패키지 가시성 설정

- GitHub → 해당 패키지 → **Package settings → Change visibility**
  - public repo: `Public` 권장 (imagePullSecret 불필요)
  - private: `Private` → 클러스터에 imagePullSecret 추가 필요

### Private 패키지일 때 클러스터 설정

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<GitHub 사용자명> \
  --docker-password=<PAT (packages:read 권한)> \
  -n <배포 네임스페이스>
```

`values.yaml`에 추가:
```yaml
imagePullSecrets:
  - name: ghcr-secret
```

---

## 3. GitHub Actions 워크플로우

소스 변경 → 이미지 빌드 → GHCR push → `values.yaml` 태그 업데이트 → Fleet 자동 배포 흐름입니다.

### `.github/workflows/deploy.yml` 템플릿

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}   # ghcr.io/digitaltoys/<repo>

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: write       # values.yaml 커밋 push
      packages: write       # GHCR push

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: 이미지 태그 생성
        id: meta
        run: echo "tag=$(echo $GITHUB_SHA | head -c7)" >> $GITHUB_OUTPUT

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.tag }}

      - name: values.yaml 이미지 태그 업데이트
        run: |
          sed -i "s/tag: .*/tag: \"${{ steps.meta.outputs.tag }}\"/" \
            deploy/<project-name>/values.yaml

      - name: 변경사항 커밋 및 푸시
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add deploy/<project-name>/values.yaml
          git diff --staged --quiet || git commit -m "chore: update image tag to ${{ steps.meta.outputs.tag }}"
          git push
```

> `deploy/<project-name>` 부분을 실제 프로젝트명으로 교체합니다.

---

## 4. Actions Secrets 등록

GitHub → 프로젝트 repo → **Settings → Secrets and variables → Actions**

| Secret 이름 | 설명 | 필요 여부 |
|---|---|---|
| `GITHUB_TOKEN` | Actions 기본 제공, GHCR push 및 repo write에 사용 | 자동 제공 |
| `AGE_SECRET_KEY` | SOPS 암호화 Secret 복호화 시 필요 | SOPS 사용 시 |

> `GITHUB_TOKEN`은 별도 등록 없이 자동으로 제공됩니다.
> SOPS 사용 프로젝트는 Age 개인키를 `AGE_SECRET_KEY`로 등록합니다.

---

## 5. 브랜치 보호 (권장)

`main` 브랜치에 직접 push를 막고, 배포 이력을 PR로 관리합니다.

GitHub → 프로젝트 repo → **Settings → Branches → Add branch ruleset**

권장 설정:
- **Restrict pushes**: 활성화 (Actions bot 제외)
- **Require pull request before merging**: 활성화
- **Require status checks to pass**: Actions 워크플로우 지정

> Actions bot이 `values.yaml`을 자동 커밋/푸시하는 경우, `github-actions[bot]`을 bypass list에 추가해야 합니다.

---

## 신규 프로젝트 GitHub 설정 순서

```
1. PAT 또는 Deploy Key 생성
2. kubectl로 fleet-local 네임스페이스에 Git 인증 Secret 등록
3. GHCR 패키지 가시성 확인 (public 권장)
4. .github/workflows/deploy.yml 작성 (위 템플릿 참고)
5. rke2-gitops repo에 projects/<project-name>/gitrepo.yaml 추가
6. (선택) main 브랜치 보호 설정
```
