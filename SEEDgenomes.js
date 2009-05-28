/*
 * GenomeQuery.js
 * Rob Edwards
 * May 25th, 2009. 
 *
 * An example code to search the SEED and retrieve data. You can share searches with others.
 * Also demonstrates using persistent data for state and for sharing information with friends.
 *
 */


/*
 * Globally scoped variables we will call
 */

var genomenames, searchTerm, genome;
var lastGenome;
var lastSearchTerm = "Enter a search term";
var allsearches = {};

/*
 * Variables for the webservices
 */

var url = "http://bioseed.mcs.anl.gov/~redwards/FIG/rest_seed.cgi";
var params = {};
params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;

/* 
 * Variables for the friends section
 */

var friendParams = {};
friendParams[opensocial.IdSpec.Field.USER_ID] = opensocial.IdSpec.PersonId.VIEWER;
friendParams[opensocial.IdSpec.Field.GROUP_ID] = 'FRIENDS';

var friendNames = {};




function init() 
{
	// document.getElementById('friendViewer').innerHTML = "<button onclick='fetchPeople();'>Fetch my friends</button>";
	document.getElementById('friendViewer').innerHTML = "<button onclick='friendSearches();'>See my friends searches</button>";	
	displayGenomesHtml();
	getLastSearch();
	setInterval("gadgets.window.adjustHeight();", 1000); // this is the best way to ensure that the window changes height all the time. It will repeatedly do it.
	getAllSearches();
};


function displayGenomesHtml() {      

	document.getElementById('genomes').innerHTML = "Getting all genomes from the SEED";

	// get all the genomes      
	var myurl = url + "/genomes/complete/undef/Bacteria";
	gadgets.io.makeRequest(myurl, genomeSelectList, params);
}



function genomeSelectList(obj) {

	var json = JSON.parse(obj.text);
	genomenames = json.result;
	var html = [];
	html.push("<select id='genome'>");


	for (g in json.result)
		if (g == lastGenome)
			html.push('<option selected value="', g, '">', json.result[g], '</option>');
		else 
			html.push('<option value="', g, '">', json.result[g], '</option>');
	html.push("</select>");

	document.getElementById('genomes').innerHTML = html.join('');
};


function showSearch() {
	var html = [];
	var query="";
	document.getElementById('errors').innerHTML = '';
	document.getElementById('caughtErrors').innerHTML = '';
	document.getElementById('searchBox').innerHTML = '';
	document.getElementById('results').innerHTML = '';
	try {
		html.push("<input type='text' size='25' id='searchTerm' onSubmit='searchGenome()' value='" + lastSearchTerm + "' />");

	}
	catch (e) {
		document.getElementById('caughtErrors').innerHTML = "showSearch : caught error: " + e.printStackTrace();
		html.push("<input type='text' size='25' id='searchTerm' onSubmit='searchGenome()' />");
	}
	html.push("	<button onclick='searchGenome();'>Search that genome</button>");
	html.push("<br />Enter a term to search and press enter");
	document.getElementById('searchBox').innerHTML = html.join('');
};


function searchGenome() {
	searchTerm = document.getElementById('searchTerm').value;
	genome = document.getElementById('genome').value;
	setLastSearch(genome, searchTerm);
	document.getElementById('searchBox').innerHTML = "Searching for " + searchTerm + " in " + genomenames[genome];

	var myurl = url + "/search_genome/" + genome + "/" + searchTerm;

	// document.getElementById('results').innerHTML = "url : " + myurl;

	try {
		document.getElementById('searchBox').innerHTML = "Making Request for " + searchTerm + " in " + genomenames[genome];
		gadgets.io.makeRequest(myurl, searchResults, params);
	}
	catch(e) {
		document.getElementById('caughtErrors').innerHTML = "Sorry, there was a network error while fetching your request: " + e.printStackTrace();
	}
}

function searchResults(obj) {
	document.getElementById('searchBox').innerHTML = "Parsing results";
	var json;
	try {  
		json = JSON.parse(obj.text);
	} 
	catch(e) {
		document.getElementById('caughtErrors').innerHTML = "Sorry, there was an error parsing the text. " + obj,text;
	}

	var html = [];
	
	html.push('<span id="savethissearchbuttonspan"><input type="button" value="Save this search for my friends" id="savethissearchbutton" \
		onclick="addCommentBox();" /></span>');

	html.push("<table>");
	var done=0;
	for (r in json.result) {
		html.push('<tr><td><a href="http://www.theseed.org/linkin.cgi?id=' + r + '">' + r + '</a>');
		html.push('</td><td>' + json.result[r] + '</td></tr>');
		done=1;
	}

	if (done == 0)
		html.push("<tr><td>Sorry, there were no results searching for " + searchTerm + " in " + genomenames[genome]);

	html.push("</table>");
	// make the user switch to canvas view, in case they are not

	document.getElementById('searchBox').innerHTML = "Done";
	document.getElementById('results').innerHTML = html.join('');
}

function addCommentBox() {
	document.getElementById('searchBox').innerHTML = '<p>Please enter a comment on this search:</p><textarea id="searchComment" rows=5 cols=20></textarea>';
	document.getElementById('savethissearchbuttonspan').innerHTML = '<input type="button" value="Save with comment" id="savethissearchbutton" \
		onclick="saveSearches();" />';

}


function json2genomes(obj)
{
	var json = JSON.parse(obj.text);
	var html = [];
	html.push("The real result is ");
	for (var r in json.result) 
		html.push("result: " + r + "<p />");
	var place = 'genomes';
	document.getElementById('genomes').innerHTML = html.join('');
};

/*
 * Functions to store and retrieve search information
 */


function setLastSearch(lastGenome, lastSearchTerm) {
	var req = opensocial.newDataRequest();
	req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'lastGenome', lastGenome));
	req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'lastSearchTerm', lastSearchTerm));
	req.send(function(response) {
			if (response.hadError()) {
				document.getElementById('errors').innerHTML += "There was an error saving the genome id";
			} 
	});
}

function getLastSearch() {

	try {
		var req = opensocial.newDataRequest();
		var idspec = opensocial.newIdSpec({'userId':'VIEWER', 'groupId':'SELF'});
		req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
		req.add(req.newFetchPersonAppDataRequest(idspec,  'lastGenome'), 'lastGenome');
		req.add(req.newFetchPersonAppDataRequest(idspec,  'lastSearchTerm'), 'lastSearchTerm');
		req.send(getLastSearchResponse);
	}
	catch(err) {
		document.getElementById('caughtErrors').innerHTML = "getGenome : caught error : " + err;
	}
};


function getLastSearchResponse(resp) {
	var viewer = resp.get('viewer').getData();
	var lastGenomeObj = resp.get('lastGenome').getData();
	var lastSearchTermObj = resp.get('lastSearchTerm').getData();


	var genomeData = lastGenomeObj[viewer.getId()];
	var searchData = lastSearchTermObj[viewer.getId()];
	if (viewer && searchData && genomeData) {
		var searchHtml=[];
		var genomeHtml=[];
		lastSearchTerm = searchData['lastSearchTerm'];
		lastGenome = genomeData['lastGenome'];
		genomeHtml.push("<select id='genome'>");

		// set the genome list
		for (g in genomenames) {
			if (g == lastGenome)
				genomeHtml.push('<option selected value="', g, '">', genomenames[g], '</option>');
			else 
				genomeHtml.push('<option value="', g, '">', genomenames[g], '</option>');
		}
		genomeHtml.push("</select>");
		document.getElementById('genomes').innerHTML = genomeHtml.join('');	

		// set the search term -- I decided to leave this until you click the button - it would be good to test 
		// whether id=searchTerm has some content
		// searchHtml.push("<input type='text' size='25' id='searchTerm' onSubmit='searchGenome()' value='" + lastSearchTerm + "' />");
		// searchHtml.push("	<button onclick='searchGenome();'>Search that genome</button>");
		// searchHtml.push("<br />Enter a term to search and press enter");
		// document.getElementById('searchBox').innerHTML = searchHtml.join('');
	}
};

/*
 * Functions that get all your searches and share them with friends 
 * 
 */


function saveSearches() {
	if (!genome && !searchTerm) {
		document.getElementById('errors')="No genome or search term";
		return;
	}
	allsearches[genome]=[searchTerm, document.getElementById('searchComment').value];
	var req = opensocial.newDataRequest();
	req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, 'allsearches', JSON.stringify(allsearches)));
	req.send(function(response) {
			if (response.hadError()) {
				document.getElementById('errors').innerHTML += "There was an error saving the genome id";
			} 
	});
	//document.getElementById('savethissearchbutton').value = "Saved!";
	document.getElementById('savethissearchbuttonspan').innerHTML="<b>Saved!</b>";

}

function getAllSearches() {

	try {
		var req = opensocial.newDataRequest();
		var idspec = opensocial.newIdSpec({'userId':'VIEWER', 'groupId':'SELF'});
		req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');
		req.add(req.newFetchPersonAppDataRequest(idspec,  'allsearches'), 'allsearches');
		req.send(getAllSearchesResponse);
	}
	catch(err) {
		document.getElementById('caughtErrors').innerHTML = "getGenome : caught error : " + err;
	}
};


function getAllSearchesResponse(resp) {
	var viewer = resp.get('viewer').getData();
	var searchObj = resp.get('allsearches').getData();

	var searchData = JSON.parse(searchObj[viewer.getId()]);
	if (viewer && searchData)
		for (genome in searchData) {
			allsearches[genome] = searchData[genome];
		}
};

/*
 * Friends. 
 *
 * This section deals with getting data from your friends, and sharing data with your friends
 *
 */

function fetchPeople() {
	document.getElementById('friendViewer').innerHTML = "Getting friends";
	var req = opensocial.newDataRequest();
	req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'friendViewer');
	var idSpec = opensocial.newIdSpec(friendParams);
	req.add(req.newFetchPeopleRequest(idSpec), 'friends');
	req.send(function(data) {
		var friendViewer = data.get('friendViewer').getData();
		var html = [];
		html.push("<select onChange='shareSearch();' id='friendsToShare'>", "<option value='null'>Choose a friend...</option>");
		var friends = data.get('friends').getData();
		document.getElementById('friends').innerHTML = '';
		friends.each(function(friend) {
			friendNames[friend.getId()] = friend.getDisplayName();
			html.push('<option value="', friend.getId(), '">', friend.getDisplayName(), '</option>');
		});
		html.push('</select>');
		document.getElementById('friendViewer').innerHTML = "Choose one of your friends to share the search with:";
		document.getElementById('friends').innerHTML = html.join('');
		gadgets.window.adjustHeight();
	});
};



function shareSearch() {
	var selected = document.getElementById('friendsToShare').selectedIndex;
	var friend = document.getElementById('friendsToShare').options[selected].value;
	var friendname = document.getElementById('friendsToShare').options[selected].text;
	// var searchTerm = document.getElementById('searchTerm').value;
	var genome = document.getElementById('genome').value;
	document.getElementById('errors').innerHTML = "Got friend: " + friendname + " (" + friend +")" ;

	var idspec = opensocial.newIdSpec({'userId':friend, 'groupId':'FRIENDS'});
	var req = opensocial.newDataRequest();
	req.add(req.newUpdatePersonAppDataRequest(idspec, 'sharedgenome', genome), 'set_data');
	req.send(function(response) {
			if (response.hadError()) {
				document.getElementById('errors').innerHTML = "There was an error saving the genome id";
			}
			// else {
			// document.getElementById('errors').innerHTML = "Saving genome as " + genome + " Succeededxx!";
			// }
	});
};



function friendSearches() {
	document.getElementById('friendViewer').innerHTML = '';
	var req = opensocial.newDataRequest();
	req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'friendViewer');
	var idSpec = opensocial.newIdSpec(friendParams);
	req.add(req.newFetchPeopleRequest(idSpec), 'friends');
	req.send(function(data) {
			var friendViewer = data.get('friendViewer').getData();
			var friends = data.get('friends').getData();
			friends.each(function(friend) {
			friendNames[friend.getId()] = friend.getDisplayName();
			try {
				var req = opensocial.newDataRequest();
				var idSpecVF = opensocial.newIdSpec({ "userId" : "VIEWER", "groupId" : "FRIENDS" });
				req.add(req.newFetchPersonAppDataRequest(idSpecVF,  'allsearches'), 'searchdata');
				req.send(getFriendsGenomeResponse);
			}
			catch(err) {
				document.getElementById('caughtErrors').innerHTML = "getGenome : caught error : " + err;
			}
			document.getElementById('friendsSearches').innerHTML += "<ul>";
		});
	});
}


function getFriendsGenomeResponse(resp) {
        var dataResp = resp.get('searchdata');
	
	var html=[];
	if (!dataResp.hadError()) {
		var data = dataResp.getData();
		if (data != null) {
			for (user in data) {
					var searchObj=data[user]['allsearches'];
					searchObj=gadgets.util.unescapeString(searchObj);
					searchObj=JSON.parse(searchObj);
					html.push(friendNames[user] + " searched for:<ul>");

					for (genome in searchObj) {
						html.push("<li>'" + searchObj[genome][0] + "' in <i>" + genomenames[genome] + "</i></li>");
						html.push("<div id=comment>" + searchObj[genome][1] + "</div>");
					}
					html.push("</ul>");
			}
		}
	}
	document.getElementById('friendViewer').innerHTML = html.join(''); 

	
};


