var margin = {top: 0, right: 20, bottom: 0, left: 40},
    width = 400 - margin.left - margin.right,
    height = 16000 - margin.top - margin.bottom;

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .2);

var x = d3.scale.linear()
    .range([width, 0]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

d3.csv("data-aoty/albumscores.csv", type, function(error, data) {
  y.domain(data.map(function(d) { return d.Album; }));
  x.domain([0, d3.max(data, function(d) { return d.AoTY; })]);

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d) { return y(d.Album); })
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return 0; })
      .attr("width", function(d) { return width - x(d.AoTY); });

  svg.selectAll(".label")
      .data(data)
    .enter().append("text")
      .attr("class", "label")
      .attr("y", function(d) { return y(d.Album) - y.rangeBand() / 2; })
      .attr("height", y.rangeBand() / 2)
      .attr("x", function(d) { return 10; })
      .attr("width", function(d) { return width - x(d.AoTY); })
      .text(function(d) { return d.Album; } );      

});

function type(d) {
  d.AoTY = +d.AoTY;
  return d;
}