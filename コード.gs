function doGet(e) {
  var schedule_number = Number(e.parameter.schedule_number);
  Logger.log("schedule_number: "+schedule_number)

  var data = SpreadsheetApp.getActiveSheet().getRange(schedule_number+1, 1, schedule_number+1, 6).getValues();
  Logger.log("data:" + data)

  var output_list = {}
  for(i=1;i<4;i++){
    output_list["候補日"+i] = Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd')
    Logger.log(Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd'));
  }
  output_list["締切日"] = Utilities.formatDate(data[0][5], 'Asia/Tokyo', 'yyyy/MM/dd')

  payload = JSON.stringify(output_list)
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(payload);
  return output
}

function doPost(e) {
  var schedule_number = e.parameter.schedule_number;
  var candidate_date1 = e.parameter.candidate_date1;
  var candidate_date2 = e.parameter.candidate_date2;
  var candidate_date3 = e.parameter.candidate_date3;
  var dead_line = e.parameter.dead_line;
  
  Logger.log("schedule_number: "+schedule_number)
  Logger.log("candidate_date1: "+candidate_date1)
  Logger.log("candidate_date2: "+candidate_date2)
  Logger.log("candidate_date3: "+candidate_date3)
  Logger.log("dead_line: "+dead_line)

  set_Schedule(schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line)
  
  payload = JSON.stringify({"response": "200"})
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(payload);
  return output
}

function set_Schedule(schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line) {
  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('input');
  var now = new Date();

  var i = datasheet.getLastRow() + 1;
  
  datasheet.getRange(i,  1).setValue("スケジュール"+schedule_number);
  datasheet.getRange(i,  2).setValue("企画"+schedule_number);
  datasheet.getRange(i,  3).setValue(candidate_date1);
  datasheet.getRange(i,  4).setValue(candidate_date2);
  datasheet.getRange(i,  5).setValue(candidate_date3);
  datasheet.getRange(i,  6).setValue(dead_line);
}