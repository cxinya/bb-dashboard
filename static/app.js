///////////////////////////
// Dropdown
//////////////////////////

// Selector list to append options to
var selectDiv = document.getElementById("selDataset");

// Add options to list
Plotly.d3.json("/names", function(error, response) {
  if (error) return console.warn(error);
  var IDs = response;
  for (var i = 0; i < IDs.length; i++) {
    var option = document.createElement("option");
    option.value = IDs[i];
    option.text = IDs[i];
    selectDiv.appendChild(option);
  }
})

/////////////////////
// Default
/////////////////////

// OTU descriptions

Plotly.d3.json("/otu", function(error, otu) {
    if (error) return console.warn(error);
    pie(otu);
    bub(otu);
})


// Pie chart
function pie(otu) {
    Plotly.d3.json("/samples/BB_940", function(error, response) {
        if (error) return console.warn(error);
        var otu_labs = [];
        for (i in response.otu_ids.slice(0,10)) {
            otu_labs.push(otu[i]);
        }
        var data = [{values: response.sample_values.slice(0,10),
                     labels: response.otu_ids.slice(0,10),
                     text: otu_labs,
                     hoverinfo: 'text + values + labels',
                     textinfo: 'percent',
                     type: 'pie'}];
        var layout = {autosize: false,
                      width: 450,
                      height: 430,
                      margin: {
                        l: 50, r: 50, b: 50, t: 50
                      }
                  };
        Plotly.plot("pie", data, layout);
    })
}

// Bubble chart
function bub(otu) {
    Plotly.d3.json("/samples/BB_940", function(error, response){
        if (error) return console.warn(error);
        var otu_labs = [];
        for (i in response.otu_ids) {
            otu_labs.push(otu[i]);
        }
        var data = [{
            x: response.otu_ids,
            y: response.sample_values,
            text: otu_labs,
            mode: 'markers',
            marker: {
                color: response.otu_ids,
                size: response.sample_values
            }
        }];
        var layout = {
            height: 600,
            width: 900,
            title: "Belly Button Bubble Chart",
            xaxis: {title: "OTU IDs"},
            yaxis: {title: "Sample values"}
        };
        Plotly.plot("bubble", data, layout);
    })
}

// Metadata
var meta = document.getElementById("meta");
Plotly.d3.json("/metadata/BB_940", function(error, response){
    metaHTML = ""
    for (key in response) {
        metaHTML += "<b>" + key + ": </b>" + response[key] + "<br>";
    }
    meta.innerHTML = metaHTML;
})

// Gauge
Plotly.d3.json("/wfreq/BB_940", function(error, level){
    gauge(level);
})

function gauge(level) {
    // Trig to calc meter point
    var degrees = 9 - level - .5,
         radius = .5;
    var radians = degrees * Math.PI / 10;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
         space = ' ',
         pathY = String(y),
         pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
       x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'Times Washed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/10,50/10,50/10,50/10,50/10,50/10,50/10,50/10,50/10,50/10,50],
      rotation: 90,
      text: ['9','8','7','6','5','4','3','2','1','0',''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['E7641D',
                       'D46E19',
                       'C17816',
                       'AF8213',
                       '9C8C10',
                       '8A960C',
                       '77A009',
                       '65AA06',
                       '52B403',
                       '40BF00',
                       'FFFFFF']},
      labels: ['9 scrubs',
               '8 scrubs',
               '7 scrubs',
               '6 scrubs',
               '5 scrubs',
               '4 scrubs',
               '2 scrubs',
               '3 scrubs',
               '1 scrub',
               '0 scrubs',
               ''],
      hoverinfo: 'label',
      hole: .4,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week',
      height: 600,
      width: 600,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);
}



////////////////////////////////////////
// Option changed function
////////////////////////////////////////

function optionChanged(sample) {
    var sampURL = `/samples/${sample}`
    var metaURL = `/metadata/${sample}`
    var wfreqURL = `/wfreq/${sample}`

    // New data - sample values & OTU IDs
    Plotly.d3.json(sampURL, function(error, newdata) {
      if (error) return console.warn(error);
      updateOTU(newdata);
    });

    // New data - wash freq
    Plotly.d3.json(wfreqURL, function(error, newfreq){
        gauge(newfreq);
    });

    // New metadata
    Plotly.d3.json(metaURL, function(error, newmeta){
        metaHTML = ""
        for (key in newmeta) {
            metaHTML += "<b>" + key + ": </b>" + newmeta[key] + "<br>";
        }
        meta.innerHTML = metaHTML;
    });
}




///////////////////////////
// Restyle
///////////////////////////

function updateOTU(newdata){
  Plotly.d3.json("/otu", function(error, otu) {
    if (error) return console.warn(error);
    console.log("otu updated");
    updatePlots(otu, newdata);
  })
}

function updatePlots(otu, newdata) {
  // OTU
  var new_otu = [];
  for (i in newdata.otu_ids) {
        new_otu.push(otu[i]);
  }
  console.log("plots updated");
  // Pie
  var Pie = document.getElementById("pie");
  Plotly.restyle(Pie, "labels", [newdata.otu_ids.slice(0,10)]);
  Plotly.restyle(Pie, "values", [newdata.sample_values.slice(0,10)]);
  Plotly.restyle(Pie, "text", [new_otu.slice(0,10)]);
  // Bub
  var Bub = document.getElementById("bubble");
  Plotly.restyle(Bub, "x", [newdata.otu_ids]);
  Plotly.restyle(Bub, "y", [newdata.sample_values]);
  Plotly.restyle(Bub, "text", [new_otu]);
}


