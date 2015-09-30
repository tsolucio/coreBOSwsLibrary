/**
 * globalvar function creates all the global variables
 * This function is executed when we open the spreadsheet.
 */
function globalvar(){
  PropertiesService.getScriptProperties().setProperty('_sign', '0');
  coreBOSLib.globalvariable();
  Logger.log("Global Variable are inserted");
}

/**
 * Do Login Operation.
 * 
 * @param {String} Parameter for corebos url.
 * @param {String} Parameter for corebos user.
 * @param {String} Parameter for corebos access key.
 * @param {Boolean} Parameter for password or not (True/False) value.
 * @return {String} Return the message for the login.
 * @customfunction
 */
function login(url, usr, access, withpass){
  var myvalue= PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==0){
    coreBOSLib.wsclient(url); 
    if (coreBOSLib.doLogin(usr, usr, withpass)){
      PropertiesService.getScriptProperties().setProperty('_sign', '1');
      return "Login successfull.";
    } else {
      return "Login failed.";
    };
  }
  else{
    return "Already logged in";
  };
};

/**
 * Do Logout Operation.
 * 
 * @return {String} Return the message for the logout.
 * @customfunction
 */
function logout(){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    if (coreBOSLib.doLogout()){
      PropertiesService.getScriptProperties().setProperty('_sign', '0');
      return "Logout successfull.";
    } else {
      return "Logout failed.";
    };
  }
  else {
    return "Already logged out";
  };
};

/**
 * Do CreateRecord Operation.
 * 
 * @param {String} Parameter for module name.
 * @param {String} Parameter for assigned_user_id.
 * @param {String} Parameter for date.
 * @param {String} Parameter for Hour.
 * @param {String} Parameter for operation.
 * @param {String} Parameter for information.
 * @param {String} Parameter for relation id.
 * @param {String} Parameter for relation module.
 * @return {String} Return the message for creating a record.
 * @customfunction
 */
function createRecord(module,id,done,hora,operation,info,rel_id,rel_mod){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var contactvalues={'assigned_user_id':id,'doneon': done, 'hora': hora,'operation':operation,'moreinfo':info,'rel_id':rel_id,'rel_module':rel_mod};
    if (coreBOSLib.doCreate(module, contactvalues))
    {
      return "The record is created successfully";
    }
    else {
      var error = coreBOSLib.lastError();
      return "The record cannot be created. "+error["message"];
    };
  }
  else {
    return "You should login first";
  };
};

/**
* Do GetRelated Operation.
* 
* @param {String} Parameter for record id of the module.
* @param {String} Parameter for base module name.
* @param {String} Parameter for related module name.
* @param {Number} Parameter for the limit in the queryParameters.
* @param {Number} Parameter for the offset in the queryParameters.
* @param {String} Parameter for the orderby in the queryParameters.
* @return {Object} Return the result.
* @customfunction
*/
function getRelated(ctoId, basemod, relmod, limit, offset, orderby){
  queryParameters = {
    'limit' : limit,
    'offset' : offset,
    'orderby' : orderby
  };
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var result = coreBOSLib.doGetRelatedRecords(ctoId, basemod, relmod, queryParameters);   
    if (result != null){
      var len=[];
      len.push([result.records.length]);
      var columns = coreBOSLib.getResultColumns(result.records);
      var colnames =[];
      for (var c=0; c < columns.length; c++) {
        // we eliminate numeric column names
        if (isNaN(columns[c])){
          colnames.push(columns[c]);
        };
      };
      columns = colnames;  
      var rows = [];
      rows[0]=[];
      for (var index = 0; index < columns.length; index++){
        rows[0][index]=columns[index];   
      };
      for( var i = 0; i<result.records.length; i++){
        rows[i+1]=[];
        for(var j=0;j<columns.length;j ++){
          rows[i+1][j]=result.records[i][j];
        };
      };
      return rows;
    }
    else{
      Logger.log(coreBOSLib.lastError());
    };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do Retrieve Operation.
 * 
 * @param {String} Parameters for running call get.
 * @return {String} Return data.
 * @customfunction
 */
function retrieve(record){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var qu=coreBOSLib.doRetrieve(record);
    if (qu !=null){
      var columns = [];
      if(qu != null && qu.length != 0) {
        var i=0;
        columns[0];
        columns.push(Object.getOwnPropertyNames(qu));
        columns[1]=[];
        for each( var key in qu) {
          columns[1][i]=key;
          i++;
        }
      }
      return columns;
    }
    else {
      var err= coreBOSLib.lastError();
      return "Error."+err["message"];
    };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do UpdateRecord Operation.
 * 
 * @param {String} Parameter for module name.
 * @param {String} Parameter for assigned_user_id.
 * @param {String} Parameter for date.
 * @param {String} Parameter for Hour.
 * @param {String} Parameter for operation.
 * @param {String} Parameter for information.
 * @param {String} Parameter for relation id.
 * @param {String} Parameter for relation module.
 * @param {String} Parameter for record id that we want to update.
 * @return {String} Return the message if the record is updated or not.
 * @customfunction
 */
function updRecord(module,id,done,hora,operation,info,rel_id,rel_mod,rec_id){
var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
  var moduleName = module;
    var valuesmap ={'assigned_user_id':id,'doneon': done, 'hora':hora,'operation':operation,'moreinfo':info,'rel_id':rel_id,'rel_module':rel_mod,'id':rec_id};
    if (coreBOSLib.doUpdate(moduleName, valuesmap))
    {
      return "The record is updated successfully";
    }
    else {
      var error = coreBOSLib.lastError();
      return "The record cannot be updated. "+error["message"];
    };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do DeleteRecord Operation.
 * 
 * @param {String} Parameter for getting record id.
 * @return {String} Return the message if the record is deleted or not.
 * @customfunction
 */
function delRecord(rec){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    if (coreBOSLib.doDelete(rec))
    {
      return "The record is deleted successfully";
    }
    else {
      var error = coreBOSLib.lastError();
      return "The record cannot be deleted. "+error["message"];
    };
  }
  else {
  return "You should login first";
  };
};

/**
 * Do ListTypes Operation.
 *
 * @return {Object} Return the result.
 * @customfunction
 */
function listTypes(name){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var module = coreBOSLib.doListTypes(name);
    if (module){
      var rows = [];
      rows.push(["Accesible Modules"]);      
      for each (m in module){
        rows.push([m['name']]);
      };
      return rows;
    }
    else {
      var err= coreBOSLib.lastError();
      return "Error. "+err["message"];
    };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do Invoke Operation.
 *
 * @param {String} Parameter for operation.
 * @param {String} Parameter for the type of the element.
 * @param {Boolean} Parameter for password or not (True/False) value.
 * @return {Object} Return the result.
 * @customfunction
 */
function Invoke(operation,element_type,method){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var result=coreBOSLib.doInvoke(operation,element_type,method);
    if (result!=null){ 
      var rows = [];
      var i=0;
      var fielddesc;
      for each(var field in result['fields']){
        var ttname="tt"+i;
        i++;
        fielddesc=field['label']; 
        rows.push([fielddesc]);  
      };
      return rows;
    }
    else {
      Logger.log(coreBOSLib.lastError());
    };
  }
   else {
    return "You should login first";
  };
};

/**
 * Do Describe Operation.
 * 
 * @param {String} Parameter for the module name.
 * @return {Object} Return data in JSON format.
 * @customfunction
 */
function Describe(mod){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var result=coreBOSLib.doDescribe(mod);
    if(result!=null){
      var rows = [];
      rows.push(["Module Name and Id: "+mod+"("+result['idPrefix']+")"]);      
      if(result['createable']==1){
        rows.push(["User can create records: ", "Yes"]);
      }
      else { 
        rows.push(["User can create records: ", "No"]);
      };
      if(result['updateable']==1){
        rows.push(["User can update records: ", "Yes"]); }
      else {
        rows.push(["User can update records: ", "No"]);
      };   
      if(result['deleteable']==1){  
        rows.push(["User can delete records: ", "Yes"]);
      }
      else {    
        rows.push(["User can delete records: ", "No"]);
      }; 
      if(result['retrieveable']==1){ 
        rows.push(["User can retrieve records: ", "Yes"]);
      }
      else { 
        rows.push(["User can retrieve records: ", "No"]);
      };   
	  var i=0;
      var fielddesc;
      var field
      for each(field in result['fields']){
        var ttname="tt"+i;
        i++;
        var fieldname=field['label'];
        fielddesc=fieldname;
        rows.push([fielddesc]);
        rows.push(["Field:", field['name']]);
        rows.push(["Mandatory", field['name'] ? 'yes' : 'no']);
        rows.push(["Editable", field['editable'] ? 'yes' : 'no']);
        rows.push(["Null", field['nullable'] ? 'yes' : 'no']);
        rows.push(["Default", field['default']]);
        rows.push(["Type", field['type']['name']]);
        rows.push(["Format", field['type']['format']]);
      };
      return rows;
    }
    else{
      return "asgje";
    };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do Query Operation.
 *
 * @param {String} Parameter for getting the query.
 * @param {String} Parameter for getting (True/False) value if we should add Header or not to the result.
 * @return {Object} Return the result for the selected query.
 * @customfunction
 */
function doquery(query,header){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var qu = coreBOSLib.doQuery(query);  
    if (qu != null){ 
      var columns = coreBOSLib.getResultColumns(qu);
      var rows = [];
      rows[0]=[];
      if (header==true)
         for (var index = 0; index < columns.length; index++){
           rows[0][index]=columns[index];   
         };    
        for( var i = 1; i<qu.length; i++){
          rows[i]=[];
          for(var j=0;j<columns.length;j++){
            rows[i][j]=qu[i-1][columns[j]];
          };
        };
        return rows;
     }
     else{
       Logger.log(coreBOSLib.lastError());
     };
  }
  else {
    return "You should login first";
  };
};

/**
 * Do SetRelated Operation.
 * 
 * @param {String} Parameter for getting the id of the base module.
 * @param {String} Parameter for getting the id of the related module.
 * @param {String} Parameter for getting the id of the related module.
 * @param {String} Parameter for getting the id of the related module.
 * @return {Object} Return data in JSON format.
 * @customfunction
 */
function setRelated(id, id1, id2, id3){
  var myvalue = PropertiesService.getScriptProperties().getProperty('_sign');
  if(myvalue==1){
    var with_these_ids = [id1, id2, id3];
    var result=coreBOSLib.doSetRelated(id, with_these_ids);
    if (result){
      return result;
    }
    else {
      var gabim= coreBOSLib.lastError();
      return "Error."+gabim["message"];
    };
  }
  else {
    return "You should login first";
  };
};
