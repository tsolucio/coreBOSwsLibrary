/*
 * (C) Copyright 2015 David Fernandez Gonzalez.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
*/

var _serviceurl = '';
var _lasterror = false;

// Webservice user credentials
var _serviceuser= false;
var _servicekey = false;

// Webservice login validity
var _servertime = false;
var _expiretime = false;
var _servicetoken=false;

// Webservice login credentials
var _sessionid  = false;
var _userid     = false;
var wsclient_version = 'coreBOS2.1';
var _servicebase = 'webservice.php';

/**
 * Main object.
 * @param {String} Dirección del servicio Web.
 */
function wsclient(url){
	Logger.clear();
	url = url + '/';
	_servicebase += '?';
	this._serviceurl = url + _servicebase;
	Logger.log(this._serviceurl);
};

/**
 * Get actual record id from the response id.
 */
function getRecordId(id) {
	var ex = id.split('x');
	return ex[1];
};

/**
 * Get the URL for sending webservice request.
 */
function getWebServiceURL(url) {
	if(url.indexOf(this._servicebase) === false) {
		if(url.lastIndexOf('/') != (url.length-1)) {
			url += '/';
		}
		url += this._servicebase;
	}
	return url;
};

/**
 * Get result response.
 * 
 * @param {Object} Parámetros para ejecutar llamada get.
 * @return {Object} Retorno de datos en formato JSon.
 * @customfunction
 */
function get(params){
	if (params != '' || params == null){
		var paramsURL = Object.keys(params).map(function(key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
		var options = {
			method: "get",
			contentType : "application/json"
		};
		var uri = UrlFetchApp.fetch(this._serviceurl + paramsURL, options);
		return JSON.parse(uri.getContentText());
	};
};

/**
 * Get result response.
 * 
 * @param {Object} Parámetros para ejecutar llamada get.
 * @return {Object} Retorno de datos en formato JSon.
 * @customfunction
 */
function post(params){
	if (params != '' || params == null){
		var paramsURL = Object.keys(params).map(function(key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
		}).join('&');
		var options = {
			method: "post",
			payload: paramsURL
		};
		var uri = UrlFetchApp.fetch(this._serviceurl, options);
		return JSON.parse(uri.getContentText());
	};
};

/**
 * Check if result has any error.
 * 
 * @param {Object} Datos obtenidos. 
 * @return {Boolean}.
 * @customfunction
 */
function hasError(result){
	if (result.success != '' && result.success == true ){
		this._lasterror = false;
		return false;
	}
	else{
		this._lasterror = result.error;
		return true;
	};
};

/**
 * Get last operation error.
 *
 * @return {String} Retorno del error obtenido.
 * @customfunction
 */
function lastError() {
	return this._lasterror;
}

function version() {
	return this.wsclient_version;
};

/**
 * Perform the challenge.
 *
 * @param {String} Nombre de usuario.
 * @return {Boolean}
 * @customfunction
 */
function doChallenge(username){
	Logger.log("Info::doChallenge entry.");
	var params = {
		operation: "getchallenge",
		username: username,
	}
	try
	{
		//Get response.
		var response = this.get(params);
		//Check response error.
		if (this.hasError(response)){
			return false;
		};
		//Get data.
		if (response.success){
			this._servicetoken = response.result.token;
			this._servertime = response.result.serverTime;
			this._expiretime = response.result.expireTime;
			return true;
		};
		return false;
	}
	catch(e){
		Logger.log(e);
	}
};

/**
 * Do Login Operation.
 *
 * @param {String} Nombre del usuario.
 * @param {String} Clave de acceso del usuario.
 * @param {String} Acceder con contraseña o clave.
 * @return {Boolean}
 * @customfunction
 */
function doLogin(username, accesskey, withpassword){
	if (this._serviceurl != ''){
		Logger.log("Info::doChallenge");
		Logger.log("Info::" + username + "," + accesskey);
		if (this.doChallenge(username)){
			Logger.log("Info::doLogin");
			//Generate hash.
			var keyHash = GetMD5Hash(keyHash);
			//Define params function.
			var params = {
				operation: "login",
				username: username,
				accessKey: (withpassword ? this._servicetoken + accesskey : keyHash),
			}
			//Get response.
			var response = this.post(params);
			//Check response error.
			if (this.hasError(response)){
			return false;
			};
			//Get data.
			if (response.success){
				Logger.log(response);
				this._serviceuser= username;
				this._servicekey = accesskey;
				this._sessionid  = response.result.sessionName;
				this._userid     = response.result.userId;
				return true;
			}
			else{
				return false;
			};
		};
	}
	else{
		Logger.log("Error->No se ha definido la url.");
		return false;
	};
};

function doInvoke(method, params, type) {
	// Perform re-login if required
	this.__checkLogin();
	if(typeof(params) == 'undefined')
		 params = {};
	var reqtype = 'POST';
	if(typeof(type) != 'undefined') 
		reqtype = type.toUpperCase();
	var senddata = {
		operation   : method,
		sessionName : this._sessionid
	};
	if(params!=null) {
		for(key in params) {
			if(typeof(senddata[key]) == 'undefined') {
				senddata[key] = params[key];
			}
		}
	}
	try
	{
		if(reqtype=='POST')
			var response = this.post(senddata);
		if(reqtype=='GET')
			var response = this.get(senddata);
	`	if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};

/**
 * Do Query Operation.
 *
 * @param {String} Consulta SQL a ejecutar.
 * @return {Object} Rango de datos obtenidos de la consulta.
 * @customfunction
 */
function doQuery(query){ 
	Logger.log("Info::doQuery entry.");
	var params = {
		operation: "query",
		sessionName: this._sessionid,
		query: query,
	}
	try
	{
		var response = this.get(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


function doLogout(){
	Logger.log("Info::doLogout");
	var params = {
		operation   : "logout",
		sessionName : this._sessionid
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


function __checkLogin() {
	return true;
}

/**
 * Retrieve details of record.
 */
function doRetrieve(record) {
	// Perform re-login if required.
	this.__checkLogin();
	var params = {
		operation    : "retrieve",
		sessionName  : this._sessionid,
		id           : record
	};
	try
	{
		var response = this.get(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


/**
 * Get Result Column Names.
 */
function getResultColumns(result) {
	var columns = [];
	if(result != null && result.length != 0) {
		var firstrecord = result[0];
		for(key in firstrecord) {
			columns.push(key);
		}
	}
	return columns;
};

/**
 * Describe Module Fields.
 */
function doDescribe(module) {
	// Perform re-login if required.
	this.__checkLogin();
	var params = {
		operation    : "describe",
		sessionName  : this._sessionid,
		elementType  : module
	};
	try
	{
		var response = this.get(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};

/**
 * Do Create Operation
 */
function doCreate(module, valuemap) {
	// Perform re-login if required.
	this.__checkLogin();
	// Assign record to logged in user if not specified
	if(valuemap['assigned_user_id'] == null) {
		valuemap['assigned_user_id'] = this._userid;
	}
	var params = {
		operation   : "create",
		sessionName : this._sessionid,
		elementType : module,
		element     :  JSON.stringify(valuemap)
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


/**
 * Do Update Operation
 */
function doUpdate(module, valuemap) {
	// Perform re-login if required.
	this.__checkLogin();
	// Assign record to logged in user if not specified
	if(valuemap['assigned_user_id'] == null) {
		valuemap['assigned_user_id'] = this._userid;
	}
	var params = {
		operation   :  "update",
		sessionName :  this._sessionid,
		elementType :  module,
		element     :   JSON.stringify(valuemap)
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


/**
 * Do Delete Operation
 */
function doDelete(record) {
	// Perform re-login if required.
	this.__checkLogin();
	var params = {
		operation   :   "delete",
		sessionName :   this._sessionid,
		id          :   record
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


/**
 * List types available Modules.
 */
function doListTypes(fieldTypeList) {
	// Perform re-login if required.
	this.__checkLogin();
	if (Array.isArray(fieldTypeList))
		fieldTypeList = JSON.stringify(fieldTypeList);
	var params = {
		operation : "listtypes",
 		sessionName  : this._sessionid,
		fieldTypeList : fieldTypeList
	};
	try
	{
		var response = this.get(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			var modulenames= response.result;
			var module=modulenames.types;
			var returnvalue={ };
			for(var i=0;i<module.length;++i) {
				var m=module[i];
				returnvalue[m] ={
					'name'     : m
				};
			};
			return returnvalue;
		};
		return null;
	}
	catch(e){
	Logger.log(e);
	}
};


function doGetRelatedRecords(record, module, relatedModule, queryParameters) {
	// Perform re-login if required.
	this.__checkLogin();
	var params = {
		operation       : "getRelatedRecords",
		sessionName     : this._sessionid,
		id              : record,
		module          : module,
		relatedModule   : relatedModule,
		queryParameters : queryParameters
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};


/**
 * Set relation between records.
 * param relate_this_id string ID of record we want to related other records with
 * param with_this_ids string/array either a string with one unique ID or an array of IDs to relate to the first parameter
 */
function doSetRelated(relate_this_id, with_these_ids) {
	// Perform re-login if required.
	this.__checkLogin();
	var params = {
		operation        : "SetRelation",
		sessionName      : this._sessionid,
		relate_this_id   : relate_this_id,
		with_these_ids   : JSON.stringify(with_these_ids)
	};
	try
	{
		var response = this.post(params);
		if (this.hasError(response)){
			return false;
		};
		if (response.success){
			return response.result;
		};
		return null;
	}
	catch(e){
		Logger.log(e);
	}
};

/**
 * Get Hash code.
 *
 * @param {String} Texto a codificar en MD5.
 * @return {String} Texto codificado.
 * @customfunction
 */
function GetMD5Hash(text) {
	var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text);
	var txtHash = '';
	for (j = 0; j <rawHash.length; j++) {
		var hashVal = rawHash[j];
		if (hashVal < 0)
			hashVal += 256;
		if (hashVal.toString(16).length == 1)
			txtHash += "0";
		txtHash += hashVal.toString(16);
	};
	return txtHash;
};
