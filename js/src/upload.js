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

const NAME               = 'upload'
const VERSION            = '4.2.1'
const DATA_KEY           = 'bs.upload'
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

class Upload {
  constructor(element, config) {
	this._default = {
		'maxSize':200*1024*1000,			//最大尺寸 200MB
		'allowMime':[
			'image/jpeg','image/gif','image/svg+xml','image/png','text/plain'
		],
		'allowSuffix':['doc','docx','xls','xlsx'],
		'startBtn':'',
		'uploadKey':'bs.upload',
		'uploadProgress':'',
		'blockSize':2048000					//分片大小 2MB
		'filePathConfig':'/upload/file/{yyyy}{mm}{dd}/{time}{rand:6}'
	}
    this._element = element
    this._config  = $.extend(this._default,config)
	this._progress_container = null			//进度条容器 jQuery 对象
	this._progress_status = 0				//进度条初始化状态 0 未初始化 1 已初始化
	this._progress_obj = null				//进度条 jQuery 对象
	
	this.file_suffix = ''					//文件后缀
	this.server_location = ''				//上传至服务器后 在服务器上的相对路径
	this.error = 0							//服务器返回错误代码
	
    //console.log(this._config)
    this._timeout = null
	this._element.on('change',(e)=>{
		let file_obj  = element[0].files[0]
		let file_type = file_obj['type']
		let file_name = file_obj['name']
		let file_suffix = (file_name.substr(file_name.lastIndexOf("."))).toLowerCase()
		this.file_suffix = file_suffix
		if((this._config['allowMime'].indexOf(file_type) === false) && (this._config['allowSuffix'].indexOf(file_suffix) === false)){
			throw new TypeError(`文件类型错误,只能上传图片和office文档`)
			return;
		} else if(file_obj['size'] > this._config['maxSize']){
			throw new SizeError(`文件尺寸超过限制,目前为${file_obj['size']}`)
			return;
		} else {
			this._files = file_obj
			let total_size = file_obj['size']
			let block_size = this._config['blockSize']
			if(total_size > block_size){
				let _slice_arr = []
				let start = 0
				let end = block_size

				while((end <= total_size) && (start < total_size)){
					let _slice = file_obj.slice(start,end)
					_slice_arr.push(_slice)
					start += block_size
					end = ((end + block_size) >  total_size) ? total_size : (end + block_size)
				}
				//console.log(_slice_arr)
				this._files_arr = _slice_arr
			} else {
				this._files_arr = file_obj
			}
		}
		
		//如果有上传按钮 则点击按钮执行上传 否则直接上传
		let start_btn = $(this._config['startBtn'])
		if(start_btn.length > 0){
			start_btn.on('click',this.startUpload)
		} else {
			this.startUpload()
		}
		
		let upload_progress = null
		if(upload_progress = $(this._config['uploadProgress'])){
			this._progress_container = upload_progress
		}
	})
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get DefaultType() {
    return DefaultType
  }
  

  /**
   * 公共方法-开始上传文件
   * 
   * 整体上传后端返回信息
   * original: "red-robin-3743702.png"
   * size: 2760801
   * state: "文件大小超出网站限制"
   * title: "1546398947942439.png"
   * type: ".png"
   * url: "/upload/ueditor/image/20190102/1546398947942439.png"
   * 
   * 分片上传后端返回信息
   * original: "blob"
   * size: 712801
   * state: "文件类型不允许"
   * title: "1546399252663550"
   * type: ""
   * url: "/upload/ueditor/image/20190102/1546399252663550"
   * 
   * 
   * 
   */
  startUpload() {
    var form_data = new FormData();//创建表单数据对象
	if(!form_data){
		throw new Error(`目前使用的浏览器不支持FormData上传方式,请更换最新版的Chrome或Firefox浏览器`)
		return;
	} 
	let _length = this._files_arr.length
	if(_length == 0){
		throw new Error(`文件数组还未初始化完成,无法上传`)
		return;
	} else {
		/*let xhr = new XMLHttpRequest();
		xhr.upload.addEventListener("progress", this.uploadProgress(this), false);//监听上传进度
		xhr.addEventListener("load", this.uploadComplete, false);
		xhr.addEventListener("error", this._config.uploadFailed, false);
		xhr.addEventListener("readystatechange",this.readystatechange,false);*/
		
		this._showProgress()
		this._createSaveServerFilename();
		return;
		for(let i = 0;i < _length; i++){
			if(this.error < 0){
				this._removeProgress()
				//todo 提示错误
				return;
			}
			let xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", this.uploadProgress(this), false);//监听上传进度
			xhr.addEventListener("load", this.uploadComplete, false);
			xhr.addEventListener("error", this._config.uploadFailed, false);
			xhr.addEventListener("readystatechange",()=>{
				if(xhr.readyState === 4 && xhr.status === 200){
			        let res = JSON.parse(xhr.response)
			        this.server_location = res.url
			        //console.log(this)
			        this.error = res.error
			        this._updateProgress(res.progress)
				}
			},false);
			
			form_data.delete(this._config.uploadKey)
			form_data.append(this._config.uploadKey,this._files_arr[i])
			//文件后缀
			if(form_data.get('suffix') == '' || form_data.get('suffix') == undefined){
				form_data.append('suffix',this.file_suffix)	
			}
			//分块索引顺序
			form_data.delete('i')
			form_data.append('i',i)
			//保存于服务端的文件路径
			if(form_data.get('server_location') == '' || form_data.get('server_location') == undefined || form_data.get('server_location') == null){
				if(this.server_location != '' && this.server_location != undefined && this.server_location != null){
					form_data.append('server_location',this.server_location)
				}
			}
			//总分块数量
			form_data.delete('totalBlocks')
			form_data.append('totalBlocks',_length)
			xhr.open("POST", this._config.uploadUrl,false);		//同步才能拿到 	this.server_location 的值   但是要处理完上传才会处理UI线程
			xhr.send(form_data);
		}
		
		/*form_data.append(this._config.uploadKey,this._files)
		xhr.open("POST", this._config.uploadUrl);
		xhr.send(form_data);*/
	}
  }
  
  //监听上传进度方法
  uploadProgress(e){
	if (e.lengthComputable) {
	  let percentComplete = Math.round(e.loaded * 100 / e.total);
	  this._progress_container.html(percentComplete.toString() + '%');
	}
  }
  
  //加载完成方法
  uploadComplete(e){
	  //console.log(e)
  }
  
  //响应完成方法
  /*readystatechange(e){
	  if(this.readyState === 4 && this.status === 200){
		  let res = JSON.parse(this.response) 
	  }
  }*/
  

  // Private
  //初始化进度条
  _showProgress(){
	  let progress_html = `<div class="col-md-6" style="margin:0 auto;top:200px">
	  							<div class="box box-solid">
	  								<div class="box-header with-border">
	  									<h3 class="box-title">正在上传...</h3>
	  									<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>
	  								</div>
		  							<div class="box-body">
		  								<div class="progress progress-xs active">
		  									<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width: 0%"><span class="sr-only"></span></div>
		  								</div>
		  							</div>
		  						</div>
		  					</div>`
	  this._progress_obj = $(progress_html)
  	  $('body').append(this._progress_obj)
  	  this._progress_status = 1
  }
  
  //更新进度条
  _updateProgress($width = 0){
	  if(this._progress_status == 0){
		  throw new Error('进度条没有初始化，无法更新')
		  return
	  }
	  this._progress_obj.find('.progress .progress-bar').css('width',`${$width}%`)
  }
  
  //移除进度条
  _removeProgress(){
	  if(this._progress_status == 0){
		  return
	  }
	  this._progress_obj.remove()
	  this._progress_obj = null
	  this._progress_status == 0
  }
  
  //前端生成服务端存储文件名
  _createSaveServerFilename(){
	  this._config
	  let t = parseInt(Date.parse(new Date())/1000);
	  console.log(this._getFormatDate());
  }
  
  //获取格式化时间
  _getFormatDate(){
	  let date = new Date();
	  let month = date.getMonth() + 1;
	  let strDate = date.getDate();
	  if (month >= 1 && month <= 9) {
		  month = "0" + month;
	  }
	  if (strDate >= 0 && strDate <= 9) {
		  strDate = "0" + strDate;
	  }
	  let currentdate = date.getFullYear() + '-' + month + '-' + strDate
	        + "-" + date.getHours() + '-' + date.getMinutes()
	        + '-' + date.getSeconds();
	  return currentdate;
  }

  // Static
  static _jQueryInterface(config) {
	  const $element = $(this)
      let data       = $element.data(DATA_KEY)	
      if (!data) {
		const _config  = typeof config === 'object' && config	
        data = new Upload(this, _config)
        $element.data(DATA_KEY, data)							
      }
  }
  
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 */
$.fn[NAME]             = Upload._jQueryInterface		//jQuery插件与该模块的桥梁
$.fn[NAME].Constructor = Upload
$.fn[NAME].noConflict  = () => {
  $.fn[NAME] = JQUERY_NO_CONFLICT
  return Uploading._jQueryInterface
}

export default Upload
