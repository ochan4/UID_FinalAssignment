
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
    reader.onload = function(e) {

        var data = e.target.result();
        var workbook = XLSX.read(data, { type: 'binary' });

        workbook.SheetNames.forEach(function(sheetName) {
            // Here is your object
            var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            var json_object = JSON.stringify(XL_row_object);
            console.log(json_object);

        })

    };

var gMapAPIKey = 'AIzaSyDJ-F1rPoqgpPewazBEZPgJpFLrOv0c63c'

function makeNewElement(className){
	var newDiv = document.createElement('div');
	newDiv.class = className;
}

