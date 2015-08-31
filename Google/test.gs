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

	function Invoke(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		coreBOSLib.doLogin("admin", "admin", true);
		var result=coreBOSLib.doInvoke('describe',{'elementType' : 'Contacts'},'GET');
		if (result!=null){ 
			var sheet = SpreadsheetApp.getActiveSheet();
			var rows = [];
			rows.push(["Module Name and Id: contacts("+result['idPrefix']+")"]);
			dataRange = sheet.getRange(1, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);   
			if(result['createable']==1){
				var rows = [];
				rows.push(["User can create records: Yes"]); 
			}
			else { 
				var rows = [];
				rows.push(["User can create records: No"]);
			};
			dataRange = sheet.getRange(2, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['updateable']==1){
				var rows = [];
				rows.push(["User can update records: Yes"]); 
			}
			else { 
				var rows = [];
				rows.push(["User can update records: No"]);
			};
			dataRange = sheet.getRange(3, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);   
			if(result['deleteable']==1){
				var rows = [];
				rows.push(["User can delete records: Yes"]); 
			}
			else {
				var rows = [];
				rows.push(["User can delete records: No"]);
			};
			dataRange = sheet.getRange(4, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['retrieveable']==1){
				var rows = [];
				rows.push(["User can retrieve records: Yes"]);
			}
			else {
				var rows = [];
				rows.push(["User can retrieve records: No"]);
			};
			dataRange = sheet.getRange(5, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			var rows = [];
			rows.push(["Fields (hover over name for full details):"]);
			dataRange = sheet.getRange(6, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows); 
			var i=0;
			var fielddesc;
			var rows = [];
			for each(var field in result['fields']){
				var ttname="tt"+i;
				i++;
				var fieldname=field['label'];
				fielddesc=fieldname;
				rows.push([fielddesc]);  
			};
			dataRange = sheet.getRange(7, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);    
		}
		else {
			Logger.log(coreBOSLib.lastError());
		};
	};


	function Describe(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		var modulename="Contacts";
		//Realizar login contra plataforma.
		coreBOSLib.doLogin("admin", "admin", true);
		Logger.log("Login OK");
	var result=coreBOSLib.doDescribe(modulename);
		if(result!=null){
			var sheet = SpreadsheetApp.getActiveSheet();
			var rows = [];
			rows.push(["Module Name and Id: "+modulename+"("+result['idPrefix']+")"]);
			dataRange = sheet.getRange(1, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['createable']==1){
				var rows = [];
				rows.push(["User can create records: Yes"]);
			}
			else { 
				var rows = [];
				rows.push(["User can create records: No"]);
			};
			dataRange = sheet.getRange(2, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['updateable']==1){
			var rows = [];
			rows.push(["User can update records: Yes"]); }
			else {
				var rows = [];
				rows.push(["User can update records: No"]);
			};
			dataRange = sheet.getRange(3, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['deleteable']==1){
				var rows = [];
				rows.push(["User can delete records: Yes"]);
			}
			else { 
				var rows = [];
				rows.push(["User can delete records: No"]);
			}; 
			dataRange = sheet.getRange(4, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			if(result['retrieveable']==1){
				var rows = [];
				rows.push(["User can retrieve records: Yes"]);
			}
			else {
				var rows = [];
				rows.push(["User can retrieve records: No"]);
			};
			dataRange = sheet.getRange(5, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);  
			var rows = [];
			rows.push(["Fields (hover over name for full details):"]);
			dataRange = sheet.getRange(6, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows); 
			var i=0;
			var fielddesc;
			var rows = [];
			for each(var field in result['fields']){
				var ttname="tt"+i;
				i++;
				var fieldname=field['label'];
				fielddesc=fieldname;
				rows.push([fielddesc]);  
			};
			dataRange = sheet.getRange(7, 2, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
 			dataRange.setValues(rows);  
		}
		else{
			Logger.log(coreBOSLib.lastError());
		};
	};


	function ListType(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var module = coreBOSLib.doListTypes();
		if (module){
			var sheet = SpreadsheetApp.getActiveSheet();
			var rows = [];
			rows.push(["Accesible Modules"]);
			dataRange = sheet.getRange(1, 1, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);
			var rows = [];  
			for each (modulename in module){
				rows.push([modulename['name']]);
			};
			dataRange = sheet.getRange(2, 1, rows.length, 1);
			dataRange.setHorizontalAlignment("center");
			dataRange.setValues(rows);
		}
		else {
			Logger.log(coreBOSLib.lastError());
		};
	};


	function Version(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var module = coreBOSLib.version();
		if (module){
			return module;
		} 
		else{
			Logger.log(coreBOSLib.lastError());
		};
	};


	function WebServiceURL(){
		var service=coreBOSLib.getWebServiceURL("http://corebos.org/demos/corebos");
		return service;
	}


	function record(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var rec= coreBOSLib.getRecordId("3x40");
		return rec;
	}


	function deleted(id){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true)
		if (coreBOSLib.doDelete(id)){
			return "deleted" ;
		} 
		else {
			var error= coreBOSLib.lastError();
			return "Not deleted."+error["message"];
		};
	};


	function setrel(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		coreBOSLib.doLogin("admin", "admin", true);
		var ctoId='12x22';  // Contacts
		var pdoId='14x52';  // Product
		var docId='15x159';  // Document
		var srvId='26x151'; // Services
		var with_these_ids = [pdoId,docId,srvId];
		var result=coreBOSLib.doSetRelated(ctoId, with_these_ids);
		if (result){
			return result;
		}
		else {
			var error= coreBOSLib.lastError();
			return "nuk u fshi ."+error["message"];
		};
	};


	function Retrive(record){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos")
		coreBOSLib.doLogin("admin", "admin", true)
		if (coreBOSLib.doRetrieve(record)){
			return "Correct."+coreBOSLib.doRetrieve(record);
		}
		else {
			var error= coreBOSLib.lastError();
			return "Didn't retrive."+error["message"];
		};
	};


	function logout(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		if (coreBOSLib.doLogin("admin", "admin", true)){
			if (coreBOSLib.doLogout()){
				return "Logout with success" ;
			}
			else {
				return "Logout failed";
			};
		}
		else {
			return "Login failed";
		};
	};


	function query(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		if (coreBOSLib.doLogin("admin", "admin", true)){
			Logger.log("Login OK");
			var qu = coreBOSLib.doQuery("select * from Contacts;");
			if (qu != null){
				var sheet = SpreadsheetApp.getActiveSheet();
				var columns = coreBOSLib.getResultColumns(qu);
				var rows = [];
				rows[0]=[];
				for (var index = 0; index < columns.length; ++index){
					rows[0][index]=columns[index];   
				};
				dataRange = sheet.getRange(1, 1, 1,columns.length);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(rows);        
				var rows = [];
				for( var i = 0; i<qu.length; ++i){
					rows[i]=[];
					for(var j=0;j<columns.length;++j){
						rows[i][j]=qu[i][columns[j]];
					};
				};
				dataRange = sheet.getRange(2, 1, rows.length, columns.length);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(rows);
				Browser.msgBox("Datos cargados correctamente.");
			}
			else {
				Logger.log(coreBOSLib.lastError());
			};
		}
		else {
			Logger.log(coreBOSLib.lastError());
		};
	};


	function RelatedRecords(){
		var ctoId='12x22';  // Contacts
		var srvId='26x151'; // Services
		var queryParameters = {
			'limit' : '3',
			'offset' : '0',
			'orderby' : ''
		};
		coreBOSLib.wsclient("http://corebos.org/demos/corebos");
		if (coreBOSLib.doLogin("admin", "admin", true)) {
			Logger.log("Login OK");
			var result = coreBOSLib.doGetRelatedRecords(ctoId, 'Contacts', 'Services', queryParameters);
			if (result != null){
				var sheet = SpreadsheetApp.getActiveSheet();
				var row1=[];
				row1.push([result.records.length]);
				dataRange = sheet.getRange(1, 1, 1,1);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(row1); 
				var columns = coreBOSLib.getResultColumns(result.records);
				var colnames =[];
				for (var c=0; c < columns.length; ++c) {
					if (isNaN(columns[c])){
						colnames.push(columns[c]);
					};
				};
				columns = colnames;
 				var rows = [];
				rows[0]=[];
				for (var index = 0; index < columns.length; ++index){
					rows[0][index]=columns[index];   
				};
				dataRange = sheet.getRange(2, 1, 1,columns.length);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(rows);        
				var rows = [];
				for( var i = 0; i<result.records.length; ++i){
					rows[i]=[];
					 for(var j=0;j<columns.length;++j){
						rows[i][j]=result.records[i][j];
					};
				};
				dataRange = sheet.getRange(3, 1, rows.length, columns.length);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(rows);
				Browser.msgBox("Datos cargados correctamente.");
			}
			else{
				Logger.log(coreBOSLib.lastError());
			};
		}
		else{
			Logger.log(coreBOSLib.lastError());
		};
	};

  
	function LoadData(){
		coreBOSLib.wsclient("http://corebos.org/demos/corebos"); 
		//Realizar login contra plataforma.
		if (coreBOSLib.doLogin("admin", "admin", true))
		{
			Logger.log("Login OK");
			//Ejecutar query.
			var qu = coreBOSLib.doQuery("select salesorder_no, hdnGrandTotal, duedate from SalesOrder;");
			//Capturar datos si todo es correcto.    
			if (qu != null){
				var sheet = SpreadsheetApp.getActiveSheet();
				//Creamos cabeceras
				var rows = [];
				rows.push(["MES", "IMPORTE", "FECHA"]);      
				dataRange = sheet.getRange(1, 1, rows.length, 3);
				dataRange.setHorizontalAlignment("center");
				dataRange.setValues(rows);        
				//Cargar datos en matriz.
				var rows = [];
				for(i = 0; i<qu.length; i++){
					var fecha = getDate(qu[i].duedate, "dd/MM/yyyy");
					var mes = getDate(qu[i].duedate, "M") -1;
					rows.push([Number(mes), Number(qu[i].hdnGrandTotal), qu[i].duedate]);
				};
				//Cargar datos en hoja.
				dataRange = sheet.getRange(2, 1, rows.length, 3);
				dataRange.setValues(rows);
				//Aplicamos formato a la columna de importe.
				var mon_range = sheet.getRange("B2:B8");
				mon_range.setNumberFormat("#,##0.00\ [$€-1]");
				//Mensaje de finalización
				Browser.msgBox("Datos cargados correctamente.");
			}
			else{
				Logger.log(coreBOSLib.lastError());
			};
		}
		else{
			Logger.log(coreBOSLib.lastError());
		};
	};


	function getDate(data, format){
		if (data != ''){
			var dt = data.split("-");
			var newdt = new Date(dt[0], dt[1], dt[2]);
			var formatdt = Utilities.formatDate(newdt, "GMT+01", format);
			return formatdt;
		}
		return "";
	}


	function onOpen() {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		var entries = [{
			name : "Obtener contactos",
			functionName : "LoadData"
		},{
			name : "List types",
			functionName : "ListType"
		},{
			name : "get Result Columns",
			functionName : "query"
		},{
			name : "Get Related Records",
			functionName : "RelatedRecords"
		},{
			name : "Describe",
			functionName : "Describe"
		},{
			name : "Invoke",
			functionName : "Invoke"
		}];
		spreadsheet.addMenu("coreBOS", entries);
	};


	function removeBadMenu() {
		var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		spreadsheet.removeMenu("coreBOS");
	}
