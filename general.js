function getSearchParameters()
{
	var prmstr = window.location.search.substr(1);
	return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr )
{
	var params = {};
	var prmarr = prmstr.split("&");
	for ( var i = 0; i < prmarr.length; i++)
	{
		var tmparr = prmarr[i].split("=");
		params[tmparr[0]] = tmparr[1];
	}
	return params;
}


function httpGet(url, callback)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, true); // False for synchronous reqeust
	xmlHttp.onreadystatechange = function(){callback(xmlHttp);};
	xmlHttp.send();
}

function getTimeDiff(startdate, enddate){
	var miliseconds = enddate.getTime() - startdate.getTime();
	var seconds = miliseconds / 1000;
	var minutes = seconds/60;
	var hours = minutes / 60;
	var days = hours / 24;
	return Math.floor(days)+"d "+Math.floor(hours%24)+"h";
}

function updateRelay(relay){
	var titleobj = document.getElementById("nickname");
	titleobj.textContent = relay['nickname'];
	var countryobj = document.getElementById("country");
	countryobj.textContent = relay['country_name'];
	var runningobj = document.getElementById("running");
	runningobj.textContent = relay['running'];
	var bandwidthobj = document.getElementById("bandwidth");
	bandwidthobj.textContent = Math.floor((relay['advertised_bandwidth'])/1000)+"kB";
	var contactobj = document.getElementById("contact");
	contactobj.textContent = relay['contact'];
	var detailslinkobj = document.getElementById("detailslink");
	detailslinkobj.href = "http://globe.torproject.org/#/relay/"+relay.fingerprint

	// Get age
	var datestr = relay['first_seen'].split(' ')[0];
	var timestr = relay['first_seen'].split(' ')[1];
	var created = new Date(datestr+"T"+timestr);
	var current = new Date();
	var age = getTimeDiff(created, current);
	// Set age
	var ageobj = document.getElementById("age");
	ageobj.textContent = age;
	
	// Get relay uptime	
	var datestr = relay['last_restarted'].split(' ')[0];
	var timestr = relay['last_restarted'].split(' ')[1];
	var restarted = new Date(datestr+"T"+timestr);
	var current = new Date();
	var uptime = getTimeDiff(restarted, current);
	// Set uptime
	var uptimeobj = document.getElementById("uptime");
	uptimeobj.textContent = uptime;
}

function getApiUrl(){
	proto = document.location.protocol;
	if (proto == "file:")
		proto = "http:";
	url = proto + "//onionoo.torproject.org/";
	console.log(url);
	return url;
}


function getRelay(fingerprint, callback){
	url = getApiUrl()+"details?fingerprint="+fingerprint;
	response = httpGet(url, function(res){
		if (res.readyState == 4){
			if (res.status != 200){
				console.error("Http request error: " + res.status);
			}
			var relay = JSON.parse(res.response)['relays'][0];
			callback(relay);
		}
	});
}

window.onload = function(){
	var params = getSearchParameters();
	if (params.fingerprint == undefined){
		var titleobj = document.getElementById("nickname");
		titleobj.textContent = "No fingerprint specified";
	}
	else {
		getRelay(params.fingerprint, updateRelay);
	}
}
