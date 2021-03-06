import { IUIBase, getTargetElement } from './common';
import { IDisposable, dispose } from 'egret/base/common/lifecycle';
import Pickr, { HSVaColor } from './pickr/pickr';
import { addClass } from 'egret/base/common/dom';
import { isMacintosh } from 'egret/base/common/platform';
import { localize } from 'egret/base/localization/nls';
import { Emitter, Event } from 'egret/base/common/event';

import './pickr/pickr.css';
import './media/colorPicker.css';

/**
 * 颜色选择器组件
 */
export class ColorPicker implements IUIBase, IDisposable {

	protected toDisposes: IDisposable[] = [];
	private el: HTMLElement;
	private content: HTMLElement;
	private container: HTMLElement;
	private pickr: Pickr;

	private _onChanged: Emitter<HSVaColor>;
	private _onSaved: Emitter<HSVaColor>;
	private _onCanceled: Emitter<void>;
	private _onDisplay: Emitter<void>;

	constructor(container: HTMLElement | IUIBase = null) {
		this.el = document.createElement('div');
		this.content = document.createElement('div');
		if (container) {
			this.create(container);
		}
		this._onChanged = new Emitter<HSVaColor>();
		this._onSaved = new Emitter<HSVaColor>();
		this._onCanceled = new Emitter<void>();
		this._onDisplay = new Emitter<void>();
	}

	/**
	 * 颜色改变
	 */
	public get onChanged(): Event<HSVaColor> {
		return this._onChanged.event;
	}

	/**
	 * 颜色保存
	 */
	public get onSaved(): Event<HSVaColor> {
		return this._onSaved.event;
	}

	/**
	 * 取消设置
	 */
	public get onCanceled(): Event<void> {
		return this._onCanceled.event;
	}
	/**
	 * 开始设置
	 */
	public get onDisplay(): Event<void> {
		return this._onDisplay.event;
	}

	/**
	 * 核心dom对象
	 */
	public getElement(): HTMLElement {
		return this.el;
	}
	/** 样式 */
	public get style(): CSSStyleDeclaration {
		return this.el.style;
	}
	/**
	 * 创建
	 */
	public create(container: HTMLElement | IUIBase): void {
		this.container = getTargetElement(container);
		this.container.appendChild(this.el);
		this.el.appendChild(this.content);
		this.initView();
	}

	/**
	 * 初始化内容
	 * @param element 
	 */
	protected initView(): void {
		this.pickr = new Pickr({
			el: this.content,
			parent: document.body,
			components: {
				preview: true,
				opacity: false,
				hue: true,
				interaction: {
					hex: true,
					rgba: true,
					hsla: false,
					hsva: false,
					cmyk: false,
					input: true,
					clear: true,
					save: true
				}
			},
			strings: {
				save: localize('alert.button.confirm', 'Confirm'),
				clear: localize('alert.button.clear', 'Clear'),
			},
			onChange: (h, i) => this.changed_handle(h, i),
			onSave: (h, i) => this.saved_handle(h, i),
			onCancel: (i) => this.cancel_handle(i),
			onDisplay: (i) => this.display_handler(i)
		});
		addClass(this.pickr.getRoot().app, 'egret-picker');
		if (isMacintosh) {
			addClass(this.pickr.getRoot().interaction.save, 'egret-button system mac active default');
			addClass(this.pickr.getRoot().interaction.clear, 'egret-button system mac active');
		} else {
			addClass(this.pickr.getRoot().interaction.save, 'egret-button system win active default');
			addClass(this.pickr.getRoot().interaction.clear, 'egret-button system win active');
		}
	}

	private closed:boolean = true;
	private changed_handle(hsva: HSVaColor, instance: Pickr): void {
		if (!this.settingColor && !this.closed) {
			if (this._onChanged) {
				this._onChanged.fire(hsva);
			}
		}
	}

	private saved_handle(hsva: HSVaColor, instance: Pickr): void {
		this.closed = true;
		if (!this.settingColor) {
			if (this._onSaved) {
				this._onSaved.fire(hsva);
			}
		}
	}
	private cancel_handle(instance: Pickr): void {
		if (!this.settingColor && !this.closed) {
			if (this._onCanceled) {
				this._onCanceled.fire(void 0);
			}
		}
		this.closed = true;
	}
	private display_handler(instance: Pickr): void {
		this.closed = false;
		if (!this.settingColor) {
			if (this._onDisplay) {
				this._onDisplay.fire(void 0);
			}
		}
	}

	private settingColor: boolean = false;
	/**
	 * 设置一个颜色，如果设置null则将清空颜色
	 * @param value (形如 #fff, rgb(10, 156, 23))
	 * @param silent 默认是false，如果设置为true，则不会更新当前颜色。
	 */
	public setColor(value: string, silent?: boolean): void {
		this.settingColor = true;
		this.pickr.setColor(value, silent);
		this.settingColor = false;
	}

	/**
	 * 释放
	 */
	public dispose(): void {
		this.el.remove();
		this.container = null;
		dispose(this.toDisposes);
	}
}