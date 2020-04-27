

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

// Function for sorting objects by points
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
        // Sort the pilots by points!
        var pilots = squadJSON.pilots.sort(comparePointsBigToSmall);
        // For each pilot...
        for (var i = 0; i < pilots.length; i++) {
            // Create tooltip text containing the pilot's upgrades!
            var toolTipText = "No upgrades";
            if (pilots[i].upgrades) {
                toolTipText = "Upgrades:\n" + JSON.stringify(pilots[i].upgrades).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '').replace(/\[/g, '').replace(/\],/g, '\n').replace(/\,/g, ', ').replace(/\:/g, ': ').replace("]", "");
            }
            // Also, for each pilot, add:
            var pilotRowHTML = "";
            // The pilot name and ship type
            pilotRowHTML += "<div class='col'><label class='col-form-label' data-toggle='tooltip' data-placement='top' title='" + toolTipText + "'><b>" + (pilots[i].name.charAt(0).toUpperCase() + pilots[i].name.substring(1)) + "</b> (" + pilots[i].ship + ")" + "</label></div>";
            // The pilot's whole points
            pilotRowHTML += "<div class='col'><label class='col-form-label whole-points-label'><b><span class='whole-points-span'>" + pilots[i].points + "</span></b> points (whole)</label></div>";
            // The pilot's half points
            pilotRowHTML += "<div class='col'><label class='col-form-label half-points-label'><b>" + Math.ceil(pilots[i].points / 2) + "</b> points (halved)</label></div>";
            // A select for changing the ship status
            pilotRowHTML += "<div class='col-sm-2'>" +
                "<select class='form-control form-control-sm pilot-points-destroyed-select' onchange='updateTotalPointsDestroyedForThisSquad(this)'>" +
                "<option data-multiplier='0' value=0>Undamaged</option>" +
                "<option data-multiplier='0.5' value=" + Math.ceil(pilots[i].points / 2) + ">Halved</option>" +
                "<option data-multiplier='1' value=" + pilots[i].points + ">Destroyed</option>" +
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
        totalDestroyed.innerHTML = "Total squad points destroyed: <span id='squad-" + squadNumber + "-total-squad-points-destroyed' class='total-squad-points-destroyed-span'>0</span> / " + squadJSON.points;
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
var squad1PointsDestroyed = 0;
var squad2PointsDestroyed = 0;
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
    // Determine the squad, 1 or 2, and update total pts destroyed global var
    if ((squadFormElement.classList + "").indexOf("squad-1") == -1) {
        squad2PointsDestroyed = newTotalPointsDestroyed;
    } else {
        squad1PointsDestroyed = newTotalPointsDestroyed;
    }
    // Update the win con possibilities array
    updateWinConditionPossibilitiesArray(squadFormElement);
}

// When a ship is updated, update the global array of point possibilities
var squad1PointPossibilities = [];
var squad2PointPossibilities = [];
var squad1WinConditions = [];
var squad2WinConditions = [];
function updateWinConditionPossibilitiesArray(squadFormElement) {
    // Determine the squad, 1 or 2, and update total pts destroyed
    var squadNumber = 1;
    if ((squadFormElement.classList + "").indexOf("squad-1") == -1) {
        squadNumber = 2;
    }
    // Get all pilots in this squad
    var allPilotRows = squadFormElement.getElementsByClassName("pilot-row");
    // Create an array of arrays, with one array for each pilot
    var arrayOfAllPilotPossibilityArrays = [];
    // Now that there is an array for each pilot, for each pilot array, add their possibilities
    for (var i = 0; i < allPilotRows.length; i++) {
        var pilotArray = [];
        // Get the select element
        var shipStatusSelectElement = allPilotRows[i].getElementsByClassName("pilot-points-destroyed-select")[0];
        var pilotName = allPilotRows[i].innerText.split(" ")[0]
        // Add an object for the pilot name and its points
        var status = shipStatusSelectElement.options[shipStatusSelectElement.selectedIndex].text;
        // If the ship is undamaged, add halved and destroyed as future options
        if (status == "Undamaged") {
            pilotArray.push({
                name: pilotName,
                points: 0,
                status: "Undamaged"
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[1].value),
                status: "Halved"
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed"
            });
        }
        // If the ship is halved, add destroyed as an option
        if (status == "Halved") {
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[1].value),
                status: "Halved"
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed"
            });
        }
        // Finally, add destroyed
        if (status == "Destroyed") {
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed"
            });
        }
        // Add this pilot to the possibility array
        arrayOfAllPilotPossibilityArrays.push(pilotArray);
    }
    // Get the combinations
    var combinations = cartesian(arrayOfAllPilotPossibilityArrays);
    console.log("Combinations for squad " + squadNumber, combinations);
    if (squadNumber == 1) {
        squad1PointPossibilities = combinations;
        console.log("Calculating win conditions for squad 1");
        squad1WinConditions = [];
        // Loop through all possibilities for squad 2, and see where the combo is over squad 1's pts destroyed
        for (var i = 0; i < squad2PointPossibilities.length; i++) {
            var possibility = squad2PointPossibilities[i];
            var totalPointsDestroyedForThisPossibility = sumPoints(possibility);
            if (totalPointsDestroyedForThisPossibility > squad1PointsDestroyed) {
                squad1WinConditions.push({
                    points: totalPointsDestroyedForThisPossibility,
                    pilots: possibility
                });
            }
        }   
        squad1WinConditions = squad1WinConditions.sort(comparePointsSmallToBig);
        console.log("Squad 1 win conditions:", squad1WinConditions);     
    } else {
        squad2PointPossibilities = combinations;
        console.log("Calculating win conditions for squad 2");
        squad2WinConditions = [];
        // Loop through all possibilities for squad 1, and see where the combo is over squad 2's pts destroyed
        for (var j = 0; j < squad1PointPossibilities.length; j++) {
            var possibility = squad1PointPossibilities[j];
            var totalPointsDestroyedForThisPossibility = sumPoints(possibility);
            if (totalPointsDestroyedForThisPossibility > squad2PointsDestroyed) {
                squad2WinConditions.push({
                    points: totalPointsDestroyedForThisPossibility,
                    pilots: possibility
                });
            }
        }    
        squad2WinConditions = squad2WinConditions.sort(comparePointsSmallToBig);
        console.log("Squad 2 win conditions:", squad2WinConditions);    
    }
}

// See https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
function cartesian(arg) {
    var r = [], max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}

// Sum points for a list of objects with point properties
function sumPoints(objectList){
    var points = 0;
    for (var i = 0; i < objectList.length; i++) {
        points += objectList[i].points;
    }
    return points;
};
