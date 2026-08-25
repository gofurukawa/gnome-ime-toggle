import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {getInputSourceManager} from 'resource:///org/gnome/shell/ui/status/keyboard.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

// Mozc の入力ソース id は 'mozc-jp'。index ではなく id で判定するため、
// 設定画面で入力ソースの並び順を変えても壊れない。
const JAPANESE_ID_PREFIX = 'mozc';

const ImeToggleButton = GObject.registerClass(
class ImeToggleButton extends PanelMenu.Button {
    _init() {
        // 第3引数 true でメニューを作らせない。クリックは自前で処理する。
        super._init(0.5, 'IME Toggle', true);

        this._label = new St.Label({
            style_class: 'ime-toggle-label',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this._inputSourceManager = getInputSourceManager();
        this._sourceChangedId = this._inputSourceManager.connect(
            'current-source-changed', () => this._sync());

        // 後片付けは destroy シグナルに明示的に繋ぐ。PanelMenu.Button の
        // _onDestroy() を上書きする書き方は gnome-shell 内部の実装詳細に
        // 依存するため使わない。
        this.connect('destroy', () => this._disconnectSourceChanged());

        this._sync();
    }

    // タッチ操作でも切り替えたいので button-press だけでなく touch も拾う。
    // PanelMenu.Button 自身が BUTTON_PRESS と TOUCH_BEGIN の両方を見ているのと
    // 同じ理由（Wayland ではタッチからポインタイベントが合成されない）。
    vfunc_event(event) {
        const type = event.type();

        if (type === Clutter.EventType.BUTTON_PRESS) {
            // 右クリックや中クリックで意図せず切り替わらないようにする
            if (event.get_button() !== Clutter.BUTTON_PRIMARY)
                return super.vfunc_event(event);
        } else if (type !== Clutter.EventType.TOUCH_BEGIN) {
            return super.vfunc_event(event);
        }

        this._activateNextSource();
        return Clutter.EVENT_STOP;
    }

    // 登録されている入力ソースを巡回する。2つなら英数 ⇄ 日本語の往復になる。
    _activateNextSource() {
        const sources = Object.values(this._inputSourceManager.inputSources);
        if (sources.length < 2)
            return;

        const index = sources.indexOf(this._inputSourceManager.currentSource);
        // 現在のソースが特定できない場合（IBus の準備前など）は何もしない。
        // 巡回の起点が決まらないまま任意のソースを有効化すると、表示と実際の
        // 入力状態が食い違う原因になる。
        if (index < 0)
            return;

        sources[(index + 1) % sources.length].activate(true);
    }

    // Super+Space など他の手段で切り替えた場合もここを通るので表示が追従する。
    _sync() {
        const source = this._inputSourceManager.currentSource;
        const isJapanese = !!source?.id?.startsWith(JAPANESE_ID_PREFIX);

        this._label.text = isJapanese ? 'あ' : 'A';
        // 文字だけでなく背景色でも区別する（遠目で判別できるように）
        this._label.remove_style_class_name(isJapanese ? 'latin' : 'japanese');
        this._label.add_style_class_name(isJapanese ? 'japanese' : 'latin');
    }

    _disconnectSourceChanged() {
        if (this._sourceChangedId) {
            this._inputSourceManager.disconnect(this._sourceChangedId);
            this._sourceChangedId = 0;
        }
        this._inputSourceManager = null;
    }
});

export default class ImeToggleExtension extends Extension {
    enable() {
        this._button = new ImeToggleButton();
        // 時計の隣が最も目に入りやすい
        Main.panel.addToStatusArea(this.uuid, this._button, 0, 'center');
    }

    disable() {
        this._button?.destroy();
        this._button = null;
    }
}
