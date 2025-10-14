# `/api/auth/callback/credentials` が 401 になる理由と対処法

## 現象
- 新規登録後やログイン時に `POST /api/auth/callback/credentials` が 401 を返す
- NextAuth の Credentials プロバイダで `authorize` が `null` を返した場合に 401 になる

## 原因
- ユーザー登録 API (`/api/users`) ではパスワードのハッシュ化に `bcryptjs` を使用している
- 一方で認証処理 (`lib/auth.ts`) ではネイティブ実装の `bcrypt` を使用していた
- 実行環境によっては `bcrypt.compare` がハッシュを正しく検証できず、常に `false` を返していた
  - その結果、`authorize` が `null` を返し 401 になる

## 対処
- 認証処理側でも `bcryptjs` を使用するように統一した
- これにより `/api/users` で生成したハッシュと確実に互換性を保てる
- `bcrypt` 依存を削除し、ビルド時にネイティブモジュールをコンパイルする必要もなくなる

## 参考
- `src/lib/auth.ts`
- `src/app/api/users/route.ts`
