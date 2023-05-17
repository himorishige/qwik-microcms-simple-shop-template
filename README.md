# QwikとmicroCMSを利用したシンプルな売上管理アプリケーション️

![image](https://github.com/himorishige/qwik-microcms-simple-store-template/assets/71954454/4d0bd4e9-2fcc-4792-b27e-f4f0b3304ffb)

QwikとmicroCMSを利用したシンプルな売上管理アプリケーションのテンプレートです。
町内会や文化祭、フリーマーケットなど小さな店舗での利用を想定しています。

- [Qwik Docs](https://qwik.builder.io/)
- [microCMS](https://microcms.io/)

## 必要なもの

利用にあたって下記の事前準備が必要となります。

- microCMS APIキーの権限変更
- OpenWeatherのAPIキー取得

### microCMS APIキーの権限変更

レジページにて計算、売上のデータをmicroCMSに登録するために販売APIに対してのPOST権限が必要となります。以下の画像と同じように権限を追加設定してください。

![CleanShot 2023-05-17 at 16 14 15](https://github.com/himorishige/qwik-microcms-simple-store-template/assets/71954454/0cb8fb1c-443f-4911-9769-0fb42cb2aabb)

### OpenWeatherのAPIキー取得

天気予報を表示するためにOpenWeatherのOne Call API 3.0のAPIキーが必要となります。下記からアカウントの作成しAPIキーを取得してください。
[Weather API \- OpenWeatherMap](https://openweathermap.org/api)

## 環境変数の設定

プロジェクトディレクトリ内に`.env.local`ファイルを作成の上下記必要事項を記述してください。

```shell:.env.local
OPENWEATHER_API_KEY=OpenWeatherのAPIキー
MICROCMS_SERVICE_DOMAIN=microCMSのサービスドメイン名
MICROCMS_API_KEY=microCMSのAPIキー
```

## 開発

### インストール

```shell
yarn install
or
npm install
```

### 開発サーバーの起動

```shell
yarn dev
or
npm run dev
```

## デプロイ

リポジトリはCloudflare Pagesへのデプロイを想定したものとなっています。デプロイにはCloudflareのアカウントが必要です。CLIからのデプロイ、もしくはCloudflareダッシュボードからGitHub連携を利用してデプロイできます。

[Cloudflare Pages documentation · Cloudflare Pages docs](https://developers.cloudflare.com/pages/)

```shell
yarn serve
or
npm run serve
```

### Cloudflare以外へのデプロイ

`yarn qwik add`を利用することで他の環境へのアダプターを設定することが可能です。詳しくは[Deployments \- Qwik](https://qwik.builder.io/docs/deployments/)を参照ください。
