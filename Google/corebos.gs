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

/**
 * Main object.
 * @param {String} Dirección del servicio Web.
 */
function wsclient(url){  
  Logger.clear();
  
  url = url + '/';
  var _servicebase = 'webservice.php?';
  this._serviceurl = url + _servicebase;
  
  Logger.log(this._serviceurl);
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
