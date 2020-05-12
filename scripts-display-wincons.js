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