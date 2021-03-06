// ------------------------------------------------------------------
// When a ship is updated, update the global array of point possibilities
// ------------------------------------------------------------------

var squad1PointPossibilities = [];
var squad2PointPossibilities = [];
var squad1WinConditions = [];
var squad2WinConditions = [];
function updateWinConditionPossibilitiesArrayForThisSquad(squadNumber) {
    // Update total pts destroyed
    if (enableDebug) console.log("Updating win conditions for squad number", squadNumber);
    // Get all pilots in this squad
    var allPilotRows = document.getElementsByClassName("pilot-row-squad-" + squadNumber);
    // Create an array of arrays, with one array for each pilot
    var arrayOfAllPilotPossibilityArrays = [];
    // Now that there is an array for each pilot, for each pilot array, add their possibilities
    var selectElementClassName = "pilot-points-destroyed-select-squad-" + squadNumber;
    for (var i = 0; i < allPilotRows.length; i++) {
        var pilotArray = [];
        // Get the select element
        var shipStatusSelectElement = allPilotRows[i].getElementsByClassName(selectElementClassName)[0];
        var pilotName = allPilotRows[i].innerText.split(" ")[0];
        // Add an object for the pilot name and its points
        var status = shipStatusSelectElement.options[shipStatusSelectElement.selectedIndex].text;
        // Trim off the points at the end of the status text
        status = status.split(" ")[0];
        // If the ship is undamaged, add halved and destroyed as future options
        if (status == "Undamaged") {
            pilotArray.push({
                name: pilotName,
                points: 0,
                status: "Undamaged",
                alreadyDone: true
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[1].value),
                status: "Halved",
                alreadyDone: false
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed",
                alreadyDone: false
            });
        }
        // If the ship is halved, add destroyed as an option
        if (status == "Halved") {
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[1].value),
                status: "Halved",
                alreadyDone: true
            });
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed",
                alreadyDone: false
            });
        }
        // Finally, add destroyed
        if (status == "Destroyed") {
            pilotArray.push({
                name: pilotName,
                points: parseInt(shipStatusSelectElement.options[2].value),
                status: "Destroyed",
                alreadyDone: true
            });
        }
        // Add this pilot to the possibility array
        arrayOfAllPilotPossibilityArrays.push(pilotArray);
    }
    // Get the combinations
    var combinations = cartesian(arrayOfAllPilotPossibilityArrays);
    if (enableDebug) console.log("Combinations of all of the possible states of ships in squad " + squadNumber, combinations);
    if (enableDebug) console.log("Calculating win conditions for squad " + squadNumber);
    if (squadNumber == 1) {
        squad1PointPossibilities = combinations;
        squad1WinConditions = getPossibilitiesThatExceedPointsDestroyed(squad2PointPossibilities, squad1PointsDestroyed);
        squad2WinConditions = getPossibilitiesThatExceedPointsDestroyed(squad1PointPossibilities, squad2PointsDestroyed);
        if (enableDebug) console.log("Squad 1 win conditions:", squad1WinConditions);
    } else {
        squad2PointPossibilities = combinations;
        squad2WinConditions = getPossibilitiesThatExceedPointsDestroyed(squad1PointPossibilities, squad2PointsDestroyed);
        squad1WinConditions = getPossibilitiesThatExceedPointsDestroyed(squad2PointPossibilities, squad1PointsDestroyed);
        if (enableDebug) console.log("Squad 2 win conditions:", squad2WinConditions);
    }
}

// ------------------------------------------------------------------
// See https://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
// ------------------------------------------------------------------

function cartesian(arg) {
    var r = [], max = arg.length - 1;
    function helper(arr, i) {
        for (var j = 0, l = arg[i].length; j < l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i == max)
                r.push(a);
            else
                helper(a, i + 1);
        }
    }
    helper([], 0);
    return r;
}

// ------------------------------------------------------------------
// Filter to only show winning possibilities
// ------------------------------------------------------------------

function getPossibilitiesThatExceedPointsDestroyed(possibilities, pointsDestroyed) {
    var winConditions = [];
    // Loop through all possibilities for squad 1, and see where the combo is over squad 2's pts destroyed
    for (var j = 0; j < possibilities.length; j++) {
        var possibility = possibilities[j];
        var totalPointsDestroyedForThisPossibility = sumPoints(possibility);
        if (totalPointsDestroyedForThisPossibility > pointsDestroyed) {
            winConditions.push({
                points: totalPointsDestroyedForThisPossibility,
                pilots: possibility//,
                // Format the possibility in HTML
                //formattedString: formatPossibility(totalPointsDestroyedForThisPossibility, possibility)
            });
        }
    }
    // Sort
    //winConditions = winConditions.sort(comparePointsSmallToBig);    
    return winConditions;
}

// ------------------------------------------------------------------
// Sum points for a list of objects with point properties
// ------------------------------------------------------------------

function sumPoints(objectList) {
    var points = 0;
    for (var i = 0; i < objectList.length; i++) {
        points += objectList[i].points;
    }
    return points;
}