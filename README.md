# Apple Collector Game

React + TypeScript + Vite로 구축된 웹 게임입니다. 플레이어가 1-9 숫자가 적힌 사과들을 선택하여 합이 10이 되는 조합을 만드는 퍼즐 게임입니다.

## CouchDB 데이터베이스 관리

### 점수 데이터 룰 변경

클래식 룰에서 스피드 룰로 점수 데이터를 일괄 변경하는 방법:

1. 먼저 클래식 룰 상위 점수 조회:
```bash
curl -s -X GET "http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_rule_score?startkey=%5B%22classic%22%2C%7B%7D%5D&endkey=%5B%22classic%22%5D&descending=true&limit=13" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]"
```

2. 각 문서의 현재 revision 조회:
```bash
curl -s -X GET "http://couchdb.ioplug.net/scoredb/[DOCUMENT_ID]" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]"
```

3. rule 필드를 추가하여 문서 업데이트:
```bash
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/[DOCUMENT_ID]" \
  -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" \
  -H "Content-Type: application/json" \
  -d '{"_id":"[DOCUMENT_ID]","_rev":"[CURRENT_REV]","type":"score","name":"[NAME]","score":[SCORE],"createdAt":"[DATE]","tag":["speed"],"rule":"speed"}'
```

4. 변경 결과 확인:
```bash
curl -s -X GET "http://couchdb.ioplug.net/scoredb/_design/scores/_view/by_rule_score?startkey=%5B%22speed%22%2C%7B%7D%5D&endkey=%5B%22speed%22%5D&descending=true&limit=15" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]"
```

### 실제 실행한 1-13위 룰 변경 쿼리

2025-07-30 실행한 실제 명령어들:

```bash
# 1위 (258점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10902292c" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10902292c","_rev":"2-b46adb5b8ad9a87c5afec9e70a8ba31c","type":"score","name":"숩","score":258,"createdAt":"2025-07-29T06:56:31.080Z","tag":["speed"],"rule":"speed"}'

# 2위 (241점) - 가비니
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b109020fb3" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b109020fb3","_rev":"2-bb7e46b1c3bb659b8d5f03ba7c44e4d8","type":"score","name":"가비니","score":241,"createdAt":"2025-07-29T03:40:23.428Z","tag":["speed"],"rule":"speed"}'

# 3위 (237점) - 가비니
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b109020b75" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b109020b75","_rev":"2-926616c38c041932d078120c741dbed5","type":"score","name":"가비니","score":237,"createdAt":"2025-07-29T03:32:09.306Z","tag":["speed"],"rule":"speed"}'

# 4위 (234점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10902274d" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10902274d","_rev":"2-5275eda2642462680ee244203ccc9dee","type":"score","name":"숩","score":234,"createdAt":"2025-07-29T04:26:36.416Z","tag":["speed"],"rule":"speed"}'

# 5위 (227점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b109020ba8" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b109020ba8","_rev":"2-ef7f1e2eefb4ff98ea9c883bbccd3fec","type":"score","name":"숩","score":227,"createdAt":"2025-07-29T03:32:15.142Z","tag":["speed"],"rule":"speed"}'

# 6위 (202점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10902091b" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10902091b","_rev":"2-3f92cf49e9bb235fbb11f82d23488787","type":"score","name":"숩","score":202,"createdAt":"2025-07-29T03:29:53.544Z","tag":["speed"],"rule":"speed"}'

# 7위 (200점) - 가비니
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10901f2ed" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10901f2ed","_rev":"2-6118f3d8a2d3057d0db7c82aed9ca450","type":"score","name":"가비니","score":200,"createdAt":"2025-07-29T00:28:06.621Z","tag":["speed"],"rule":"speed"}'

# 8위 (191점) - 가비니
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10901f82c" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10901f82c","_rev":"2-6cbee8b9b24a346ce503c1f791763b17","type":"score","name":"가비니","score":191,"createdAt":"2025-07-29T03:17:38.618Z","tag":["speed"],"rule":"speed"}'

# 9위 (152점) - 펩시맨
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b109021d30" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b109021d30","_rev":"2-26c0a1b61f4d0368b1126e40ec72aa26","type":"score","name":"펩시맨","score":152,"createdAt":"2025-07-29T03:49:06.282Z","tag":["speed"],"rule":"speed"}'

# 10위 (138점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10901fcc5" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10901fcc5","_rev":"2-6c1704aee52deb9a24395caacbc5ee1c","type":"score","name":"숩","score":138,"createdAt":"2025-07-29T03:28:50.330Z","tag":["speed"],"rule":"speed"}'

# 11위 (132점) - 숩
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10901f687" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10901f687","_rev":"2-043ad786186640bbd16603ad01d871f0","type":"score","name":"숩","score":132,"createdAt":"2025-07-29T03:17:04.833Z","tag":["speed"],"rule":"speed"}'

# 12위 (117점) - 펩시맨
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b10901f04e" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b10901f04e","_rev":"2-d75104a9ec69aed4b77922fe1b717e20","type":"score","name":"펩시맨","score":117,"createdAt":"2025-07-28T23:43:54.775Z","tag":["speed"],"rule":"speed"}'

# 13위 (81점) - 가비니
curl -s -X PUT "http://couchdb.ioplug.net/scoredb/80dcf3666232d72639a9a0b109020430" -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" -H "Content-Type: application/json" -d '{"_id":"80dcf3666232d72639a9a0b109020430","_rev":"2-101f5a4379ca7adcfd9964e7808a0475","type":"score","name":"가비니","score":81,"createdAt":"2025-07-29T03:28:59.866Z","tag":["speed"],"rule":"speed"}'
```

### 주의사항
- CouchDB의 MVCC로 인해 revision 충돌이 발생할 수 있으므로 각 업데이트 전에 최신 revision을 조회해야 합니다.
- Authorization 헤더는 base64 인코딩된 크리덴셜을 사용합니다. (.env 파일 참조)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
