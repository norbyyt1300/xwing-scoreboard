// ------------------------------------------------------------------
// Show or hide
// ------------------------------------------------------------------

function showOrHideWinConditions() {
    // Grab the XWS form wrapper element
    var element = document.getElementById("win-conditions");
    // if it is displayed...
    if (element.style.display == "block") {
        // Set it to not display
        element.style.display = "none";
    } else {
        // Otherwise, if it is not displayed, display it!
        element.style.display = "block";
    }
}

/*
// ------------------------------------------------------------------
// Format single a possibility as simple HTML
// ------------------------------------------------------------------

function formatPossibility(points, pilots) {
    var formattedPossibility = "Points: " + points;
    for (var i = 0; i < pilots.length; i++) {
        formattedPossibility += (", <b>" + pilots[i].name + "</b> (" + pilots[i].status + ", " + pilots[i].points + ")");
    }
    return formattedPossibility;
}

// ------------------------------------------------------------------
// Format a possibility as HTML for a table row
// ------------------------------------------------------------------

function formatPossibilityAsTableRow(points, pilots) {
    var formattedPossibility = "<tr>";
    formattedPossibility += "<td>Points: <b>" + points + "</b></td>";
    for (var i = 0; i < pilots.length; i++) {
        formattedPossibility += ("<td><b>" + pilots[i].name + "</b> (" + pilots[i].status + ", " + pilots[i].points + ")</td>");
    }
    formattedPossibility += "</tr>";
    return formattedPossibility;
}

// ------------------------------------------------------------------
// Display the possibilities on the page
// ------------------------------------------------------------------

function displayPossibilities() {
    var element = document.getElementById("win-conditions");
    var newHTML = "";
    newHTML += "<h4>Squad 1 Win Conditions (count: " + squad1WinConditions.length + "):</h4>";
    newHTML += "<table class='win-cons-table'>";
    for (var i = 0; i < squad1WinConditions.length; i++) {
        newHTML += formatPossibilityAsTableRow(squad1WinConditions[i].points, squad1WinConditions[i].pilots);
    }
    newHTML += "</table>";
    newHTML += "<br><h4>Squad 2 Win Conditions (count: " + squad2WinConditions.length + "):</h4>";
    newHTML += "<table class='win-cons-table'>";
    for (var j = 0; j < squad2WinConditions.length; j++) {
        newHTML += formatPossibilityAsTableRow(squad2WinConditions[j].points, squad2WinConditions[j].pilots);
    }
    newHTML += "</table>";
    element.innerHTML = newHTML;
}
*/

// ------------------------------------------------------------------
// Display the possibilities on the page using Datatables
// ------------------------------------------------------------------

function displayPossibilitiesUsingDatatables() { 

    // Initialize empty arrays
    var squad1WinConditions_forDataTables = [];
    var squad2WinConditions_forDataTables = [];

    // Create column headers
    var squad1WinConditionsColumns = createDataTablesColumnHeaders(squad2NumberOfPilots);
    var squad2WinConditionsColumns = createDataTablesColumnHeaders(squad1NumberOfPilots);

    // Loop through the win con possibilities and reformat the data to make it suitable for datatables
    var squad1WinConditions_forDataTables = createDataTablesDataset(squad1WinConditions);
    var squad2WinConditions_forDataTables = createDataTablesDataset(squad2WinConditions);

    // Log to console
    console.log("Squad 1 win cons data set for datatables:", squad1WinConditions_forDataTables);
    console.log("Squad 2 win cons data set for datatables:", squad2WinConditions_forDataTables);

    // Create the tables
    if (squad1WinConditions_forDataTables.length > 0) {
        $('#squad1WinConditions').DataTable( {
            destroy: true,
            data: squad1WinConditions_forDataTables,
            columns: squad1WinConditionsColumns
        } );
    } else { 
        console.log("Not creating datatable; squad 1 win cons was empty.");
    }
    if (squad2WinConditions_forDataTables.length > 0) {
        $('#squad2WinConditions').DataTable( {
            destroy: true,
            data: squad2WinConditions_forDataTables,
            columns: squad2WinConditionsColumns
        } );
    } else { 
        console.log("Not creating datatable; squad 2 win cons was empty.");
    }
}

// ------------------------------------------------------------------
// Create Datatables column headers
// ------------------------------------------------------------------

function createDataTablesColumnHeaders(numberOfPilots) {
    console.log("Creating columns for a squad with this many pilots:", numberOfPilots);
    var columns = [{ title: "Total Points Destroyed", width: "70px" }, { title: "Number of Targets (❌s)", width: "80px" }];
    for (var l = 0; l < numberOfPilots; l++) {
        columns.push({ title: ("Ship " + (l + 1)) });
    }      
    console.log("Columns:", columns);
    return columns;
}

// ------------------------------------------------------------------
// Create Datatables dataset
// ------------------------------------------------------------------

function createDataTablesDataset(squadWinConditions) {
    var squadWinConditions_forDataTables = [];
    for (var i = 0; i < squadWinConditions.length; i++) {
        var winCon = squadWinConditions[i];
        var newRow = [];
        newRow.push(winCon.points); 
        // Add a placeholder for the number of targets; set it to zero, and increment it ever time alreadyDone is false
        newRow.push(0);
        for (var j = 0; j < winCon.pilots.length; j++) {
            var pilotString = "<b>" + winCon.pilots[j].name + "</b> (" + winCon.pilots[j].status + ", " + winCon.pilots[j].points + ")";
            if (winCon.pilots[j].alreadyDone) {
                pilotString += (" ✔️");
            } else {
                pilotString += (" ❌");
                // Add 1 to the target count
                newRow[1] = newRow[1] + 1;
            }
            newRow.push(pilotString);
        }
        squadWinConditions_forDataTables.push(newRow);
    }
    return squadWinConditions_forDataTables;
}