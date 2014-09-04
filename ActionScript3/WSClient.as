/*+***********************************************************************************
 * The contents of this file are subject to the Vtiger CRM Public License Version 1.0
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is:  Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) www.vtiger.com
 * All Rights Reserved.
 *************************************************************************************/

package  {
	
	import flash.display.MovieClip;
	import JSON;
	import flash.utils.Dictionary;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.geom.Matrix3D;

	import com.adobe.crypto.MD5;
	
	public class WSClient extends MovieClip {
		private var _serviceBase:String = 'webservice.php';
		private var _serviceURL:String;
		
		private var _sessionId:String;
		private var _serviceToken:String;
		private var _serverTime:String;
		private var _expireTime:String;
		
		private var _userId:String;
		private var _vtigerVersion:String;
		
		private var _lastError:String = "";
		
		
		public function WSClient(url:String) {
			if(url.substring(url.length-1) != '/') {
				_serviceURL = url+"/"+_serviceBase;
			} else {
				_serviceURL = url+_serviceBase;
			}
		}
		
		private function _doGetRequest(params:URLVariables, callBack:Function) {
			var request:URLRequest = new URLRequest(_serviceURL);			
			
			request.method = URLRequestMethod.GET;
			request.data = params;
			
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, callBack);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, _ioErrorHandler);
			
			try {
				urlLoader.load(request);
			} catch (error:Error) {
                trace("Unable to load requested document.");
            }
		}
		
		private function _doPostRequest(params:Object, callBack:Function):Object {
			var request:URLRequest = new URLRequest(_serviceURL);			
			
			request.method = URLRequestMethod.POST;
			request.data = params;
			
			var urlLoader:URLLoader = new URLLoader();
			
			urlLoader.dataFormat = URLLoaderDataFormat.TEXT;
			urlLoader.addEventListener(Event.COMPLETE, callBack);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, _ioErrorHandler);
			
			try {
				urlLoader.load(request);
			} catch (error:Error) {
                trace("Unable to load requested document.");
            }
			
			return true;
		}
		
		private function _ioErrorHandler(event:Event) {
			trace(event.target.data);
		}
		
		public function doLogin(username:String, accessKey:String, callBack:Function=null):Boolean {
				
			var map:URLVariables = new URLVariables();
			map.operation = "getchallenge";
			map.username = username;
			
			var response:Object = _doGetRequest(map, function(event:Event) {
				var response:Object = JSON.parse(event.target.data);
				
				if(_hasError(response)) {
					trace(response["error"]);
					return false;
				}
				
				_serverTime   = response["result"]["serverTime"];
				_expireTime   = response["result"]["expireTime"];
				_serviceToken = response["result"]["token"];
				
				var params:URLVariables = new URLVariables();
				params.operation = "login";
				params.username = username;
				params.accessKey = MD5.hash(_serviceToken+accessKey);
				
				_doPostRequest(params, function(event:Event){
					var loginResponse:Object = JSON.parse(event.target.data);

					var error:Boolean = false;
					if(_hasError(loginResponse)) {
						error = true;
					}
					
					_sessionId = loginResponse["result"]["sessionName"];
					_userId = loginResponse["result"]["userId"];
					_vtigerVersion = loginResponse["result"]["vtigerVersion"];
						
					callBack(error);
				});
				
			});
			
			return true;
		}
		
		private function __checkLogin() {
			if(_userId) return true;
			return false;
		}
		
		private function _hasError(response:Object):Boolean {
			if(response["success"] == false && response.hasOwnProperty("error")) {
				_lastError = response["error"]["message"];
				return true;
			}
			return false;
		}
		
		private function _handleCallBack(callBack:Function, event:Event) {
			trace(event.target.data);
			var response:Object = JSON.parse(event.target.data);
			var error = false;
			if(_hasError(response)) {
				error = true;
			}  
			callBack(response["result"], error);
		}
		
		
		
		public function getUser() {
			return _userId;
		}
				
		public function getLastError():String {
			return _lastError;
		}
		
		public function doQuery(query:String, callBack:Function) {

			if(query.indexOf(';') == -1) query += ';';
			
			var params:URLVariables = new URLVariables();
			params.operation = "query";
			params.sessionName = _sessionId;
			params.query = query;
			
			_doGetRequest(params, function(event:Event) {
				_handleCallBack(callBack, event);
			});
		}
		
		public function getListTypes(callBack:Function) {
			var params:URLVariables = new URLVariables();
			params.operation = "listtypes";
			params.sessionName = _sessionId;
			
			_doGetRequest(params, function(event:Event) {
				_handleCallBack(callBack, event);
			});
		}
		
		public function doDescribe(module:String, callBack:Function) {
			var params:URLVariables = new URLVariables();
			params.operation = "describe";
			params.sessionName = _sessionId;
			params.elementType = module;
			
			_doGetRequest(params, function(event:Event) {
				_handleCallBack(callBack, event);
			});
		}
		
		
		public function doRetrieve(record:String, callBack:Function) {
			var params:URLVariables = new URLVariables();
			params.operation = "retrieve";
			params.sessionName = _sessionId;
			params.id = record;
				
			_doGetRequest(params, function(event:Event) {
				_handleCallBack(callBack, event);
			});
		}
		
		public function doCreate(module:String, data:Object, callBack:Function) {
			
			if(!data.hasOwnProperty("assigned_user_id")) {
				data["assigned_user_id"] = _userId;
			}
			
			var params:URLVariables = new URLVariables();
			params.operation = "create";
			params.sessionName = _sessionId;
			params.elementType = module;
			params.element = JSON.stringify(data);
			
			_doPostRequest(params, function(event:Event){
				_handleCallBack(callBack, event);
			});
		}
		
		public function doInvoke(callBack:Function, method:String, params:Object=null, postType:String="POST") {
			var requestData:URLVariables = new URLVariables();
			requestData.operation = method;
			requestData.sessionName = _sessionId;
			
			for(var key:String in params) {
				if(params[key] != '') {
					requestData[key] = params[key];
				}
			}
		
			if(postType == "POST") {
				_doPostRequest(requestData, function(event:Event) {
					_handleCallBack(callBack, event);
				});
			} else {
				_doGetRequest(requestData, function(event:Event){
					_handleCallBack(callBack, event);
				});
			}
		}
	}
}

//Usage
/*var client:Vtiger_WSClient = new Vtiger_WSClient("PATH_TO_YOUR_VTIGER");
client.doLogin("YOUR_USERNAME","YOUR_ACCESSKEY", function(){
	
	client.getListTypes(function(data:Object, error:Boolean){
		if(!error) {
			trace(data.toString());
		} else {
			trace(client.getLastError());
		}
	});
});*/