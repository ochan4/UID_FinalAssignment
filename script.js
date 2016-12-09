myStorage = localStorage;
// function makeMap() {
//     var newMap = new Map();
//     var catagories = [];
//     var places = [];
// }
// function findPlaces(price, borough, activity) {
//     var places = [];
// }
//put the excel rows into javascript objects
function makeObjects() {
	var objects = [];
	reader.onload = function (e) {
		var data = e.target.result();
		var workbook = XLSX.read(data, {
			type: 'binary'
		});
		workbook.SheetNames.forEach(function (sheetName) {
			// Here is your object
			var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
			var json_object = JSON.stringify(XL_row_object);
			console.log(json_object);
		})
	};
};
var gMapAPIKey = 'AIzaSyDJ-F1rPoqgpPewazBEZPgJpFLrOv0c63c';

function makeNewElement(className) {
	var newDiv = document.createElement('div');
	newDiv.class = className;
};
/**************************************************************************/
/**
 * Get results from form. Ping Ashley for clarification! 
 */
var numResults; // keep track of how many results on page
function processForm() {
	numResults = 0;
	var form = document.getElementById("search-form");
	var address = form.address.value;
	if (address == "") {
		address = "Columbia University";
	}
	var cost = document.getElementById("cost");
	var onlyFree = cost.options[cost.selectedIndex].value;
	var activityType = document.getElementById("activity-type");
	var selectedType = activityType.options[activityType.selectedIndex].text;
	var borough = document.getElementById("borough");
	var selectedBorough = borough.options[borough.selectedIndex].text;
	myStorage.setItem('address', address);
	myStorage.setItem('only-free', onlyFree);
	myStorage.setItem('activity-type', selectedType);
	myStorage.setItem('borough', selectedBorough);
	window.location.href = "results.html";
	return false; // prevent reload of index.html
};

function displayResults() {
	var address = myStorage.getItem('address');
	var onlyFree = myStorage.getItem('only-free');
	var atype = myStorage.getItem('activity-type');
	var borough = myStorage.getItem('borough');
	var criteriaCost;
	if (onlyFree == "true") {
		criteriaCost = "Free Activities Only";
	}
	else {
		criteriaCost = "Discounted & Free Activities"
	}
	document.getElementById("form-criteria").innerHTML = "Get directions from: " + address + "<br>" + atype + ", " + borough + ", " + criteriaCost;
	if (atype == 'Arts & Entertainment') {
		showPlaces(arts, onlyFree, borough);
	}
	else if (atype == 'Food') {}
	else if (atype == 'Shopping') {}
	else { // else we want it all
		showPlaces(arts, onlyFree, borough);
		// 		showPlaces(food, onlyFree, borough);		-- commented out since we don't have these maps yet 
		//		showPlaces(shopping, onlyFree, borough);		
	}
	return false; // prevent reload
}

function showPlaces(map, onlyFree, borough) {
	if (onlyFree == "false" && borough == "Anywhere") { // showing discounted + free results in any borough
		for (var key in map) {
			getPlaceDetails(key);
		}
	}
	else if (onlyFree == "true" && borough == "Anywhere") { // showing only free results in any borough
		for (var key in map) {
			var val = map[key];
			if (val["free"] == onlyFree) {
				getPlaceDetails(key);
			}
		}
	}
	else if (onlyFree == "false" && borough != "Anywhere") { // showing discounted + free results in a single borough
		for (var key in map) {
			var val = map[key];
			if (val["borough"] == borough) {
				getPlaceDetails(key);
			}
		}
	}
	else { // showing only free results in a single borough
		for (var key in map) {
			var val = map[key];
			if (val["borough"] == borough && val["free"] == onlyFree) {
				getPlaceDetails(key);
			}
		}
	}
	return false; // prevent reload
}

function getPlaceDetails(placeId) {
	var request = {
		placeId: placeId
	};
	service = new google.maps.places.PlacesService(document.createElement('div'));
	service.getDetails(request, appendPlaceToResults);
}

function appendPlaceToResults(place, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		var node = document.getElementById("results");
		var newDiv = document.createElement('div');
		var photoUrl = "http://cdn1-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-2.jpg"; // @TODO: change to a more appropriate no image available placeholder
		if(place.photos[0] !== "undefined") { // make sure a photo is available
			photoUrl = place.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 500});
		}
		newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item')
		/*
			note to meeee: probably going to have append new modal w/ all the real info here: use global numResults variable to keep track of modals i.e. portfolioModal + "numResults"
		*/
		newDiv.innerHTML = "<a href='#portfolioModal1' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p class='text-muted'>something should go here i guess</p></div>";
		node.appendChild(newDiv);
	}
}

var arts = {}; // create test hashmap
arts['ChIJKxDbe_lYwokRVf__s8CPn-o'] = { // keyed by Google Places ID
	free: "true"
	, borough: "Manhattan"
};
arts['ChIJUZ0c7MpYwokRh8SiMzCXL98'] = {
	free: "true"
	, borough: "Queens"
};
arts['ChIJsXqcyjy5woARNz6sOh0ZmwA'] = { 
	free: "false"
	, borough: "Queens"
};
/*document.getElementById("results").appendChild("<div class='col-md-4 col-sm-6 portfolio-item'> <a href='#portfolioModal1' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='img/portfolio/roundicons.png' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>Round Icons</h4><p class='text-muted'>Graphic Design</p></div></div>");*/