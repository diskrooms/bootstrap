/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.2.1): toast.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'
import Util from './util'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME               = 'toast'
const VERSION            = '4.2.1'
const DATA_KEY           = 'bs.toast'
const EVENT_KEY          = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
  HIDE          : `hide${EVENT_KEY}`,
  HIDDEN        : `hidden${EVENT_KEY}`,
  SHOW          : `show${EVENT_KEY}`,
  SHOWN         : `shown${EVENT_KEY}`
}

const ClassName = {
  FADE    : 'fade',
  HIDE    : 'hide',
  SHOW    : 'show',
  SHOWING : 'showing'
}

const DefaultType = {
  animation : 'boolean',
  autohide  : 'boolean',
  delay     : 'number'
}

const Default = {
  animation : true,
  autohide  : true,
  delay     : 500
}

const Selector = {
  DATA_DISMISS : '[data-dismiss="toast"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toast {
  constructor(element, config) {
    this._element = element
    this._config  = this._getConfig(config)
    //console.log(this._config)
    this._timeout = null
    this._setListeners()
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get DefaultType() {
    return DefaultType
  }

  // Public

  show() {
    $(this._element).trigger(Event.SHOW)			//show动作开始初始化时 触发

    if (this._config.animation) {
      this._element.classList.add(ClassName.FADE)
    }

    const complete = () => {						//窗口显示完毕后触发
      this._element.classList.remove(ClassName.SHOWING)
      this._element.classList.add(ClassName.SHOW)

      $(this._element).trigger(Event.SHOWN)

      if (this._config.autohide) {
        this.hide()
      }
    }

    this._element.classList.remove(ClassName.HIDE)
    this._element.classList.add(ClassName.SHOWING)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  hide(withoutTimeout) {
    if (!this._element.classList.contains(ClassName.SHOW)) {
      return
    }

    $(this._element).trigger(Event.HIDE)

    if (withoutTimeout) {
      this._close()
    } else {
      this._timeout = setTimeout(() => {
        this._close()
      }, this._config.delay)
    }
  }

  dispose() {
    clearTimeout(this._timeout)
    this._timeout = null

    if (this._element.classList.contains(ClassName.SHOW)) {
      this._element.classList.remove(ClassName.SHOW)
    }

    $(this._element).off(Event.CLICK_DISMISS)

    $.removeData(this._element, DATA_KEY)
    this._element = null
    this._config  = null
  }
  
  

  // Private

  _getConfig(config) {
    config = {
      ...Default,
      ...$(this._element).data(),
      ...typeof config === 'object' && config ? config : {}
    }

    Util.typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _setListeners() {
    $(this._element).on(
      Event.CLICK_DISMISS,
      Selector.DATA_DISMISS,
      () => this.hide(true)
    )
  }

  _close() {
    const complete = () => {
      this._element.classList.add(ClassName.HIDE)
      $(this._element).trigger(Event.HIDDEN)
    }

    this._element.classList.remove(ClassName.SHOW)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)

      $(this._element)
        .one(Util.TRANSITION_END, complete)
        .emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      const $element = $(this)
      let data       = $element.data(DATA_KEY)
      const _config  = typeof config === 'object' && config		//config不是对象 _config则为false
      if (!data) {
        data = new Toast(this, _config)
        $element.data(DATA_KEY, data)							//还可以把一个对象添加到元素上
        //console.log($element.data(DATA_KEY))
      }
      
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config](this)										//执行 public方法
      }
    })
  }
  
  /**
   * static 方法内的this并不一定指向类本身 还需要看调用者是谁
   */
  static _jQueryGlobalInterface(style,options){
	  //参数过滤
	  if(style == null){
		  style = 'success'
		  options = {}
	  } else if(typeof style === 'object'){
		  style = 'success'
		  options = style
	  }
	  
	  let msg = ''
	  switch(style){
	  	case 'success':
	  		msg = options.msg || '成功';
	  		break;
	  	case 'warning':
	  		msg = options.msg || '警告';
	  		break;
	  	case 'info':
	  		msg = options.msg || '提示';
	  		break;
	  	case 'danger':
	  		msg = options.msg || '错误';
	  		break;
	  	default:
	  		throw new TypeError(`No style named "${style}"`)
	  		break;
	  }
	  
	  if(!this.__init){				//this是jQuery对象
		  let _config_tpl = `<div class="alert alert-toast alert-${style} alert-dismissible"><span><i class="icon fa fa-check"></i></span>${msg} !</div>`
		  //let _config_tpl = `<div id="toast-container" class="toast-center-center"><div class="toast toast-success" aria-live="polite" style="opacity: 0.15;"><div class="toast-message">${msg}</div></div></div>`;
		  let _tpl = (typeof options === 'object')  ? (options.tpl || _config_tpl) : _config_tpl;
		  let $toast  = $(_tpl);
		  $('body').append($toast.addClass('fade in'))
		  $toast.toast({'delay':1500})
		  $toast.toast('show')
		  this.__init = 1;
		  this._element  = $toast
	  } else {
		  this._element.toast('show')
	  }
	  
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */

$.fn[NAME]             = Toast._jQueryInterface		//jQuery插件与该模块的桥梁
$.fn[NAME].Constructor = Toast
$.fn[NAME].noConflict  = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Toast._jQueryInterface
}
$[NAME]				   = Toast._jQueryGlobalInterface

export default Toast
