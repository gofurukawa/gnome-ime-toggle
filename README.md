# gnome-ime-toggle

GNOME Shell のトップバーに大きな「**A** / **あ**」ボタンを表示し、
クリックひとつで英数入力と日本語入力を切り替える拡張機能です。

US配列キーボードには半角/全角キーがなく、`Super+Space` によるトグル操作に
頼ることになりますが、トグルは「今どちらのモードか」を頭の中で保持し続ける
必要があります。この拡張は現在のモードを常に画面に表示し、その表示自体を
クリックできるようにすることで、その負荷をなくします。

- 英語 (US) → **A**（青）
- 日本語 (Mozc) → **あ**（オレンジ）

`Super+Space` など他の手段で切り替えた場合も、表示は自動で追従します。

---

## 動作環境

- GNOME Shell 50（Wayland）
- IBus + Mozc

入力ソースとして「英語 (US)」と「日本語 (Mozc)」の2つが登録されている
ことを前提としています。

---

## インストール

### Release の zip から

```bash
gnome-extensions install --force ~/Downloads/ime-toggle@gofurukawa.github.io.shell-extension.zip
gnome-extensions enable ime-toggle@gofurukawa.github.io
```

### リポジトリから

```bash
git clone https://github.com/gofurukawa/gnome-ime-toggle.git ~/src/gnome-ime-toggle
ln -sfn ~/src/gnome-ime-toggle/ime-toggle@gofurukawa.github.io \
  ~/.local/share/gnome-shell/extensions/ime-toggle@gofurukawa.github.io
gnome-extensions enable ime-toggle@gofurukawa.github.io
```

いずれの場合も、反映には**ログアウト→ログイン**が必要です。
Wayland ではシェルの再読み込み（`Alt+F2` → `r`）が使えません。

---

## 事前設定（重要）

Mozc は既定で「直接入力」モードで起動します。この状態だと拡張の表示（あ）と
実際の入力状態（英数）が食い違うため、Mozc を常にひらがなモードで起動する
よう設定してください。

`~/.config/mozc/ibus_config.textproto` に以下を追記します。

```
active_on_launch: True
```

```bash
ibus write-cache; ibus restart
```

くわしい手順とトラブルシューティングは
[docs/environment.md](docs/environment.md) を参照してください。

---

## カスタマイズ

設定 UI はありません。ソースを直接編集してください。

| やりたいこと | 編集箇所 |
|---|---|
| 表示位置を変える | `extension.js` の `addToStatusArea` 第4引数（`'left'` / `'center'` / `'right'`） |
| 文字サイズ・色を変える | `stylesheet.css` |

編集後はログアウト→ログインで反映されます。

---

## ドキュメント

- [docs/initial-spec.md](docs/initial-spec.md) — 初期仕様
- [docs/environment.md](docs/environment.md) — 環境構築手順

---

## ライセンス

GPL-3.0
