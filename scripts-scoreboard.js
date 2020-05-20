var enableDebug = false;
function toggleConsoleDebug() {
    enableDebug = enableDebug;
}

// ------------------------------------------------------------------
// Check if there is XWS in the URL; if so, grab it, and drop it into the XWS forms
// ------------------------------------------------------------------

var squad1XWS = "";
var squad2XWS = "";
if (window.location.search.indexOf('squad1XWS') != -1) {
    if (enableDebug) console.log("Importing squad 1 XWS from URL");
    // Assume only 1 squad so far
    squad1XWS = window.location.search.split("squad1XWS=")[1];
}
if (window.location.search.indexOf('squad2XWS') != -1) {
    if (enableDebug) console.log("Importing squad 2 XWS from URL");
    // Since there are two squads worth of XWS, split the original var in half, and store each piece (it has to be in this order!)
    squad2XWS = squad1XWS.split("&squad2XWS=")[1];
    squad1XWS = squad1XWS.split("&squad2XWS=")[0];

}
document.getElementById("squad1XWS").value = decodeURIComponent(squad1XWS);
document.getElementById("squad2XWS").value = decodeURIComponent(squad2XWS);

// ------------------------------------------------------------------
// When the save to URL is clicked
// ------------------------------------------------------------------

function saveToURL() {
    var searchText = "";
    // If there is XWS in a field...
    if (document.getElementById("squad1XWS").value != "") {
        if (enableDebug) console.log("Saving squad 1 XWS to URL");
        // Add it to the search text (first cleanse the XWS)
        searchText += "squad1XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad1XWS").value);
    }
    // Do this for both XWS fields
    if (document.getElementById("squad2XWS").value != "") {
        if (enableDebug) console.log("Saving squad 2 XWS to URL");
        searchText += "&squad2XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad2XWS").value);
    }
    // Then actually commit the new search text to the URL, which will reload the page
    window.location.search = searchText;
}

// ------------------------------------------------------------------
// Before saving XWS to the URL
// ------------------------------------------------------------------

function cleanSquadJSONBeforeSavingToURL(jsonString) {
    // Parse the string to JSN (this'll clean formatting)
    var tempJSON = JSON.parse(jsonString);
    // Check for potentially lengthy or unneeded properties, and delete them!
    if (tempJSON.vendor) {
        if (enableDebug) console.log("Removing vendor information when saving to URL...");
        delete tempJSON.vendor;
    }
    if (tempJSON.description) {
        if (enableDebug) console.log("Removing description information when saving to URL...");
        delete tempJSON.description;
    }
    if (tempJSON.version) {
        if (enableDebug) console.log("Removing version information when saving to URL...");
        delete tempJSON.version;
    }
    // Convert the JSON back into a string
    return JSON.stringify(tempJSON);
}

// ------------------------------------------------------------------
// When the menu button is toggled, show or hide the form
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// Hide the form, then populate the top and bottom scoreboards
// ------------------------------------------------------------------

// Used by the show or hide win cons button
var scoreboardCreated = false;
function populateScoreboard() {
    document.getElementById("xwsForm").style.display = "none";
    populateScoreboardForASquad("squad1XWS", "squad1Form", 1);
    populateScoreboardForASquad("squad2XWS", "squad2Form", 2);
    scoreboardCreated = true;
    // Reset the win con possibilities arrays for both squads
    
    // Update the win con possibilities arrays for both squads
    updateWinConditionPossibilitiesArrayForThisSquad(1);
    updateWinConditionPossibilitiesArrayForThisSquad(2);
    // Now that the win con possibilities have been updated, display them
    displayPossibilitiesUsingDatatables();
    
    // Finally, update the plot
	resetTraces();
    updatePlot();
}

// ------------------------------------------------------------------
// Function for sorting objects by points
// ------------------------------------------------------------------

function comparePointsBigToSmall(a, b) {
    let comparison = 0;
    if (a.points > b.points) {
        comparison = 1;
    } else if (a.points < b.points) {
        comparison = -1;
    }
    return comparison;
}

function comparePointsSmallToBig(a, b) {
    let comparison = 0;
    if (a.points > b.points) {
        comparison = 1;
    } else if (a.points < b.points) {
        comparison = -1;
    }
    return comparison;
}

// ------------------------------------------------------------------
// Create the scoreboard for a squad
// ------------------------------------------------------------------

var squad1NumberOfPilots = 2;
var squad2NumberOfPilots = 2;
function populateScoreboardForASquad(squadXWSElementId, squadFormElementId, squadNumber) {
    try {
        // Parse the squad JSON
        var squadJSON = JSON.parse(document.getElementById(squadXWSElementId).value);
        if (enableDebug) console.log("Original JSON for squad " + squadNumber, squadJSON);
        // Get the squad form element, and make it visible
        var squadFormElement = document.getElementById(squadFormElementId);
        document.getElementById(squadFormElementId).style.display = "block";
        // Prepare to make some inner HTML for the squad        
        squadFormElement.innerHTML = "<h4>Squad " + squadNumber + "</h4>";
        // Sort the pilots by points!
        var pilots = squadJSON.pilots.sort(comparePointsBigToSmall);
        // Save the pilot count
        if (squadNumber == 1) {
            squad1NumberOfPilots = pilots.length;
        }
        if (squadNumber == 2) {
            squad2NumberOfPilots = pilots.length;
        }
        if (enableDebug) console.log("Pilots:", pilots);
        // For each pilot...
        for (var i = 0; i < pilots.length; i++) {
            // Create tooltip text containing the pilot's upgrades!
            var toolTipText = "No upgrades";
            if (pilots[i].upgrades) {
                toolTipText = "Upgrades:\n" + JSON.stringify(pilots[i].upgrades).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '').replace(/\[/g, '').replace(/\],/g, '\n').replace(/\,/g, ', ').replace(/\:/g, ': ').replace("]", "");
            }
            // Also, for each pilot, add:
            var pilotRowHTML = "";
            // Get the pilot name
            var formattedPilotName = "";
            if (pilots[i].name) {
                formattedPilotName = (pilots[i].name.charAt(0).toUpperCase() + pilots[i].name.substring(1));
            } else if (pilots[i].id) {
                formattedPilotName = (pilots[i].id.charAt(0).toUpperCase() + pilots[i].id.substring(1));
            }
            // Calculate half points
            var halfPoints = Math.ceil(pilots[i].points / 2);
            // The pilot name and ship type
            pilotRowHTML += "<div class='col'><label class='col-form-label' data-toggle='tooltip' data-placement='top' title='" + toolTipText + "'><b>" + formattedPilotName + "</b> (" + pilots[i].ship + ")" + "</label></div>";
            // The pilot's whole points
            pilotRowHTML += "<div class='col'><label class='col-form-label whole-points-label'><b><span class='whole-points-span'>" + pilots[i].points + "</span></b> points</label></div>";
            // The pilot's half points
            pilotRowHTML += "<div class='col'><label class='col-form-label half-points-label'><b>" + halfPoints + "</b> points (halved)</label></div>";
            // A select for changing the ship status
            pilotRowHTML += "<div class='col-sm-2'>" +
                "<select class='form-control form-control-sm pilot-points-destroyed-select-squad-" + squadNumber + "' onchange='shipStatusChanged(" + squadNumber + ")'>" +
                "<option data-multiplier='0' value=0>Undamaged (0)</option>" +
                "<option data-multiplier='0.5' value=" + halfPoints + ">Halved (" + halfPoints + ")</option>" +
                "<option data-multiplier='1' value=" + pilots[i].points + ">Destroyed (" + pilots[i].points + ")</option>" +
                "</select>" +
                "</div>";
            // Finally, create a new element for this pilot, give it this new inner HTML, and add it to the squad parent element
            var pilotRow = document.createElement("div");
            pilotRow.classList.add("form-row");
            pilotRow.classList.add("pilot-row-squad-" + squadNumber);
            pilotRow.innerHTML = pilotRowHTML;
            squadFormElement.appendChild(pilotRow);
        }
        // Now, for the whole squad, create a element to hold the total points and total destroyed
        var totalDestroyed = document.createElement("div");
        totalDestroyed.innerHTML = "Sum: <span id='squad-" + squadNumber + "-total-squad-points-destroyed' class='total-squad-points-destroyed-span'>0</span> / " + squadJSON.points;
        totalDestroyed.classList.add("total-squad-points-destroyed");
        totalDestroyed.classList.add("text-danger");
        squadFormElement.appendChild(totalDestroyed);
        // Update the squad point possibilities
        updateWinConditionPossibilitiesArrayForThisSquad(squadNumber);
    } catch (err) {
        if (enableDebug) console.log("Error with this squad: ", squadXWSElementId, squadFormElementId, err);
    }
}

// ------------------------------------------------------------------
// When a ship status select is changed!
// ------------------------------------------------------------------

function shipStatusChanged(squadNumber) {
    // Update the total points destroyed, then now that the total has changed...
    updateTotalPointsDestroyedForThisSquad(squadNumber);
    // Update the win con possibilities arrays for both squads, but in the right order
    if (squadNumber == 1) {
        // If the change was made to squad 1, first update the win cons for squad 1, then squad 2
        updateWinConditionPossibilitiesArrayForThisSquad(2);
        updateWinConditionPossibilitiesArrayForThisSquad(1);
    } else {
        // If the change was made to squad 2, first update the win cons for squad 1, then squad 2
        updateWinConditionPossibilitiesArrayForThisSquad(1);
        updateWinConditionPossibilitiesArrayForThisSquad(2);
    }
    // Now that the win con possibilities have been updated, display them
    displayPossibilitiesUsingDatatables();
    // Next, plot the difference
    updatePlot();    
}

var squad1PointsDestroyed = 0;
var squad2PointsDestroyed = 0;
function updateTotalPointsDestroyedForThisSquad(squadNumber) {
    // Update the total points destroyed
    //First, get all the pilot points destroyed elements
    var newTotalPointsDestroyed = 0;
    var allPilotPointsDestroyedSelectElements = document.getElementsByClassName("pilot-points-destroyed-select-squad-" + squadNumber);
    for (var i = 0; i < allPilotPointsDestroyedSelectElements.length; i++) {
        // And add each pilots destroyed points to the total
        newTotalPointsDestroyed += parseInt(allPilotPointsDestroyedSelectElements[i].value);
    }
    // Get the element containing the total points destroyed, and update its value
    var totalSquadPointsDestroyedSpanElement = document.getElementById("squad-" + squadNumber + "-total-squad-points-destroyed");
    totalSquadPointsDestroyedSpanElement.innerText = newTotalPointsDestroyed;
    // Determine the squad, 1 or 2, and update total pts destroyed global var
    if (squadNumber == 2) {
        squad2PointsDestroyed = newTotalPointsDestroyed;
    } else {
        squad1PointsDestroyed = newTotalPointsDestroyed;
    }
    // Update the "squad points lost" spans on the tables
    updateSquadPointsLostSpans(squadNumber, newTotalPointsDestroyed);
}

function updateSquadPointsLostSpans(squadNumber, pointsDestroyed) {
    var className = "squad" + squadNumber + "PointsLost";
    var spans = document.getElementsByClassName(className);
    for (var i = 0; i < spans.length; i++) {
        spans[i].innerText = pointsDestroyed;
    }
}