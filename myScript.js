// entireMax and entireMin are the biggest and smallest mean values within the entire dataset. we use them for our scale.				
var entireMax = 0;
var entireMin = 1;

// color is used for the displayed country gradient, redder colors signify a higher obese mean value.
var color = d3.scale.quantize()
	.range(colorbrewer.YlOrRd[9])
	.domain([9,0]);

// color2 is a greyscale used in the process of highlighting a specific country.
var color2 = d3.scale.quantize()
	.range(colorbrewer.Greys[9])
	.domain([9,0]);
	
/* newdata is used to hold the mean values of our data subset, allDataObjects holds a mean value for every country,
randomObjectSubset holds 8 randomly chosen data objects from the allDataObjects array. */
var newData = [];
var allDataObjects = [];
var randomObjectSubset = [];

var bodySelection = d3.select("body");

var svgSelection = bodySelection.append("svg")
.attr("width", 500).attr("height", 500);

//Initial creation of our dropdown list, will be populated later.
var sel = document.getElementById('CountryNames')
var opt = document.createElement('option');
opt.innerHTML = "default";
opt.value = "default";
sel.appendChild(opt);

// Saves data to the allDataObjects array if certain conditions are met.
d3.csv("IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.csv", function(data) {
	data.forEach(function(d) {
		d.mean = +d.mean;
	
		if (d.year == "2013" && d.metric == "obese" && d.age_group == "20 to 24 yrs" && d.sex_id == "3") {
			allDataObjects.push({country: d.location_name, val: d.mean});
			if (d.mean > entireMax) {
				entireMax = d.mean;
			}
			if (d.mean < entireMin) {
				entireMin = d.mean;
			}		
		}
	});
  
changeCont();
});


// These two functions are used to find our local Min and Max values from our 8-object subset.
function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function getMinOfArray(numArray) {
  return Math.min.apply(null, numArray);
}

// Function is called when we use the drop-down selector to highlight a certain data circle.
function changeVis() {
	var selected = document.getElementById("CountryNames");
	var greyify = d3.selectAll("circle")
		.attr("fill",function(d,i){
		
			if (selected.value == "Default") {
				return color(i);
			} else {
				return color2(i);
			}
		})
		.each(function (d, i) {
			
			if (i-1 == selected.selectedIndex && selected.value !== "Default") {
			  // put all your operations on the second element, e.g.
			  d3.select(this).attr("fill", "#FF0000");    
			}
			else if (i == 1) {
			  // put all your operations on the second element, e.g.
			  d3.select(this).attr("fill", "#ffffff");    
			}
			else if (i == 0) {
				d3.select(this).attr("fill", "#000000");  
			}						
		});
	
	// Changes our label output to display the country's mean value.					
	if (selected.value !== "Default") {
		document.getElementById('meanDispVal').innerHTML = randomObjectSubset[selected.selectedIndex-1].val;
	} else {
		document.getElementById('meanDispVal').innerHTML = '';
	}
}
			

document.getElementById("newContriesBtn").addEventListener("click", changeCont);

// Main function used to build the circle displays. Creates radii based off the mean values given.
function changeCont() {
	
	//clear our random object subset array, our circle svgs, and our dropdown options.
	d3.selectAll("circle").remove();
	randomObjectSubset.length = 0;
	newData.length = 0;
	while (sel.options.length > 0) {                
		sel.remove(0);
	} 
	
	//Initial creation of our dropdown list, will be populated later.
	var opt = document.createElement('option');
	opt.innerHTML = "Default";
	opt.value = "Default";
	sel.appendChild(opt);
	
	//get a random subset of our object array, then sort it by mean, so we can perform our selector object with ease.
	for (let i = 0; i < 8; i++) {
		var item = allDataObjects[Math.floor(Math.random()*allDataObjects.length)];
		randomObjectSubset.push(item);
	}
  
	//sort our array by mean value.
	randomObjectSubset.sort(function(a,b){ 
		return a.val - b.val
	});
	
	randomObjectSubset.reverse();

	// Add data to our drop down selector and our newData array.
	for (let i = 0; i < 8; i++) {
		newData.push(randomObjectSubset[i].val);
		var opt = document.createElement('option');
		opt.innerHTML = randomObjectSubset[i].country;
		opt.value = randomObjectSubset[i].country;
		sel.appendChild(opt);
		console.log(randomObjectSubset[i].val + randomObjectSubset[i].country);
	}

	/* Get our min and max values, with which we create a border for our
	 visualization, along with our normalization logic. */
	var maxy2 = getMaxOfArray(newData);
	var miny2 = getMinOfArray(newData);
	var maxy = entireMax;
	var miny = entireMin;
	var bigBack = maxy2 + maxy2*.50;
	var smallBack = maxy2 + maxy2*.25;
	var backSelection = [bigBack, smallBack];
	
	//sort our input data by size
	newData.sort(function(a,b){ 
		return a - b
	});
	newData.push(smallBack);
	newData.push(bigBack);
	//reverse the data
	newData.reverse();
	newData.toString();			
	
	//Normalize data
	var scale = d3.scale.linear();
	scale.domain([miny, maxy]);
	scale.range([3, 65]);		
	
	// Use D3 to create our visualization using our mean values as the Radii.
	var circleSelection = svgSelection.selectAll("circle")
		.data(newData).enter().append("circle");
	
	var circleAttr = circleSelection.attr("cx", 235)
		.attr("cy", 223).attr("r", function (d) { 
			return scale(d);
		})
		.attr("fill",function(d,i){return color(i);})
			.each(function (d, i) {
			
				if (i == 1) {
				  d3.select(this).attr("fill", "#ffffff");    
				}
				if (i == 0) {
					d3.select(this).attr("fill", "#000000");  
				}						
			}
		);
	// Clear mean value label.
	document.getElementById('meanDispVal').innerHTML = '';
};