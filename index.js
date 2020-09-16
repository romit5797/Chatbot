const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json'); //use your service account json file
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');

const port = 5000;
const sessionId = uuid.v4();
const userData = []
const userData2 = []

app.use(bodyParser.urlencoded({
	extended:false
}));


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "UseYourOwnUrl.firebaseio.com" //use your own databaseUrl
});

var db = admin.database();  
var ref = db.ref("Bookings/Details");

var dx = new Date();

//2020-09-16T17:00:00+06:00
var j = schedule.scheduleJob('*/1 * * * *', function(){
  if(userData.length == 8){
    if(userData[7] == "time"){
      var timeDifference = calculateTimeDifference(dx.getFullYear(), dx.getMonth(), dx.getDay(), dx.getHours(), dx.getMinutes(),time.substring(0, 4), time.substring(5, 7), time.substring(8, 10), time.substring(11, 13),time.substring(14, 16));
      if(timeDifference == 45){
    sendScheduledEmail();
  }
  
    }
  }
  if(userData.length == 9){
  
  var timeDifference = calculateTimeDifference(dx.getFullYear(), dx.getMonth(), dx.getDay(), dx.getHours(), dx.getMinutes(),time.substring(0, 4), time.substring(5, 7), time.substring(8, 10), time.substring(11, 13),time.substring(14, 16));
  if(timeDifference == 45){
    sendScheduledEmail();
  }
  }
  
  console.log('Working around the clock for you..');
});

function calculateTimeDifference(year1,month1,date1,hour1,min1,year2,month2,date2,hour2,min2){
  if(year1 == year2 && month1 == month2 && date1 == date2){
    timeDifference = (((hour2*60)+min2) - ((hour1*60)+min1));
    return timeDifference;
  }
}

function sendScheduledEmail(){
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sender@gmail.com',
      pass: 'password'
    }
  });
  
  var mailOptions = {
    from: 'sender@gmail.com',
    to: 'recevier@gmail.com',
    subject: 'Service update',
    text: 'Stephen is on the way to take their dog for a walk.'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function calculatePrice(time){
  //If age of dog is below 5 years then $10 per hour for all breeds except German Shepherd

var Price = 0;
var d = new Date();
var currentTime = d.getHours();
var bookingTime = time.substring(11, 13);

  if(parseInt(bookingTime) - parseInt(currentTime) < 3){
      Price = Price + 30;
    }
  
  if(parseInt(userData2[1]) <= 5 && userData2[0] != "German Shepherd"){
    Price = 10*userData2[3];
  }
  if(parseInt(userData2[1]) > 5 && userData2[0] != "German Shepherd"){
    Price = 15*userData2[3];
  }
  if(userData2[7] == "monthy"){
    Price = Price - (Price*0.1);
  }
  if(userData2[7] == "bi-weekly"){
    Price = Price - (Price*0.15);
  }
  if(userData2[7] == "weekly"){
    Price = Price - (Price*0.2);
  }

  return Price;

}


function ReadData(){

ref.on("value",function (snapshot) {
  snapshot.forEach(function (childSnapshot){
    var data = childSnapshot.val();
    console.log(data.name);
  });
});

}

function writeUserData() {

breed = userData2[0];
age = userData2[1];
date = userData2[2];
duration = userData2[3];
email = userData2[4];
name = userData2[5];
contact = userData2[6];
if(userData[7] == "recurrence"){
  recurrence = userData2[7];
  time = userData2[8];
  price = calculatePrice(time);
}
else{
  recurrence = "none";
  time = userData2[7];
  price = calculatePrice(time);
}

const messageRef = admin.database().ref('Bookings').child('Details')
messageRef.push({breed,age,date,duration,email,name,contact,recurrence,time,price})

}

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
  });

app.post('/send-msg',(req,res)=>{
  
	runSample(req.body.MSG).then(data=>{
		res.send({Reply:data})
  })
});


/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg,projectId = 'Your-Project-File-ID') {
  // A unique identifier for the given session

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({
      keyFilename:"yourCredFile.json" //use your own dialogflow service account json file
  });
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: msg,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  console.log(result.parameters.fields)
  //console.log(result.parameters.fields.Breed.stringValue)
  if((Object.keys(result.parameters.fields).length)>0){
    paramlist = Object.keys(result.parameters.fields);
    for (x in paramlist) {
      userData.push(paramlist[x]);

      if(x+1 == userData.length){
        userData2.push(result.parameters.fields[userData[x]].stringValue);
      }
      else{
        var len = parseInt(userData.length) - 1;
        userData2.push(result.parameters.fields[userData[len]].stringValue);
      }
      
     
    // userData2.push(userData[x]);
    }
    for(y in userData) {
      for(z in userData){
        if(userData[z]>userData[y]){
          var temp = userData[y];
          userData[y] = userData[z];
          userData[z] = temp;

          var temp2 = userData2[y];
          userData2[y] = userData2[z];
          userData2[z] = temp2;
        }

      }
    }
    //userData.sort();
    console.log(userData);
    console.log(userData2);
    //console.log(result.parameters.fields[userData[0]].stringValue)
  }
  console.log(userData.length)  
  
  if(userData.length == 9){
    
    writeUserData();
  }
  if(userData.length == 8){
    console.log(userData[7]);
    if(userData[7] == "time"){
     
      writeUserData();
      
    }
  }
  console.log(Object.keys(result.parameters.fields).length)
  if(result.fulfillmentText == "Thank you.You're booking is now complete."){
    if(userData2.length == 8){
      var TotalPrice = calculatePrice(userData2[7]);
      return("Thank you.You're booking is now complete.Total pricing is $"+TotalPrice);
    }
    else if(userData2.length == 9){
      var TotalPrice = calculatePrice(userData2[8]);
      return("Thank you.You're booking is now complete.Total pricing is $"+TotalPrice);
    }
    
   
  }
  else{
    return result.fulfillmentText;
  }
  
  
}

app.listen(port,()=>{
	console.log("Running on port :"+port);
});