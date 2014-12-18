var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 3000,
    height = 13360;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    z = d3.scale.linear();

var svg = d3.select("body")
						.append("svg")
    				.attr("width", width)
    				.attr("height", height);

var metadata = ["Album_url","Artist","Profile_url","Album","ReleaseDate","Label","Genre","Artist_url"]

d3.csv("data-aoty/albumscores.csv", function(error, data) { 

	data.sort(function(a,b) {return b.AoTY-a.AoTY;});

	function change(k) {

  	console.log("click: " + k);
    row.sort(function(a, b) { return b[k] - a[k]; });

  }

	// Extract the list of dimensions and create a scale for each.
  var dimensions = d3.keys(data[0]).filter(function(d) {
    return metadata.indexOf(d) == -1;
  });

	var cell_width = width / (dimensions.length + 3) - 2;
	var cell_height = 16;

	var tmp = dimensions[1];
	dimensions[1] = dimensions[0];
	dimensions[0] = tmp;

	z.range([0,cell_width / 2])
	 .domain([0,100]);

	var table = svg.append("g")
								 .attr("class","table")
								 .attr("transform", function(d, i) { return "translate(0," + 20 + ")"; });

	var row = table.selectAll("row")
								 .data(data)
								 .enter()
								 .append("g")
								 .attr("class", "row")
								 .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	row.append("text")
     .text(function(d) { return d.Artist + " / \"" + d.Album + "\""; } )
     .attr("transform", function(d, i) { return "translate(0," + (cell_height - 4) + ")"; });

  var cell = row.selectAll("cell")
					      .data(function(d) { return dimensions.map(function(k) { return d[k]; }); })
					      .enter()
					      .append("g")
					      .attr("class","cell")
					      .attr("transform", function(d, i) { return "translate(" + (3.5 * cell_width + i * cell_width) + ",0)"; })
					      .attr("width", cell_width / 2)
				        .attr("height", cell_height);

	cell.append("rect") 	
			.attr("class", "bounds")
		  .attr("height", cell_height)
		  .attr("width", cell_width / 2);					        

	cell.append("rect")
      .attr("class","value")
      .attr("height", cell_height)
      .attr("width", function(d) { return z(d); })
      .append("title");

  cell.append("text")
      .attr("height", cell_height)
      .attr("transform", function(d, i) { return "translate(4," + (cell_height - 4) + ")"; })
      .text(function(d) { return d; });

  var header = svg.append("g")
								  .attr("class","header");

	header.append("text")		
			  .text("Artist / Album" )
        .attr("transform", function(d, i) { return "translate(0," + (cell_height - 4) + ")"; });;					 

  header.selectAll("column")
  			.data(dimensions)
  			.enter()
  			.append("g")
  			.attr("class","column")
  			.on("click", function(k) { change(k); })
  			.append("text")
  			.attr("transform", function(d, i) { return "translate(" + (3.5 * cell_width + i * cell_width) + "," + (cell_height - 4) + ")"; })
  			.text(function(d) { return d; });

});
