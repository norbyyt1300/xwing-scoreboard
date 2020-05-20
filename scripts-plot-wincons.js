// Create vars to hold the traces
var x = [];

var squad1PointsLost = [];
var squad2PointsLost = [];

var squad1NumberOfWinConsRemaining = [];
var squad2NumberOfWinConsRemaining = [];

var squad1NumberOfShipsUndamaged = [];
var squad2NumberOfShipsUndamaged = [];

var squad1NumberOfShipsHalved = [];
var squad2NumberOfShipsHalved = [];

var squad1NumberOfShipsDestroyed = [];
var squad2NumberOfShipsDestroyed = [];

var squad1MinimumNumberOfTargetsToWin = [];
var squad2MinimumNumberOfTargetsToWin = [];

// ------------------------------------------------------------------
// Reset the traces
// ------------------------------------------------------------------

function resetTraces() {
    console.log("Resetting traces!");
    x = [];

    squad1PointsLost = [];
    squad2PointsLost = [];

    squad1NumberOfWinConsRemaining = [];
    squad2NumberOfWinConsRemaining = [];

    squad1NumberOfShipsUndamaged = [];
    squad2NumberOfShipsUndamaged = [];

    squad1NumberOfShipsHalved = [];
    squad2NumberOfShipsHalved = [];

    squad1NumberOfShipsDestroyed = [];
    squad2NumberOfShipsDestroyed = [];

    squad1MinimumNumberOfTargetsToWin = [];
    squad2MinimumNumberOfTargetsToWin = [];

    updatePlot();
}

// ------------------------------------------------------------------
// Assemble the arrays
// ------------------------------------------------------------------

function assembleArraysIntoDataForPlot() {
    console.log("Assembling trace arrays into a data object suitable for plotting...");
    var data = [{
        x: x,
        y: squad1PointsLost,
        mode: 'lines',
        name: 'Squad 1 Points Lost',
        line: {
            color: "cyan",
            width: 2
        },
        hoverinfo: "y"
    }, {
        x: x,
        y: squad2PointsLost,
        mode: 'lines',
        name: 'Squad 2 Points Lost',
        line: {
            color: "pink",
            width: 2
        },
        hoverinfo: "y"
    }, {
        x: x,
        y: squad1NumberOfWinConsRemaining,
        mode: 'lines+markers',
        name: 'Squad 1 # of Win Cons Left',
        line: {
            color: "cyan",
            dash: 'dashdot',
            width: 1
        },
        hoverinfo: "y"
    }, {
        x: x,
        y: squad2NumberOfWinConsRemaining,
        mode: 'lines+markers',
        name: 'Squad 2 # of Win Cons Left',
        line: {
            color: "pink",
            dash: 'dashdot',
            width: 1
        },
        hoverinfo: "y"
    }, {
        x: x,
        y: squad1NumberOfShipsUndamaged,
        mode: 'lines+markers',
        name: 'Squad 1 # Ships Undamaged'
    }, {
        x: x,
        y: squad2NumberOfShipsUndamaged,
        mode: 'lines+markers',
        name: 'Squad 2 # Ships Undamaged'
    }, {
        x: x,
        y: squad1NumberOfShipsHalved,
        mode: 'lines+markers',
        name: 'Squad 1 # Ships Halved'
    }, {
        x: x,
        y: squad2NumberOfShipsHalved,
        mode: 'lines+markers',
        name: 'Squad 2 # Ships Halved'
    }, {
        x: x,
        y: squad1NumberOfShipsDestroyed,
        mode: 'lines+markers',
        name: 'Squad 1 # Ships Destroyed'
    }, {
        x: x,
        y: squad2NumberOfShipsDestroyed,
        mode: 'lines+markers',
        name: 'Squad 2 # Ships Destroyed'
    }, {
        x: x,
        y: squad1MinimumNumberOfTargetsToWin,
        mode: 'lines+markers',
        name: 'Squad 1 Minimum # Targets to Win',
        line: {
            color: "blue",
            dash: 'dash',
            width: 1
        },
        hoverinfo: "y",
        yaxis: 'y2'
    }, {
        x: x,
        y: squad2MinimumNumberOfTargetsToWin,
        mode: 'lines+markers',
        name: 'Squad 2 Minimum # Targets to Win',
        line: {
            color: "red",
            dash: 'dash',
            width: 1
        },
        hoverinfo: "y",
        yaxis: 'y2'
    }];
    console.log("Chart data:", data);
    return data;
}

// ------------------------------------------------------------------
// When a ship is updated, update the plot
// ------------------------------------------------------------------

var plotCreated = false;
function updatePlot() {
    // Update the data arrays
    updateTraceDataArrays();
    console.log("Updating plot!");
    // Create the plot
    Plotly.newPlot('winConsChart', assembleArraysIntoDataForPlot(), LAYOUT, CONFIG);
}

// ------------------------------------------------------------------
// Specify the layout and config
// ------------------------------------------------------------------

var LAYOUT = {
    title: {
        text: 'Plot of Win Con Data',
        font: { color: 'white'}
    },
    xaxis: {
        dtick: 1,
        color: 'white',
        showgrid: false
    },
    yaxis: {
        color: 'white',
        showgrid: false,
        minimum: 0,
        rangemode: 'tozero'
    },
    yaxis2: {
        title: '# of Ships',
        color: 'gray',
        dtick: 1,
        overlaying: 'y',
        showgrid: false,
        side: 'right',
        rangemode: 'tozero'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: true,
    legend: { 
        "orientation": "h",
        font: { color: 'white'}
    }
};

var CONFIG = { responsive: true };

// ------------------------------------------------------------------
// When a ship is updated, update the plot
// ------------------------------------------------------------------

function updateTraceDataArrays() {
    console.log("Updating trace arrays...");
    // Increment the x axis
    x.push(x.length + 1);
    // Update the points lost
    squad1PointsLost.push(parseInt(document.getElementById("squad-1-total-squad-points-destroyed").innerText));
    squad2PointsLost.push(parseInt(document.getElementById("squad-2-total-squad-points-destroyed").innerText));
    // Update the number of win console
    squad1NumberOfWinConsRemaining.push(squad1NumberOfWinCons);
    squad2NumberOfWinConsRemaining.push(squad2NumberOfWinCons);
    // Update the minimum number of targets
    squad1MinimumNumberOfTargetsToWin.push(squad1CurrentMinimumNumberOfTargetsToWin);
    squad2MinimumNumberOfTargetsToWin.push(squad2CurrentMinimumNumberOfTargetsToWin);
}