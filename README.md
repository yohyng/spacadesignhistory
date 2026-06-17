# 空間デザインを読む年表

Books × DSA 12 Categories のインタラクティブ年表プロトタイプです。Vite + React 構成なので、Vercel にそのままインポートして画面確認用 URL を発行できます。

## Local development

```bash
npm install
npm run dev
```

## Vercel deployment

1. GitHub にこのリポジトリを push します。
2. Vercel の **Add New Project** からリポジトリを Import します。
3. Framework Preset は **Vite** を選択します。
4. Build Command は `npm run build`、Output Directory は `dist` を使用します。
5. Vercel 側の Project Settings で **Root Directory がリポジトリ直下** になっていることを確認します。`src` や別フォルダを指定すると 404 になります。
6. Deploy 後に発行される Preview URL をタッチパネル端末やブラウザで開いて確認します。

`vercel.json` に同じ設定を入れているため、通常は Vercel 側で自動検出されます。

## If Vercel shows 404

- Project Settings → Build & Development Settings の Output Directory が `dist` か確認します。
- Project Settings → General の Root Directory がリポジトリ直下か確認します。
- 最新コミットで Redeploy してください。`vercel.json` には SPA fallback の rewrite を入れています。
