/**

SoundConsensus

A visual summary of album review scores
Data scraped from albumoftheyear.org

Matt Brehmer / @mattbrehmer

December 2014

**/

//track horizontal and vertical scrolling
window.pos = function() {
  if (window.scrollX != null && window.scrollY != null) 
    return { x: window.scrollX, y : window.scrollY };
  else 
    return { x: document.body.parentNode.scrollLeft, 
             y: document.body.parentNode.scrollTop };
};

//keep header panel fixed to top but not left
window.onscroll = function(e){
  document.getElementById('header_panel')
          .style.top = window.pos().y + 'px';
};

//initialize dimensions
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = window.innerWidth - 35,
    height = 16750;

//initialize scales
var x = d3.scale.ordinal().rangePoints([0, width], 1),
    y = {}, //scales for each dimension
    z = d3.scale.linear(), //scale for bar charts
    genreScale = d3.scale.ordinal(), //ordinal scale for genres
    labelScale = d3.scale.ordinal(); //ordinal scale for labels

//initialize dispatch for highlighting selections from dropdowns
var genreDispatch = d3.dispatch("genreHighlight");
var labelDispatch = d3.dispatch("labelHighlight");

//initialize tooltip, initially invisible
var tooltip = d3.select("body")
                .append("div")   
                .attr("class", "tooltip")              
                .style("opacity", 0);                      

//initialize main svg area
var main_svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

//initialize header svg
var header_svg = d3.select("body")
            .append("svg")
            .attr("id", "header_panel")
            .attr("width", width)
            .attr("height", 25);          
              
//create an array of known metadata dimensions              
var metadata = ["Album_url", 
                "Artist",
                "Profile_url",
                "Album",
                "ReleaseDate",
                "Label",
                "Genre",
                "Artist_url"]

//load the data from csv
d3.csv("data-aoty/albumscores.csv", function(error, data) { 

  //sort the data based on albumoftheyear (AoTY) aggregate score
  data.sort(function(a,b) {
    return b.AoTY-a.AoTY;
  });

  // Extract the list of dimensions and create a scale for each.
  // dimensions are scores from review publications
  x.domain(dimensions = d3.keys(data[0]).filter(function(d) {
    return metadata.indexOf(d) == -1;
  }));

  //determine cell size based on the number of dimensions
  var cell_width = width / (dimensions.length + 4 );
  var cell_height = 16;

  //swap first two dimensions such that AoTY appears first
  var tmp = dimensions[1];
  dimensions[1] = dimensions[0];
  dimensions[0] = tmp;

  //specify range and domain of bar charts based on cell width
  z.range([0,cell_width / 1.5])
   .domain([0,100]);

  //specify genre scale domain
  genreScale.domain(data.map( function (d) { 
    return d.Genre; 
  }));

  //specify label scale domain
  labelScale.domain(data.map( function (d) { 
    return d.Label; 
  }));

  /**

  HEADER

  **/

  //append container containing column heads to header panel
  var header = header_svg.append("g")
                         .attr("class","header");

  //append title to header                       
  header.append("text")
        .attr("class","title")
        .attr("dy", "0.7em")
        .text(function() {
          if (width >= 1400) 
            return "SoundConsensus";
          else 
            return "SC"; //short version for small windows
        });

  //append year to header
  header.append("text")
        .attr("class","year")
        .attr("dy", "0.7em")
        .attr("dx", "8em")
        .attr("dx", function() {
          if (width >= 1400) 
            return "8em";
          else 
            return "1.4em"; //condensed version for small windows
        })
       .text("14");

  //append subtitle to header
  header.append("text")
        .attr("class","subtitle")
        .attr("dy", "2.1em")
        .text(function() {
          if (width >= 1400) 
            return "a visual summary of music review scores";
          else 
            return "music review scores"; //short version for small windows
        });
     
  //append artist column head to header
  header.append("text")
        .attr("text-anchor", "end")
        .attr("class","artist")
        .attr("dy", "0.9em")
        .text("Artist")
        .attr("transform", function(d, i) { 
          return "translate(" + (3.25 * cell_width) + ",0)"; 
        });

  //append album column head to header
  header.append("text")
        .attr("class","album")
        .attr("text-anchor", "end")
        .attr("dy", "2em")
        .text("Album")
        .attr("transform", function(d, i) { 
          return "translate(" + (3.25 * cell_width) + ",0)"; 
        });

  //append column heads to header, one for each dimension
  header.selectAll("column")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class","column")
        .append("text")
        .attr("dy", "1.2em")            
        .attr("transform", function(d,i) { 
          return "translate(" + (3.5 * cell_width + i * cell_width) + ",0)"; 
        })
        .text(function(d) { 
          return d; 
        });

  /**

  MAIN BODY

  **/     

  //append "table" of rows containing data to main panel
  var table = main_svg.append("g")
                 .attr("class","table")
                 .attr("transform", function(d, i) { 
                  return "translate(0," + 35 + ")"; 
                 });

  //append rows to the table, one for each datum
  var row = table.selectAll("row")
                 .data(data)
                 .enter()
                 .append("g")
                 .attr("class", "row")                 
                 .attr("transform", function(d, i) { 
                  return "translate(0," + i * 25 + ")"; 
                 })
                 .on("mouseover", function(d) { //specify tooltip behaviour
                  tooltip.transition()
                     .duration(200) 
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
                    "<br/>" + d.Artist_url)
                    .style("left", (d3.event.pageX + 10) + "px")       
                    .style("top", (d3.event.pageY + 15) + "px");                    
                  d3.select(this) //genreHighlight corresponding row of cells 
                    .selectAll("rect")
                    .transition()
                    .duration(200)
                    .style("stroke", "#b00");
                  d3.select(this)
                    .selectAll("rect.value")
                    .transition()
                    .duration(200)
                    .style("fill", "#fcc")
                    .style("stroke", "#b00");
                  d3.select(this)
                    .selectAll("text.album")
                    .style("fill", "#b00");
                  d3.select(this)
                    .selectAll("text.artist")
                    .style("fill", "#b00");
                })
                .on("mouseout", function() {  //undo mouseover events 
                  tooltip.transition()
                         .delay(100)
                         .duration(200) 
                         .style('pointer-events', 'none')
                         .style("opacity", 0);                                      
                  d3.select(this)
                    .selectAll("rect")
                    .transition()
                    .delay(100)
                    .duration(200)
                    .style("stroke", "#999");
                  d3.select(this)
                    .selectAll("rect.value")
                    .transition()
                    .delay(100)
                    .duration(200)
                    .style("fill", "#ccc")
                    .style("stroke", "#999");
                  d3.select(this).selectAll("text.album")
                    .style("fill", "#000");
                  d3.select(this).selectAll("text.artist")
                    .style("fill", "#666");
                });

  //append row header to each row to contain artist and album
  var row_header = row.append("g")
                      .attr("class","row_header");  

  //append artist link and name to row header
  row_header.append("a")
            .attr("xlink:href", function(d){ 
              return d.Profile_url ; 
            })     
            .append("text")
            .attr("text-anchor", "end")
            .attr("class","artist")
            .attr("dy", "0.9em")
            .text(function(d) { 
              return d.Artist; 
            })
            .attr("transform", function(d, i) { 
              return "translate(" + (3.25 * cell_width) + ",0)"; 
            });

  //append album link and name to row header
  row_header.append("a")
            .attr("xlink:href", function(d){ 
              return d.Album_url ; 
            })
            .append("text")
            .attr("class","album")
            .attr("text-anchor", "end")
            .attr("dy", "2em")
            .text(function(d) { 
              return d.Album ; 
            })
            .attr("transform", function(d, i) { 
              return "translate(" + (3.25 * cell_width) + ",0)"; 
            });

  //append cells to each row, map each cell to a dimension
  var cell = row.selectAll("cell")
                .data(function(d) { 
                  return dimensions.map(function(k) { 
                    return d[k]; 
                  }); 
                })
                .enter()
                .append("g")
                .attr("class","cell")
                .attr("transform", function(d, i) { 
                  return "translate(" + (3.5 * cell_width + i * cell_width) + ",0)"; 
                })
                .attr("width", cell_width / 1.5)
                .attr("height", cell_height);

  //append rectangular bounds to each cell
  cell.append("rect")   
      .attr("class", "bounds")
      .attr("height", cell_height)
      .attr("width", cell_width / 1.5);                 

  //append link to album page and bar scaled to score to cell
  cell.append("a")
      .attr("class", "link")
      .attr("xlink:href", function(d) { 
        return d3.select(this.parentNode.parentNode).datum().Album_url; 
      })
      .append("rect")
      .attr("class","value")
      .attr("height", cell_height)
      .attr("width", function(d) { 
        return z(d); 
      });

  //append album score in the cell
  cell.append("text")
      .attr("height", cell_height)
      .attr("dy", "1.5em")
      .attr("dx", "0.3em")
      .text(function(d) { 
        return d; 
      });

  //listen for dispatch events from genre selector
  genreDispatch.on("genreHighlight.row", function(genre) {
    row.style("opacity", function(d){
      if (d.Genre == genre || genre == "") 
        return 1;
      else 
        return 0.25;
    })
  });

  //listen for dispatch events from label selector
  labelDispatch.on("labelHighlight.row", function(label) {
    row.style("opacity", function(d){
      if (d.Label == label || label == "") 
        return 1;
      else 
        return 0.25;
    })
  });

  /**

  FOOTER

  **/ 

  //append genre dropdown to footer, 
  var selectGenre = d3.select("#footer")
                      .append("select")
                      .on("change", changeGenre),
      genreOptions = selectGenre.selectAll("option")
                                .data(genreScale.domain().sort());

  //populate genre dropdown with genres 
  genreOptions.enter()
         .append("option")
         .text(function (d) { 
          return d; 
         });

  //whenever a genre is selected from the dropdown, issue a dispatch event 
  function changeGenre() {
    var selectedGenreIndex = selectGenre.property("selectedIndex"),
        selectedGenre = genreOptions[0][selectedGenreIndex].__data__;
    genreDispatch.genreHighlight(selectedGenre);
  }

  //append label dropdown to footer, 
  var selectLabel = d3.select("#footer")
                      .append("select")
                      .on("change", changeLabel),
      labelOptions = selectLabel.selectAll("option")
                                .data(labelScale.domain().sort());

  //populate label dropdown with labels
  labelOptions.enter()
         .append("option")
         .text(function (d) { 
          return d; 
         });

  //whenever a label is selected from the dropdown, issue a dispatch event 
  function changeLabel() {
    var selectedLabelIndex = selectLabel.property("selectedIndex"),
        selectedlabel = labelOptions[0][selectedLabelIndex].__data__;
    labelDispatch.labelHighlight(selectedlabel);
  }

}); //end d3.csv load