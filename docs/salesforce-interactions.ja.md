## Salesforce Interactions（Personalization）– Nuxt 3 連携フロー

このドキュメントは、Salesforce Interactions（旧 Interaction Studio / Evergage）を Nuxt 3 プロジェクトへ統合し、`sample/spa` のような SPA フローで運用する手順をまとめたものです。

### 1) 前提条件
- Salesforce Personalization のアカウント（Campaign / Template / Beacon 作成権限）。
- Beacon スクリプト（`window.SalesforceInteractions` が利用可能になるもの）。
- Nuxt 3 プロジェクト（新規または既存）。

### 2) Nuxt 3 プロジェクト作成（新規の場合）
```bash
npm create nuxt@latest my-app
cd my-app
npm install
npm run dev
```

### 3) Nuxt 側の基本設定
- Beacon/SDK はクライアント側のみで読み込みます。SPA では内部遷移のたびに `reinit()` を呼び、PS が DOM を再スキャンできるようにします。
- `app/app.vue` の `useHead` または client プラグインで Beacon を読み込みます。

例（`useHead` を使用）:
```ts
// app/app.vue (script setup)
useHead({
  script: [
    { src: 'https://<your-beacon-domain>/path/to/beacon.js', defer: true }
  ]
})
```

または client プラグイン（例：`app/plugins/salesforce-interactions.client.ts`）で読み込みます。

### 4) PS が描画する領域（zone）の定義
PS によるレコメンドやキャンペーンを表示したい位置に、`data-zone` 属性のコンテナを用意します。
```html
<div data-zone="ps-recommend-a" />
<div data-zone="ps-recommend-b" />
<div data-zone="ps-recommend-c" />
```

本リポジトリでは、`app/components/SpaTabs.vue` の枠内（ボーダー付きエリア）に zone を配置し、商品がその枠内に表示されるようにしています。

### 5) SPA ナビゲーションと `reinit()`
SPA ではページリロードを伴わないため、内部遷移後に `window.SalesforceInteractions.reinit()` を呼び、PS に DOM 再スキャンを促します。

`SpaTabs.vue` より抜粋:
```ts
const reinitSalesforceInteractions = () => {
  if (typeof window === 'undefined') return
  // @ts-expect-error beacon/PS により注入
  const SI = window.SalesforceInteractions
  if (SI && typeof SI.reinit === 'function') {
    try { SI.reinit() } catch {}
  }
}

const setTab = (key) => {
  activeTab.value = key
  window.location.hash = `#${key}`
  reinitSalesforceInteractions()
}
```

`hashchange` などのイベントでも `reinit()` を呼びます。
```ts
window.addEventListener('hashchange', () => {
  reinitSalesforceInteractions()
})
```

### 6) Salesforce 側での Campaign/Template 設定
1. Personalization で Campaign を作成します。
2. Template/Content を作成し、`[data-zone="ps-recommend-a"]` など、対象のセレクタへ描画するように設定します。
3. ターゲティング、オーディエンス、実験（A/B）などを必要に応じて設定します。
4. Campaign を Publish します。

ページロードや `reinit()` 呼出し時に、PS は DOM をスキャンし、設定した zone にコンテンツを描画します。

### 7) 動作確認
- DevTools で `window.SalesforceInteractions` が存在することを確認。
- Network タブで Beacon/SDK が正しくロードされているかを確認。
- タブ/ルートを切り替え、ボックス内にレコメンドが再描画されることを確認。

### 8) SSR・セキュリティ・パフォーマンス注意点
- Beacon/SDK はクライアントのみで読み込む（SSR では実行しない）。
- `defer` / `async` を使い、初期描画ブロックを避ける。
- レコメンド領域には `overflow: auto` を付与し、項目が増えた際のレイアウト崩れを抑制。

### 9) エラーハンドリングとフォールバック
- `SI.reinit()` は `try/catch` で囲み、一時的な SDK エラーで UI が壊れないようにします。
- PS のコンテンツが来る前に、プレースホルダーを表示しておくと UX が向上します。

### 10) 新規プロジェクトからのチェックリスト
1. Nuxt 3 を作成し、開発サーバを起動。
2. `useHead` または client プラグインで Beacon/SDK を読み込み。
3. 表示したい位置に `data-zone` を設置。
4. SPA 内部遷移やタブ変更のたびに `reinit()` を呼び出し。
5. Salesforce で Campaign/Template を作成し、zone にマッピングして Publish。
6. 表示確認（期待する位置にコンテンツが出ること）。

実装例は `app/components/SpaTabs.vue` を参照してください。


