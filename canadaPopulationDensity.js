
//Width and height
var w = 750;
var h = 500;

//Define map projection
var projection = d3.geoMercator().translate([w, h+170]).scale([230]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Define quantize scale to sort data values into buckets of color
var color = d3.scaleQuantize()
                    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
                    //Colors taken from colorbrewer.js, included in the D3 download

//Number formatting for population values
var formatAsThousands = d3.format(",");  //e.g. converts 123456 to "123,456"

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("text-align", "center");

//Load in agriculture data
d3.csv("canadaPopulationDensity.csv", function(data) {

    //Set input domain for color scale
    color.domain([
        d3.min(data, function(d) { return d.value; }), 
        d3.max(data, function(d) { return d.value; })
    ]);

    //Load in GeoJSON data
    d3.json("canada.json", function(json) {

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {

            var dataState = data[i].state;	
            var dataValue = parseFloat(data[i].value);	//Grab data value, and convert from string to float

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

                    //Stop looking through the JSON
                    break;

                }
            }		
        }

        //Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
           .data(json.features)
           .enter()
           .append("path")
           .attr("d", path)
           .style("fill", function(d) {
                //Get data value
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }
           });




    });

});