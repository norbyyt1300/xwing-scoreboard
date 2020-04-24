

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
    // Since there are two squads worth of XWS, split the original var in half, and store each piece
    squad1XWS = squad1XWS.split("&squad2XWS=")[0];
    squad2XWS = squad1XWS.split("&squad2XWS=")[1]
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
        var squadJSON = JSON.parse(document.getElementById(squadXWSElementId).value);
        console.log("Squad JSON:", squadJSON);
        var squadFormElement = document.getElementById(squadFormElementId);
        document.getElementById(squadFormElementId).style.display = "block";
        squadFormElement.innerHTML = "";
        //squadFormElement.innerHTML = "<h4>Squad " + squadNumber + "</h4>";
        for (var i = 0; i < squadJSON.pilots.length; i++) {
            var toolTipText = "No upgrades";
            if (squadJSON.pilots[i].upgrades) {
                toolTipText = "Upgrades:\n" + JSON.stringify(squadJSON.pilots[i].upgrades).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '').replace(/\[/g, '').replace(/\],/g, '\n').replace(/\,/g, ', ').replace(/\:/g, ': ').replace("]", "");
            }
            var pilotRowHTML = "";
            pilotRowHTML += "<div class='col'><label class='col-form-label' data-toggle='tooltip' data-placement='top' title='" + toolTipText + "'><b>" + (squadJSON.pilots[i].name.charAt(0).toUpperCase() + squadJSON.pilots[i].name.substring(1)) + "</b> (" + squadJSON.pilots[i].ship + ")" + "</label></div>";
            pilotRowHTML += "<div class='col'><label class='col-form-label whole-points-input'><b>" + squadJSON.pilots[i].points + "</b> points (whole)</label></div>";
            pilotRowHTML += "<div class='col'><label class='col-form-label half-points-input'><b>" + Math.ceil(squadJSON.pilots[i].points / 2) + "</b> points (halved)</label></div>";
            pilotRowHTML += "<div class='col-sm-2'><select class='form-control form-control-sm' onchange='updatePoints(this)'><option value=0>Undamaged</option><option value=0.5>Halved</option><option value=1>Destroyed</option></select></div>";
            pilotRowHTML += "<div class='col-sm-1' style='display: none;'><label class='col-form-label pilot-points-destroyed'>Points destroyed: <b>0</b></label></div>";
            var pilotRow = document.createElement("div");
            pilotRow.classList.add("form-row")
            pilotRow.innerHTML = pilotRowHTML;
            squadFormElement.appendChild(pilotRow);
        }
        var totalDestroyed = document.createElement("div");
        totalDestroyed.innerHTML = "Total squad points destroyed: <span class='total-squad-points-destroyed-span'>0</span> / " + squadJSON.points;
        totalDestroyed.classList.add("total-squad-points-destroyed")
        totalDestroyed.classList.add("text-danger")
        squadFormElement.appendChild(totalDestroyed);
    } catch (err) {
        console.log("Error with this squad: ", squadXWSElementId, squadFormElementId, err);
    }
}

// When a ship status select is changed!
function updatePoints(selectElement) {
    var pilotRowElement = selectElement.parentElement.parentElement;
    var pilotPointsdestroyedElement = pilotRowElement.getElementsByClassName("pilot-points-destroyed")[0];
    console.log(pilotRowElement);
    pilotPointsdestroyedElement.innerHTML = "Points destroyed: <b>" + Math.ceil(selectElement.value * parseInt(pilotRowElement.getElementsByClassName("whole-points-input")[0].innerText.split(" ")[0])) + "</b>";
    var newTotalPointsDestroyed = 0;
    var pilotPointsElements = pilotRowElement.parentElement.getElementsByClassName("pilot-points-destroyed");
    for (var i = 0; i < pilotPointsElements.length; i++) {
        newTotalPointsDestroyed += parseFloat(pilotPointsElements[i].innerText.replace("Points destroyed: ", ""));
    }
    var totalSquadPointsDestroyedSpanElement = pilotRowElement.parentElement.getElementsByClassName("total-squad-points-destroyed-span")[0];
    totalSquadPointsDestroyedSpanElement.innerText = newTotalPointsDestroyed;
}