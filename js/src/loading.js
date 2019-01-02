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

const NAME               = 'loading'
const VERSION            = '4.2.1'
const DATA_KEY           = 'bs.loading'
const EVENT_KEY          = `.${DATA_KEY}`
const JQUERY_NO_CONFLICT = $.fn[NAME]

const Event = {
  CLICK_DISMISS : `click.dismiss${EVENT_KEY}`,
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


/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Loading {
  constructor(element, config) {
    this._element = element
    this._config  = this._getConfig(config)
    //console.log(this._config)
    this._timeout = null
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
    if (this._config.animation) {
      //console.log(this._element)
      this._element[0].classList.add(ClassName.FADE)
    }

    const complete = () => {						//窗口显示完毕后触发
      this._element[0].classList.remove(ClassName.SHOWING)
      this._element[0].classList.add(ClassName.SHOW)
    }

    this._element[0].classList.remove(ClassName.HIDE)
    this._element[0].classList.add(ClassName.SHOWING)
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }

  //隐藏方法
  hide() {
    if (!this._element[0].classList.contains(ClassName.SHOW)) {
      return
    }
    this._close()
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


  _close() {
    const complete = () => {
      this._element.classList.add(ClassName.HIDE)
    }
    this._element.classList.remove(ClassName.SHOW)
    
    if (this._config.animation) {
      const transitionDuration = Util.getTransitionDurationFromElement(this._element)
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration)
    } else {
      complete()
    }
  }
  
  // Static
  static _jQueryInterface(config) {
	  const $element = $(this)
      let data       = $element.data(DATA_KEY)
      const _config  = typeof config === 'object' && config		
      if (!data) {
        data = new Loading(this, _config)
        $element.data(DATA_KEY, data)							
        //console.log($element.data(DATA_KEY))
      }
      
      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }
        data[config](this)										
      }
  }
  
  static _jQueryGlobalInterface(action,options){
	  //参数过滤
	  if(action == null){
		  action = 'start'
		  options = {}
	  } else if(typeof action === 'object'){
		  action = 'start'
		  options = action
	  }
	  if(action = 'start'){
		  let defaults = {
	            opacity: 1,									//loading页面透明度
	            backgroundColor: "#000000c0",				//loading页面背景色
	            borderColor: "#bbb",						//提示边框颜色
	            borderWidth: 1,								//提示边框宽度
	            borderStyle: "solid",						//提示边框样式
	            loadingTips: "Loading, please wait...",		//提示文本
	            TipsColor: "#ff922b",						//提示颜色
	            delayTime: 1000,							//页面加载完成后，加载页面渐出速度
	            zindex: 999,								//loading页面层次
	            sleep: 0									//设置挂起,等于0时则无需挂起
	      }
	      options = $.extend(defaults, options);
	  }
	  
	  if(!this.__init_loading){
		  let _PageHeight = document.documentElement.clientHeight,_PageWidth = document.documentElement.clientWidth;
		  let _config_tpl = `<div id="loadingPage" style="position:fixed;left:0;top:0;_position: absolute;width:100%;height:${_PageHeight}px;background:${options.backgroundColor};opacity:${options.opacity};filter:alpha(opacity=${options.opacity} * 100);z-index:${options.zindex};"><div id="loadingTips" style="position: absolute; cursor1: wait; width: auto; height:40px; line-height:40px;border-radius:10px; color:${options.TipsColor};font-size:20px;">${options.loadingTips}</div></div>`
		  let _tpl = (typeof options === 'object')  ? (options.tpl || _config_tpl) : _config_tpl;
		  let $loading  = $(_tpl);
		  $('body').append($loading.addClass('fade in'))
		  $loading.loading('show')
		  this.__init_loading = 1;
		  this._element  = $loading
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
/*$.fn[NAME]             = Loading._jQueryInterface		//jQuery插件与该模块的桥梁
$.fn[NAME].Constructor = Loading
$.fn[NAME].noConflict  = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Loading._jQueryInterface
}
$[NAME]				   = Loading._jQueryGlobalInterface*/

export default Loading
