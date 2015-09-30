
/**
 * globalvariable function creates all the global variables
 * This function is executed when we open the spreadsheet.
 */
function globalvariable(){
  PropertiesService.getScriptProperties().setProperty('_sessionid', false);
  PropertiesService.getScriptProperties().setProperty('_serviceuser', false);
  PropertiesService.getScriptProperties().setProperty('_servicekey', false);
  PropertiesService.getScriptProperties().setProperty('_servertime', false);
  PropertiesService.getScriptProperties().setProperty('_expiretime', false);
  PropertiesService.getScriptProperties().setProperty('_userid', false);
  PropertiesService.getScriptProperties().setProperty('_lasterror', false);
  PropertiesService.getScriptProperties().setProperty('_servicetoken', false);
  PropertiesService.getScriptProperties().setProperty('_serviceurl',false );
  PropertiesService.getScriptProperties().setProperty('_servicebase','webservice.php' );
  PropertiesService.getScriptProperties().setProperty('wsclient_version','coreBOS2.1' );
}

/**
 * Main object.
 * @param {String} Web address Service.
 * @customfunction
 */
function wsclient(url){  
  Logger.clear();
  url = url + '/';
  var file=PropertiesService.getScriptProperties().getProperty('_servicebase');
  file += '?';
  PropertiesService.getScriptProperties().setProperty('_serviceurl',url + file ); 
  Logger.log(PropertiesService.getScriptProperties().getProperty('_serviceurl'));
};

/**
 *Get Record Id Operation
 * @param {String} Get actual record id from the response id.
 * @return {String} Return Id.
 * @customfunction
 */
function getRecordId(id) {
  var ex = id.split('x');
  return ex[1];
};

/**
 * Get Web Service URL Operation.
 * @param {String} Get the URL for sending webservice request.
 * @return {String} Return Url.
 * @customfunction
 */
function getWebServiceURL(url) {
  if(url.indexOf(this._servicebase) === false) {
    if(url.lastIndexOf('/') != (url.length-1)) {
       url += '/';
    }
    url += PropertiesService.getScriptProperties().getProperty('_servicebase');
  }
  return url;
};

/**
 * Get result response.
 * 
 * @param {Object} Parameters for running call GET.
 * @return {Object} Return data in JSON format.
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
    var uri = UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('_serviceurl') + paramsURL, options);
    return JSON.parse(uri.getContentText());    
  };
};

/**
 * Post result response.
 * 
 * @param {Object} Parameters for running call POST.
 * @return {Object} Return data in JSON format.
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
    var uri = UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('_serviceurl'), options);
    return JSON.parse(uri.getContentText());
  }; 
};

/**
 * Check if result has any error.
 * 
 * @param {Object} Result of an operation. 
 * @return {Boolean}.
 * @customfunction
 */
function hasError(result){
  if (result.success != '' && result.success == true ){
    PropertiesService.getScriptProperties().setProperty('_lasterror', false);
    return false;
  }
  else{
    PropertiesService.getScriptProperties().setProperty('_lasterror', result.error);
    return true;
  };
};

/**
 * Get last operation error.
 *
 * @return {String} Return error obtained.
 * @customfunction
 */
function lastError() {
  return PropertiesService.getScriptProperties().getProperty('_lasterror');
}

/**
 * Get Version.
 *
 * @return {String} Version.
 * @customfunction
 */
function version() {
  return PropertiesService.getScriptProperties().getProperty('wsclient_version');
};

/**
 * Perform the challenge.
 *
 * @param {String} Username.
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
     PropertiesService.getScriptProperties().setProperty('_servicetoken', response.result.token);
     PropertiesService.getScriptProperties().setProperty('_servertime', response.result.serverTime);
     PropertiesService.getScriptProperties().setProperty('_expiretime', response.result.expireTime);
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
 * @param {String} Username.
 * @param {String} User password or ccess key. 
 * @param {String} True/False. 
 * @return {Boolean}
 * @customfunction
 */
function doLogin(username, accesskey, withpassword){
  if (PropertiesService.getScriptProperties().getProperty('_serviceurl') != ''){    
    Logger.log("Info::doChallenge");
    Logger.log("Info::" + username + "," + accesskey);    
    if (this.doChallenge(username)){
      Logger.log("Info::doLogin");
      var keyHash = GetMD5Hash(keyHash);
      var params = {
        operation: "login",
        username: username,
        accessKey: (withpassword ? PropertiesService.getScriptProperties().getProperty('_servicetoken') + accesskey : keyHash),
      }        
      var response = this.post(params);
      if (this.hasError(response)){
        return false;
      };
      if (response.success){
        Logger.log(response);
        PropertiesService.getScriptProperties().setProperty('_serviceuser', username);
        PropertiesService.getScriptProperties().setProperty('_servicekey', accesskey);
        PropertiesService.getScriptProperties().setProperty('_sessionid', response.result.sessionName);
        PropertiesService.getScriptProperties().setProperty('_userid', response.result.userId);
        return true;
      }
      else{
        return false;
      };
    };
  }
  else{
    return "Url is not defined. ";
    Logger.log("Error->No se ha definido la url."); 
  };
};

/**
 * Do Logout Operation.
 * 
 * @return {Boolean}
 * @customfunction
 */
function doLogout(){ 
  Logger.log("Info::doLogout");  
  var params = {
    operation   : "logout",
    sessionName : PropertiesService.getScriptProperties().getProperty('_sessionid')
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
 * Do Query Operation.
 *
 * @param {String} SQL query to execute.
 * @return {Object} Range query data.
 * @customfunction
 */
function doQuery(query){ 
  Logger.log("Info::doQuery entry.");
  
  var params = {
    operation: "query",
    sessionName: PropertiesService.getScriptProperties().getProperty('_sessionid'),
    query: query
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
 * Do Invoke Operation.
 *
 * @param {String} Operation that we want to use.
 * @param {Array} Define the parameters we want for the function.
 * @param {String} Type of the method: GET/POST.
 * @return {Object} Return the result.
 * @customfunction
 */
function doInvoke(method, params, type) {
  this.__checkLogin();	
  if(typeof(params) == 'undefined') params = {};
  var reqtype = 'POST';
  if(typeof(type) != 'undefined') reqtype = type.toUpperCase();
  var senddata = {
    operation   : method,
    sessionName : PropertiesService.getScriptProperties().getProperty('_sessionid')
  };
  if(params!=null) {
    for(key in params) {
      if(typeof(senddata[key]) == 'undefined') {
         senddata[key] = params[key];
      }
    }
  }
  try
  { if(reqtype=='POST')
		var response = this.post(senddata);
    if(reqtype=='GET')
               var response = this.get(senddata);
		 
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
 * Do Describe Operation.
 *
 * @param {String} Module name that we want to describe.
 * @return {Object} Return the result.
 * @customfunction
 */
function doDescribe(module) {
  this.__checkLogin();
  var params = {
    operation    : "describe",
    sessionName  : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 * __checkLogin Operation.
 * 
 * @return {Boolean}
 * @customfunction
 */
function __checkLogin() {
  return true;
}

/**
 * Retrieve details of record.
 *
 * @param {String} Record id that we want to retrieve.
 * @return {Object} Return the result.
 * @customfunction
 */
function doRetrieve(record) {
  this.__checkLogin();
  var params = {
    operation    : "retrieve",
    sessionName  : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 *
 * @param {Object} Result of an operation.
 * @return {Object} Return columns.
 * @customfunction
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
 * Do Create Operation
 *
 * @param {String} Module that we want to create.
 * @param {Array} Characteristics of the module.
 * @return {Object} Return the result.
 * @customfunction
 */
function doCreate(module, valuemap) {
  this.__checkLogin();
  if(valuemap['assigned_user_id'] == null) {
    valuemap['assigned_user_id'] = PropertiesService.getScriptProperties().getProperty('_userid');
  }
  var params = {
    operation   : "create",
    sessionName : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 *
 * @param {String} Module that we want to create.
 * @param {Array} New characteristics of the module.
 * @return {Object} Return the result.
 * @customfunction
 */
function doUpdate(module, valuemap) {
  this.__checkLogin();
  if(valuemap['assigned_user_id'] == null) {
    valuemap['assigned_user_id'] = PropertiesService.getScriptProperties().getProperty('_userid');
  }
  var params = {
    operation   :  "update",
    sessionName :  PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 *
 * @param {String} Record id that we want to delete.
 * @return {Object} Return the result.
 * @customfunction
 */
function doDelete(record) {
  this.__checkLogin();
  var params = {
    operation   :   "delete",
    sessionName :   PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 *
 * @param {Array} Name of the field.
 * @return {Object} Return the result.
 * @customfunction
 */
function doListTypes(fieldTypeList) {
this.__checkLogin();
if (Array.isArray(fieldTypeList)) fieldTypeList = JSON.stringify(fieldTypeList);
var params = {
  operation : "listtypes",
  sessionName  : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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

/**
 * Do Get Related Record Operation
 *
 * @param {String} Record id.
 * @param {String} Base module name.
 * @param {String} Related module name.
 * @param {Array} Parameters of the query.
 * @return {Object} Return the result.
 * @customfunction
 */
function doGetRelatedRecords(record, module, relatedModule, queryParameters) {
  this.__checkLogin();
  var params = {  
    operation       : "getRelatedRecords",
    sessionName     : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 * @param {String} ID of record we want to related other records with
 * @param {String/Array} Either a string with one unique ID or an array of IDs to relate to the first parameter
 * @return {Object} Return the result.
 * @customfunction
 */
function doSetRelated(relate_this_id, with_these_ids) {
  this.__checkLogin();
  var params = {
    operation        : "SetRelation",
    sessionName      : PropertiesService.getScriptProperties().getProperty('_sessionid'),
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
 * @param {String} Text encoded in MD5.
 * @return {String} Consolidated text.
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