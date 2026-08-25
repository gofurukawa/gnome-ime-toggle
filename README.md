# gnome-ime-toggle

GNOME Shell のトップバーに大きな「**A** / **あ**」ボタンを表示し、
クリックひとつで英数入力と日本語入力を切り替える拡張機能です。

US配列キーボードには半角/全角キーがなく、`Super+Space` によるトグル操作に
頼ることになりますが、トグルは「今どちらのモードか」を頭の中で保持し続ける
必要があります。この拡張は現在のモードを常に画面に表示し、その表示自体を
クリックできるようにすることで、その負荷をなくします。

- 英語 (US) → **A**（青地に白文字）
- 日本語 (Mozc) → **あ**（オレンジ地に黒文字）

文字色を白と黒で反転させているのは、色が判別しにくい場合でも状態の違いが
伝わるようにするためです。

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
| 背景色を変える | `stylesheet.css` の `.ime-toggle-chip.latin` / `.ime-toggle-chip.japanese` |
| 文字色を変える | `stylesheet.css` の `.ime-toggle-chip.latin .ime-toggle-label` / `.ime-toggle-chip.japanese .ime-toggle-label` |
| 文字サイズを変える | `stylesheet.css` の `.ime-toggle-label` |
| ボタンの大きさを変える | `stylesheet.css` の `.ime-toggle-chip` の `height` / `min-width` |

背景と文字は別の要素に分かれています。`.ime-toggle-chip` が背景・角丸・寸法を、
`.ime-toggle-label` が文字を担当します。チップの高さを固定しているのは、
`A` と `あ` で使われるフォントが異なり、文字に合わせると切り替えるたびに
ボタンの大きさが変わってしまうためです。

配色を変更する場合は、文字と背景のコントラスト比を 4.5:1 以上に保ってください。
現在の値は英語が 4.77:1、日本語が 10.58:1 です。

編集後はログアウト→ログインで反映されます。

---

## ドキュメント

- [docs/initial-spec.md](docs/initial-spec.md) — 初期仕様
- [docs/environment.md](docs/environment.md) — 環境構築手順

---

## ライセンス

GPL-3.0
