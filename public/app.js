
var oReq = new XMLHttpRequest();
function reqListener () {
   // console.log(this.responseText);
}

function onSignIn(event){
  console.log(event.Zi.access_token)

  var token = event.Zi.access_token;
  oReq.addEventListener("load", reqListener);
  var url = "/events";
  var params = `key=${token}`;
  oReq.open("POST", url, true);

  //Send the proper header information along with the request
  oReq.setRequestHeader("Content-Type",'application/x-www-form-urlencoded');
  // oReq.setRequestHeader("Content-length", params.length);
  // oReq.setRequestHeader("Connection", "close");

  oReq.onreadystatechange = function() {//Call a function when the state changes.
    if(oReq.readyState == 4 && oReq.status == 200) {
      console.log(oReq.responseText);
    }
  }

  oReq.send(params);
};