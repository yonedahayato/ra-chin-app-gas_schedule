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
  var deadline = e.parameter.deadline;
  
  Lo
}