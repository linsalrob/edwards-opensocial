/**
 * metagenomics.js
 * By: Daniel Cuevas, Rob Edwards Bioinformatics Lab, San Diego State University
 * 
 * OpenSocial application
 * Display results from the info passed into the cgi database.
 * CGI website: http://edwards.sdsu.edu/cgi-bin/cell_phone_metagenomes.cgi
 */


var url = "http://edwards.sdsu.edu/cgi-bin/cell_phone_metagenomes.cgi";
var mPhoneNumber, mNumber, mTitle, mJSON;
var postData;
var choice = {"ALLTITLES":0, "TITLE":1};
var params = {};
params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;

/**
 * Startup function. Set up form.
 */ 
function init() {
	
//	alert("Begin\nNow!");
	setInterval("gadgets.window.adjustHeight();", 1000);
		
	document.getElementById('prompt').innerHTML = "<h4>Enter information</h4>";
	document.getElementById('main').innerHTML = "";
	document.getElementById('results').innerHTML = "";
	document.getElementById('errors').innerHTML = "";
	
	//Create all form fields
	var html = [];
	html.push("<form name='myForm' id='myForm'>" +
			"Phone Number: &nbsp; <input type='text' name='phoneNumber' size='10' /> <p />" +
			"Number of sample: &nbsp; <input type='text' name='number' size='20' /> <p /> " +
			"Title of metagenome: &nbsp; <input type='text' name='title' size='20' /> <p />" +
			"<input type='reset' name='rbutton' value='Reset Fields' /></form>");
	document.getElementById('main').innerHTML = html.join("");
	
	html = [];
	html.push("<a href='#' id='jfield' onclick='JSONField(); return true;'>Show JSONObject field</a><p />");
	document.getElementById('hidejson').innerHTML = html.join("");
	
	html = [];
	html.push("<a href='#' id='jfield' onclick='JSONField(); return true;'>Hide JSONObject field</a><p />" +
			"<h4>Enter JSON object</h4><p /><textarea cols='100%' rows='15' name='jsonObj'></textarea><p />" +
			"<input type='button' onclick='saveJSON();' value='Save JSON Object' />" +
			"&nbsp;<input type='button' onclick='clearJSONField();' value='Clear JSON field' />");
	document.getElementById('showjson').innerHTML = html.join("");
	
	html = [];
	html.push("<input type='button' onclick='fetchAllTitles();' value='Get all titles' />" +
			"<input type='button' onclick='fetchTitle();' value='Get title' />" +
			"<input type='button' onclick='fetchJSONObj();' value='Get JSON object' />");
	document.getElementById('buttons').innerHTML = html.join("");
	
/*	
	html = [];
	html.push("<p /><input type='button' onclick='clearResults();' value='Clear Results' /><p />" +
			"<table border='1' id='rtab' class='sortable'><thead><tr><th>Function</th><th>Value</th></tr></thead><tbody>" +
			"</tbody><tfoot></tfoot></table>");
	document.getElementById('restab').innerHTML = html.join("");
*/
}

/**
 * Store the JSON object into database.
 * Must supply a phone number, title, and the JSON object.
 */
function saveJSON() {
	
	mPhoneNumber = document.getElementsByName('phoneNumber')[0].value;
	mTitle = document.getElementsByName('title')[0].value;
	mJSON = document.getElementsByName('jsonObj')[0].value;
	document.getElementById('results').innerHTML = "";
	document.getElementById('errors').innerHTML = "";
	
	mPhoneNumber = trim(mPhoneNumber);
	mTitle = trim(mTitle);
	mJSON = trim(mJSON);
	
	if( mPhoneNumber == "" || mTitle == "" || mJSON == "" ) {
		document.getElementById('errors').innerHTML = "You must enter in a phone number, title, and JSON object.";
		return;
	}
	postData = {
			phoneNumber : mPhoneNumber,
			title : mTitle,
			jsonObject : mJSON,
			put : "Save this JSON Object"
	};
	
	postData = gadgets.io.encodeValues(postData);
	params[gadgets.io.RequestParameters.POST_DATA] = postData;
	gadgets.io.makeRequest(url, saveJSONResults, params);
}

/**
 * Retrieve all objects stored at supplied phone number.
 * Must supply phone number.
 */
function fetchAllTitles() {
	
	mPhoneNumber = document.getElementsByName('phoneNumber')[0].value;
	document.getElementById('results').innerHTML = "";
	document.getElementById('errors').innerHTML = "";
	
	mPhoneNumber = trim(mPhoneNumber);
	
	if( mPhoneNumber == "" ) {
		document.getElementById('errors').innerHTML = "You must enter in a phone number.";
		return;
	}
	
	postData = {
			phoneNumber : mPhoneNumber,
			get : "allTitles"
	};
	
	postData = gadgets.io.encodeValues(postData);
	params[gadgets.io.RequestParameters.POST_DATA] = postData;
	gadgets.io.makeRequest(url, allTitlesResults, params);	
}

/**
 * Retrieve the title of the numbered object.
 * Must supply the phone number and number of the object.
 */
function fetchTitle() {
	
	mPhoneNumber = document.getElementsByName('phoneNumber')[0].value;
	mNumber = document.getElementsByName('number')[0].value;
	document.getElementById('results').innerHTML = "";
	document.getElementById('errors').innerHTML = "";
	
	mPhoneNumber = trim(mPhoneNumber);
	mNumber = trim(mNumber);
	
	if( mPhoneNumber == "" || mNumber == "" ) {
		document.getElementById('errors').innerHTML = "You must enter in a phone number and number.";
		return;
	}
	
	postData = {
			phoneNumber : mPhoneNumber,
			count : mNumber,
			get : "title"
	};
	
	postData = gadgets.io.encodeValues(postData);
	params[gadgets.io.RequestParameters.POST_DATA] = postData;
	gadgets.io.makeRequest(url, titleResults, params);
}

/**
 * Retrieve the data of the given object.
 * Must supply the phone number and title.
 */
function fetchJSONObj() {
	
	mPhoneNumber = document.getElementsByName('phoneNumber')[0].value;
	mNumber = document.getElementsByName('number')[0].value;
	document.getElementById('results').innerHTML = "";
	document.getElementById('errors').innerHTML = "";
	
	mPhoneNumber = trim(mPhoneNumber);
	mNumber = trim(mNumber);
	
	if( mPhoneNumber == "" || mNumber == "" ) {
		document.getElementById('errors').innerHTML = "You must enter in a phone number and number.";
		return;
	}
	
	postData = {
		phoneNumber : mPhoneNumber,
		count : mNumber,
		get : "jsonObject"
	};
	
	postData = gadgets.io.encodeValues(postData);
	params[gadgets.io.RequestParameters.POST_DATA] = postData;
	gadgets.io.makeRequest(url, JSONResults, params);
}

/**
 * Call back function for saveJSON().
 * After a successful storage of the object, alert user of the ID#.
 */
function saveJSONResults(obj) {
	
	if( obj != null) {
		var json = gadgets.json.parse(obj.text);
		if( json )
			for( key in json ) alert("Object added!\nID = " + json[key]);
		else
			document.getElementById('errors').innerHTML = "ERROR: JSON object was not stored in server. Please try again.";
	}
	else
		document.getElementById('errors').innerHTML = "ERROR: Problem connecting with server. Return value is null.";
}

/**
 * Call back function for fetchAllTitles().
 * Create a drop down list of all titles stored.
 */
function allTitlesResults(obj) {
	
	if( obj != null ) {
		var json = gadgets.json.parse(obj.text);
		var html = [];
		if( json ) {
			
			html.push("<h5>Choose a title</h5><p /><form><select name='choice'>");
			for( key in json ) {
				html.push("<option value='"+key+"' />"+json[key]+"</option>");
			}
			html.push("<input type='button' onclick='title2json("+choice.ALLTITLES+");' value='Submit' /></form>");
			document.getElementById('results').innerHTML = html.join("");
		}
		else
			document.getElementById('errors').innerHTML = "Sorry, there is no data stored in this phone number.<br />" +
					"Be sure the phone number has been entered correctly.";
	}
	else
		document.getElementById('errors').innerHTML = "ERROR: Problem connecting with server. Return value is null.";
}

/**
 * Call back function for fetchTitle().
 * Display the title and a choice to retrieve the data table.
 */
function titleResults(obj) {
	
	if( obj != null ) {
		var json = gadgets.json.parse(obj.text);
		mTitle = json["title"];
		
		if( mTitle != null ) {
			document.getElementById('results').innerHTML = "<p />Title : " + json["title"] +
					"&nbsp; <input type='button' onclick='title2json("+choice.TITLE+");' value='Get JSON object?' />";
		}
		else
			document.getElementById('errors').innerHTML = "Sorry, there is no title at number " + mNumber + ".";
	}
	else
		document.getElementById('errors').innerHTML = "ERROR: Problem connecting with server. Return value is null.";
}

/**
 * Call back function for fetchJSONObj().
 * Create a table and fill with the JSON object data.
 */
function JSONResults(obj) {
	
	if( obj != null ) {
		var json = gadgets.json.parse(obj.text);
/*		
 		if( json ) {
			var table = document.getElementById('rtab'); //Might need .innerHTML
			restabField();
			
			for( key in json ) {
				var numRows = table.rows.length;
				var newRow = table.insertRow(numRows);
				
				var cell1 = newRow.insertCell(0);
				var textNode = document.createTextNode(key);
				cell1.appendChild(textNode);
				
				var cell2 = newRow.insertCell(1);
				textNode = document.createTextNode(json[key]);
				cell2.appendChild(textNode);
			}
		}
*/
		
		if( json ) {
			var html = [];
			
			html.push("<p /><input type='button' onclick='clearResults();' value='Clear Results' /><p />" +
					"<h1>Results</h1><p />" +
					"<table border='1' id='rtab' class='sortable'><thead><tr><th>Function</th><th>Value</th></tr></thead><tbody>");
			for( key in json ) {
				html.push("<tr><td>" + key + "</td><td>" + json[key] + "</td></tr>");
			}
			html.push("</tbody><tfoot></tfoot></table>");
			
			document.getElementById('restab').innerHTML = html.join("");
		}
		else
			document.getElementById('errors').innerHTML = "Sorry, there is no object stored at this phone number and/or number.<br />" +
					"Be sure the phone number and/or number has been entered correctly.";
	}
	else
		document.getElementById('errors').innerHTML = "ERROR: Problem connecting with server. Return value is null.";
}

/**
 * Used by allTitleResults() and titleResults() functions.
 * Calls the JSONResults() call back function
 * to display the data.
 */
function title2json(num) {
	
	if( num == choice.ALLTITLES )
		mNumber = document.getElementsByName('choice')[0].value;
	else if( num == choice.TITLE )
		document.getElementById('results').innerHTML = "";
		
	postData = {
			phoneNumber : mPhoneNumber,
			count : mNumber,
			get : "jsonObject"
	};
	
	postData = gadgets.io.encodeValues(postData);
	params[gadgets.io.RequestParameters.POST_DATA] = postData;
	gadgets.io.makeRequest(url, JSONResults, params);
}

/**
 * Hide/Show the JSON field. Use with CSS.
 */
function JSONField() {
	
	var id1 = document.getElementById('hidejson').style;
	var id2 = document.getElementById('showjson').style;
	if( !id1.display ) 
		id1.display = "block";
	if( !id2.display ) 
		id2.display = "none";

	id1.display = (id1.display == "none" ? "block" : "none");
	id2.display = (id2.display == "none" ? "block" : "none");
}

/*
function restabField() {
	
	var obj = document.getElementById('restab').style;
	obj.display = (obj.display == "none" ? "block" : "none");
}
*/

/**
 * Regex when error checking form fields.
 * Eliminates white space.
 */
function trim(obj) {
	
	return obj.replace(/^\s*|\s*$/,"")
}

function clearResults() {
	
	var ans = confirm("Are you sure you want to clear your results?");
	if( ans == true ) {
		document.getElementById('results').innerHTML = "";
		document.getElementById('restab').innerHTML = "";
		document.getElementById('errors').innerHTML = "";
//		clearRestab();
	}
}

function clearJSONField() {
	
	document.getElementsByName('jsonObj')[0].value = "";
	mJSON = "";
}

/*
function clearRestab() {
	
	restabField();
	var table = document.getElementById('rtab'); //Might not need .innerHTML
	var numRows = table.rows.length;
	while( numRows > 2 ) {
		table.deleteRow(--numRows);
	}
}
*/
