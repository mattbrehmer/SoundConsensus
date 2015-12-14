/**

SoundConsensus

A visual summary of album review scores
Data scraped from albumoftheyear.org

by Matt Brehmer / @mattbrehmer

December 2015

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
    width = window.innerWidth - 15,
    height = 4000;

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
                   .attr("height", 35);

//initialize filter div
var filter_div = d3.select("body")
                   .append("div")
                   .attr("id", "filter_div");

//initialize footer svg
var footer_svg = d3.select("body")
                   .append("svg")
                   .attr("id", "footer_panel")
                   .attr("width", width)
                   .attr("height", 35) ;

//initialize detail svg
var detail_svg = d3.select("body")
                    .append("svg")
                    .attr("id", "detail_panel")
                    .attr("class", "detail");

//detail text and link fields
detail_svg.append("a")
           .attr("id","detail_artist_link")
           .append("text")
           .attr("x",105)
           .attr("dy", "0.9em")
           .attr("dx", "0.3em")
           .attr("class","artist")
           .attr("id","detail_artist");

detail_svg.append("a")
           .attr("id","detail_album_link")
           .append("text")
           .attr("x",105)
           .attr("dy", "1.9em")
           .attr("dx", "0.3em")
           .attr("class","album")
           .attr("id","detail_album");

detail_svg.append("a")
          .attr("id","detail_album_art_link")
          .append("svg:image")
          .attr("x",0)
          .attr("y",0)
          .attr("width",100)
          .attr("height",100)
          .attr("class","album_art")
          .attr("id","detail_album_art");

detail_svg.append("text")
          .attr("x",105)
          .attr("dy", "3.9em")
          .attr("dx", "0.3em")
          .attr("id","detail_genre");

detail_svg.append("text")
          .attr("x",105)
          .attr("dy", "4.9em")
          .attr("dx", "0.3em")
          .attr("id","detail_release");

detail_svg.append("text")
          .attr("x",105)
          .attr("dy", "6.9em")
          .attr("dx", "0.3em")
          .attr("id","detail_score");

detail_svg.append("a")
           .attr("id","detail_website_link")
           .append("text")
           .attr("x",105)
           .attr("dy", "8.9em")
           .attr("dx", "0.3em")
           .attr("class","album")
           .attr("id","detail_website");

var about_visible = false;

var about_panel = d3.select("body")
                    .append("div")
                    .attr("id", "about_panel")
                    .style("display",'none')
                    .on("click", function() {
                      about_visible = false;
                      d3.select(this).style("display","none");
                    })
                    .html('<a href="https://github.com/mattbrehmer/SoundConsensus" target="_blank"><strong>SoundConsensus</strong></a> is an interactive visualization by @<a href="https://twitter.com/mattbrehmer">mattbrehmer</a> for comparing multiple ranked lists of record reviews from 19 prominent music publications. ' +
                      'The data visualized here represents the 108 most-reviewed records released in 2015, according to the music publication aggregator site <a href="http://www.albumoftheyear.org/ratings/overall/2015/16">albumoftheyear.org</a>. ' +
                      '<br/><br/><strong>Visual Encoding</strong>: Each column is associated with a music publication. Each cell containing a bar corresponds to a review score. The vertical position of a cell encodes its rank among other reviews from that publication. ' +
                      'The bars in each cell encode the score itself.<br/><br/>The first column is unique in that it encodes the overall rank and score calculated by <a href="http://www.albumoftheyear.org/ratings/overall/2015/16">albumoftheyear.org</a>. ' +
                      '<br/><br/>The columns are of unequal size because: (1) not all of the music publications reviewed all of the records; and (2) some music publications use a 10-point scale when rating a record, resulting in more ties than those using a 100-point or decimal scale. ' +
                      '<br/><br/><strong>Interaction</strong>: Hover over a record\'s artist or name to highlight the ranks and scores across all of the music publications who reviewed the record, and to see details about the record (such as genre, record label, and release date) in the panel at the lower left. ' +
                      '<br/><br/>You can also hover over any cell. ' +
                      'Clicking on a cell makes the highlighting persist, which can facilitate comparisons between records. Clicking again removes the highlight. ' +
                      '<br/><br/>Click on an artist name or album name to visit corresponding <a href="http://www.albumoftheyear.org">albumoftheyear.org</a> artist and album profile pages, which contain links to the original reviews. ' +
                      '<br/><br/>Hover over a column header to see the corresponding music publication\'s full name in a detail, along with details about the publication in the panel at the lower left. ' +
                      '<br/><br/><strong>Genre / Record Label Filtering</strong>: Select a musical genre and / or record label from the dropdown boxes in the lower left to filter the list of records (filtering maintains the relative rank positions of review scores). ' +
                      '<br/><br/><strong>Consensus Filtering</strong>: Select a consensus level from the dropdown box in the lower left to filter based on a record\'s standard deviation of review scores, where a high standard deviation corresponds to a low consensus, and vice versa (consensus ranges are at 20% quantiles). ' +
                      '<br/><br/>View the <a href="https://github.com/mattbrehmer/SoundConsensus" target=_blank">Github repo</a>.' +
                      '<br/><br/>(Click anywhere in this panel to close it.)');

//create an array of known metadata dimensions
var metadata = ["Album_url",
                "Artist",
                "Profile_url",
                "Album",
                "ReleaseDate",
                "Label",
                "Genre",
                "Artist_url",
                "AoTY",
                "SD",
                "Cover"]

//load the data from csv
d3.csv("data/albumscores.csv", function(error, data) {
  d3.csv("data/albumranks.csv", function(error, rank_data) {
    d3.csv("data/list_urls.csv", function(error, reviewer_data) {

      //sort SD array for consensus filtering
      var sd_arr = data.map(function(e) { return +e.SD; }).sort(d3.ascending);

      //get list of dimensions from rank data
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
      header.append("a")
            .attr("xlink:href","https://github.com/mattbrehmer/SoundConsensus")
            .append("text")
            .attr("class","title")
            .attr("dy", "0.7em")
						.attr("dx", "1em")
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
            .attr("dx", "9.2em")
            .attr("dx", function() {
              if (width >= 1400)
                return "9.2em";
              else
                return "2.25em"; //condensed version for small windows
            })
           .text("15");

      //append subtitle to header
      header.append("text")
            .attr("class","subtitle")
						.attr("dx", "1.8em")
            .attr("dy", "2.4em")
            .text(function() {
              if (width >= 1400)
                return "the year's most-reviewed records";
              else
                return ""; //short version for small windows
            });

      //append artist column head to header
      header.append("text")
            .attr("text-anchor", "end")
            .attr("class","artist")
            .attr("dy", "0.9em")
            .text("Artist")
            .style("pointer-events", "none")
            .attr("transform", function() {
              return "translate(" + (3.25 * cell_width) + ",0)";
            });

      //append album column head to header
      header.append("text")
            .attr("class","album")
            .attr("text-anchor", "end")
            .attr("dy", "2em")
            .text("Album")
            .style("pointer-events", "none")
            .attr("transform", function() {
              return "translate(" + (3.25 * cell_width) + ",0)";
            });

      //append aoty column head to header
      header.append("a")
            .attr("xlink:href",
              "http://www.albumoftheyear.org/ratings/overall/2015/16")
            .append("text")
            .attr("dy", "0.9em")
            .text("AoTY")
            .attr("class","column")
            .style("fill", "#de2d26")
            .attr("transform", function() {
              return "translate(" + (3.5 * cell_width) + ",0)";
            })
            .append("title")
              .text("albumoftheyear.org");

      //append AoTY subtitle to header
      header.append("a")
            .attr("xlink:href",
              "http://www.albumoftheyear.org/ratings/overall/2015/16")
            .append("text")
            .attr("class","album")
            .attr("dy", "2em")
            .text("(overall)")
            .attr("transform", function() {
              return "translate(" + (3.5 * cell_width) + ",0)";
            })
            .append("title")
              .text("albumoftheyear.org");

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
            .on("mouseover", function(d,i) { //specify detail behaviour, repurpose detail
              d3.select("#detail_artist") //reviewer name
                .transition()
                .text(getReviewerData(d,3));
              d3.select("#detail_artist_link") //reviewer aoty url
                .transition()
                .attr("xlink:href", getReviewerData(d,1));
              d3.select("#detail_album") //reviewer abbreviation
                .transition()
                .text(d);
              d3.select("#detail_album_link")
                .transition()
                .attr("xlink:href", getReviewerData(d,1));
              d3.select("#detail_album_art_link")
                  .transition()
                  .attr("xlink:href", "");
              d3.select("#detail_album_art")
                  .transition()
                  .attr("xlink:href", "");
              d3.select("#detail_genre")
                .transition()
                .text("");
              d3.select("#detail_release")
                .transition()
                .text("Founded: " + getReviewerData(d,4));
              d3.select("#detail_score")
                .transition()
                .text("Location: " + getReviewerData(d,5));
              d3.select("#detail_website_link")
                .transition()
                .attr("xlink:href", getReviewerData(d,2));
              d3.select("#detail_website")
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
                            return "translate(0," + 40 + ")";
                          });

      var selected_row = null;

      //append rows to the table, one for each datum
      var row = table.selectAll("row")
                     .data(data)
                     .enter()
                     .append("g")
                     .attr("class", "row")
                     .on("mouseover", function(d,i) { //specify detail behaviour
                      d3.select("#detail_artist")
                        .transition()
                        .text(d.Artist);
                      d3.select("#detail_artist_link")
                        .transition()
                        .attr("xlink:href", d.Profile_url);
                      d3.select("#detail_album")
                        .transition()
                        .text(d.Album);
                      d3.select("#detail_album_art")
                        .transition()
                        .attr("xlink:href", d.Cover)
											d3.select("#detail_album_art_link")
                          .transition()
                          .attr("xlink:href", d.Album_url);
                      d3.select("#detail_album_link")
                        .transition()
                        .attr("xlink:href", d.Album_url);
                      d3.select("#detail_genre")
                        .transition()
                        .text("Genre: " + d.Genre);
                      d3.select("#detail_release")
                        .transition()
                        .text("Released: " + d.ReleaseDate + " (" + d.Label + ")");
                      d3.select("#detail_score")
                        .transition()
                        .text("AoTY rank (score): " + (i + 1) + " (" + d.AoTY + ")");
                      d3.select("#detail_website_link")
                        .transition()
                        .attr("xlink:href", d.Artist_url);
                      d3.select("#detail_website")
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
                          .style("stroke", "#de2d26");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
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
                  .on("click", function(d,i) { //specify detail behaviour
                      if (selected_row == null) {
                        selected_row = d.Album_url;
                        d3.select('.table').selectAll(".row").sort(function (a, b) { // select the parent and sort the path's
                            if (a.Album_url != d.Album_url && a.Album_url != selected_row) return -1;               // a is not the hovered element, send "a" to the back
                            else return 1;                             // a is the hovered element, bring "a" to the front
                        });
                        d3.select(this) //highlight corresponding row of cells
                          .selectAll("rect")
                          .transition()
                          .style("stroke", "#54278f");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
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
                          .style("stroke", "#bbb");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
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
                          .style("z-index", "0")
                          .style("stroke", "#bbb");
                        d3.select(this)
                          .selectAll("rect.value")
                          .transition()
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
                return y(i) + cell_height / 2;
              })
              .attr("y2", function(d,i) {
                return y(getRank(d.Album_url,dimensions[0])) + cell_height / 2;
              })
              .style("display", function(d,i){
                if (getRank(d.Album_url,dimensions[0]) == -1)
                  return "none";
                else
                  return "inline";
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
            if (i + 1 != dimensions.length)
              return x(dimensions[i+1]);
            else
              return x(dimensions[i]) + cell_width / 1.5;
          })
          .attr("y1", function(d,i) {
            return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i])) + cell_height / 2;
          })
          .attr("y2", function(d,i) {
						if (i == 18) {
							return -1;
						}
						else {
							return y(getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i+1])) + cell_height / 2;
						}
          })
          .style("display", function(d,i){
            if (i + 1 == dimensions.length ||
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i]) == -1 ||
              getRank(d3.select(this.parentNode.parentNode).datum().Album_url,dimensions[i+1]) == -1)
              return "none";
            else
              return "inline";
          });

      //listen for dispatch events from genre selector
      dispatch.on("highlight.row", function(genre,label,consensus_lb,consensus_ub) {


        row.selectAll('.album').style("opacity", function(d){
          if ((d.Genre == genre || genre == "( All Genres )") &&
              // (d.Label == label || label == "(  All Record Labels )") &&
              (d.SD >= consensus_lb) && (d.SD <= consensus_ub))
            return 1;
          else
            return 0.25;
        });
        row.selectAll('.artist').style("opacity", function(d){
          if ((d.Genre == genre || genre == "( All Genres )") &&
              (label == "( All Record Labels )" || d.Label == label) &&
              (d.SD >= consensus_lb) && (d.SD <= consensus_ub))
            return 1;
          else
            return 0.25;
        });
        row.style("pointer-events", function(d){
          if ((d.Genre == genre || genre == "( All Genres )") &&
              (label == "( All Record Labels )" || d.Label == label) &&
              (d.SD >= consensus_lb) && (d.SD <= consensus_ub))
            return 'inherit';
          else
            return 'none';
        });
        row.sort(function (d, a) { // select the parent and sort the path's
          if ((d.Genre == genre || genre == "( All Genres )") &&
              (label == "( All Record Labels )" || d.Label == label) &&
              (d.SD >= consensus_lb) && (d.SD <= consensus_ub))
            return 1; // a is not the hovered element, send "a" to the back
          else
            return -1; // a is the hovered element, bring "a" to the front
        });

        row.selectAll('.cell').style("display", function(d){
          if ((d3.select(this.parentNode).datum().Genre == genre || genre == "( All Genres )") &&
              (label == "( All Record Labels )" || label == d3.select(this.parentNode).datum().Label) &&
              (d3.select(this.parentNode).datum().SD >= consensus_lb) && (d3.select(this.parentNode).datum().SD <= consensus_ub))
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

       //append artist column head to header
      footer.append("text")
            .attr("class","artist")
            .attr("id","more_info")
            .attr("dy", "1.3em")
            .attr("dx", "2.2em")
            .text("More Info")
            .on("mouseover", function() {
              d3.select(this).style("fill","#de2d26");
              d3.select('#info_button').attr("xlink:href","assets/info-hover.png");
            })
            .on("mouseout", function() {
              d3.select(this).style("fill","#000");
              d3.select('#info_button').attr("xlink:href","assets/info.png");
            })
            .on("click", function() {
              if (!about_visible) {
                about_visible = true;
                d3.select('#about_panel').style("display","inline");
              }
              else {
                about_visible = false;
                d3.select('#about_panel').style("display","none");
              }
            });

      //append title to footer
      footer.append("a")
            .attr("xlink:href",
              "https://twitter.com/mattbrehmer")
            .append("text")
            .attr("class","attribution")
            .attr("dy", "0.6em")
            .attr("dx", "7.5em")
						.text(function() {
              if (width >= 1400)
                return "by @mattbrehmer";
              else
                return ""; //short version for small windows
            });

      //append title to footer
      footer.append("a")
            .attr("xlink:href",
              "https://github.com/mattbrehmer/SoundConsensus")
            .append("text")
            .attr("class","attribution")
            .attr("dy", "0.6em")
            .attr("dx", "12.5em")
						.text(function() {
              if (width >= 1400)
                return "(github repo)";
              else
                return ""; //short version for small windows
            });

      //append subtitle to footer
      footer.append("a")
            .attr("xlink:href",
              "http://www.albumoftheyear.org/ratings/overall/2015/16")
            .append("text")
            .attr("class","attribution")
            .attr("dy", "2.0em")
            .attr("dx", "7.5em")
						.text(function() {
              if (width >= 1400)
                return "data from AoTY / albumoftheryear.org";
              else
                return ""; //short version for small windows
            });

      //append subtitle to footer
      footer.append("image")
            .attr("id","info_button")
            .attr("xlink:href","assets/info.png")
            .style("cursor","pointer")
            .attr("width", 16)
            .attr("height", 16)
            .on("mouseover", function() {
              d3.select('#more_info').style("fill","#de2d26");
              d3.select(this).attr("xlink:href","assets/info-hover.png");
            })
            .on("mouseout", function() {
              d3.select('#more_info').style("fill","#000");
              d3.select(this).attr("xlink:href","assets/info.png");
            })
            .on("click", function() {
              if (!about_visible) {
                about_visible = true;
                d3.select('#about_panel').style("display","inline");
              }
              else {
                about_visible = false;
                d3.select('#about_panel').style("display","none");
              }
            })
            .append("title")
            .text("More info");

			var filter_form = d3.select("#filter_div").append("form")
			.attr("class","form-inline")
			.attr("role","form");

			var genre_picker = filter_form.append("div")
			.attr("class","form-group");

      var all_genres = ["( All Genres )"];

		 	genre_picker.append("label")
			.attr("for","#genre_picker")
			.text("Filters : ");

 			genre_picker.append("select")
			.attr("class","form-control")
			.attr("id","genre_select")
			.on("change", dropdownChange)
			.selectAll("option")
			.data(all_genres.concat(genre_scale.domain().sort()))
			.enter()
			.append("option")
			.text(function (d) {
				return d;
			});

		  var label_picker = filter_form.append("div")
			.attr("class","form-group");

			var all_labels = ["(  All Record Labels )"];

      //append label dropdown to footer,
      label_picker.append("div")
			.attr("class","form-group")
      .append("select")
			.attr("class","form-control")
			.attr("id","label_select")
      .on("change", dropdownChange)
    	.selectAll("option")
      .data(all_labels.concat(label_scale.domain().sort()))
			.enter()
      .append("option")
      .text(function (d) {
      	return d;
      });

		  var consensus_picker = filter_form.append("div")
			.attr("class","form-group");

      //consensus level options
      var consensus_levels = [
				"( All Consensus Levels )",
        "Low Consensus",
        // "Low-Medium Consensus",
        "Medium Consensus",
        // "Medium-High Consensus",
        "High Consensus"
			];

      //append consensus dropdown to footer,
      consensus_picker.append("div")
		  .attr("class","form-group")
      .append("select")
		  .attr("class","form-control")
			.attr("id","consensus_select")
     	.on("change", dropdownChange)
    	.selectAll("option")
      .data(consensus_levels)
			.enter()
      .append("option")
      .text(function (d) {
      	return d;
      });

      //whenever an option is selected from the dropdowns, issue a dispatch event
      function dropdownChange() {


        var selected_genre = d3.select("#genre_select").property("value"),
            selected_label = d3.select("#label_select").property("value"),
            selected_consensus_index = d3.select("#consensus_select").property("selectedIndex"),
            consensus_lb,consensus_ub; //consensus upper and lower bounds

            switch(selected_consensus_index) {
              case 0: //all consensus levels
                consensus_lb = d3.min(sd_arr);
                consensus_ub = d3.max(sd_arr);
                break;
              case 1: //low consensus
                consensus_lb = d3.quantile(sd_arr,0.66);
                consensus_ub = d3.max(sd_arr);
                break;
              // case 2: //low-medium consensus
              //   consensus_lb = d3.quantile(sd_arr,0.6);
              //   consensus_ub = d3.quantile(sd_arr,0.8);
              //   break;
              case 2: //middle consensus
                consensus_lb = d3.quantile(sd_arr,0.33);
                consensus_ub = d3.quantile(sd_arr,0.66);
                break;
              // case 4: //middle-high consensus
              //   consensus_lb = d3.quantile(sd_arr,0.2);
              //   consensus_ub = d3.quantile(sd_arr,0.4);
              //   break;
              case 3: //high consensus
                consensus_lb = d3.min(sd_arr);
                consensus_ub = d3.quantile(sd_arr,0.33);
                break;
            }

        dispatch.highlight(selected_genre,selected_label,consensus_lb,consensus_ub);
      }

    }); //end d3.csv load
  }); //end d3.csv load
}); //end d3.csv load
