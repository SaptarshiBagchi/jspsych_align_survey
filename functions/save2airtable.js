/* 
Need a Netlify function only to hide the Airtable auth key, 
otherwise could have done it from frontend.
*/

var Airtable = require('airtable');


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async event => {
  var APIKEY = process.env.AIRTABLE_AUTH_TOKEN;
  var base = await new Airtable({apiKey: APIKEY}).base('appatSmYTxmCmbTYM'); 
  var table = await base('survey_data');

  if (event.httpMethod !== 'POST') {
    return {
        statusCode: 501,
        body: 'GET IS NOT ALLOWED HERE',
        headers: {'content-type': 'application/json;charset=utf8', 'Allow': 'POST'}
    }
  }

  if (event.body) {
    var body = JSON.parse(event.body);    
}

  var dateObject = new Date(Date.now());
  var date = dateObject.getDate();
  var month = dateObject.getMonth() + 1;
  var year = dateObject.getFullYear();
  var hours = dateObject.getHours();
  var minutes = dateObject.getMinutes();
  var seconds = dateObject.getSeconds();

  // prints date & time in YYYY-MM-DD format
  var datetime = `${year}_${month}_${date}_${hours}_${minutes}_${seconds}`;

  var newData = [{
      "fields": {
        "PROLIFIC_PID": body.PROLIFIC_PID,
        "PROLIFIC_STUDY_ID": body.PROLIFIC_STUDY_ID,
        "PROLIFIC_SESSION_ID": body.PROLIFIC_SESSION_ID,
        "jspsych_data_all": body.jspsych_data_all,
        "jspsych_pID": body.jspsych_pid,
        "datetime": datetime,
      }}];

  //console.log(newData);

  await table.create(newData, {typecast: true}, function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
    records.forEach(function (record) {
      console.log("Airtable record " + record.getId() + " created");
    });
  });


  // weird hack: sleeping ensures the API call finishes and data gets written, otherwise Netlify kills the process too soon
  await sleep(800); // milliseconds
  

  // todo : return the airtable id if success or return error code
  return {
    statusCode: 200,
    body: "OK"  
  }

}