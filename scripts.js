

// Check if there is XWS in the URL; if so, grab it, and drop it into the XWS forms
var squad1XWS = "";
var squad2XWS = "";
if (window.location.search.indexOf('squad1XWS') != -1) {
    console.log("Importing squad 1 XWS from URL");
    // Assume only 1 squad so far
    squad1XWS = window.location.search.split("squad1XWS=")[1];
}
if (window.location.search.indexOf('squad2XWS') != -1) {
    console.log("Importing squad 2 XWS from URL");
    // Since there are two squads worth of XWS, split the original var in half, and store each piece (it has to be in this order!)
    squad2XWS = squad1XWS.split("&squad2XWS=")[1]
    squad1XWS = squad1XWS.split("&squad2XWS=")[0];
    
}
document.getElementById("squad1XWS").value = decodeURIComponent(squad1XWS);
document.getElementById("squad2XWS").value = decodeURIComponent(squad2XWS);

// When the save to URL is clicked
function saveToURL() {
    var searchText = "";
    // If there is XWS in a field...
    if (document.getElementById("squad1XWS").value != "") {
        console.log("Saving squad 1 XWS to URL");
        // Add it to the search text (first cleanse the XWS)
        searchText += "squad1XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad1XWS").value);
    }
    // Do this for both XWS fields
    if (document.getElementById("squad2XWS").value != "") {
        console.log("Saving squad 2 XWS to URL");
        searchText += "&squad2XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad2XWS").value);
    }
    // Then actually commit the new search text to the URL, which will reload the page
    window.location.search = searchText;
}

// Before saving XWS to the URL
function cleanSquadJSONBeforeSavingToURL(jsonString) {
    // Parse the string to JSN (this'll clean formatting)
    var tempJSON = JSON.parse(jsonString);
    // Check for potentially lengthy or unneeded properties, and delete them!
    if (tempJSON.vendor) {
        console.log("Removing vendor information when saving to URL...");
        delete tempJSON.vendor;
    }
    if (tempJSON.description) {
        console.log("Removing description information when saving to URL...");
        delete tempJSON.description;
    }
    if (tempJSON.version) {
        console.log("Removing version information when saving to URL...");
        delete tempJSON.version;
    }
    // Convert the JSON back into a string
    return JSON.stringify(tempJSON);
}

// When the menu button is toggled, show or hide the form
function showOrHideXWSFormElement() {
    // Grab the XWS form wrapper element
    var element = document.getElementById("xwsForm");
    // if it is displayed...
    if ((element.style.display == "") || (element.style.display == "block")) {
        // Set it to not display
        element.style.display = "none";
    } else {
        // Otherwise, if it is not displayed, display it!
        element.style.display = "block";
    }
}

// Hide the form, then populate the top and bottom scoreboards
function populateScoreboard() {
    document.getElementById("xwsForm").style.display = "none";
    populateScoreboardForASquad("squad1XWS", "squad1Form", 1);
    populateScoreboardForASquad("squad2XWS", "squad2Form", 2);
}

// Create the scoreboard for a squad
function populateScoreboardForASquad(squadXWSElementId, squadFormElementId, squadNumber) {
    try {
        // Parse the squad JSON
        var squadJSON = JSON.parse(document.getElementById(squadXWSElementId).value);
        console.log("Original JSON for squad " + squadNumber, squadJSON);
        // Get the squad form element, and make it visible
        var squadFormElement = document.getElementById(squadFormElementId);
        document.getElementById(squadFormElementId).style.display = "block";
        // Prepare to make some inner HTML for the squad        
        squadFormElement.innerHTML = "";
        // For each pilot...
        for (var i = 0; i < squadJSON.pilots.length; i++) {
            // Create tooltip text containing the pilot's upgrades!
            var toolTipText = "No upgrades";
            if (squadJSON.pilots[i].upgrades) {
                toolTipText = "Upgrades:\n" + JSON.stringify(squadJSON.pilots[i].upgrades).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '').replace(/\[/g, '').replace(/\],/g, '\n').replace(/\,/g, ', ').replace(/\:/g, ': ').replace("]", "");
            }
            // Also, for each pilot, add:
            var pilotRowHTML = "";
            // The pilot name and ship type
            pilotRowHTML += "<div class='col'><label class='col-form-label' data-toggle='tooltip' data-placement='top' title='" + toolTipText + "'><b>" + (squadJSON.pilots[i].name.charAt(0).toUpperCase() + squadJSON.pilots[i].name.substring(1)) + "</b> (" + squadJSON.pilots[i].ship + ")" + "</label></div>";
            // The pilot's whole points
            pilotRowHTML += "<div class='col'><label class='col-form-label whole-points-label'><b><span class='whole-points-span'>" + squadJSON.pilots[i].points + "</span></b> points (whole)</label></div>";
            // The pilot's half points
            pilotRowHTML += "<div class='col'><label class='col-form-label half-points-label'><b>" + Math.ceil(squadJSON.pilots[i].points / 2) + "</b> points (halved)</label></div>";
            // A select for changing the ship status
            pilotRowHTML += "<div class='col-sm-2'>" +
                "<select class='form-control form-control-sm pilot-points-destroyed-select' onchange='updateTotalPointsDestroyedForThisSquad(this)'>" +
                    "<option data-multiplier='0' value=0>Undamaged</option>" + 
                    "<option data-multiplier='0.5' value=" + Math.ceil(squadJSON.pilots[i].points / 2) + ">Halved</option>" + 
                    "<option data-multiplier='1' value=" + squadJSON.pilots[i].points + ">Destroyed</option>" +
                "</select>" +
            "</div>";
            // Finally, create a new element for this pilot, give it this new inner HTML, and add it to the squad parent element
            var pilotRow = document.createElement("div");
            pilotRow.classList.add("form-row");
            pilotRow.classList.add("pilot-row");
            pilotRow.innerHTML = pilotRowHTML;
            squadFormElement.appendChild(pilotRow);
        }
        // Now, for the whole squad, create a element to hold the total points and total destroyed
        var totalDestroyed = document.createElement("div");
        totalDestroyed.innerHTML = "Total squad points destroyed: <span class='total-squad-points-destroyed-span'>0</span> / " + squadJSON.points;
        totalDestroyed.classList.add("total-squad-points-destroyed")
        totalDestroyed.classList.add("text-danger")
        squadFormElement.appendChild(totalDestroyed);
        // Update the squad point possibilities
        updateWinConditionPossibilitiesArray(squadFormElement);
    } catch (err) {
        console.log("Error with this squad: ", squadXWSElementId, squadFormElementId, err);
    }
}

// When a ship status select is changed!
function updateTotalPointsDestroyedForThisSquad(shipStatusSelectElement) {
    // Update the total points destroyed
    var squadFormElement = shipStatusSelectElement.parentElement.parentElement.parentElement;
    //First, get all the pilot points destroyed elements
    var newTotalPointsDestroyed = 0;
    var allPilotPointsDestroyedSelectElements = squadFormElement.getElementsByClassName("pilot-points-destroyed-select");
    for (var i = 0; i < allPilotPointsDestroyedSelectElements.length; i++) {
        // And add each pilots destroyed points to the total
        newTotalPointsDestroyed += parseInt(allPilotPointsDestroyedSelectElements[i].value);
    }
    // Get the element containing the total points destroyed, and update its value
    var totalSquadPointsDestroyedSpanElement = squadFormElement.getElementsByClassName("total-squad-points-destroyed-span")[0];
    totalSquadPointsDestroyedSpanElement.innerText = newTotalPointsDestroyed;    
    // Update the win con possibilities array
    updateWinConditionPossibilitiesArray(squadFormElement);
}

// When a ship is updated, update the global array of point possibilities
var squad1PointPossibilities = [];
var squad2PointPossibilities = [];
function updateWinConditionPossibilitiesArray(squadFormElement) {
    var newPossibilities = [];
    // Loop through all rows
    var allPilotRows = squadFormElement.getElementsByClassName("pilot-row");
    for (var i = 0; i < allPilotRows.length; i++) {
        // Add an object for the pilot name and its points
        newPossibilities.push(
            {
                name: allPilotRows[i].innerText.split(" ")[0],
                points: parseInt(allPilotRows[i].getElementsByClassName("pilot-points-destroyed-select")[0].value)
            }
        );
    }
    // Determine the squad, 1 or 2
    var squadNumber = 1;
    if ((squadFormElement.classList + "").indexOf("squad-1") == -1) {
        squadNumber = 2;
    }
    // Write the new possibilities to the squad
    console.log("Updating point possibilities for squad", squadNumber);
    if (squadNumber == 1) {
        squad1PointPossibilities = newPossibilities;
    } else {
        squad2PointPossibilities = newPossibilities;
    }
    console.log("New point possibilities array for squad " + squadNumber, newPossibilities);
}