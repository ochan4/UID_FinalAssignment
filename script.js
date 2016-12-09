
// function makeMap() {
//     var newMap = new Map();

//     var catagories = [];
//     var places = [];


// }

// function findPlaces(price, borough, activity) {
//     var places = [];



// }

function getObjects(objects, borough, activity) {
    var places = [];
    //iterate through objects array
    for (var i in objects) {
        if (!objects.hasOwnProperty(i)) continue;
        if (typeof objects[i] == 'object') {
            places = places.concat(getObjects(objects[i], borough, activity));
        } else if (i == key) {
            objects.push(obj);
        }
    }
    return objects;
}

var gMapAPIKey = 'AIzaSyDJ-F1rPoqgpPewazBEZPgJpFLrOv0c63c'

function makeNewElement(className){
	var newDiv = document.createElement('div');
	newDiv.class = className;
}

