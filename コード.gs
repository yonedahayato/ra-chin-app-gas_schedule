function doGet(e) {
  var schedule_number = Number(e.parameter.schedule_number);
  Logger.log("schedule_number: "+schedule_number)

  if (schedule_number != -1){ 
    var data = SpreadsheetApp.getActiveSheet().getRange(schedule_number+1, 1, schedule_number+1, 6).getValues();
    Logger.log("data:" + data)
    
    var output_list = {}
    for(i=1;i<4;i++){
      output_list["候補日"+i] = Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd')
      Logger.log(Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd'));
    }
    output_list["締切日"] = Utilities.formatDate(data[0][5], 'Asia/Tokyo', 'yyyy/MM/dd')
  }

  if (!e.parameter.detail){                 // json形式でresponsee
    payload = JSON.stringify(output_list)
    var output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(payload);
    return output
  } else if(e.parameter.detail=="-1") {     // google site へリダイレクト
    update_Date(schedule_number)
    var to_site = HtmlService.createTemplateFromFile("to_site");
    return to_site.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
  } else {                                  // schedule 入力画面のresponse
    if (schedule_number == -1){
      var last_edit_number = calculate_LastEditNumber()
      Logger.log("last_edit_number: " + last_edit_number)
      var data = SpreadsheetApp.getActiveSheet().getRange(last_edit_number+1, 1, last_edit_number+1, 6).getValues();
      Logger.log("data(schedule_number == -1):" + data)
      
      var output_list = {};
      for(i=1;i<4;i++){
        output_list["候補日"+i] = Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd')
        Logger.log(Utilities.formatDate(data[0][i+1], 'Asia/Tokyo', 'yyyy/MM/dd'));
      }
      output_list["締切日"] = Utilities.formatDate(data[0][5], 'Asia/Tokyo', 'yyyy/MM/dd')
    }
    
    var plan_info = get_plan_info(last_edit_number);

    var ditail = HtmlService.createTemplateFromFile("schedule_form");
    //ditail.schedule_number = schedule_number;
    ditail.last_edit_number = last_edit_number;
    ditail.output_list = output_list;
    ditail.plan_name = plan_info["plan_name"]
    return ditail.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }
}

function doPost(e) {
  var schedule_number = e.parameter.schedule_number;
  var candidate_date1 = e.parameter.candidate_date1;
  var candidate_date2 = e.parameter.candidate_date2;
  var candidate_date3 = e.parameter.candidate_date3;
  var dead_line = e.parameter.dead_line;
  
  Logger.log("schedule_number: "+schedule_number);
  Logger.log("candidate_date1: "+candidate_date1);
  Logger.log("candidate_date2: "+candidate_date2);
  Logger.log("candidate_date3: "+candidate_date3);
  Logger.log("dead_line: "+dead_line)

  set_Schedule(schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line)
  update_Schedule(schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line)
  
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
  datasheet.getRange(i,  7).setValue(now)
}

function update_Schedule(schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line) {
  var now = new Date();
  var schedule_number = Number(schedule_number)
  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('data');
  var insert_data = [["スケジュール"+schedule_number, "企画"+schedule_number, candidate_date1, candidate_date2, candidate_date3, dead_line, now]];
  
  var cols = insert_data[0].length;
  Logger.log("cols: "+cols);
  Logger.log(schedule_number+1);
  
  //datasheet.insertRows(schedule_number+1, cols)
  datasheet.getRange(schedule_number+1,1,1,cols).setValues(insert_data)
}

function update_Date(schedule_number) {
  var now = new Date();
  var schedule_number = Number(schedule_number)
  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('data');
  datasheet.getRange(schedule_number+1, 8).setValue(now)
}

function getSelectListFromMasterSS() {
  var selectList = [];

  // マスタデータシートを取得
  var datasheet = SpreadsheetApp.openById('1E2VMlYvO-8XFrT9nI7xKI5TNWTvUlJtuOavnwtoO-FI').getSheetByName('user_master');
  // B列2行目のデータからB列の最終行までを取得 
  var lastRow = datasheet.getRange("B:B").getValues().filter(String).length - 1;
  Logger.log("lastRow = %s", lastRow);
  // B列2行目のデータからB列の最終行までを1列だけ取得 
  selectList = datasheet.getRange(2, 2, lastRow, 1).getValues();
  Logger.log("selectList = %s", selectList); 

  return {data: selectList};
}

function calculate_LastEditNumber(){
  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('data')
  var indicateRow = datasheet.getLastRow() + 1;

  var data = datasheet.getRange(2, 1, indicateRow-1-1, 9).getValues();
  //var data = datasheet.getRange(2, 1, 1, 8).getValues();
  var sorted_data = ArrayLib.sort(data, 8-1, false)
  Logger.log("[calculate_LastEditNumber] : "+sorted_data)
  var LastEditNumber = sorted_data[0][8];
  return LastEditNumber
}

function get_plan_info(plan_number) {
  var output = {};
  // 計画
  var datasheet_plan = SpreadsheetApp.openById('1E2VMlYvO-8XFrT9nI7xKI5TNWTvUlJtuOavnwtoO-FI').getSheetByName('data');
  output["plan_name"] = datasheet_plan.getRange(plan_number+1, 2).getValue()
  
  // スケジュール
  var datasheet_schedule = SpreadsheetApp.openById("1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo").getSheetByName('data');
  var candidate_date1 = datasheet_schedule.getRange(plan_number+1, 3).getValue();
  var candidate_date2 = datasheet_schedule.getRange(plan_number+1, 4).getValue();
  var candidate_date3 = datasheet_schedule.getRange(plan_number+1, 5).getValue();
  
  output["candidate_date1"] = Utilities.formatDate(candidate_date1, 'Asia/Tokyo', 'yyyy/MM/dd')
  output["candidate_date2"] = Utilities.formatDate(candidate_date2, 'Asia/Tokyo', 'yyyy/MM/dd')
  output["candidate_date3"] = Utilities.formatDate(candidate_date3, 'Asia/Tokyo', 'yyyy/MM/dd')
  return output
}