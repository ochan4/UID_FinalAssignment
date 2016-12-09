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
var numResults = 0; // keep track of how many results on page
var numSaved = 0; // keep track of how many saved things we've displayed 
var savedPlaces = JSON.parse(myStorage.getItem('saved-places')); // saved places array
//var savedPlaces = [];
function initSavedPlaces() {
	if (JSON.parse(myStorage.getItem('saved-places')) == "") {
		savedPlaces = [];
		myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
		noSavedPlaces(); // @TODO: show some message saying to get started 
	}
	else {
		//savedPlaces = [];
		savedPlaces = JSON.parse(myStorage.getItem('saved-places'));
		displaySavedPlaces(); // @TODO: display list of places 
	}
	
		//	savedPlaces = [];
			//myStorage.setItem("saved-places", JSON.stringify(savedPlaces));
			//alert(JSON.parse(myStorage.getItem("saved-places")));
			//displaySavedPlaces(); // @TODO: display list of places 


}

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
		// 		showPlaces(food, onlyFree, borough);		-- commented out since we don't have these lists yet 
		//		showPlaces(shopping, onlyFree, borough);		
	}
	return false; // prevent reload
}

function showPlaces(list, onlyFree, borough) {
	if (onlyFree == "false" && borough == "Anywhere") { // showing discounted + free results in any borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			getPlaceDetails(cur["id"]);
		}
	}
	else if (onlyFree == "true" && borough == "Anywhere") { // showing only free results in any borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["free"] == onlyFree) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else if (onlyFree == "false" && borough != "Anywhere") { // showing discounted + free results in a single borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["borough"] == borough) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else { // showing only free results in a single borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["borough"] == borough && cur["free"] == onlyFree) {
				getPlaceDetails(cur["id"]);
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
		numResults++;
		var results = document.getElementById("results");
		var newDiv = document.createElement('div');
		newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item')
		var photoUrl = "http://cdn1-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-2.jpg"; // @TODO: change to a more appropriate no image available placeholder
		if (place.photos[0] !== "undefined") { // make sure a photo is available
			photoUrl = place.photos[0].getUrl({
				'maxWidth' : 1000,
				'maxHeight': 1000
			});
		}
		newDiv.innerHTML = "<a href='#resultModal" + numResults + "' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p class='text-muted'>Rating: " + place.rating + "</p></div>";
		var resultModals = document.getElementById("resultModals");
		var newModal = document.createElement('div');
		var placeId = JSON.stringify(place.place_id);

		newModal.setAttribute('class', 'portfolio-modal modal fade');
		newModal.setAttribute('id', 'resultModal' + numResults);
		newModal.setAttribute('tabindex', '-1');
		newModal.setAttribute('role', 'portfolio-modal modal fade');
		newModal.setAttribute('aria-hidden', 'true');
		var ratingDiv = "<div class='col-lg-6' id ='rating'>Average rating: " + place.rating + " / 5.0</div>";
        var discountDiv = "<div class='col-lg-6' id='discount'><span class='alert alert-success'>Discount: X%</span></div>";
        var photoDiv = "<div class='col-lg-6' id='photo'><img src='" + photoUrl +  "'>   </div>";
        var placeInfoDiv = "<div class='col-lg-6' id='placeInfo'> <span class='glyphicon glyphicon-map-marker'></span><span class='infoText'>" + place.vicinity + "</span><br><span class='glyphicon glyphicon-link'></span><span class='infoText'><a href=" + place.url + ">Google Page</a></span><br><span class='glyphicon glyphicon-earphone'></span><span class='infoText'>" + place.formatted_phone_number + "</span></div>";
        var hoursDiv = "<div class='col-lg-6' id='hoursDiv'> <h6 id='hoursTitle'>Hours</h6>" + place.opening_hours.weekday_text[0] + "<br>" + place.opening_hours.weekday_text[1] + "<br>" + place.opening_hours.weekday_text[2] + "<br>" + place.opening_hours.weekday_text[3] + "<br>" + place.opening_hours.weekday_text[4] + "<br>" + place.opening_hours.weekday_text[5] + "<br>" + place.opening_hours.weekday_text[6] + "</div>";
		
		var buttonText;
		var buttonFunc;
		
		if(isSaved(place.place_id)) {
			buttonText = "Remove from Saved";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "Add to Saved";
			buttonFunc = "addToSaved";
		}
		/****
		@TODO: get discount val from hashmap, keyed by placeid
		
		*****/
		
		newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2>" + ratingDiv + discountDiv + "<br> <button type='button' id='saved-button' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + ")'>" + buttonText + "</button><br>" + photoDiv + placeInfoDiv + hoursDiv + "<iframe width='700' height='400' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + myStorage.getItem('address') + "&destination=" + place.formatted_address + "&avoid=tolls|highways' allowfullscreen> </iframe> <br> <button type='button' class='btn btn-primary' data-dismiss='modal'><i class='fa fa-times'></i> Close Window</button> </div> </div> </div> </div> </div> </div>";
		results.appendChild(newDiv);
		resultModals.appendChild(newModal);
	}
}

function isSaved(placeId) {
	var parsed = JSON.parse(myStorage.getItem('saved-places'));
	if(_.indexOf(parsed, placeId) > -1) {
		return true;
	}
	return false;

}

function addToSaved(placeId) {
	savedPlaces.push(placeId);
	myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
	var parsed = JSON.parse(myStorage.getItem('saved-places'));
	alert("Succesfully added this location to your saved list!");	
	//alert(_.without(parsed, 1));  use underscore.js so that we can remove items from the saved list, not built into plain javascript
	return false;
}

function removeFromSaved(placeId) {
	var origSaved = JSON.parse(myStorage.getItem('saved-places'));
	var updatedSaved = _.without(origSaved, placeId);
	savedPlaces = updatedSaved;
	myStorage.setItem('saved-places', JSON.stringify(updatedSaved));
	alert("Succesfully removed this location to your saved list!");
	return false; // @TODO: implement me!
}

function noSavedPlaces() {
	return false;
}

function displaySavedPlaces() {
	var toDisplay = JSON.parse(myStorage.getItem('saved-places'));
	for (var i = 0; i < toDisplay.length; i++) {
		getSavedDetails(toDisplay[i]);
	}
}

function getSavedDetails(placeId) {
	var request = {
		placeId: placeId
	};
	service = new google.maps.places.PlacesService(document.createElement('div'));
	service.getDetails(request, appendPlaceToSaved);
}

function appendPlaceToSaved(place, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		numSaved++;
		var saved = document.getElementById("saved-places");
		var newDiv = document.createElement('div');
		newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item')
		var photoUrl = "http://cdn1-www.dogtime.com/assets/uploads/gallery/30-impossibly-cute-puppies/impossibly-cute-puppy-2.jpg"; // @TODO: change to a more appropriate no image available placeholder
		if (place.photos[0] !== "undefined") { // make sure a photo is available
			photoUrl = place.photos[0].getUrl({
				'maxWidth': 500
				, 'maxHeight': 500
			});
		}
		newDiv.innerHTML = "<a href='#savedModal" + numSaved +"' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p class='text-muted'>Rating: " + place.rating + "</p></div>";
		
		var savedModals = document.getElementById("saved-modals");
		var newModal = document.createElement('div');
		var placeId = JSON.stringify(place.place_id);
		newModal.setAttribute('class', 'portfolio-modal modal fade');
		newModal.setAttribute('id', 'savedModal' + numSaved);
		newModal.setAttribute('tabindex', '-1');
		newModal.setAttribute('role', 'portfolio-modal modal fade');
		newModal.setAttribute('aria-hidden', 'true');
		
		
		
		var buttonText;
		var buttonFunc;
		
		if(isSaved(place.place_id)) {
			buttonText = "Remove from Saved";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "Add to Saved";
			buttonFunc = "addToSaved";
		}
		
		/****
		@TODO: get discount val from hashmap, keyed by placeid
		
		*****/
		newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2> <p class='item-intro text-muted'>Lorem ipsum dolor sit amet consectetur.</p> <img class='img-responsive img-centered' src='' alt=''> <button type='button' id='saved-button' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + ")'>" + buttonText + "</button> <br><br> <p>Use this area to describe your project. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est blanditiis dolorem culpa incidunt minus dignissimos deserunt repellat aperiam quasi sunt officia expedita beatae cupiditate, maiores repudiandae, nostrum, reiciendis facere nemo!</p> <p> <strong>Want these icons in this portfolio item sample?</strong>You can download 60 of them for free, courtesy of <a href='https://getdpd.com/cart/hoplink/18076?referrer=bvbo4kax5k8ogc'>RoundIcons.com</a>, or you can purchase the 1500 icon set <a href='https://getdpd.com/cart/hoplink/18076?referrer=bvbo4kax5k8ogc'>here</a>.</p> <ul class='list-inline'> <li>Date: July 2014</li> <li>Client: Round Icons</li> <li>Category: Graphic Design</li> </ul> <iframe width='450' height='250' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + myStorage.getItem('address') + "&destination=" + place.formatted_address + "&avoid=tolls|highways' allowfullscreen> </iframe> <br> <button type='button' class='btn btn-primary' data-dismiss='modal'><i class='fa fa-times'></i> Close Project</button> </div> </div> </div> </div> </div> </div>";
		saved.appendChild(newDiv);
		savedModals.appendChild(newModal);
	}
}

var arts = []; // create test list
arts.push({
	id: 'ChIJKxDbe_lYwokRVf__s8CPn-o'
	, free: "true"
	, borough: "Manhattan"
});
arts.push({
	id: 'ChIJUZ0c7MpYwokRh8SiMzCXL98'
	, free: "true"
	, borough: "Queens"
});
arts.push({
	id: 'ChIJsXqcyjy5woARNz6sOh0ZmwA'
	, free: "false"
	, borough: "Queens"
});