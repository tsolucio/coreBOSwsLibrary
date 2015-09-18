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

/*
*This function create a global variable
*/
function global(){
	PropertiesService.getScriptProperties().setProperty('glob_val', '0');
}

/**
 * Get result response.
 * 
 * @param {String} Parámetros para ejecutar llamada get.
 * @param {String} Parámetros para ejecutar llamada get.
 * @param {String} Parámetros para ejecutar llamada get.
 * @return {String} Retorno de datos en formato JSon.
 * @customfunction
 */

function login(url, usr, withpass) {
	var myvalue= PropertiesService.getScriptProperties().getProperty('glob_val');
	if(myvalue==0){
		coreBOSLib.wsclient(url); 
		if (coreBOSLib.doLogin(usr, usr, withpass)){
			PropertiesService.getScriptProperties().setProperty('glob_val', '1');
			return "Login successfull.";
		} else {
			return "Login failed.";
		};
	} else {
		return "Already logged in";
	};
};

//----------------------------------------------------------------------

function logout() {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if(myvalue==1){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		if (coreBOSLib.doLogin("admin", "admin", true)){
			if (coreBOSLib.doLogout()){
				PropertiesService.getScriptProperties().setProperty('glob_val', '0');
				return "Logout successfull.";
			} else {
				return "Logout failed.";
			};
		} else {
			return "login failed.";
		}
	} else {
		return "Already logged out";
	};
};

//----------------------------------------------------------------------

function createRecord(module, name, lastn, phone, email, id) {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if(myvalue==1){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		var contactvalues = {'lastname': lastn, 'firstname': name, 'id': id, 'phone': phone, 'email': email};
		if (coreBOSLib.doLogin("admin", "admin", true)) {
			if (coreBOSLib.doCreate(module, contactvalues)) {
				return "The record is created successfully";
			} else {
				var err = coreBOSLib.lastError();
				return "The record cannot be created. "+err["message"];
			};
		};
	 else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function getRelated(ctoId,basemod,relmod) {
	queryParameters = {
		'limit' : '3',
		'offset' : '0',
		'orderby' : ''
	};
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if(myvalue==1){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		if (coreBOSLib.doLogin("admin", "admin", true)) {
			Logger.log("Login OK");
			var result = coreBOSLib.doGetRelatedRecords(ctoId, basemod, relmod, queryParameters);
			if (result != null) {
				var len=[];
				len.push([result.records.length]);
				var columns = coreBOSLib.getResultColumns(result.records);
				var colnames =[];
				for (var c=0; c < columns.length; c++) {
					// we eliminate numeric column names
					if (isNaN(columns[c])) {
						colnames.push(columns[c]);
					};
				};
				columns = colnames;
				//Creamos cabeceras
				var rows = [];
				rows[0]=[];
				for (var index = 0; index < columns.length; index++) {
					rows[0][index]=columns[index];
				};
				//Cargar datos en matriz.
				for( var i = 0; i<result.records.length; i++) {
					rows[i+1]=[];
					for(var j=0;j<columns.length;j ++) {
						rows[i+1][j]=result.records[i][j];
					};
				};
				return rows;
			} else {
				Logger.log(coreBOSLib.lastError());
			};
		} else {
			Logger.log(coreBOSLib.lastError());
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function retrieve(record) {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos")
		coreBOSLib.doLogin("admin", "admin", true)
		if (coreBOSLib.doRetrieve(record)) {
			return coreBOSLib.doRetrieve(record);
		} else {
			var err= coreBOSLib.lastError();
			return "Error."+err["message"];
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function updRecord(module, name, lastn, id) {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		var moduleName = module;
		var valuesmap = { 'firstname' : name, 'lastname': lastn, 'id': id};
		if (coreBOSLib.doUpdate(moduleName, valuesmap)) {
			return "The record is updated successfully";
		} else {
			var err = coreBOSLib.lastError();
			return "The record cannot be updated. "+err["message"];
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function delRecord(rec) {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		coreBOSLib.doLogin("admin", "admin", true);
		if (coreBOSLib.doDelete(rec)) {
			return "The record is deleted successfully";
		} else {
			var err = coreBOSLib.lastError();
			return "The record cannot be deleted. "+err["message"];
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function listTypes() {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if(myvalue==1){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var module = coreBOSLib.doListTypes();
		if (module) {
			var sheet = SpreadsheetApp.getActiveSheet();
			//Creamos cabeceras
			var rows = [];
			rows.push(["Accesible Modules"]);
			for each (m in module) {
				rows.push([m['name']]);
			};
			return rows;
		} else {
			var err= coreBOSLib.lastError();
			return "Error. "+err["message"];
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function Invoke(){
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		coreBOSLib.doLogin("admin", "admin", true);
		var result=coreBOSLib.doInvoke('describe',{'elementType' : 'Contacts'},'GET');
		if (result!=null) {
			var sheet = SpreadsheetApp.getActiveSheet();
			var rows = [];
			rows.push(["Module Name and Id: contacts("+result['idPrefix']+")"]);
			if (result['createable']==1) {
				rows.push(["User can create records: Yes"]); 
			} else { 
				rows.push(["User can create records: No"]);
			};
			if (result['updateable']==1) {
				rows.push(["User can update records: Yes"]); 
			} else {
				rows.push(["User can update records: No"]);
			};
			if (result['deleteable']==1) {
				rows.push(["User can delete records: Yes"]); 
			} else {
				rows.push(["User can delete records: No"]);
			};
			if (result['retrieveable']==1) {
				rows.push(["User can retrieve records: Yes"]);
			} else {
				rows.push(["User can retrieve records: No"]);
			};
			rows.push(["Fields (hover over name for full details):"]);
			var i=0;
			var fielddesc;
			for each (var field in result['fields']) {
				var ttname="tt"+i;
				i++;
				fielddesc=field['label'];
				rows.push([fielddesc]);
			};
			return rows;
		} else {
			Logger.log(coreBOSLib.lastError());
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

/**
 * Get result response.
 * 
 * @param {String} Parámetros para ejecutar llamada get.
 * @return {String} Retorno de datos en formato JSon.
 * @customfunction
 */

function Describe(mod){
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		//Realizar login contra plataforma.
		coreBOSLib.doLogin("admin", "admin", true);
		Logger.log("Login OK");
		var result=coreBOSLib.doDescribe(mod);
		if (result!=null) {
			var rows = [];
			rows.push(["Module Name and Id: "+mod+"("+result['idPrefix']+")"]);      
			if (result['createable']==1) {
				rows.push(["User can create records: Yes"]);
			} else { 
				rows.push(["User can create records: No"]);
			};
			if (result['updateable']==1) {
				rows.push(["User can update records: Yes"]);
			} else {
				rows.push(["User can update records: No"]);
			};
			if (result['deleteable']==1) {
				rows.push(["User can delete records: Yes"]);
			} else { 
				rows.push(["User can delete records: No"]);
			};
			if (result['retrieveable']==1) {
				rows.push(["User can retrieve records: Yes"]);
			} else {
				rows.push(["User can retrieve records: No"]);
			};
			rows.push(["Fields (hover over name for full details):"]);
			var i=0;
			var fielddesc;
			var field;
			for each (field in result['fields']) {
				var ttname="tt"+i;
				i++;
				var fieldname=field['label'];
				fielddesc=fieldname;
				rows.push([fielddesc]);  
			};
			return rows;
		} else{
			Logger.log(coreBOSLib.lastError());
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function doquery(query,header){
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		Logger.log("Login OK");
		var qu = coreBOSLib.doQuery(query);  
		if (qu != null) {
			var columns = coreBOSLib.getResultColumns(qu);
			var rows = [];
			rows[0]=[];
			if (header=="True")
				for (var index = 0; index < columns.length; index++) {
					rows[0][index]=columns[index];   
				};
				for( var i = 0; i<qu.length; i++) {
					rows[i+1]=[];
					for(var j=0;j<columns.length;j++) {
						rows[i+1][j]=qu[i][columns[j]];
					};
				};
				return rows;
			} else{
				Logger.log(coreBOSLib.lastError());
			};
		} else{
			Logger.log(coreBOSLib.lastError());
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function setRelated(id, id1, id2, id3) {
	var myvalue = PropertiesService.getScriptProperties().getProperty('glob_val');
	if (myvalue==1) {
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var with_these_ids = [id1, id2, id3];
		var result=coreBOSLib.doSetRelated(id, with_these_ids);
		if (result) {
			return result;
		} else {
			var err= coreBOSLib.lastError();
			return "Error."+err["message"];
		};
	} else {
		return "You should login first";
	};
};

//----------------------------------------------------------------------

function onOpen() {
	var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	var entries = [{
			name : "Login",
			functionName : "login"
		},{
			name : "Create Record",
			functionName : "createRecord"
		},{
			name : "Logout",
			functionName : "logout"
		},{
			name : "Query",
			functionName : "doquery"
		},{
			name : "Describe",
			functionName : "Describe"
		}];
		spreadsheet.addMenu("coreBOS Operations", entries);
};
