var squad1XWS = "";
var squad2XWS = "";
if (window.location.search.indexOf('squad1XWS') != -1) {
    console.log("Importing squad 1 XWS from URL");
    squad1XWS = window.location.search.split("squad1XWS=")[1];
}
if (window.location.search.indexOf('squad2XWS') != -1) {
    console.log("Importing squad 2 XWS from URL");
    squad2XWS = squad1XWS.split("&squad2XWS=")[1]
    squad1XWS = squad1XWS.split("&squad2XWS=")[0];
}
document.getElementById("squad1XWS").value = decodeURIComponent(squad1XWS);
document.getElementById("squad2XWS").value = decodeURIComponent(squad2XWS);

function saveToURL() {
    var searchText = "";
    if (document.getElementById("squad1XWS").value != "") {
        console.log("Saving squad 1 XWS to URL");
        searchText += "squad1XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad1XWS").value);
    }
    if (document.getElementById("squad2XWS").value != "") {
        console.log("Saving squad 2 XWS to URL");
        searchText += "&squad2XWS=" + cleanSquadJSONBeforeSavingToURL(document.getElementById("squad2XWS").value);
    }
    window.location.search = searchText;
}

function cleanSquadJSONBeforeSavingToURL(jsonString) {
    var tempJSON = JSON.parse(jsonString);
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
    return JSON.stringify(tempJSON);
    /*
    return jsonString
        .replace(/  /g, ' ')
        .replace(/  /g, ' ')
        .replace(/  /g, ' ')
        .replace(/  /g, ' ')
        .replace(/, "/g, ',"')
        .replace(/{ /g, '{')
        .replace(/\[ /g, '[')
        .replace(/ }/g, '}')
        .replace(/ ]/g, ']')
        */
}

function showOrHideXWSFormElement() {
    var element = document.getElementById("xwsForm");
    if ((element.style.display == "") || (element.style.display == "block")) {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

function populateScoreboard() {
    document.getElementById("xwsForm").style.display = "none";
    populateScoreboardForASquad("squad1XWS", "squad1Form", 1);
    populateScoreboardForASquad("squad2XWS", "squad2Form", 2);
}

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