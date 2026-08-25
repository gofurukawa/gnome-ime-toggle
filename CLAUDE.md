# gnome-ime-toggle

GNOME Shell 拡張。トップバーに「A / あ」ボタンを表示し、クリックひとつで
英数入力と日本語（ローマ字→ひらがな）入力を切り替える。子どもが使うため、
現在のモードが常に画面上で分かることを最優先とする。

---

## 対象環境

| 項目 | 値 |
|---|---|
| OS | Ubuntu |
| GNOME Shell | 50.1 |
| セッション | **Wayland**（GNOME 50 は X11 を廃止済み） |
| 入力メソッド | IBus + Mozc (ibus-mozc) |
| キーボード | US配列（半角/全角・変換・無変換キーなし） |

入力ソースは2つ登録されている。

```
[('xkb', 'us'), ('ibus', 'mozc-jp')]
```

Mozc 側は `active_on_launch: True` で常にひらがなモードに固定済み。
詳細は [docs/environment.md](docs/environment.md)。

---

## 検証済みの制約（再検討不要）

以下はすべて実機で確認した結論。**代替案として提案しないこと。**

### 外部プロセスから入力ソースは切り替えられない

- `gsettings set org.gnome.desktop.input-sources current N` は**効かない**。
  このキーは gnome-shell が現在状態を書き込む先で、外部からの書き込みは反映されない
- `org.gnome.Shell.Eval` は現行 GNOME で既定無効
- キーイベントの合成（Super+Space の注入）は Wayland の制限で不可

### 別アプリのウィンドウは常時最前面にできない

Wayland には X11 の `_NET_WM_STATE_ABOVE` に相当する一般アプリ向け
プロトコルが存在しない。

### X11 セッションへの退避は不可

**GNOME Shell 50 は X11 サポートを削除している。** X11 前提の回避策は
すべて成立しない。

### 既存拡張 Customize IBus は使えない

表示は動くがクリック切り替えが無反応。gnome-shell 内部にパッチを当てる
方式のため、GNOME 50 では差し替え対象が変わっており、例外も出さずに失敗する。

### → gnome-shell 内で動く拡張として実装する以外に手段がない

拡張からであれば `getInputSourceManager()` に直接アクセスできる。

---

## 実装の前提

- **GNOME 45 以降の ESM 構文**を使う（`import ... from 'gi://...'`、
  `Extension` を default export するクラス）
- GNOME 50 では extension.js 関連の破壊的変更はなく、45系の書き方が通る
- `disable()` でのシグナル切断・アクター破棄は必ず行う
- `metadata.json` の `shell-version` は `["50"]`。
  未記載のバージョンでは `OUT OF DATE` となり読み込まれない

---

## 開発時の注意

**Wayland ではシェルの再読み込みができない。反映にはログアウト→ログインが必要。**
`Alt+F2` → `r` は使えない。

ログアウトせずに確認したい場合はネストセッションを使う。

```bash
dbus-run-session -- gnome-shell --nested --wayland
```

デバッグ：

```bash
# State が ACTIVE か
gnome-extensions info ime-toggle@gofurukawa.github.io

# 読み込み時のエラー
journalctl -f -o cat /usr/bin/gnome-shell
```

---

## ドキュメント

- [docs/initial-spec.md](docs/initial-spec.md) — 初期仕様（作成時点のスナップショット）
- [docs/environment.md](docs/environment.md) — Mozc 事前設定・環境再構築手順

---

## 参考

- https://gjs.guide/extensions/
- https://gjs.guide/extensions/upgrading/gnome-shell-50.html
