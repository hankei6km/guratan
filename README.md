# tsend

Google Drive へファイルを送信する簡易ツール。

## Usage

```
$ GOOGLE_APPLICATION_CREDENTIALS=./gha-creds-temp.json npx tsend send --parent-id 12345ABC --dest-file-name test.txt --src-file-name path/to/test.txt
```

- `GOOGLE_APPLICATION_CREDENTIALS` にはサービスアカウントの鍵ファイルを指定
- 送信先フォルダー(`--parent-id`) に同名ファイル(`--dest-file-name`) が存在するときは上書きされる
- 各オプションは環境変数での指定も可能(例. `--parent-id` = `TSEND_PARENT_ID`)

## License

MIT License

Copyright (c) 2022 hankei6km
