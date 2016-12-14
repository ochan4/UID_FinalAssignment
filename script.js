myStorage = localStorage;
var arts = [];
var foods = [];
var shoppings = [];
var allplaces = [];
var discountDictionary = {};

function splitCategory() {
	var masterlist = allplacesJSON['masterlist'];
	var discountArray = [];
	for (var i = 0; i < allplacesJSON['masterlist'].length; i++) {
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
			id: id['googleID']
			, discount: id['discount']
		});
	}
	discountDictionaryFunction(discountArray); //parse the array to dictionary
}

function discountDictionaryFunction(discountArray) {
	for (var i = 0; i < discountArray.length; i++) {
		var id = discountArray[i].id;
		var discountAmount = discountArray[i].discount;
		discountDictionary[id] = discountAmount;
	}
}
/**************************************************************************/
/**
 * Get results from form. Ping Ashley for clarification! 
 */
var numResults = 0; // keep track of how many results on page
var numSaved = 0; // keep track of how many saved things we've displayed 
var savedPlaces = JSON.parse(myStorage.getItem('saved-places')); // saved places array
var hasResult = false;

function initSavedPlaces() {
	//alert(JSON.parse((myStorage.getItem('saved-places'))));
	if (JSON.parse((myStorage.getItem('saved-places')) == "") || (JSON.parse(myStorage.getItem('saved-places')) == null)) {
		savedPlaces = [];
		myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
		noSavedPlaces();
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
		criteriaCost = "Both Discounted & Free Activities"
	}
	document.getElementById("form-criteria").innerHTML = "You're starting from: " + address + "<br>Showing places for <b>" + atype + "</b> in <b>" + borough + "</b> (" + criteriaCost + ")";
	splitCategory();
	hideLoadMessage();
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
	if (onlyFree != "true" && borough == "Anywhere") { // showing all + free results in any borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			getPlaceDetails(cur["id"]);
		}
	}
	else if (onlyFree == "true" && borough == "Anywhere") { // showing only free results in any borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["free"] == true) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else if (onlyFree == "true" && borough != "Anywhere") { // showing only free results in a single borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["borough"] == borough && cur["free"] == true) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	else if (onlyFree != "true" && borough != "Anywhere") { // showing all + in a single borough
		for (var i = 0; i < list.length; i++) {
			var cur = list[i];
			if (cur["borough"] == borough) {
				getPlaceDetails(cur["id"]);
			}
		}
	}
	return false; // prevent reload
}

function hideLoadMessage() {
	setTimeout(function () {
		document.getElementById("loading").style.display = "none";
		if (!hasResult) {
			document.getElementById("noResults").style.display = "block";
		}
	}, 15000);
}

function getPlaceDetails(placeId) {
	var request = {
		placeId: placeId
	};
	let map = new google.maps.Map(document.createElement('div'));
	service = new google.maps.places.PlacesService(map)
	service.getDetails(request, appendPlaceToResults);
}

function appendPlaceToResults(place, status) {
	var attempts = 0;
	var success = false;
	while (success != true && attempts < 3) {
		hasResult = true;
		document.getElementById("loading").style.display = "block";
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			success = true;
			console.log("...i'm in");
			numResults++;
			console.log("result numbah: " + numResults);
			var results = document.getElementById("results");
			var newDiv = document.createElement('div');
			newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item');
			newDiv.setAttribute('id', 'result' + numResults);
			var photoUrl = "http://ahandup.net/wp-content/uploads/2015/08/no-propertyfound1-830x460.png";
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
				ratingTxt = place.rating + " <span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
			}
			else {
				ratingTxt = "None available.";
			}
			var divButtonTxt;
			var pageLoc = JSON.stringify("results");
			var placeId = JSON.stringify(place.place_id);
			if (isSaved(place.place_id)) { // is saved
				divButtonTxt = "<i class='fa fa-heart' aria-hidden='true'></i>";
				divButtonClass = "btn";
				divButtonOnClick = "removeFromSavedNoModal(" + placeId + "," + numResults + "," + pageLoc + ")";
			}
			else { // is not saved
				divButtonTxt = "<i class='fa fa-heart-o' aria-hidden='true'></i>";
				divButtonClass = "btn";
				divButtonOnClick = "addToSavedNoModal(" + placeId + "," + numResults + "," + pageLoc + ")";
			}
			newDiv.innerHTML = "<a href='#resultModal" + numResults + "' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-search-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p id='ratingTxt' class='text-muted'>Rating: " + ratingTxt + "</p>" + "<button type='button' class=" + divButtonClass + " id='divButton" + numResults + "' + onclick = '" + divButtonOnClick + "'>" + divButtonTxt + "</button>" + "</div>";
			var resultModals = document.getElementById("resultModals");
			var newModal = document.createElement('div');
			newModal.setAttribute('class', 'portfolio-modal modal fade');
			newModal.setAttribute('id', 'resultModal' + numResults);
			newModal.setAttribute('tabindex', '-1');
			newModal.setAttribute('role', 'portfolio-modal modal fade');
			newModal.setAttribute('aria-hidden', 'true');
			var ratingDiv;
			if (place.rating !== undefined) {
				ratingDiv = "<div class='col-lg-6' id ='rating'>Average rating: " + place.rating + " / 5.0 <span class='glyphicon glyphicon-star' aria-hidden='true'></span></div>";
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
				buttonText = "<i class='fa fa-heart' aria-hidden='true'></i> Remove from Saved?";
				buttonFunc = "removeFromSaved";
			}
			else {
				buttonText = "<i class='fa fa-heart-o' aria-hidden='true'></i> Add to Saved";
				buttonFunc = "addToSaved";
			}
			var pageLoc = JSON.stringify("results");
			var fromAddress = encodeURIComponent(myStorage.getItem('address'));
			var toAddress = encodeURIComponent(place.formatted_address);
			var iframe = "<iframe width='700' height='400' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + fromAddress + "&destination=" + toAddress + "&avoid=tolls|highways&mode=transit' allowfullscreen> </iframe>";
			newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2>" + ratingDiv + discountDiv + "<br> <button type='button' id='saved-button" + numResults + "' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + "," + numResults + "," + pageLoc + ")'>" + buttonText + "</button><br>" + photoDiv + placeInfoDiv + hoursDiv + "<br>" + iframe + "<br><br> <button type='button' class='btn btn-primary center-block' data-dismiss='modal'><i class='fa fa-times'></i> Close Window</button> </div> </div> </div> </div> </div> </div>";
			results.appendChild(newDiv);
			resultModals.appendChild(newModal);
		}
		else {
			attempts++;
			console.log("Woah! I got a bad result.");
			console.log(status);
			delay(500);
		}
	}
	document.getElementById("loading").style.display = "none";
}

function delay(ms) {
	ms += new Date().getTime();
	while (new Date() < ms) {}
}

function isSaved(placeId) {
	var parsed = JSON.parse(myStorage.getItem('saved-places'));
	if (_.indexOf(parsed, placeId) > -1) {
		return true;
	}
	return false;
}

function addToSaved(placeId, resultNum, loc) {
	savedPlaces.push(placeId);
	myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
	var myButton = document.getElementById('saved-button' + resultNum);
	myButton.innerHTML = "<i class='fa fa-heart' aria-hidden='true'></i> Remove from Saved?";
	myButton.onclick = function () {
		removeFromSaved(placeId, resultNum, loc);
	};
	if (loc == "results") {
		console.log("inside loc thing");
		document.getElementById("divButton" + resultNum).innerHTML = "<i class='fa fa-heart' aria-hidden='true'></i>";
		document.getElementById("divButton" + resultNum).onclick = function () {
			removeFromSavedNoModal(placeId, resultNum, loc);
		}
	}
	else {
		document.getElementById("savedPlace" + resultNum).style.display = "block";		
	}
	swal("Success!", "This location has been added to your Saved list.", "success");
	return false;
}

function addToSavedNoModal(placeId, resultNum, loc) {
	savedPlaces.push(placeId);
	myStorage.setItem('saved-places', JSON.stringify(savedPlaces));
	var myButton = document.getElementById('divButton' + resultNum);
	myButton.innerHTML = "<i class='fa fa-heart' aria-hidden='true'></i>";
	myButton.onclick = function () {
		removeFromSavedNoModal(placeId, resultNum, loc);
	};
	console.log(loc);
	if (loc == "results") {
		var myButton = document.getElementById('saved-button' + resultNum);
		myButton.innerHTML = "<i class='fa fa-heart' aria-hidden='true'></i> Remove from Saved?";
		myButton.onclick = function () {
			removeFromSaved(placeId, resultNum, loc);
		}
	}
	swal("Success!", "This location has been added to your Saved list.", "success");
	return false;
}

function removeFromSaved(placeId, resultNum, loc) {
	swal({
		title: ""
		, text: "Are you sure you want to remove this location?"
		, type: "warning"
		, showCancelButton: true
		, confirmButtonColor: "#DD6B55"
		, confirmButtonText: "Yes, remove it!"
		, closeOnConfirm: false
	}, function () {
		var origSaved = JSON.parse(myStorage.getItem('saved-places'));
		var updatedSaved = _.without(origSaved, placeId);
		savedPlaces = updatedSaved;
		myStorage.setItem('saved-places', JSON.stringify(updatedSaved));
		var myButton = document.getElementById('saved-button' + resultNum);
		myButton.innerHTML = "<i class='fa fa-heart-o' aria-hidden='true'></i> Add to Saved";
		myButton.onclick = function () {
			addToSaved(placeId, resultNum, loc);
		}
		if (loc == "homePage") {
			document.getElementById("savedPlace" + resultNum).style.display = "none";
		}
		else {
			document.getElementById("divButton" + resultNum).innerHTML = "<i class='fa fa-heart-o' aria-hidden='true'></i>";
			document.getElementById("divButton" + resultNum).onclick = function () {
				addToSavedNoModal(placeId, resultNum, loc);
			}
		}
		swal("Removed!", "This location has been removed from your saved list.", "success");
	});
	return false;
}

function removeFromSavedNoModal(placeId, resultNum, loc) {
	swal({
		title: ""
		, text: "Are you sure you want to remove this location?"
		, type: "warning"
		, showCancelButton: true
		, confirmButtonColor: "#DD6B55"
		, confirmButtonText: "Yes, remove it!"
		, closeOnConfirm: false
	}, function () {
		var origSaved = JSON.parse(myStorage.getItem('saved-places'));
		var updatedSaved = _.without(origSaved, placeId);
		savedPlaces = updatedSaved;
		myStorage.setItem('saved-places', JSON.stringify(updatedSaved));
		var myButton = document.getElementById('divButton' + resultNum);
		myButton.innerHTML = "<i class='fa fa-heart-o' aria-hidden='true'></i>";
		myButton.onclick = function () {
			addToSavedNoModal(placeId, resultNum, loc);
		}
		if (loc == "homePage") {
			document.getElementById("savedPlace" + resultNum).style.display = "none";
		}
		else {
			var myButton = document.getElementById('saved-button' + resultNum);
			myButton.innerHTML = "<i class='fa fa-heart-o' aria-hidden='true'></i> Add to Saved";
			myButton.onclick = function () {
				addToSaved(placeId, resultNum, loc);
			}
		}
		swal("Removed!", "This location has been removed from your saved list.", "success");
	});
	return false;
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
		newDiv.setAttribute('id', 'savedPlace' + numSaved);
		newDiv.setAttribute('class', 'col-md-4 col-sm-6 portfolio-item')
		var photoUrl = "http://ahandup.net/wp-content/uploads/2015/08/no-propertyfound1-830x460.png";
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
			ratingTxt = place.rating + " <span class='glyphicon glyphicon-star' aria-hidden='true'></span>";
		}
		else {
			ratingTxt = "None available.";
		}
		var divButtonTxt;
		var pageLoc = JSON.stringify("homePage");
		var placeId = JSON.stringify(place.place_id);
		if (isSaved(place.place_id)) { // is saved
			divButtonTxt = "<i class='fa fa-heart' aria-hidden='true'></i>";
			divButtonClass = "btn";
			divButtonOnClick = "removeFromSavedNoModal(" + placeId + "," + numSaved + "," + pageLoc + ")";
		}
		else { // is not saved
			divButtonTxt = "<i class='fa fa-heart-o' aria-hidden='true'></i>";
			divButtonClass = "btn";
			divButtonOnClick = "addToSavedNoModal(" + placeId + "," + numSaved + "," + pageLoc + ")";
		}
		newDiv.innerHTML = "<a href='#savedModal" + numSaved + "' class='portfolio-link' data-toggle='modal'> <div class='portfolio-hover'> <div class='portfolio-hover-content'> <i class='fa fa-search-plus fa-3x'></i> </div></div> <img src='" + photoUrl + "' class='img-responsive' alt=''> </a><div class='portfolio-caption'><h4>" + place.name + "</h4><p id='ratingTxt' class='text-muted'>Rating: " + ratingTxt + "</p>" + "<button type='button' class=" + divButtonClass + " id='divButton" + numSaved + "' + onclick = '" + divButtonOnClick + "'>" + divButtonTxt + "</button>" + "</div>";
		var savedModals = document.getElementById("saved-modals");
		var newModal = document.createElement('div');
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
			ratingDiv = "<div class='col-lg-6' id ='rating'>Average rating: " + place.rating + " / 5.0 <span class='glyphicon glyphicon-star' aria-hidden='true'></span></div>";
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
			buttonText = "<i class='fa fa-heart' aria-hidden='true'></i> Remove from Saved?";
			buttonFunc = "removeFromSaved";
		}
		else {
			buttonText = "<i class='fa fa-heart-o' aria-hidden='true'></i> Add to Saved";
			buttonFunc = "addToSaved";
		}
		var pageLoc = JSON.stringify("homePage");
		var fromAddress = encodeURIComponent(myStorage.getItem('address'));
		var toAddress = encodeURIComponent(place.formatted_address);
		var iframe = "<iframe width='700' height='400' frameborder='0' style='border:0' src='https://www.google.com/maps/embed/v1/directions?key=AIzaSyDwjNhrGi0G3W-aKvTJ6eAegH7mf4Y3SuE&origin=" + fromAddress + "&destination=" + toAddress + "&avoid=tolls|highways&mode=transit' allowfullscreen> </iframe>";
		newModal.innerHTML = "<div class='modal-dialog'> <div class='modal-content'> <div class='close-modal' data-dismiss='modal'> <div class='lr'> <div class='rl'> </div> </div> </div> <div class='container'> <div class='row'> <div class='col-lg-8 col-lg-offset-2'> <div class='modal-body'> <!-- Project Details Go Here --> <h2>" + place.name + "</h2>" + ratingDiv + discountDiv + "<br> <button type='button' id='saved-button" + numSaved + "' class='btn btn-primary' onclick='" + buttonFunc + "(" + placeId + "," + numSaved + "," + pageLoc + ")'>" + buttonText + "</button><br>" + photoDiv + placeInfoDiv + hoursDiv + "<br>" + iframe + "<br><br> <button type='button' class='btn btn-primary center-block' data-dismiss='modal'><i class='fa fa-times'></i> Close Window</button> </div> </div> </div> </div> </div> </div>";
		saved.appendChild(newDiv);
		savedModals.appendChild(newModal);
	}
}

function helpModal() {
	console.log("help appear");
	var div = document.getElementById('help');
	div.style.display = "block";
}
	
















