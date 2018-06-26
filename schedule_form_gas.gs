function registerSSByFormData(data) {

  Logger.log("data = %s", data);

  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('ditail_input');
  var now = new Date();
  var now_str = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  var i = datasheet.getLastRow() + 1;
  datasheet.getRange(i,  1).setValue(data[ 0]); // user_name

  datasheet.getRange(i,  2).setValue(data[ 1]); // day1_good
  datasheet.getRange(i,  3).setValue(data[ 2]); // day1_soso
  datasheet.getRange(i,  4).setValue(data[ 3]); // day1_bad
  
  datasheet.getRange(i,  5).setValue(data[ 4]); // day2_good
  datasheet.getRange(i,  6).setValue(data[ 5]); // day2_soso
  datasheet.getRange(i,  7).setValue(data[ 6]); // day2_bad

  datasheet.getRange(i,  8).setValue(data[ 7]); // day3_good
  datasheet.getRange(i,  9).setValue(data[ 8]); // day3_soso
  datasheet.getRange(i,  10).setValue(data[ 9]); // day3_bad

  datasheet.getRange(i, 11).setValue(now_str);
  datasheet.getRange(i, 12).setValue(data[10]); // plan number
  
  var status = "";
  for (j=0;j<3;j++) {
    status += check_GoodBad(data[j*3+1], data[j*3+2], data[j*3+3]);
    if (j<2) {
      status += "-"
    }
  }
  Logger.log("[status]: "+status)
  
  datasheet.getRange(i, 13).setValue(status); // status

  result = true;
  
  var plan_info = get_plan_info(Number(data[10]));

  // lineへの通知
  Logger.log("plan_name: "+plan_info["plan_name"])
  post_SendLine(data[0], data[10], plan_info["plan_name"], plan_info["candidate_date1"], plan_info["candidate_date2"], plan_info["candidate_date3"], status)
  // user_name, plan_number, plan_name, candidate_date1, candidate_date2, candidate_date3, status
  Logger.log("finish to send line")
  
  update_schedule_ditail(data[10], status, data[0])
  //plan_number, status, user_name
  
  return {data: true};
}

function check_GoodBad(good, soso, bad) {
  if (good){
    var status = "2";
  } else if (soso) {
    var status = "1";
  } else if (bad) {
    var status = "0";
  } else {
    var status = "0";
  }
  return status
}

function update_schedule_ditail(plan_number, status, user_name) {
  var datasheet = SpreadsheetApp.openById('1B9Jj7-LUafTe1_rlI3U2nM2v9Reh7RdgmmE9Pf8_rxo').getSheetByName('ditail_data');
  plan_number = Number(plan_number)
  Logger.log(plan_number+1);
  
  var user_number = get_user_number(user_name);
  datasheet.getRange(plan_number+1, user_number+2).setValue(status)
}

function get_user_number(user_name) {
  var datasheet = SpreadsheetApp.openById('1E2VMlYvO-8XFrT9nI7xKI5TNWTvUlJtuOavnwtoO-FI').getSheetByName('user_master');
  // B列2行目のデータからB列の最終行までを取得 
  var lastRow = datasheet.getRange("B:B").getValues().filter(String).length - 1;
  // B列2行目のデータからB列の最終行までを1列だけ取得
  var selectList = [];
  selectList = datasheet.getRange(2, 2, lastRow, 1).getValues();
  
  for(i=0;i<selectList.length;i++) {
    if (selectList[i] == user_name){
      var user_number = i;
      return user_number
    }
  }
  var user_number = -1;
  return user_number
}

function post_SendLine(user_name, plan_number, plan_name, candidate_date1, candidate_date2, candidate_date3, status){
  var url = "https://script.google.com/macros/s/AKfycbyYF9YMvMyRi4BIIVlDo68vNKWqgaZCUedOJvob8qkrI2M-FQs/exec"

  var payload = {
    "user_name" : user_name,
    "plan_name" : plan_name,
    "plan_number": plan_number,
    "candidate_date1" : candidate_date1,
    "candidate_date2" : candidate_date2,
    "candidate_date3" : candidate_date3,
    "status": status,
    "message_type": "schedule"
  };

  var options = {
    "method" : "POST",
    "payload" : payload
  };
  Logger.log("start_fetch")
  var response = UrlFetchApp.fetch(url, options);
  Logger.log("[post_SendLine]: response: "+response)
}