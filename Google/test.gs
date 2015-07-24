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

/**
 * Obtener los datos del servicio.
 */
function LoadData()
{
  //Crear enlace.
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

/**
 * Aplicamos formato fecha.
 */
function getDate(data, format){
  if (data != ''){
    var dt = data.split("-");
    var newdt = new Date(dt[0], dt[1], dt[2]);
    var formatdt = Utilities.formatDate(newdt, "GMT+01", format);
    return formatdt;
  }
  return "";
}

/**
 * Crear opción al menú.
 */
function onOpen() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Obtener contactos",
    functionName : "LoadData"
  }];
  spreadsheet.addMenu("coreBOS", entries);
};

/**
 * Borrar opción del menú.
 */
function removeBadMenu() {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   spreadsheet.removeMenu("coreBOS");
}
