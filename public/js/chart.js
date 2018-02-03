const dataPointsLimit = 130;
var duration = 1000;
var returning = false;
var gdaxPath = null;
var bitfinexPath = null;
var axisX = null;
var axisY = null;

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatTime = function (d) {
    var dateValue = new Date(d);
    return dateValue.getHours() + ':' + dateValue.getMinutes() + ':' + dateValue.getSeconds();
};

var data = [];
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

function draw(dataItem, startTime, endTime, minPrice, maxPrice) {
    data.push(dataItem);
    if (data.length > dataPointsLimit) {
        var x = d3.scaleLinear()
            .domain([startTime, endTime])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([minPrice, maxPrice])
            .range([height, 0]);

        var gdaxValueline = d3.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.gdaxQuote); });

        var bitfinexValueLine = d3.line()
            .x(function(d) { return x(d.time); })
            .y(function(d) { return y(d.bitFinexQuote); });

        if (!returning) {
            axisX = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(formatTime));

            axisY = svg.append("g")
                .call(d3.axisLeft(y));

            gdaxPath = svg.append("path")
                .data([data])
                .attr("class", "gdaxQuotes")
                .attr("d", gdaxValueline);

            bitfinexPath = svg.append("path")
                .data([data])
                .attr("class", "bitfinexQuotes")
                .attr("d", bitfinexValueLine);

            returning = true;
        } else {
            axisX.transition()
                .duration(duration)
                .ease(d3.easeLinear,2)
                .call(d3.axisBottom(x).tickFormat(formatTime));

            axisY.transition()
                .duration(duration)
                .ease(d3.easeLinear,2)
                .call(d3.axisLeft(y));

            gdaxPath.attr("d", gdaxValueline)
                .transition()
                .duration(duration)
                .ease(d3.easeLinear,2);

            bitfinexPath.attr("d", bitfinexValueLine)
                .transition()
                .duration(duration)
                .ease(d3.easeLinear,2);
        }
        data.shift();
    }
}