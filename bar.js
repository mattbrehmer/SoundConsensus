window.pos = function() {
  if (window.scrollX != null && window.scrollY != null) return { x: window.scrollX, y : window.scrollY };
  else return { x: document.body.parentNode.scrollLeft, y : document.body.parentNode.scrollTop };
};

window.onscroll = function(e){
  document.getElementById('header_panel').style.top = window.pos().y + 'px';
};

var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = window.innerWidth - 35,
    height = 16750;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {},
    z = d3.scale.linear()
    ordScale = d3.scale.ordinal();

var selected_genre = "";

var tooltip = d3.select("body")
	.append("div")   
	.attr("class", "tooltip")              
	.style("opacity", 0);                      

var svg = d3.select("body")
						.append("svg")
    				.attr("width", width)
    				.attr("height", height);

var header_svg = d3.select("body")
						.append("svg")
						.attr("id", "header_panel")
    				.attr("width", width)
    				.attr("height", 25);	

// var footer_svg = d3.select("body")
// 						.append("svg")
// 						.attr("id", "footer_panel")
//     				.attr("width", width)
//     				.attr("height", 25);    									

var metadata = ["Album_url","Artist","Profile_url","Album","ReleaseDate","Label","Genre","Artist_url"]

d3.csv("data-aoty/albumscores.csv", function(error, data) { 

	data.sort(function(a,b) {return b.AoTY-a.AoTY;});

	function change(k){

  	console.log("click: " + k);
    row.sort(function(a, b) { return b[k] - a[k]; });

  }

	// Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return metadata.indexOf(d) == -1;
  }));

	var cell_width = width / (dimensions.length + 4 );
	var cell_height = 16;

	var tmp = dimensions[1];
	dimensions[1] = dimensions[0];
	dimensions[0] = tmp;

	z.range([0,cell_width / 1.5])
	 .domain([0,100]);

	ordScale.domain(data.map( function (d) { return d.Genre; }));

	var header = header_svg.append("g")
								  			 .attr("class","header");

  header.append("text")
  	 .attr("class","title")
		 .attr("dy", "0.7em")
     .text(function() {
     	if (width >= 1400) return "SoundConsensus";
     	else return "SC";
     });

  header.append("text")
  	 .attr("class","year")
		 .attr("dy", "0.7em")
		 .attr("dx", "8em")
		 .attr("dx", function() {
     	if (width >= 1400) return "8em";
     	else return "1.4em";
     })
     .text("2014");

  header.append("text")
  	 .attr("class","subtitle")
		 .attr("dy", "2.1em")
		 .text(function() {
     	if (width >= 1400) return "a visual summary of music review scores";
     	else return "music review scores";
     });
     
	header.append("text")
		 .attr("text-anchor", "end")
     .attr("class","artist")
		 .attr("dy", "0.9em")
     .text("Artist")
     .attr("transform", function(d, i) { return "translate(" + (3.25 * cell_width) + ",0)"; });

  header.append("text")
  	 .attr("class","album")
		 .attr("text-anchor", "end")
     .attr("dy", "2em")
     .text("Album")
     .attr("transform", function(d, i) { return "translate(" + (3.25 * cell_width) + ",0)"; });

  header.selectAll("column")
  			.data(dimensions)
  			.enter()
  			.append("g")
  			.attr("class","column")
  			.append("text")
  			.attr("dy", "1.2em")     			  
  			.attr("transform", function(d,i) { return "translate(" + (3.5 * cell_width + i * cell_width) + ",0)"; })
  			.text(function(d) { return d; });

	var table = svg.append("g")
								 .attr("class","table")
								 .attr("transform", function(d, i) { return "translate(0," + 35 + ")"; });

	var row = table.selectAll("row")
								 .data(data)
								 .enter()
								 .append("g")
								 .attr("class", "row")
								 .style("opacity", function(d){
								 	 if (d.Genre == selected_genre || selected_genre == "") return 1;
								 	 else return 0.33;
								 })
								 .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; })
									.on("mouseover", function(d) {
										tooltip.transition()
											 .duration(500)	
											 .style("opacity", 0);
										tooltip.transition()
											 .duration(200)	
											 .style("opacity", 1);	
										tooltip.html(
											"<strong>Artist</strong>: "  + d.Artist +	 
											"<br/><strong>Album</strong>: "  + d.Album +	 
											"<br/><strong>Release Date</strong>: "  + d.ReleaseDate +	 
											"<br/><strong>Label</strong>: "  + d.Label +
											"<br/><strong>Genre</strong>: "  + d.Genre +
											'<br/><a href="' + d.Artist_url + '">' + d.Artist_url + "</a>")
											.style("left", (d3.event.pageX + 10) + "px")			 
											.style("top", (d3.event.pageY + 15) + "px");										
				            d3.select(this).selectAll("rect")
											.transition()
				            	.duration(200)
				            	.style("stroke", "#b00");
				            d3.select(this).selectAll("rect.value")
											.transition()
				            	.duration(200)
				            	.style("fill", "#fcc")
				            	.style("stroke", "#b00");
				            d3.select(this).selectAll("text.album")
				            	.style("fill", "#b00");
			            	d3.select(this).selectAll("text.artist")
				            	.style("fill", "#b00");
									})
									.on("mouseout", function() {	
										tooltip.transition()
													 .delay(100)
													 .duration(200)	
													 .style('pointer-events', 'none')
													 .style("opacity", 0);																			
				            d3.select(this).selectAll("rect")
											.transition()
				            	.delay(200)
				            	.duration(200)
				            	.style("stroke", "#999");
				            d3.select(this).selectAll("rect.value")
											.transition()
				            	.delay(200)
				            	.duration(200)
				            	.style("fill", "#ccc")
				            	.style("stroke", "#999");
				            d3.select(this).selectAll("text.album")
				            	.style("fill", "#000");
			            	d3.select(this).selectAll("text.artist")
				            	.style("fill", "#666");
									});


	var row_header = row.append("g")
											.attr("class","row_header");	

	row_header.append("a")
     .attr("xlink:href", function(d){ return d.Profile_url ; })  	 
		 .append("text")
		 .attr("text-anchor", "end")
     .attr("class","artist")
		 .attr("dy", "0.9em")
     .text(function(d) { return d.Artist; } )
     .attr("transform", function(d, i) { return "translate(" + (3.25 * cell_width) + ",0)"; });

  row_header.append("a")
     				.attr("xlink:href", function(d){ return d.Album_url ; })
     				.append("text")
			  	  .attr("class","album")
					  .attr("text-anchor", "end")
			      .attr("dy", "2em")
			      .text(function(d) { return d.Album ; } )
			      .attr("transform", function(d, i) { return "translate(" + (3.25 * cell_width) + ",0)"; });

  var cell = row.selectAll("cell")
					      .data(function(d) { return dimensions.map(function(k) { return d[k]; }); })
					      .enter()
					      .append("g")
					      .attr("class","cell")
					      .attr("transform", function(d, i) { return "translate(" + (3.5 * cell_width + i * cell_width) + ",0)"; })
					      .attr("width", cell_width / 1.5)
				        .attr("height", cell_height);

	cell.append("rect") 	
			.attr("class", "bounds")
		  .attr("height", cell_height)
		  .attr("width", cell_width / 1.5);					        

	cell.append("a")
			.attr("class", "link")
     	.attr("xlink:href", function(d) { return d3.select(this.parentNode.parentNode).datum().Album_url; } )
     	.append("rect")
      .attr("class","value")
      .attr("height", cell_height)
      .attr("width", function(d) { return z(d); });

  //print numerical score in the cell
  cell.append("text")
      .attr("height", cell_height)
      .attr("dy", "1.5em")
      .attr("dx", "0.3em")
      .text(function(d) { return d; });

  var select = d3.select("#footer")
								 .append("select")
								 .on("change", change),
			options = select.selectAll("option").data(ordScale.domain().sort());

	options.enter().append("option").text(function (d) { return d; });

  function change() {
    var selectedIndex = select.property("selectedIndex"),
    	  selectedItem = options[0][selectedIndex].__data__;
    	  console.log(selectedItem);
    selected_genre = selectedItem;
  }
});