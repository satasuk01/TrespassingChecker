function play() {
    var startDate = document.getElementById("startDate").value;
    var startTime = document.getElementById("startTime").value;
    var convert_begin = new Date(Date.parse(startDate + "T" + startTime + ":00"));
    var endDate = document.getElementById("endDate").value;
    var endTime = document.getElementById("endTime").value;
    var convert_end = new Date(Date.parse(endDate + "T" + endTime + ":00"));
    var duration = document.getElementById("duration").value;
    //console.log(startDate,startTime,endDate,endTime,duration);
    //console.log(convert_end.getHours(),convert_end.getDate());
    var request = new XMLHttpRequest();
    request.open('GET', 'https://api.netpie.io/feed/PassLog?apikey=LtCJboFxMtB05t0q5xHKe2KElS3rYVoO&since=12days', true);
    request.onload = function () {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        console.log(request.status);
        if (request.status >= 200 && request.status < 400) {
            myjson = data;
            console.log(data)
            var summary = document.getElementById("PassingSummary");
            summary.innerHTML = "Passing Summary";
            var summary = document.getElementById("summaryTable");
            summary.innerHTML = genSummaryTable(convert_begin, convert_end, duration);
            var log = document.getElementById("PassingLog");
            log.innerHTML = "Passing log";
            var log = document.getElementById("logTable");
            log.innerHTML = getLogTable(convert_begin, convert_end);
        } else {
            var error = document.getElementById("error");
            error.innerHTML = 'ERROR';
        }
    }
    request.send();
}

var myjson = {};
var temp = 5;

function tstoTime(timestamp) {
    var d = new Date(timestamp);
    var formattedDate = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
    var hours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours(); //If it is 1 digit, fill 0 in its front. ex. 9 -> 09.
    var minutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
    var seconds = (d.getSeconds() < 10) ? "0" + d.getSeconds() : d.getSeconds();
    var formattedTime = hours + ":" + minutes + ":" + seconds;

    formattedDate = formattedDate + " " + formattedTime;
    return formattedDate;
}

function dtCompare(dateTime1, dateTime2)
{
    var dts1 = Date.parse(dateTime1);
    var dts2 = Date.parse(dateTime2);
    if(dts1 < dts2) return -1;
    if(dts1 > dts2) return 1;
    return 0;
}

function genSummaryTable(dateStart, dateEnd, blockDuration)
{
    var headerRow = '';
    var headers = '';
    var valueRows = '';
    var valueRow = '';
    var values = '';
    var table = '';
    headers += '<th>Time</th><th>Total Passes</th>';
    headerRow = '<tr>' + headers + '</tr>';
    var blockStart = new Date(dateStart);  
    var blockEnd = new Date(dateStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + parseInt(blockDuration));
    //console.log(blockStart, blockEnd);
    var count, temp_date;
    var i = 0;
    while(1)
    {
       //onsole.log(dtCompare(blockStart, dateEnd));
       //console.log(blockStart, blockEnd);
       if(dtCompare(blockStart, dateEnd) >= 0) break; 
       if(dtCompare(blockEnd, dateEnd) == 1) blockEnd = Date(dateEnd); 
       //if(i == myjson.data[0].values.length) break;
       //console.log(blockStart, blockEnd);
       count = 0;
       while(1)
       {
          if(i == myjson.data[0].values.length) break;
          temp_date = new Date(myjson.data[0].values[i][0]);
          console.log(temp_date, blockEnd);
          if(dtCompare(temp_date, blockEnd) == 1) break; //TBM
          if(dtCompare(temp_date, blockStart) >= 0) count++;
          i++;
       }
       //console.log(count);
       if(count != 0)
       {
          values = '';
          values+= '<td><center>' + tstoTime(blockStart) + " - " + tstoTime(blockEnd) + '</center></td>';  //TBM
          values+= '<td><center>' + count + '</center></td>';
          valueRow = '<tr>'+ values + '</tr>';  //one value row
          valueRows = valueRows + valueRow; //all value rows
       }
       blockStart.setMinutes(blockStart.getMinutes() + parseInt(blockDuration));
       //console.log(blockEnd.getMinutes() + parseInt(blockDuration)); 
       blockEnd.setMinutes(blockEnd.getMinutes() + parseInt(blockDuration));
       //console.log(blockStart, blockEnd);
    } 
    table = '<table>' + headerRow + valueRows + '</table>';
    return table;
}

function checkTime(timestamp, dateStart, dateEnd) {
    var d = new Date(timestamp);
    // if(st.getDate()<=d.getDate() && d.getDate()<=et.getDate() && d.getMonth()+1==12 && d.getFullYear()==2018)
    if(dtCompare(d, dateStart) < 0) return false;
    if(dtCompare(d, dateEnd) >= 0) return false;
    return true;
    //return true;
    //return false;
}

function getLogTable(dateStart, dateEnd) //generating html code of json data 
{
    var headerRow = '';
    var headers = '';
    var valueRows = '';
    var valueRow = '';
    var values = '';
    var table = '';
    headers += '<th>Time</th><th>Pass Duration (Seconds)</th>';
    headerRow = '<tr>' + headers + '</tr>';
    for(i=0; i < myjson.data[0].values.length; i++)
    {
        values = '';
        //console.log(myjson.data[0].values[i][0], dateStart, dateEnd);
        if(checkTime(myjson.data[0].values[i][0], dateStart, dateEnd))
        {
        values+= '<td><center>' + tstoTime(myjson.data[0].values[i][0]) + '</center></td>';  //timestamp
        for(j=0; j < myjson.data.length; j++)
        {
            values+= '<td><center>' + myjson.data[j].values[i][1] + '</center></td>';  //values entry
        }
        valueRow = '<tr>'+ values + '</tr>';  //one value row
        valueRows = valueRows + valueRow; //all value rows
        }
    }
    table = '<table>' + headerRow + valueRows + '</table>';
    return table;
}