myStorage = localStorage;
var arts = [] ;
var foods = [];
var shoppings = [];
var allplaces = [];
var discountDictionary = {};

function splitCategory (){
	var masterlist = allplacesJSON['masterlist'];
	var discountArray = [];

	for(var i = 0; i < allplacesJSON['masterlist'].length; i++){
		
		var id = masterlist[i];

		if (id['category'] == "Arts & Entertainment") {
          arts.push({
            id: id['googleID']
            , free: id['boolFree']
            , borough: id['borough']
          });
        }

        if (id['category'] == "Shopping") {
          shoppings.push({
             id: id['googleID']
            , free: id['boolFree']
            , borough: id['borough']
          });
        }

        if (id['category'] == "Food") {
          foods.push({
             id: id['googleID']
            , free: id['boolFree']
            , borough: id['borough']
          });
        }

        allplaces.push({
            id: id['googleID']
            , free: id['boolFree']
            , borough: id['borough']
          });

        discountArray.push({
        	id: id['googleID'],
        	discount: id['discount']
        });

	}
    
    discountDictionaryFunction(discountArray);	//parse the array to dictionary
}

function discountDictionaryFunction(discountArray){
	for (var i = 0; i < discountArray.length; i++) {
		var id = discountArray[i].id;
		var discountAmount = discountArray[i].discount;

		discountDictionary[id]= discountAmount;
	}
}

/**************************************************************************/
/**
 * Get results from form. Ping Ashley for clarification! 
 */
var numResults = 0; // keep track of how many results on page
var numSaved = 0; // keep track of how many saved things we've displayed 
var savedPlaces = JSON.parse(myStorage.getItem('saved-places')); // saved places array

function initSavedPlaces() {
	if (JSON.parse(myStorage.getItem('saved-places')) == "") {
		savedPlaces = [];
		myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
		noSavedPlaces(); // @TODO: show some message saying to get started 
		document.getElementById('has-saved-places').style.display = "none";
		document.getElementById('no-saved-places').style.display = "block";
	}
	else {
		savedPlaces = JSON.parse(myStorage.getItem('saved-places'));
		splitCategory();
		document.getElementById('no-saved-places').style.display = "none";
		document.getElementById('has-saved-places').style.display = "block";
		displaySavedPlaces(); 
	}
}

function initResults() {
	//@TODO
}

function processForm() {

	numResults = 0;
	var form = document.getElementById("search-form");
	var address = form.address.value;
	if (address == "" || address == undefined) {
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
	document.getElementById("form-criteria").innerHTML = "Getting directions from: " + address + "<br>" + atype + ", " + borough + ", " + criteriaCost;
	
	splitCategory();

	if (atype == 'Arts & Entertainment') {
		showPlaces(arts, onlyFree, borough);
	}
	else if (atype == 'Food') {
		showPlaces(foods, onlyFree, borough);
	}
	else if (atype == 'Shopping') {
		showPlaces(shoppings, onlyFree, borough);

	}
	else { // else we want it all
		showPlaces(allplaces, onlyFree, borough);
	
	}
	return false; // prevent reload
}

function showPlaces(list, onlyFree, borough) {

	if (onlyFree != "free" && borough == "Anywhere") { // showing all + free results in any borough

		console.log("showing all + free results in any borough");
		for (var i = 0; i < list.length; i++) {
			console.log("Iteration Number: " + i);
			var cur = list[i];
			getPlaceDetails(cur["id"]);
		}
	}
	else if (onlyFree == "free" && borough == "Anywhere") { // showing only free results in any borough
		console.log("free stuff anywhere");

		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["free"] == onlyFree) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else if (onlyFree == "free" && borough != "Anywhere") { // showing only free + free results in a single borough
		console.log("free stuff in somewhere");

		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["borough"] == borough) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else if (onlyFree != "free" && borough != "Anywhere"){ // showing all + in a single borough
		for (var i = 0; i < list.length; i++) {
			console.log("showing all + in a single borough");
			var cur = list[i];
			if (cur["borough"] == borough) {
				 getPlaceDetails(cur["id"]);
			}
		}
	}
	return false; // prevent reload
}

function getPlaceDetails(placeId) {
	console.log("inside place details");
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
		newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item');
		newDiv.setAttribute('id', 'result' + numResults);
		var photoUrl = "https://www.masterworksfineart.com/wp-content/uploads/2015/09/not_available.png"; // @TODO: change to a more appropriate no image available placeholder
		if (place.photos !== undefined) {
			if (place.photos[0] !== undefined) { // make sure a photo is available
				photoUrl = place.photos[0].getUrl({
					'maxWidth': 1000
					, 'maxHeight': 1000
				});
			}
		}
		
		var rating;
		if (place.rating !== undefined) {
			ratingTxt = place.rating;
		}
		else {
			ratingTxt = "None available.";
		}
		
		newDiv.innerHTML = "<a href='#resultModal" + numResults + "' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p class='text-muted'>Rating: " + ratingTxt + "</p></div>";
		var resultModals = document.getElementById("resultModals");
		var newModal = document.createElement('div');
		var placeId = JSON.stringify(place.place_id);
		newModal.setAttribute('class', 'portfolio-modal modal fade');
		newModal.setAttribute('id', 'resultModal' + numResults);
		newModal.setAttribute('tabindex', '-1');
		newModal.setAttribute('role', 'portfolio-modal modal fade');
		newModal.setAttribute('aria-hidden', 'true');
		
		var ratingDiv;
		if (place.rating !== undefined) {
			ratingDiv = "<div class='col-lg-6' id ='rating'>Average rating: " + place.rating + " / 5.0</div>";
		}
		else {
			ratingDiv = "<div class='col-lg-6' id ='rating'>No rating available for this location.</div>";
		}
		
		
		var discountDiv = "<div class='col-lg-6' id='discount'><span class='alert alert-success'>Discount: " + discountDictionary[place.place_id] + "</span></div>";
		var photoDiv = "<div class='col-lg-6' id='photo'><img src='" + photoUrl + "'>   </div>";
		var placeInfoDiv = "<div class='col-lg-6' id='placeInfo'> <span class='glyphicon glyphicon-map-marker'></span><span class='infoText'>" + place.vicinity + "</span><br><span class='glyphicon glyphicon-link'></span><span class='infoText'><a href=" + place.url + " target='_blank'>Google Page</a></span><br><span class='glyphicon glyphicon-earphone'></span><span class='infoText'>" + place.formatted_phone_number + "</span></div>";
		var hoursDiv;
		if (place.opening_hours !== undefined && place.opening_hours.weekday_text !== undefined) {
			hoursDiv = "<div class='col-lg-6' id='hoursDiv'> <h6 id='hoursTitle'>Hours</h6>" + place.opening_hours.weekday_text[0] + "<br>" + place.opening_hours.weekday_text[1] + "<br>" + place.opening_hours.weekday_text[2] + "<br>" + place.opening_hours.weekday_text[3] + "<br>" + place.opening_hours.weekday_text[4] + "<br>" + place.opening_hours.weekday_text[5] + "<br>" + place.opening_hours.weekday_text[6] + "</div>";
		}
		else {
			hoursDiv = "<div class='col-lg-6' id='hoursDiv'> <h6 id='hoursTitle'>Hours</h6> Hours currently unavailable for this location.</div>";
		}
		var buttonText;
		var buttonFunc;
		if (isSaved(place.place_id)) {
			buttonText = "Remove from Saved";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "Add to Saved";
			buttonFunc = "addToSaved";
		}
		var fromAddress = encodeURIComponent(myStorage.getItem('address'));
		var toAddress = encodeURIComponent(place.formatted_address);
		
		var iframe = "<iframe width='700' height='400' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + fromAddress + "&destination=" + toAddress + "&avoid=tolls|highways&mode=transit' allowfullscreen> </iframe>";

		newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2>" + ratingDiv + discountDiv + "<br> <button type='button' id='saved-button' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + ")'>" + buttonText + "</button><br>" + photoDiv + placeInfoDiv + hoursDiv + "<br>" + iframe + "<br><br> <button type='button' class='btn btn-primary center-block' data-dismiss='modal'><i class='fa fa-times'></i> Close Window</button> </div> </div> </div> </div> </div> </div>";
		results.appendChild(newDiv);
		resultModals.appendChild(newModal);
	}
}

function isSaved(placeId) {
	var parsed = JSON.parse(myStorage.getItem('saved-places'));
	if (_.indexOf(parsed, placeId) > -1) {
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
		var photoUrl = "https://www.masterworksfineart.com/wp-content/uploads/2015/09/not_available.png"; // @TODO: change to a more appropriate no image available placeholder
		if (place.photos !== undefined) {
			if (place.photos[0] !== undefined) { // make sure a photo is available
				photoUrl = place.photos[0].getUrl({
					'maxWidth': 500
					, 'maxHeight': 500
				});
			}
		}	
		
		var rating;
		if (place.rating !== undefined) {
			ratingTxt = place.rating;
		}
		else {
			ratingTxt = "None available.";
		}		
		
		
		newDiv.innerHTML = "<a href='#savedModal" + numSaved + "' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p class='text-muted'>Rating: " + ratingTxt + "</p></div>";
		
		
		
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
		if (isSaved(place.place_id)) {
			buttonText = "Remove from Saved";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "Add to Saved";
			buttonFunc = "addToSaved";
		}

		var ratingDiv;
		if (place.rating !== undefined) {
			ratingDiv = "<div class='col-lg-6' id ='rating'>Average rating: " + place.rating + " / 5.0</div>";
		}
		else {
			ratingDiv = "<div class='col-lg-6' id ='rating'>No rating available for this location.</div>";
		}
		var discountDiv = "<div class='col-lg-6' id='discount'><span class='alert alert-success'>Discount: " + discountDictionary[place.place_id] + "</span></div>";
		var photoDiv = "<div class='col-lg-6' id='photo'><img src='" + photoUrl + "'>   </div>";
		var placeInfoDiv = "<div class='col-lg-6' id='placeInfo'> <span class='glyphicon glyphicon-map-marker'></span><span class='infoText'>" + place.vicinity + "</span><br><span class='glyphicon glyphicon-link'></span><span class='infoText'><a href=" + place.url + " target='_blank'>Google Page</a></span><br><span class='glyphicon glyphicon-earphone'></span><span class='infoText'>" + place.formatted_phone_number + "</span></div>";
		var hoursDiv;
		if (place.opening_hours !== undefined && place.opening_hours.weekday_text !== undefined) {
			hoursDiv = "<div class='col-lg-6' id='hoursDiv'> <h6 id='hoursTitle'>Hours</h6>" + place.opening_hours.weekday_text[0] + "<br>" + place.opening_hours.weekday_text[1] + "<br>" + place.opening_hours.weekday_text[2] + "<br>" + place.opening_hours.weekday_text[3] + "<br>" + place.opening_hours.weekday_text[4] + "<br>" + place.opening_hours.weekday_text[5] + "<br>" + place.opening_hours.weekday_text[6] + "</div>";
		}
		else {
			hoursDiv = "<div class='col-lg-6' id='hoursDiv'> <h6 id='hoursTitle'>Hours</h6> Hours currently unavailable for this location.</div>";
		}
		var buttonText;
		var buttonFunc;
		if (isSaved(place.place_id)) {
			buttonText = "Remove from Saved";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "Add to Saved";
			buttonFunc = "addToSaved";
		}
		var fromAddress = encodeURIComponent(myStorage.getItem('address'));
		var toAddress = encodeURIComponent(place.formatted_address);
		
		var iframe = "<iframe width='700' height='400' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + fromAddress + "&destination=" + toAddress + "&avoid=tolls|highways&mode=transit' allowfullscreen> </iframe>";
		/****
			@TODO: get discount val from hashmap, keyed by placeid
		
			*****/
		newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2>" + ratingDiv + discountDiv + "<br> <button type='button' id='saved-button' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + ")'>" + buttonText + "</button><br>" + photoDiv + placeInfoDiv + hoursDiv + "<br>" + iframe + "<br><br> <button type='button' class='btn btn-primary center-block' data-dismiss='modal'><i class='fa fa-times'></i> Close Window</button> </div> </div> </div> </div> </div> </div>";
		
		saved.appendChild(newDiv);
		savedModals.appendChild(newModal);
	}
}


 function helpModal() {
 	console.log("help appear");
    var div = document.getElementById('help');
    div.style.display = "block";
  }



var allplacesJSON = {
	"masterlist" : [
 {
   "category": "Arts & Entertainment",
   "name": "The Noguchi Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Queens",
   "address": "9-01 33rd Rd, Queens, NY 11106",
   "Rating": 4.5,
   "googleID": "ChIJUZ0c7MpYwokRh8SiMzCXL98"
 },
 {
   "category": "Arts & Entertainment",
   "name": "American Numismatic Society",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "75 Varick St, New York, NY 10013",
   "Rating": null,
   "googleID": "ChIJmzolTYtZwokRHq_kx0LfXvo"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Bronx Museum of the Arts",
   "discount": "Free",
   "boolFree": true,
   "borough": "Bronx",
   "address": "1040 Grand Concourse Bronx, New York 10456",
   "Rating": null,
   "googleID": "ChIJDbNgaTH0wokRRQPTw1E93GY"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Dahesh Museum of Art",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "145 6th Ave, New York, NY 10013",
   "Rating": null,
   "googleID": "ChIJ7WI5fvtYwokRPDUT1aUOA_Q"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Intrepid Sea, Air & Space Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "Pier 86, W 46th St & 12th Ave, New York, NY 10036",
   "Rating": null,
   "googleID": "ChIJnxlg1U5YwokR8T90UrZiIwI"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Jewish Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "1109 5th Ave & 92nd St, New York, NY 10128",
   "Rating": null,
   "googleID": "ChIJxY5cO6JYwokRPeVk85UNj2g"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Metropolitan Museum of Art",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "1000 5th Ave, New York, NY 10028",
   "Rating": 4.7,
   "googleID": "ChIJb8Jg9pZYwokR-qHGtvSkLzs"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Morgan Library & Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "225 Madison Ave, New York, NY 10016",
   "Rating": null,
   "googleID": "ChIJ3453OAdZwokRja92OOKCugM"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Museum of Modern Art",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "11 W 53rd St, New York, NY 10019",
   "Rating": null,
   "googleID": "ChIJKxDbe_lYwokRVf__s8CPn-o"
 },
 {
   "category": "Arts & Entertainment",
   "name": "National Academy Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "1083 5th Ave, New York, NY 10128",
   "Rating": null,
   "googleID": "ChIJISGWiaJYwokRuOumpQv1i88"
 },
 {
   "category": "Arts & Entertainment",
   "name": "New York Transit Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Brooklyn",
   "address": "99 Schermerhorn St, Brooklyn, NY 11201",
   "Rating": null,
   "googleID": "ChIJdThqNVVawokRFk58UQOvtuM"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Queens Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Queens",
   "address": "Flushing Meadows Corona Park, New York City Building, Queens, NY 11368",
   "Rating": null,
   "googleID": "ChIJmWMJBtBfwokR5qK7waLcgAM"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Socrates Sculpture Park",
   "discount": "Free",
   "boolFree": true,
   "borough": "Queens",
   "address": "32-01 Vernon Blvd, Long Island City, NY 11106",
   "Rating": null,
   "googleID": "ChIJvcjmWLVYwokRFz2FMdi00cA"
 },
 {
   "category": "Arts & Entertainment",
   "name": "American Folk Art Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "2 Lincoln Square, New York, NY 10023",
   "Rating": null,
   "googleID": "ChIJEeD6FPVYwokRgs0ZbWMrrzk"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Asia Society and Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "725 Park Ave, New York, NY 10021",
   "Rating": null,
   "googleID": "ChIJeXQWdutYwokRuHX2h1so5K4"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Brooklyn Historical Society",
   "discount": "Free",
   "boolFree": true,
   "borough": "Brooklyn",
   "address": "128 Pierrepont St, Brooklyn, NY 11201",
   "Rating": null,
   "googleID": "ChIJLYgHV0hawokR2-ZdvxaMGxE"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Cloisters",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "99 Margaret Corbin Dr, New York, NY 10040",
   "Rating": null,
   "googleID": "ChIJK6bycAH0wokRrSnflfrnkZE"
 },
 {
   "category": "Arts & Entertainment",
   "name": "El Museo Del Barrio",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "1230 5th Ave, New York, NY 10029",
   "Rating": null,
   "googleID": "ChIJWT0gUBz2wokRNcAxVUphAAs"
 },
 {
   "category": "Arts & Entertainment",
   "name": "International Center of Photography Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "250 Bowery, New York, NY 10012",
   "Rating": null,
   "googleID": "ChIJ5YRc6oVZwokRcRC4WKbR6_s"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Japan Society",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "333 E 47th St, New York, NY 10017",
   "Rating": null,
   "googleID": "ChIJT9QreB1ZwokRHZEDNBAX--0"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Met Breuer",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "945 Madison Ave, New York, NY 10021",
   "Rating": null,
   "googleID": "ChIJl-WU6pRYwokRA91OgdYWfa4"
 },
 {
   "category": "Arts & Entertainment",
   "name": "MoMA PS1",
   "discount": "Free",
   "boolFree": true,
   "borough": "Queens",
   "address": "22-25 Jackson Ave, Long Island City, NY 11101",
   "Rating": null,
   "googleID": "ChIJwfbFiiNZwokRN8hnF940DbY"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Museum of Jewish Heritage",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "36 Battery Pl, New York, NY 10280",
   "Rating": null,
   "googleID": "ChIJYTeZ_BFawokRe_SRVX_pKIs"
 },
 {
   "category": "Shopping",
   "name": "J.Crew",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "91 5th Ave, New York, NY 10003, USA",
   "Rating": null,
   "googleID": "ChIJ9cyRU6JZwokR6BE7qIX8VQc"
 },
 {
   "category": "Shopping",
   "name": "J.Crew",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "347 Madison Ave, New York, NY 10017",
   "Rating": null,
   "googleID": "ChIJL6ZX4gFZwokRlhNUcAXdOeM"
 },
 {
   "category": "Shopping",
   "name": "Club Monaco",
   "discount": "20%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "160 5th Ave, New York, NY 10010, USA",
   "Rating": null,
   "googleID": "ChIJHRful6NZwokRxosgqshaDMk"
 },
 {
   "category": "Shopping",
   "name": "Club Monaco",
   "discount": "20%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "6 W 57th St, New York, NY 10019",
   "Rating": null,
   "googleID": "ChIJv5p_b_pYwokRPKwidmPgV3k"
 },
 {
   "category": "Shopping",
   "name": "Topshop",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "478 Broadway, New York, NY 10013",
   "Rating": null,
   "googleID": "ChIJj8DVbolZwokRi5US6vDx14U"
 },
 {
   "category": "Shopping",
   "name": "Topshop",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "608 5th Ave, New York, NY 10020",
   "Rating": null,
   "googleID": "ChIJo8-Dlv5YwokRFJb77gbBNhk"
 },
 {
   "category": "Shopping",
   "name": "Madewell",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "1144 Madison Avenue, New York, NY 10028",
   "Rating": null,
   "googleID": "ChIJ92YC35dYwokR6Lh4p1NhDBw"
 },
 {
   "category": "Shopping",
   "name": "Madewell",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "115 5th Ave, New York, NY 10003",
   "Rating": null,
   "googleID": "ChIJA-0YU6JZwokR4qv4OBgNnRE"
 },
 {
   "category": "Shopping",
   "name": "Eddie Bauer",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "100 5th Ave, New York, NY 10011",
   "Rating": null,
   "googleID": "ChIJ951VnqJZwokRs5Xya4oAnWA"
 },
 {
   "category": "Shopping",
   "name": "Charlotte Russe",
   "discount": "10%",
   "boolFree": false,
   "borough": "Queens",
   "address": "Queens Center, 9015 Queens Blvd, Elmhurst, NY 11373",
   "Rating": null,
   "googleID": "ChIJW4ed-0tewokRrSKUvDUQ7ZQ"
 },
 {
   "category": "Shopping",
   "name": "Goodwill",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "217 W 79th St, New York, NY 10024",
   "Rating": null,
   "googleID": "ChIJ-VHbm4hYwokRtL5UgbY6-7g"
 },
 {
   "category": "Shopping",
   "name": "Goodwill",
   "discount": "10%",
   "boolFree": false,
   "borough": "Brooklyn",
   "address": "258 Livingston St, Brooklyn, NY 11201",
   "Rating": null,
   "googleID": "ChIJKRnp3kxawokR1qNG46dKHPY"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Museum of the City of New York",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "1220 5th Ave & 103rd St, New York, NY 10029",
   "Rating": null,
   "googleID": "ChIJi4hYtB32wokR1Npx_Tv7phk"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Nicholas Roerich Museum",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "319 W 107th St, New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJCYAz0Dr2wokRe49DUpkvIL4"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Paley Center for Media",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "25 W 52nd St, New York, NY 10019",
   "Rating": null,
   "googleID": "ChIJF5e1QvlYwokRcVF6x1CEcQk"
 },
 {
   "category": "Arts & Entertainment",
   "name": "Schomburg Center for Research in Black Culture",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "515 Malcolm X Blvd, New York, NY 10037",
   "Rating": null,
   "googleID": "ChIJ7etix3b2wokRKN_Pd9RLRHQ"
 },
 {
   "category": "Arts & Entertainment",
   "name": "The Studio Museum in Harlem",
   "discount": "Free",
   "boolFree": true,
   "borough": "Manhattan",
   "address": "144 W 125th St, New York, NY 10027",
   "Rating": null,
   "googleID": "ChIJ_ShwXw32wokRQJpaKAIcCOo"
 },
 {
   "category": "Food",
   "name": "Fairway Market",
   "discount": "5%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "2328 12th Ave, New York, NY 10027",
   "Rating": null,
   "googleID": "ChIJtRnkH2j2wokR3bnS8Xx_xTY"
 },
 {
   "category": "Food",
   "name": "Key Food",
   "discount": "5%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "421 W. 125th, New York, NY",
   "Rating": null,
   "googleID": "ChIJ7QUAcmv2wokRyL8ic6V6B6w"
 },
 {
   "category": "Food",
   "name": "Aangan",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "2701 Broadway, New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJKy-DsSX2wokRBcHOLpDvWlY"
 },
 {
   "category": "Food",
   "name": "Strokos",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "1090 Amsterdam Ave, New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJw6ajyj32wokR0NKOvGb2tXk"
 },
 {
   "category": "Food",
   "name": "Subway",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "971 Amsterdam Ave #1, New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJVa8uC4NYwokR8Fuu0w7D0bc"
 },
 {
   "category": "Food",
   "name": "Ajanta Indian Restaurant ",
   "discount": "10%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "1237 Amsterdam Avenue New York, NY 10027",
   "Rating": null,
   "googleID": "ChIJ6efYQhX2wokRW7w_zEbHv9k"
 },
 {
   "category": "Food",
   "name": "Royal Curry and Kabab",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "931 Amsterdam Ave New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJyaNYDhr2wokROSnH0e0O-Ps"
 },
 {
   "category": "Food",
   "name": "V&T Pizzeria",
   "discount": "15%",
   "boolFree": false,
   "borough": "Manhattan",
   "address": "1024 Amsterdam Avenue New York, NY 10025",
   "Rating": null,
   "googleID": "ChIJtUqk7Dz2wokRsi_5j6j1DHM"
 }
]
};
