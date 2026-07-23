# Sticker Mockuper（仮称）

MacBook / iPad にステッカーを貼る前に、見た目をシミュレーションできるMVP。
画像はブラウザ内でのみ処理され、サーバーには送信されません。

要件定義は [`files/sticker_mockuper_requirements.md`](files/sticker_mockuper_requirements.md)、
挙動の参考実装は [`files/sticker_mockuper_demo.html`](files/sticker_mockuper_demo.html) を参照。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

Vercelへは `vercel.json` の設定でデプロイ可能（フレームワーク: Vite）。
