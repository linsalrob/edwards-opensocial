/*
 * Metagenomics.js
 * Create a form to imitate and implement Rob Edwards' Real-Time Metagenomics site
*/

var url = "http://bioseed.mcs.anl.gov/~redwards/FIG/RTMg_cellphone.cgi";
//var url = "http://bioseed.mcs.anl.gov/~redwards/FIG/RTMg_josh.cgi";
var params;
//var params = {};
//params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
//params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
var http_request;

function init() {
	
	setInterval("gadgets.window.adjustHeight();", 1000);

	document.getElementById('prompt').innerHTML = "<h4>Choose a fasta file to upload</h4>";
	document.getElementById('main').innerHTML = "Creating form...";
	document.getElementById('results').innerHTML = '';
	document.getElementById('error').innerHTML = '';
	
	var html = [];
	html.push("<form name='uploadForm' id='uploadForm' action='javascript:createRequest();'>" +
			"File: &nbsp; <input type='file' name='uploadedFile' size='30' /> <p />" +
			"Stringency: &nbsp; <select name='stringency'>" +
			"<option value='1'>1</option>" +
			"<option value='2'>2</option>" +
			"<option value='3'>3</option>" +
			"<option value='4'>4</option>" +
			"</select> <p />" +
			"Level: &nbsp; <select name='level'>" +
			"<option value='0'>Function</option>" +
			"<option value='1'>Subsystems</option>" +
			"<option value='2'>One Level Hierarchy</option>" +
			"<option value='3'>Two Level Hierarchy</option>" +
			"<option value='4'>Three Level Hierarchy</option>" +
			"<option value='5'>OTUs</option>" +
			"</select> <p />" +
			"<input type='submit' name='sbutton' value='Upload' /><input type='reset' name='rbutton' /></form>" +
			"<input type='button' onclick='showParams();' value='Test: Show Entered Data Values' />");
	
	document.getElementById('main').innerHTML = html.join('');
}

// An OpenSocial-HttpRequest that sends the form data to the server
// and receives the JSON string with the keys "max" and "url"
function createRequest() {
	
	var uploadedFile = document.getElementsByName('uploadedFile')[0].value;
	var stringency = document.getElementsByName('stringency')[0].value;
	var level = document.getElementsByName('level')[0].value;
	alert("Variables set");
	
	http_request = null;
	httpRequest();
	if (http_request == null) {
		alert("Cannot create an XMLHTTP instance. Browser does not support!");
		return;
	}
	
	http_request.onreadystatechange = getFileContents;
	http_request.open('GET', uploadedFile, true);
	http_request.send(null);
	
	
	
	
//	**** OpenSocial Method ****
//	var request = {
//			uploadedfile : uploadedFile,
//			stringency : stringency,
//			level : level,
//			submit : "Upload"
//	};
//	request = gadgets.io.encodeValues(request);
//	params[gadgets.io.RequestParameters.POST_DATA] = request;
//	gadgets.io.makeRequest(url, getJSON, params);
	
}

function getJSON(obj) {
	if (obj != null) {
		alert(obj);
		alert(obj.text);
		var json = gadgets.json.parse(obj.text);
		alert(json);
		var myUrl = json["url"];
		alert(myUrl);
	}
}

function httpRequest() {
	if (window.XMLHttpRequest)
	  {
	  // code for IE7+, Firefox, Chrome, Opera, Safari
	  xmlhttp=new XMLHttpRequest();
	  }
	else (window.ActiveXObject)
	  {
	  // code for IE6, IE5
	  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
}

function getFileContents() {
	if (http_request.readyState == 4) {
		if (http_request.status == 200) {
			alert(http_request.responseText);
		}
	}
}

// Test function to show data in input fields of form
function showParams() {
	
	var uploadedFile = document.getElementsByName('uploadedFile')[0].value;
	var stringency = document.getElementsByName('stringency')[0].value;
	var level = document.getElementsByName('level')[0].value;
	
	document.getElementById('results').innerHTML = "Filename = " + uploadedFile + "<br />" +
													"Stringency = " + stringency + "<br />" + 
													"Level = " + level;
}