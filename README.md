# guratan

Google Drive へファイルを送信する簡易ツール。

## Usage

### send

```
$ GOOGLE_APPLICATION_CREDENTIALS=./gha-creds-temp.json npx guratan send --parent-id 12345ABC --dest-file-name test.txt --src-file-name path/to/test.txt
```

- `GOOGLE_APPLICATION_CREDENTIALS` にはサービスアカウントの鍵ファイルを指定
- 送信先フォルダー(`--parent-id`) に同名ファイル(`--dest-file-name`) が存在するときは上書きされる
- 同名ファイルが複数ある場合は最初にヒットしたものが上書きされる
- `--parent-id` `--dest-file-name` の代わりに `--file-id` で上書きファイルを指定できる
- 各オプションは環境変数での指定も可能(例. `--parent-id` = `GURATAN_PARENT_ID`)
- `guratan` からは upload と update のみ可能

### share

```
$ GOOGLE_APPLICATION_CREDENTIALS=./gha-creds-temp.json npx guratan share --file-id 12345ABC --type anyone --role reader
```

- `GOOGLE_APPLICATION_CREDENTIALS` にはサービスアカウントの鍵ファイルを指定
- `--file-id` の permission を作成/上書きすることで共有設定を変更する
- `--file-id` の代わりに `--parent-id` `--dest-file-name` で変更ファイルを指定できる
- 同名ファイルが複数ある場合は最初にヒットしたもののみが変更される
- 各オプションは環境変数での指定も可能(例. `--parent-id` = `GURATAN_PARENT_ID`)
- `guratan` から permission の削除はできない

## License

MIT License

Copyright (c) 2022 hankei6km
