/**

SoundConsensus

A visual summary of album review scores
Data scraped from albumoftheyear.org

by Matt Brehmer / @mattbrehmer

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
    height = 2440;

//initialize scales
var x = d3.scale.ordinal(),
    y = d3.scale.linear(), //scales for each dimension
    z = d3.scale.linear(), //scale for bar charts
    genre_scale = d3.scale.ordinal(), //ordinal scale for genres
    label_scale = d3.scale.ordinal(); //ordinal scale for labels

//initialize dispatch for highlighting selections from dropdowns
var dispatch = d3.dispatch("highlight");
                  

//initialize main svg area
var main_svg = d3.select("body")
                 .append("svg")
                 .attr("id", "main_panel")
                 .attr("width", width)
                 .attr("height", height);

//initialize header svg
var header_svg = d3.select("body")
                   .append("svg")
                   .attr("id", "header_panel")
                   .attr("width", width)
                   .attr("height", 25); 

//initialize footer svg
var footer_svg = d3.select("body")
                   .append("svg")
                   .attr("id", "footer_panel")
                   .attr("width", width)
                   .attr("height", 25) ;    

//initialize tooltip svg
var tooltip_svg = d3.select("body")
                    .append("svg")
                    .attr("id", "tooltip_panel")
                    .attr("class", "tooltip")
                    .attr("width", 160)
                    .attr("height", 120);

//tooltip text and link fields
tooltip_svg.append("a")
           .attr("id","tooltip_artist_link") 
           .append("text")
           .attr("dy", "0.9em")
           .attr("dx", "0.3em")
           .attr("class","artist")
           .attr("id","tooltip_artist");                                                

tooltip_svg.append("a")
           .attr("id","tooltip_album_link")
           .append("text")
           .attr("dy", "1.9em")
           .attr("dx", "0.3em")
           .attr("class","album")
           .attr("id","tooltip_album");                                                

tooltip_svg.append("text")
          .attr("dy", "3.9em")
          .attr("dx", "0.3em")
          .attr("id","tooltip_genre");                                                                                              

tooltip_svg.append("text")
          .attr("dy", "4.9em")
          .attr("dx", "0.3em")
          .attr("id","tooltip_release");     

tooltip_svg.append("text")
          .attr("dy", "6.9em")
          .attr("dx", "0.3em")
          .attr("id","tooltip_score");                                            

tooltip_svg.append("a")
           .attr("id","tooltip_website_link")
           .append("text")
           .attr("dy", "8.9em")
           .attr("dx", "0.3em")
           .attr("class","album")
           .attr("id","tooltip_website");                                                

              
//create an array of known metadata dimensions              
var metadata = ["Album_url", 
                "Artist",
                "Profile_url",
                "Album",
                "ReleaseDate",
                "Label",
                "Genre",
                "Artist_url",
                "AoTY"]

//load the data from csv
d3.csv("data-aoty/albumscores.csv", function(error, data) { 
  d3.csv("data-aoty/albumranks.csv", function(error, rank_data) { 
    d3.csv("data-aoty/list_urls.csv", function(error, reviewer_data) { 

      rank_dimensions = d3.keys(rank_data[0]);

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
      var cell_width = width / (dimensions.length + 4.5 );
      var cell_height = 16;

      x.rangePoints([cell_width * 4, 
        cell_width * 4 + dimensions.length * cell_width], 1);  

      //specify range and domain of bar charts based on cell width
      y.range([0,height - 100])
       .domain([0,data.length - 1]);

      //specify range and domain of bar charts based on cell width
      z.range([0,cell_width / 1.5])
       .domain([0,100]);

      //specify genre scale domain
      genre_scale.domain(data.map( function (d) { 
        return d.Genre; 
      }));

      //specify label scale domain
      label_scale.domain(data.map( function (d) { 
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
            .style("pointer-events", "none")
            .attr("transform", function(d, i) { 
              return "translate(" + (3.25 * cell_width) + ",0)"; 
            });

      //append album column head to header
      header.append("text")
            .attr("class","album")
            .attr("text-anchor", "end")
            .attr("dy", "2em")
            .text("Album")
            .style("pointer-events", "none")
            .attr("transform", function(d, i) { 
              return "translate(" + (3.25 * cell_width) + ",0)"; 
            });

      //append aoty column head to header
      header.append("a")
            .attr("xlink:href", 
              "http://www.albumoftheyear.org/ratings/overall/2014/")
            .append("text")
            .attr("dy", "0.9em")
            .text("AoTY")
            .attr("class","column")
            .style("fill", "#de2d26")
            .attr("transform", function(d, i) { 
              return "translate(" + (3.5 * cell_width) + ",0)"; 
            });   

      //append AoTY subtitle to header
      header.append("a")
            .attr("xlink:href", 
              "http://www.albumoftheyear.org/ratings/overall/2014/")
            .append("text")
            .attr("class","album")
            .attr("dy", "2em")
            .text("(overall)")
            .attr("transform", function(d, i) { 
              return "translate(" + (3.5 * cell_width) + ",0)"; 
            });         

      //append column heads to header, one for each dimension
      header.selectAll("column")
            .data(dimensions)
            .enter()
            .append("g")
            .append("a")
            .attr("xlink:href", function(d) {
              return getReviewerData(d,2);
            })
            .append("text")
            .attr("class","column")
            .attr("dy", "1.2em")            
            .attr("transform", function(d,i) { 
              return "translate(" + (4.5 * cell_width + i * cell_width) + ",0)"; 
            })
            .text(function(d) { 
              return d; 
            })
            .on("mouseover", function(d,i) { //specify tooltip behaviour, repurpose tooltip
              d3.select("#tooltip_artist") //reviewer name
                .transition()
                .text(getReviewerData(d,3));
              d3.select("#tooltip_artist_link") //reviewer aoty url
                .transition()
                .attr("xlink:href", getReviewerData(d,1));
              d3.select("#tooltip_album") //reviewer abbreviation
                .transition()
                .text(d);
              d3.select("#tooltip_album_link")
                .transition()
                .attr("xlink:href", getReviewerData(d,1));
              d3.select("#tooltip_genre")
                .transition()
                .text("");
              d3.select("#tooltip_release")
                .transition()
                .text("Founded: " + getReviewerData(d,4));
              d3.select("#tooltip_score")
                .transition()
                .text("Location: " + getReviewerData(d,5));
              d3.select("#tooltip_website_link")
                .transition()
                .attr("xlink:href", getReviewerData(d,2));
              d3.select("#tooltip_website")
                .transition()
                .text(getReviewerData(d,2));
            })
            .append("title")
              .text(function(d) {
                return getReviewerData(d,3);
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

      var selected_row = null;                    

      //append rows to the table, one for each datum
      var row = table.selectAll("row")
                     .data(data)
                     .enter()
                     .append("g")
                     .attr("class", "row")
                     .on("mouseover", function(d,i) { //specify tooltip behaviour 
                      d3.select("#tooltip_artist")
                        .transition()
                        .text(d.Artist);
                      d3.select("#tooltip_artist_link")
                        .transition()
                        .attr("xlink:href", d.Profile_url);
                      d3.select("#tooltip_album")
                        .transition()
                        .text(d.Album);
                      d3.select("#tooltip_album_link")
                        .transition()
                        .attr("xlink:href", d.Album_url);
                      d3.select("#tooltip_genre")
                        .transition()
                        .text("Genre: " + d.Genre);
                      d3.select("#tooltip_release")
                        .transition()
                        .text("Released: " + d.ReleaseDate + " (" + d.Label + ")");
                      d3.select("#tooltip_score")
                        .transition()
                        .text("AoTY rank (score): " + (i + 1) + " (" + d.AoTY + ")");
                      d3.select("#tooltip_website_link")
                        .transition()
                        .attr("xlink:href", d.Artist_url);
                      d3.select("#tooltip_website")
                        .transition()
                        .text(d.Artist_url);
                    })
                     .on("mouseenter", function(d,i) {
                      if (selected_row != d.Album_url) {             
                        d3.select('.table').selectAll(".row").sort(function (a, b) { // select the parent and sort the path's
                            if (a.Album_url != d.Album_url && a.Album_url != selected_row) return -1;               // a is not the hovered element, send "a" to the back
                            else return 1;                             // a is the hovered element, bring "a" to the front
                        });
                        d3.select(this) //highlight corresponding row of cells 
                          .selectAll("rect")
                          .transition()
                          .duration(200)
                          .style("stroke", "#de2d26");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
                          .duration(200)
                          .style("fill", "#fcbba1")
                          .style("stroke", "#de2d26");
                        d3.select(this)
                          .selectAll("text.album")
                          .style("fill", "#de2d26");
                        d3.select(this)
                          .selectAll("text.artist")
                          .style("fill", "#de2d26");
                        d3.select(this)
                          .selectAll("line.link_line")
                          .style("opacity", "1")
                          .style("stroke", "#de2d26");
                      }
                    })
                  .on("click", function(d,i) { //specify tooltip behaviour
                      if (selected_row == null) {
                        selected_row = d.Album_url;
                        d3.select('.table').selectAll(".row").sort(function (a, b) { // select the parent and sort the path's
                            if (a.Album_url != d.Album_url && a.Album_url != selected_row) return -1;               // a is not the hovered element, send "a" to the back
                            else return 1;                             // a is the hovered element, bring "a" to the front
                        });
                        d3.select(this) //highlight corresponding row of cells 
                          .selectAll("rect")
                          .transition()
                          .duration(200)
                          .style("stroke", "#54278f");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
                          .duration(200)
                          .style("fill", "#bcbddc")
                          .style("stroke", "#54278f");
                        d3.select(this)
                          .selectAll("text.album")
                          .style("fill", "#54278f");
                        d3.select(this)
                          .selectAll("text.artist")
                          .style("fill", "#54278f");
                        d3.select(this)
                          .selectAll("line.link_line")
                          .style("opacity", "1")
                          .style("stroke", "#54278f");
                      }
                      else if (selected_row == d.Album_url){
                        selected_row = null;
                        d3.select(this) //highlight corresponding row of cells 
                          .selectAll("rect")
                          .transition()
                          .duration(200)
                          .style("stroke", "#bbb");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
                          .duration(200)
                          .style("fill", "#ccc")
                          .style("stroke", "#bbb");
                        d3.select(this)
                          .selectAll("text.album")
                          .style("fill", "#666");
                        d3.select(this)
                          .selectAll("text.artist")
                          .style("fill", "#000");
                        d3.select(this)
                          .selectAll("line.link_line")
                          .style("opacity", "1")
                          .style("stroke", "#bbb");
                      }
                    })
                    .on("mouseleave", function(d,i) {  //undo mouseenter events                    
                      if (selected_row != d.Album_url) {                      
                        d3.select(this)
                          .selectAll("rect")
                          .transition()
                          .delay(100)
                          .duration(200)
                          .style("z-index", "0")
                          .style("stroke", "#bbb");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
                          .delay(100)
                          .duration(200)
                          .style("fill", "#ccc")
                          .style("stroke", "#bbb");
                        d3.select(this).selectAll("text.album")
                          .style("fill", "#666");
                        d3.select(this).selectAll("text.artist")
                          .style("fill", "#000");
                        d3.select(this)
                          .selectAll("line.link_line")
                          .style("opacity", "0.25")
                          .style("stroke", "#bbb");
                      }
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
                .attr("y", function(d,i) {
                  return y(i);
                })
                .attr("transform", function(d, i) { 
                  return "translate(" + (3.25 * cell_width) + ",0)"; 
                });

      //append album link and name to row header
      row_header.append("a")
                .attr("class", "link")
                .attr("xlink:href", function(d) { 
                  return d.Album_url; 
                })
                .append("text")
                .attr("class","album")
                .attr("text-anchor", "end")
                .attr("dy", "2em")
                .text(function(d) { 
                  return d.Album ; 
                })
                .attr("y", function(d,i) {
                  return y(i);
                })
                .attr("transform", function(d, i) { 
                  return "translate(" + (3.25 * cell_width) + ",0)"; 
                });

      //append index to row header
      row_header.append("text")
                .attr("class","index")
                .attr("text-anchor", "end")
                .attr("dy", "1.5em")
                .text(function(d, i) {
                  if (width >= 1400) 
                    return i + 1;
                  else 
                    return ""; //don't show in small windows
                })
                .attr("y", function(d,i) {
                  return y(i);
                })
                .attr("transform", function(d, i) { 
                  return "translate(" + (3.47 * cell_width) + ",0)"; 
                });          

      //append aoty cell to each row
      var aotycell = row.append("g")
                        .attr("class","cell")
                        .attr("y", function(d,i) {
                          return y(i);
                        })
                        .attr("transform", function(d) { 
                          return "translate(" + 
                            (3.5 * cell_width) + 
                            ",0)"; 
                        })
                        .attr("width", cell_width / 1.5)
                        .attr("height", cell_height);

      //append rectangular bounds to each cell
      aotycell.append("rect")   
              .attr("class", "bounds")
              .attr("height", cell_height)
              .attr("width", cell_width / 1.5)
              .attr("y", function(d,i) {
                  return y(i);
              });                 

      //append link to album page and bar scaled to score to cell
      aotycell.append("rect")
              .attr("class","value")
              .attr("height", cell_height)
              .attr("width", function(d) { 
                return z(d.AoTY); 
              })
              .attr("y", function(d,i) {
                return y(i);
              });

      //append album score in the cell
      aotycell.append("text")
              .attr("class","score")
              .attr("height", cell_height)
              .attr("dy", "1.5em")
              .attr("dx", "0.3em")
              .text(function(d) { 
                return d.AoTY; 
              })
              .attr("y", function(d,i) {
                  return y(i);
              });       

      //append line to cell, link to next cell
      aotycell.append("line")
              .attr("class","link_line")
              .attr("x1", function() {
                return x(dimensions[0]) - 3.825 * cell_width;
              })
              .attr("x2", function() {
                  return x(dimensions[0]) - 3.5 * cell_width;
              })
              .attr("y1", function(d,i) {
                if (getRank(d.Album_url,dimensions[0]) == -1)
                  return y(-1);
                else
                  return y(i) + cell_height / 2;
              })
              .attr("y2", function(d,i) {
                if (getRank(d.Album_url,dimensions[0]) == -1)
                  return y(-1);
                else 
                  return y(getRank(d.Album_url,dimensions[0])) + cell_height / 2;
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
                    .attr("width", cell_width / 1.5)
                    .attr("height", cell_height);

      //append rectangular bounds to each cell
      cell.append("rect")   
          .attr("class", "bounds")
          .attr("height", cell_height)
          .attr("width", cell_width / 1.5)
          .attr("x", function(d,i) {
            return x(dimensions[i]);
          })
          .attr("y", function(d,i) {
            if (d == '')
              return y(data.length - 1);
            else
              return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]));        
          })
          .style("stroke-width", function(d) { 
            if (d == '')
              return 0 + "px"; 
          });                 

      //append bar scaled to score to cell
      cell.append("rect")
          .attr("class","value")
          .attr("height", cell_height)
          .attr("width", function(d) { 
            return z(d); 
          })
          .attr("x", function(d,i) {
            return x(dimensions[i]);
          })
          .attr("y", function(d,i) {
            if (d == '')
              return y(data.length - 1);
            else
              return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]));        
          });

      //append album score in the cell
      cell.append("text")
          .attr("class","score")
          .attr("height", cell_height)
          .attr("dy", "1.5em")
          .attr("dx", "0.3em")
          .text(function(d) { 
            return d; 
          })      
          .style("fill", function(d) { 
            if (d == 100)
              return "#de2d26"; 
          })
          .style("font-weight", function(d) { 
            if (d == 100)
              return "bold"; 
          })
          .attr("x", function(d,i) {
            return x(dimensions[i]);
          })
          .attr("y", function(d,i) {
            if (d == '')
              return y(data.length - 1);
            else
              return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]));
          });

      //append line to cell, link to next cell
      cell.append("line")
          .attr("class","link_line")
          .attr("x1", function(d,i) {
            return x(dimensions[i]) + cell_width / 1.5;
          })
          .attr("x2", function(d,i) {
            if (i + 1 == dimensions.length)
              return x(dimensions[i]);
            else
              return x(dimensions[i+1]);
          })
          .attr("y1", function(d,i) {
            if (i + 1 == dimensions.length || 
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]) == -1 ||
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i+1]) == -1)
              return y(-1);
            else
              return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i])) + cell_height / 2;
          })
          .attr("y2", function(d,i) {
            if (i + 1 == dimensions.length || 
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]) == -1 ||
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i+1]) == -1)
              return y(-1);
            else 
              return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i+1])) + cell_height / 2;
          });
        
      //listen for dispatch events from genre selector
      dispatch.on("highlight.row", function(genre,label) {
        row.selectAll('.album').style("opacity", function(d){
          if ((d.Genre == genre || genre == "") && 
              (d.Label == label || label == ""))
            return 1;
          else 
            return 0.25;
        }); 
        row.selectAll('.artist').style("opacity", function(d){
          if ((d.Genre == genre || genre == "") && 
              (d.Label == label || label == ""))
            return 1;
          else 
            return 0.25;
        }); 
        row.style("pointer-events", function(d){
          if ((d.Genre == genre || genre == "") && 
              (d.Label == label || label == ""))
            return 'inherit';
          else 
            return 'none';
        }); 
        row.sort(function (d, a) { // select the parent and sort the path's
          if ((d.Genre == genre || genre == "") && 
              (d.Label == label || label == ""))               // a is not the hovered element, send "a" to the back
            return 1;
          else 
            return -1;                             // a is the hovered element, bring "a" to the front
        });

        row.selectAll('.cell').style("display", function(d){
          if ((d3.select(this.parentNode).datum().Genre == genre || genre == "") && 
              (d3.select(this.parentNode).datum().Label == label || label == ""))
            return 'inline';
          else 
            return 'none';
        });    
      });

      //function for getting reviewer metdata, given an abbreviation and a metadata dimension index
      function getReviewerData (reviewer,metadata) {

        var index = reviewer_data.map(function(e) { 
          return e.reviewNames; 
        }).indexOf(reviewer);

        switch(metadata) {
          case 0:
            return reviewer_data[index].reviewNames;
            break;
          case 1:
            return reviewer_data[index].aotyUrls;
            break;
          case 2:
            return reviewer_data[index].url;
            break;
          case 3:
            return reviewer_data[index].fullName;
            break;
          case 4:
            return reviewer_data[index].yearFounded;
            break;
          case 5:
            return reviewer_data[index].location;
            break;
        }
      }

      //function for determining rank according to current dimension 
      function getRank (url,dimension) {

        var index = rank_data.map(function(e) { 
          return e.Album_url; 
        }).indexOf(url);

        var dim_index = rank_dimensions.indexOf(dimension);

        var rank = rank_data[index][rank_dimensions[dim_index]];

        if (rank - 1 == -1)
          console
        
        return rank - 1;
      }

      /**

      FOOTER

      **/ 

      //append container credits to footer panel
      var footer = footer_svg.append("g")
                             .attr("class","footer");

      //append title to footer                       
      footer.append("a")
            .attr("xlink:href", 
              "https://twitter.com/mattbrehmer")
            .append("text")
            .attr("class","attribution")
            .attr("dy", "0.6em")
            .text("by @mattbrehmer");

      //append subtitle to footer
      footer.append("a")
            .attr("xlink:href", 
              "http://www.albumoftheyear.org/ratings/overall/2014/")
            .append("text")
            .attr("class","attribution")
            .attr("dy", "2.0em")
            .text("data from AoTY / albumoftheryear.org");

      d3.select("#footer")
        .html("Filter by genre and / or by record label: ")

      var empty_string = [""];

      //append genre dropdown to footer, 
      var select_genre = d3.select("#footer")
                           .append("select")
                           .on("change", dropdownChange),
          genre_options = select_genre.selectAll("option")
                                      .data(empty_string.concat(genre_scale.domain().sort()));

      //populate genre dropdown with genres 
      genre_options.enter()
                   .append("option")
                   .text(function (d) { 
                    return d; 
                   });     

      //append label dropdown to footer, 
      var select_label = d3.select("#footer")
                          .append("select")
                          .on("change", dropdownChange),
          label_options = select_label.selectAll("option")
                                    .data(empty_string.concat(label_scale.domain().sort()));

      //populate label dropdown with labels
      label_options.enter()
                   .append("option")
                   .text(function (d) { 
                    return d; 
                   });

      //whenever an option is selected from the dropdowns, issue a dispatch event 
      function dropdownChange() {
        var selected_genre_index = select_genre.property("selectedIndex"),
            selected_genre = genre_options[0][selected_genre_index].__data__,
            selected_label_index = select_label.property("selectedIndex"),
            selected_label = label_options[0][selected_label_index].__data__;
        dispatch.highlight(selected_genre,selected_label);
      }       

    }); //end d3.csv load
  }); //end d3.csv load
}); //end d3.csv load