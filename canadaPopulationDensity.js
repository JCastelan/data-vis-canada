
//Width and height
var w = 750;
var h = 500;

//Define map projection
//var projection = d3.geoMercator().translate([w, h+170]).scale([230]);
var projection = d3.geoAlbers().scale([700]).translate([w/2,h+45]).parallels([50,70])

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

//Define Tooltip here
var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

//Load in agriculture data
d3.csv("canadaPopulation2016simple.csv", function(error, data) {

    if(error) throw error;
    data.forEach( function(d){
        d.value = +d.value;
        d.area = +d.area; //in km squared
        d.popDensity = d.value/d.area;
        console.log(d);
    })
    
    console.log(d3.extent( data, function(d) { return d.popDensity;}));
    //Set input domain for color scale
    color.domain(d3.extent( data, function(d) { return d.popDensity;})
        /*[
        d3.min(data, function(d) { return d.population; }), 
        d3.max(data, function(d) { return d.population; })
    ]*/);

    //Load in GeoJSON data
    d3.json("canada.json", function(json) {

        //Merge the data and GeoJSON
        //Loop through once for each data value
        for (var i = 0; i < data.length; i++) {
            var dataLoc = data[i].location;	
            var dataValue = parseFloat(data[i].value);	//Grab data value, and convert from string to float
            var dataArea = parseFloat(data[i].area);
            var dataPopDensity = parseFloat(data[i].popDensity);
            
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonLoc = json.features[j].properties.Name;
                if (dataLoc == jsonLoc) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataPopDensity;

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
                    return "black";
                }
           }).on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .95);
            div.html( "<b>"+d.properties.Name+
                     "</br>Population Density: "+ d.properties.value+"</b>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
       })
       .on("mouseout", function(d) {
            div.transition()
               .duration(500)
               .style("opacity", 0);
       });
        

    });

});
