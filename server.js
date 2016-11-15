var express = require('express');
var path = require('path');
var bodyparser = require('body-parser');
var readline = require('readline');
var app = express();
const pug = require('pug');
var request = require('request');
var cheerio = require('cheerio');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var fs = require('fs');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var SCOPES = ['https://www.googleapis.com/auth/calendar'];

var holder={};

var str = '{ "name": "John Doe", "age": 42 }';
console.log("str",str)
var obj = JSON.parse(str);
console.log("obj",obj)

//set template engine to use Pug
app.use(express.static('./public'));
app.use(bodyparser.urlencoded({extended:true}));
app.set('view engine','pug');
//tell express where our template files live
app.set('views','./templates');

var port = process.env.PORT || 3000;

var listing = [];

var objlisting = {};
objlisting.listing = listing;

//app.get is using express to get a request then response to render to template


app.get('/', (req,res) => {
  res.render("login");
});

var key = {};

app.post('/events',(req,res)=>{
  console.log("req",req.body);
  key = req.body;
  console.log("KEEEEY", key);
})


app.get('/events',(req,res)=>{
  // console.log('app##########.get req',res);

  // console.log('app.get res', res)
  var url ="http://www.honolulumagazine.com/Calendar/";
  //request is using npm
  request(url,function(err,resp,html){
    var $ = cheerio.load(html);
    //ask ray why css isnt hooking up
    //need to loop through this so it will come out clean
    var body = $('body');
    var eventListing = body.find('.event-listing');
    eventListing.each(function (i, item) {
      // var $a = $(item).children('a')
      var companyName = $(item).find('.company');
      var companyNameText = companyName.text();
      var title =$(item).find('h2 ');
      var titleText=title.text();
      var location=$(item).find('.event-location ');
      var locationText=location.text();
      var date=$(item).find('.event-date ');
      var dateText=date.text();
      var summary =$(item).find('.event-desc ');
      var summaryText = summary.text();
      listing[i]={
        id: i,
        title : titleText,
        location : locationText,
        date : dateText,
        summary : summaryText
      };
    })
      // console.log(resp)

       // console.log(objlisting)
      res.render("index",objlisting);
  })

})

app.post('/events/:id',(req,res)=>{
  var i = req.params.id;
  var year = objlisting.listing[i].date;
  var day = objlisting.listing[i].date;
  year = year.slice(8,23);
  year = year.slice(0,4);
  day = day.slice(0,7);
  day = day.slice(4,6);
  var newToken = key.key;
  console.log('newToken',newToken)
  var event = {
  'summary': objlisting.listing[i].title,
  'location': objlisting.listing[i].location,
  'description': objlisting.listing[i].summary,
  'start': {
    'dateTime': `${year}-11-${day}T09:00:00-07:00`,
    'timeZone': 'America/Los_Angeles',
  },
  'end': {
    'dateTime': `${year}-11-${day}T09:00:00-07:00`,
    'timeZone': 'US/Hawaii',
  },
  'recurrence': [

    'RRULE:FREQ=DAILY;COUNT=2'

  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10},
    ],
  },
};

 var oauth2Client = new OAuth2(
  '86868105440-gtfdf40gfpm70cid8qj4n15cdtp1bkn0.apps.googleusercontent.com',
  '1psPZldBv_G-LUo_vKIZSIX8',
  'http://localhost:3000/oauthcallback'
);

// Retrieve tokens via token exchange explained above or set them:
oauth2Client.setCredentials({
  access_token: newToken,
  refresh_token: '1/vPEkwhFqXHxoDkPEoGEZ3SRTqCCnJTpAYFiZzrQ1h3k'
  // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
  // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)

});
calendar.events.insert({
  auth: oauth2Client,
  calendarId: 'primary',
  resource: event,
}, function(err, event) {
  if (err) {
    console.log("##########",calendar);
    console.log('There was an error contacting the Calendar service: ' + err);
    console.log('event',event)
    return;
  }
  console.log('Event created: %s', event.htmlLink);
})

})
app.listen(port);
console.log("server is listening on " + port);
