/******MENU*******/
//.addItem('FAQs','showDialog')
function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
  .addItem('Add Noise', 'showSidebar')
  .addItem('Answers','showAnswer')
  .addToUi();  
}

function onInstall(e) {onOpen(e);}

function showAnswer() {
  var ui = HtmlService.createHtmlOutputFromFile('answer').setTitle('Answers');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('index').setTitle('Noise Data');
  SpreadsheetApp.getUi().showSidebar(ui);
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('faqs').setWidth(450).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Read before using the "Noisy Sheets" add-on');
}

function showAbout() {
  var html = HtmlService.createHtmlOutputFromFile('about').setWidth(400).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'About');
}
/******MENU*******/

/*****INDEX******/
/*These functions are called from the index.html*/
//This function put names of the sheet in the select tag of email (index)
function celdas()
{
  var respuesta="";
  var res="Selecciones";
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  respuesta =activeSpreadsheet.getActiveRange().getDataSourceUrl();
  var num = respuesta.search("range");
  res = respuesta.substring(num+6, respuesta.length);
  
  return res; 
}
//This function put names of the sheet in the select tag in Answers.hmtl
function comboBox()
{
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var numFiles = activeSpreadsheet.getNumSheets();
  var respuesta= "";
  for(var i=0; i< numFiles ;i++) //fila
  {
    var sheet = activeSpreadsheet.getSheets()[i];
    respuesta= respuesta + sheet.getSheetName() + "-";
  }
  //console.info("Hojas: "+ respuesta);
  return respuesta;
}

/*****INDEX******/

/*****VALIDATION******/
//This function validate the format of the emails
function validarEmails(valoresEmail)
{
  var numEmails= valoresEmail.length;//Numero de correos
  
  for(var s= 0; s<numEmails;s++ )//NUMERO DE CORREOS
  {
    if(validarEmail(valoresEmail[s][2]))
    {
    }
    else{return true;}
  }
  return false;
}
//This function validate the format of the emails
function validarEmail(email)
{
  var res= /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return res.test(email);
}
//This function validate is cell has numbers
function isDigit(c)
{
  return !isNaN(parseFloat(c)) && isFinite(c);
}
//This function validate if the questions sheet has formulas(answer of the questions)
function validationQuestions(formulas)
{
  console.info("validationQuestions: ");
  var string="";
  for(var i=0; i<formulas.length;i++) 
  {
    for (var j=0; j <formulas[0].length;j++) 
    {
      console.info("Formulas: "+ formulas[i][j]);
      if(string.localeCompare(formulas[i][j])==0)
      {
        return true;
      }
    }
  }
  return false;
}
/*****VALIDATION******/

/******MENU*******/
function questionsData(valuesQuestions,newData)
{
  newData[0][0]="Students";
  for(var i=0; i< valuesQuestions.length ;i++) //fila
  {
    
    for(var j=0; j < valuesQuestions[0].length;j++)//columna
    {      
      newData[j][i+1]=  valuesQuestions[i][j];
    }
  }  
  return newData;
}
function answersData(formulas,nData,num,name)
{
  if(num==1)
  {
    nData[0][0]=name;
    for(var i=0; i<nData.length;i++) 
    {//console.info("I: " +i); 
      for (var j=0; j <(nData[0].length-1);j++) 
      {//console.info("J: " +j); 
        //var string = formulas[j][i];
        nData[i][j+1]=formulas[j][i];
      }
    }
  }
  else{
    console.info("Nombre: " +name); 
    for(var i=0; i<nData.length;i++) //fila
    {//console.info("I: " +i); 
      for (var j=0; j <nData[0].length;j++) //Columna
      {//console.info("J: " +j); 
        nData[i][j]=formulas[i][j];
      }
    }
  }
  return nData;
}
//This function put the answers in the sheet of the students
function putAnswers(sheetname)
{
  
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var questionsSheet = activeSpreadsheet.getSheetByName(sheetname);
  if(questionsSheet==null){return -1;}
  var contador=0;
  var rangeQues= questionsSheet.getRange(2, 2, questionsSheet.getLastRow()-1,1);
  var formulas= rangeQues.getFormulas();
  
  var flagQuestiones= validationQuestions(formulas);
  if(flagQuestiones)
  {
    return -2;
  } 
  //Get answer of students
  var id = activeSpreadsheet.getId();
  var fileSource = DriveApp.getFileById(id);
  var folders =fileSource.getParents();
    
  while (folders.hasNext()) 
  {
    var folder = folders.next();
    console.info(folder.getName());
  }
  var files =folder.getFiles();
  var cont= 1;

  while(files.hasNext())
  {
    var auxFile= files.next();
    var str= auxFile.getName();
    var strRes = str.split("-");
    
    if(strRes.length>=2)
    {
      var spreadStudent= SpreadsheetApp.openById(auxFile.getId());
      var sheetStudent = spreadStudent.getSheetByName("Questions");
      if(sheetStudent==null){sheetStudent = spreadStudent.insertSheet("Questions");}
      
      var rangeQues1= sheetStudent.getRange(1,1,formulas.length,1);
      var nData1 =rangeQues1.getValues();
      var nombre=strRes[0];
      nData1=answersData(formulas,nData1,2,nombre);
      rangeQues1.setValues(nData1);
      contador++;
    }     
  }
  return contador;  
}
//This function get the answers of the sheet of the students, delete the sheet and create de MasterAnswers sheet
function getAnswers()
{
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var bandera=true;
  //Ask if master file exists
  var idAux = activeSpreadsheet.getId();
  var fileSourceAux = DriveApp.getFileById(idAux);
  var foldersAux =fileSourceAux.getParents();
  while(foldersAux.hasNext())
  {
    var folderAux = foldersAux.next();
    var sheet4=folderAux.getFilesByName("MasterAnswers");
    
    while(sheet4.hasNext())
    {  
      var page= sheet4.next()
      var file4 = DriveApp.getFileById(page.getId());
      folderAux.removeFile(file4);
      console.info("Archivo"+page.getName());
      console.info("Borrando");
    }
  }

  if(bandera)
  {  
    //console.info("Crear");
    //Copy to the folder
    var sheet = SpreadsheetApp.create("MasterAnswers");
    var id = sheet.getId();
    var idSource =activeSpreadsheet.getId();
    var file = DriveApp.getFileById(id);
    var fileSource = DriveApp.getFileById(idSource);
    var folders =fileSource.getParents();
    while (folders.hasNext()) 
    {
      var folder = folders.next();
    }
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }  
  
  var questionsSheet = activeSpreadsheet.getSheetByName("Questions");
  //Put the questions in the new sheet
  var rangeQuestions= questionsSheet.getRange(2, 1, questionsSheet.getLastRow()-1,1);
  var valuesQuestions= rangeQuestions.getValues();
  var spreadSheet= sheet.getSheetByName("Sheet1");
  var rangeAnswer= spreadSheet.getRange(1, 1, 1, questionsSheet.getLastRow());
  var newData= rangeAnswer.getValues();
  newData=questionsData(valuesQuestions,newData);
  rangeAnswer.setValues(newData);  
  //Put the answer in the new sheet
  //var rangeQues= questionsSheet.getRange(2, 2, questionsSheet.getLastRow()-1,1);
  //var formulas= rangeQues.getFormulas();
  
  //Get answer of students
  var id = activeSpreadsheet.getId();
  var fileSource = DriveApp.getFileById(id);
  var folders =fileSource.getParents();
  while (folders.hasNext()) 
  {
    var folder = folders.next();
    Logger.log(folder.getName());
  }
  var files =folder.getFiles();
  var cont= 0;
  while(files.hasNext())
  {
    var auxFile= files.next();
    
    var str= auxFile.getName();
    var strRes = str.split("-");
    if(strRes.length>=2)
    {
      var spreadStudent= SpreadsheetApp.openById(auxFile.getId());
      var sheetStudent = spreadStudent.getSheetByName("Questions");
      
      var rangeQues1= sheetStudent.getRange(1,1,sheetStudent.getLastRow(),1);
      var formulas1= rangeQues1.getValues();
      
      var ranAnswer1= spreadSheet.getRange(2+cont, 1, 1, questionsSheet.getLastRow());
      var nData1 =ranAnswer1.getValues();
      var nombre=strRes[0];
      nData1=answersData(formulas1,nData1,1,nombre);
      ranAnswer1.setValues(nData1);
      cont++;
      
      spreadStudent.deleteSheet(sheetStudent);
    } 
  }  
}

function addNoise(form)
{
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  ///EMAIL
  var emailSheet = activeSpreadsheet.getSheetByName(form.email);
  var rangoEmail= emailSheet.getRange(2, 1, emailSheet.getLastRow()-1, emailSheet.getLastColumn());
  var valoresEmail= rangoEmail.getValues();
  ///QUESTIONS

  
  //get the data from the index
  var rangoRow = activeSpreadsheet.getRange(form.row);//Rango de filas
  var valoresRow= rangoRow.getValues();
  var rangoData = activeSpreadsheet.getRange(form.name);//Rango de datos
  var valoresData= rangoData.getValues();
  
  var string2="";
  //get the format of the headers
  if(string2.localeCompare(form.colum)!=0)
  {  
    var rangoColumn = activeSpreadsheet.getRange(form.colum);//Rango de columnas
    var valoresColumn= rangoColumn.getValues();
    var sBG = activeSpreadsheet.getRange(form.colum).getBackgrounds();
    var sFC = activeSpreadsheet.getRange(form.colum).getFontColors();
    var sFF = activeSpreadsheet.getRange(form.colum).getFontFamilies();
    var sFL = activeSpreadsheet.getRange(form.colum).getFontLines();
    var sFFa = activeSpreadsheet.getRange(form.colum).getFontFamilies();
    var sFSz = activeSpreadsheet.getRange(form.colum).getFontSizes();
    var sFSt = activeSpreadsheet.getRange(form.colum).getFontStyles();
    var sFW = activeSpreadsheet.getRange(form.colum).getFontWeights();
    var sHA = activeSpreadsheet.getRange(form.colum).getHorizontalAlignments();
    var sVA = activeSpreadsheet.getRange(form.colum).getVerticalAlignments();
    var sNF = activeSpreadsheet.getRange(form.colum).getNumberFormats();
    var sWR = activeSpreadsheet.getRange(form.colum).getWraps();
  }  

  var sBG1 = activeSpreadsheet.getRange(form.row).getBackgrounds();
  var sFC1 = activeSpreadsheet.getRange(form.row).getFontColors();
  var sFF1 = activeSpreadsheet.getRange(form.row).getFontFamilies();
  var sFL1 = activeSpreadsheet.getRange(form.row).getFontLines();
  var sFFa1 = activeSpreadsheet.getRange(form.row).getFontFamilies();
  var sFSz1 = activeSpreadsheet.getRange(form.row).getFontSizes();
  var sFSt1 = activeSpreadsheet.getRange(form.row).getFontStyles();
  var sFW1 = activeSpreadsheet.getRange(form.row).getFontWeights();
  var sHA1 = activeSpreadsheet.getRange(form.row).getHorizontalAlignments();
  var sVA1 = activeSpreadsheet.getRange(form.row).getVerticalAlignments();
  var sNF1 = activeSpreadsheet.getRange(form.row).getNumberFormats();
  var sWR1 = activeSpreadsheet.getRange(form.row).getWraps();
  
  var mailNoSend=0;
  var mailSend=0;
  var nameNoSend="";
  var numEmails= valoresEmail.length;//number of emails
  //console.info("Tamanio emails: "+ numEmails);
  
  var flagEmails= validarEmails(valoresEmail);
  if(flagEmails){return "a-error email";}
  
  //validate, create a new sheet with the noise and send the mail
  for(var s= 0; s<numEmails;s++ )
  {
    if(validarEmail(valoresEmail[s][2]))
    {
      var nameFile = valoresEmail[s][0] + " " +valoresEmail[s][1] +" - "+ activeSpreadsheet.getName(); 
      
      var sheet = SpreadsheetApp.create(nameFile);
      var spreadSheet= sheet.getSheetByName("Sheet1");
      spreadSheet.setName(activeSpreadsheet.getActiveSheet().getName());
      var carpeta="My Drive";
      var id = sheet.getId();
      var idSource =activeSpreadsheet.getId();
      var file = DriveApp.getFileById(id);
      var fileSource = DriveApp.getFileById(idSource);
      var folders =fileSource.getParents();
      if(folders.hasNext())
      {  
        while (folders.hasNext()) 
        {
          var folder = folders.next();
          //console.info("Carpeta: "+ folder.getName());
        }
        if(carpeta.localeCompare(folder.getName())==0)
        {
          folder.removeFile(file);
          return "i-the file in the root";
        }
        else{}
        folder.addFile(file);
        DriveApp.getRootFolder().removeFile(file);
      }
      else
      {
        DriveApp.removeFile(file);
      }
      //Agrego las columnas y filas al nuevo libro creado
      sheet.getRange(form.row).setValues(valoresRow);
      //Put the format of the headers
      if(string2.localeCompare(form.colum)!=0)
      {  
        sheet.getRange(form.colum).setValues(valoresColumn);
        sheet.getRange(form.colum)
        .setBackgrounds(sBG)
        .setFontColors(sFC)
        .setFontFamilies(sFF)
        .setFontLines(sFL)
        .setFontFamilies(sFFa)
        .setFontSizes(sFSz)
        .setFontFamilies(sFFa)
        .setFontSizes(sFSz)
        .setFontStyles(sFSt)
        .setFontWeights(sFW)
        .setHorizontalAlignments(sHA)
        .setVerticalAlignments(sVA)
        .setNumberFormats(sNF)
        .setWraps(sWR);
      }
      //Put the format of the headers
      sheet.getRange(form.row)
      .setBackgrounds(sBG1)
      .setFontColors(sFC1)
      .setFontFamilies(sFF1)
      .setFontLines(sFL1)
      .setFontFamilies(sFFa1)
      .setFontSizes(sFSz1)
      .setFontFamilies(sFFa1)
      .setFontSizes(sFSz1)
      .setFontStyles(sFSt1)
      .setFontWeights(sFW1)
      .setHorizontalAlignments(sHA1)
      .setVerticalAlignments(sVA1)
      .setNumberFormats(sNF1)
      .setWraps(sWR1);
      
      
      var rangeData= sheet.getRange(form.name);
      var newData= rangeData.getValues();
      //Add the noise depending of the value distribution
      switch (parseInt(form.type)) 
      {
        case 1:
          newData=matrix(valoresData,newData,form.negative,form.decimal);
          console.info("Matrix");
          break;
        case 2:
          newData=column(valoresData,newData,form.negative,form.decimal);
          console.info("column");
          break;
        case 3:
          newData=row(valoresData,newData,form.negative,form.decimal);
          console.info("Row");
      } 
      //If the original spreadsheet has letters in the data, the will send a messege of the mistake
      if(newData==-1)
      {
        folder.removeFile(file);
        return "e-data with letters";
      }  
      
      rangeData.setValues(newData);  
      //share and send email
      var url = sheet.getUrl();
      var email = valoresEmail[s][2];
      var subject = sheet.getName();
      var body ="Hi " + valoresEmail[s][0] + "\n" + form.message + "\n" +url;
      sheet.addEditor(valoresEmail[s][2]);
      MailApp.sendEmail(email, subject, body);
      mailSend++;
    }
    else
    {
      mailNoSend++;
      nameNoSend=nameNoSend+valoresEmail[s][0] + " " +valoresEmail[s][1]+ ",";
    }
  }
  var res= mailNoSend+"-"+mailSend+"-"+nameNoSend;
  return res;
}
/*Function of Values distribution*/
function row(valoresData,newData,bandera,flagdecimal)
{
  
  for(var i=0; i< valoresData.length ;i++) //fila
  {
    var string="";
    var newArray = [];
    var cont=0;
    for(var j=0; j < valoresData[0].length;j++)//columna
    {
      if((string.localeCompare(valoresData[i][j]))!=0)
      {  
        if(isDigit(valoresData[i][j]))
        {  
          newArray[cont]=parseFloat(valoresData[i][j]);
          cont++;
        }
        else
        {
          return -1;
        }
        
      }  
    }
    var variance2= getVariance(newArray,5);
    
    for(var l=0; l < newData[0].length;l++)//columna
    {     
      var valor=valoresData[i][l];
      if((string.localeCompare(valor))!=0)
      {  
        var ruido=((Math.random()*2)-1)* Math.sqrt(variance2);
        var respuesta = ruido+valor;
        if(!bandera&& respuesta<0)
        {
          ruido=(Math.random())* Math.sqrt(variance2);
          respuesta = ruido+valor;
        }
        if(!flagdecimal){respuesta=parseInt(respuesta);} 
        newData[i][l]=respuesta;
      } 
      else
      {
        newData[i][l]=valor;  
      } 
    }
  }
  return newData;
}
function column(valoresData,newData,bandera,flagdecimal)
{
  for(var i=0; i< valoresData[0].length ;i++) //column
  {
    var string="";
    var newArray = [];
    var cont=0;
    for(var j=0; j < valoresData.length;j++)//row
    {
      if((string.localeCompare(valoresData[j][i]))!=0)
      {           
        if(isDigit(valoresData[j][i]))
        {  
          newArray[cont]=parseFloat(valoresData[j][i]);
          cont++;
        }
        else{return -1;}
      }  
    }
    var variance2= getVariance(newArray,5);
    
    for(var l=0; l < newData.length;l++)//row
    {     
      var valor=valoresData[l][i];
      if((string.localeCompare(valor))!=0)
      {  
        var ruido=((Math.random()*2)-1)* Math.sqrt(variance2);
        var respuesta = ruido+valor;
        if(!bandera&& respuesta<0)
        {
          ruido=(Math.random())* Math.sqrt(variance2);
          respuesta = ruido+valor;
        }
        if(!flagdecimal){respuesta=parseInt(respuesta);} 
        newData[l][i]=respuesta;
      } 
      else
      {
        newData[l][i]=valor;  
      } 
    }
  }
  return newData;
  
}
function matrix(valoresData,newData,bandera,flagdecimal)
{
  var string="";
  var newArray = [];
  var cont=0;
  for(var i=0; i< valoresData.length ;i++) //fila
  {
    for(var j=0; j < valoresData[0].length;j++)//columna
    {
      if((string.localeCompare(valoresData[i][j]))!=0)
      {
        if(isDigit(valoresData[i][j]))
        {  
          newArray[cont]=parseFloat(valoresData[i][j]);
          cont++;
        }
        else{return -1;}
      }  
    }
  }
  var variance2= getVariance(newArray,5);
  for(var k=0; k< newData.length ;k++) //fila
  {
    for(var l=0; l < newData[0].length;l++)//columna
    {     
      var valor=valoresData[k][l];
      if((string.localeCompare(valor))!=0)
      {  
        var ruido=((Math.random()*2)-1)* Math.sqrt(variance2);
        var respuesta = ruido+valor;
        if(!bandera&& respuesta<0)
        {
          ruido=(Math.random())* Math.sqrt(variance2);
          respuesta = ruido+valor;
        }
        if(!flagdecimal){respuesta=parseInt(respuesta);} 
        newData[k][l]=respuesta;
      } 
      else
      {
        newData[k][l]=valor;  
      } 
    }
  }
  return newData;
}
/*Function of Values distribution*/

/*Statistics function*/
function mean(numbers) 
{
  var total = 0,i;
  for (i = 0; i < numbers.length; i += 1) 
  {
    total += numbers[i];
  }
  return total / numbers.length;
}

function getNumWithSetDec( num, numOfDec)
{
  var pow10s = Math.pow( 10, numOfDec || 0 );
  return ( numOfDec ) ? Math.round( pow10s * num ) / pow10s : num;
}
function getAverageFromNumArr( numArr, numOfDec )
{
  var i = numArr.length, 
      sum = 0;
  while( i-- ){
    sum += numArr[ i ];
  }
  //return getNumWithSetDec((sum / numArr.length ), numOfDec );
  return (sum / numArr.length );
}
function getVariance(numArr, numOfDec)
{
  var avg = getAverageFromNumArr( numArr, numOfDec ), 
      i = numArr.length,
      v = 0;
  
  while( i-- ){
    v += Math.pow( (numArr[ i ] - avg), 2 );
  }
  v /= numArr.length;
  //return getNumWithSetDec(v, numOfDec );
  return v;
}
function standardDeviation(values)
{
  var avg = average(values);
  var squareDiffs = values.map(function(value)
                               {
                                 var diff = value - avg;
                                 var sqrDiff = diff * diff;
                                 return sqrDiff;
                               });
  var avgSquareDiff = average(squareDiffs);
  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}
function average(data)
{
  var sum = data.reduce(function(sum, value)
                        {
                          return sum + value;
                        }, 0);
  
  //console.info("Tamaño: " +data.length);
  var avg = sum / data.length;
  return avg;
}
/*Statistics function*/
//http://zigmandel.blogspot.com.au/2015/09/how-i-crowd-translated-my-product-tour.html
//https://github.com/googlesamples/apps-script-templates/blob/master/sheets-addon/Code.gs
//https://developers.google.com/apps-script/guides/dialogs
//https://developers.google.com/apps-script/guides/services/authorization