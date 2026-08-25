# 初期仕様

作成時点のスナップショット。実装が進んだ後の正は実コードであり、
この文書は「当初どう決めたか」の記録として残す。

---

## 1. 目的

US配列キーボードの Ubuntu 環境で、子どもが英数入力と日本語入力を
迷わず切り替えられるようにする。

US配列には半角/全角キーも変換/無変換キーもないため、既定では
`Super+Space` によるトグル操作に頼ることになる。しかしトグルは
「今どちらのモードか」を頭の中で保持し続ける必要があり、
子どもには負荷が高い。

そこで、**現在のモードを常に画面に表示し、それ自体をクリックできる**
UI を用意する。

---

## 2. 機能要件

1. トップバーに常時表示されるボタンを置く
2. 現在の入力ソースに応じて表示を切り替える
   - 英語(US) → `A`（青背景）
   - Mozc → `あ`（オレンジ背景）
3. クリックで次の入力ソースへ切り替える（登録が2つなら往復）
4. `Super+Space` など他の手段で切り替えた場合も表示が追従する
5. 遠目でも判別できるよう、文字サイズと背景色の双方で区別する

### 対象外とすること

- 設定 UI（prefs.js）は作らない。調整はソース直編集で行う
- Mozc 内部のモード（カタカナ・全角英数など）の切り替えは扱わない。
  Mozc は常にひらがなに固定されている前提
- 入力ソースが3つ以上の場合の最適化は行わない（巡回するのみ）

---

## 3. 非機能要件

- extensions.gnome.org への公開は行わない。
  GitHub の Public リポジトリで zip を配布する
- 審査ガイドラインへの厳密な準拠は不要。ただし `disable()` での
  後片付けは必ず行う
- 依存ライブラリは追加しない。gnome-shell 同梱のものだけで完結させる

---

## 4. 実装方針

- `PanelMenu.Button` を継承し、第3引数に `true` を渡してメニューを作らせない
- クリックは `vfunc_button_press_event` で処理する
- 入力ソースの判定は `currentSource.id` が `mozc` で始まるかで行う。
  index ではなく id で判定するため、入力ソースの並び順を変えても壊れない
- 切り替えは `inputSources[index].activate(true)`
- 表示の追従は `InputSourceManager` の `current-source-changed` を購読
- 配置は `Main.panel.addToStatusArea(uuid, button, 0, 'center')`。
  時計の隣が最も目に入りやすいため

### ファイル構成

```
ime-toggle@gofurukawa.github.io/
├── metadata.json
├── extension.js
└── stylesheet.css
```

### metadata.json

```json
{
  "uuid": "ime-toggle@gofurukawa.github.io",
  "name": "IME Toggle",
  "description": "Shows a large A / あ button in the top bar. Click it to switch between input sources.",
  "shell-version": ["50"],
  "version": 1
}
```

---

## 5. 手動テスト項目

- [ ] ログイン直後、Mozc がひらがなモードで、ボタンが「あ」になっている
- [ ] ボタンをクリックすると「A」に変わり、英数が入力できる
- [ ] もう一度クリックすると「あ」に戻り、`aiueo` → `あいうえお` になる
- [ ] `Super+Space` で切り替えたときもボタンの表示が追従する
- [ ] `ibus restart` 後も「あ」で復帰する
- [ ] 拡張を無効化してもエラーが出ず、ボタンが消える
- [ ] 拡張を再度有効化すると正常に復帰する

---

## 6. 配布方法

### Release の zip を使う

```bash
gnome-extensions install --force ~/Downloads/ime-toggle@gofurukawa.github.io.shell-extension.zip
gnome-extensions enable ime-toggle@gofurukawa.github.io
```

### clone してシンボリックリンク

```bash
git clone https://github.com/gofurukawa/gnome-ime-toggle.git ~/src/gnome-ime-toggle
ln -sfn ~/src/gnome-ime-toggle/ime-toggle@gofurukawa.github.io \
  ~/.local/share/gnome-shell/extensions/ime-toggle@gofurukawa.github.io
gnome-extensions enable ime-toggle@gofurukawa.github.io
```

### zip の作成

```bash
gnome-extensions pack --extra-source=stylesheet.css ime-toggle@gofurukawa.github.io
```

いずれの場合もログアウト→ログインが必要。

---

## 7. 将来の検討事項

- GNOME はメジャーバージョンが年2回上がる。更新時は
  `metadata.json` の `shell-version` 追加と、gjs.guide の
  ポーティングガイド確認が必要
- 表示位置やサイズを設定可能にしたくなった場合は prefs.js を追加する
  （現時点では不要と判断）
