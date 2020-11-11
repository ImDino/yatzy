/***************************************************************
******************* CONTENT OF THIS FILE ***********************
****************************************************************

Lämna in projektet: https://studentportal.nackademin.se/mod/assign/view.php?id=94006
Utvärdera grupparbetet: https://forms.gle/BRDZGMv2ipB8S7hN6

TODO:
    - Build a nextPlayer function and apply to ON CLICK: SKIP A SCORE & ON CLICK: SELECT SUGGESTION
    - Add more languages?
    - Show witch players turn it is
    - Show how many throws a player has left


1. GAME SETTINGS

2. WHEN DOCUMENT LOADED
    2.1 ON CHANGE: LANGUAGE
    2.2 ON CLICK: ADD PLAYER
    2.3 ON CLICK: START GAME
    2.4 ON CLICK: SKIP A SCORE
    2.5 ON CLICK: SELECT SUGGESTION/ALTERNATIVE
    2.6 ON CLICK: ROLL DICE 
    2.7 ON CLICK: DICE CHECKBOXES

3. FUNCTION IN THIS GAME
    3.1 addScoreToYatzyTable()
    3.2 addPlayersToDOM()
    3.3 rollDice()
    3.4 throwCountSetAndCheck()
    3.5 calcDices() (this is the biggest functions that handle all the calcuclations to se if player has a pair of something else)
    3.6 endGame()

JQUERY-FUNCTIONS USED IN THIS APP:
.val()
    desc: Get the current value of the first element in the set of matched elements or set the value of every matched element.
    more: https://api.jquery.com/val/

.each()
    desc: Iterate over a jQuery object, executing a function for each matched element.
    more: https://api.jquery.com/each/

.text()
    desc: Get the combined text contents of each element in the set of matched elements, including their descendants, or set the text contents of the matched elements.
    more: https://api.jquery.com/text/

.closest()
    desc: For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
    more: https://api.jquery.com/closest/

.prop()
    desc: Get the value of a property for the first element in the set of matched elements or set one or more properties for every matched element.
    more: https://api.jquery.com/prop/

.empty()
    desc: Remove all child nodes of the set of matched elements from the DOM.
    more: https://api.jquery.com/empty/

.attr()
    desc: Get the value of an attribute for the first element in the set of matched elements or set one or more attributes for every matched element.
    more: https://api.jquery.com/attr/

.removeClass()
    desc: Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
    more: https://api.jquery.com/removeClass/

.on()
    desc: Attach an event handler function for one or more events to the selected elements.
    more: https://api.jquery.com/on/

.trigger()
    desc: Execute all handlers and behaviors attached to the matched elements for the given event type.
    more: https://api.jquery.com/trigger/

.hasClass()
    desc: Determine whether any of the matched elements are assigned the given class.
    more: https://api.jquery.com/hasClass/

.addClass()
    desc: Adds the specified class(es) to each element in the set of matched elements.
    more: https://api.jquery.com/addClass/

.parent()
    desc: Get the parent of each element in the current set of matched elements, optionally filtered by a selector.
    more: https://api.jquery.com/parent/

.html()
    desc: Get the HTML contents of the first element in the set of matched elements.
    more: https://api.jquery.com/html/

.append()
    desc: Insert content, specified by the parameter, to the end of each element in the set of matched elements.
    more: https://api.jquery.com/append/

.hide()
    desc: Hide the matched elements.
    more: https://api.jquery.com/hide/

.show()
    desc: Display the matched elements.
    more: https://api.jquery.com/show/

.find()
    desc: Get the descendants of each element in the current set of matched elements, filtered by a selector, jQuery object, or element.
    more: https://api.jquery.com/find/

*****************************************************************
*****************************************************************/


/*------------------------------*/
/*--------GAME SETTINGS---------*/
/*------------------------------*/
var players = [null]; //adds first value with 'null' to get player 1 to be at index 1 in the array
var dices = [null, 0, 0, 0, 0, 0, 0]; //adds first value with 'null' to get index correct with dice values
var settings = {
  currentRound: 1, //each game of yatzy contains 15 rounds
  currentPlayer: 1, //start the game with player 1
  currentThrow: 0, //for each round every player has 3 throws
  lang: "en", //sets default languange of the app
};

/*------------------------------*/
/*-------DOCUMENT LOADED--------*/
/*------------------------------*/
$(document).ready(function () {

  //ONCHANGE LANGUAGE
  $("#language").on("change", function () {
    settings.lang = $(this).val();
    $(".playerInputs input").each(function (e) {
      $(this).attr("placeholder", lang[settings.lang]["placeholderEnterName"]);
    });
    $("#addPlayer").text(lang[settings.lang]["btnAddMorePlayers"]);
    $("#start").text(lang[settings.lang]["btnStartGame"]);
  });

  //ONCLICK ADD PLAYER
  $("#addPlayer").on("click", function () {
    $(".playerInputs").append( '<input type="text" placeholder="' + lang[settings.lang]["placeholderEnterName"] + '">');
    $(".playerInputs input:first").focus();
  });

  //ONCLICK START GAME
  //when the user clicks start game,
  $("#start").on("click", function () {
    // we get the name/s that were entered by the user
    var nameInput = [];
    $("#rollDice").text(lang[settings.lang]["btnRollDices"]);
    // loop through and push the names to our nameInput-array
    $(".playerInputs input").each(function () {
      nameInput.push($(this).val());
    });
    // display those names at the top
    addPlayersToDOM(nameInput.length, nameInput);
    // we hide the newGameContainer div, where the user press the button 'Start Game'
    $("#newGameContainer").hide();
    // we show the yatzyContainer div the user press the button 'Start Game'
    $(".yatzyContainer").css("display", "flex");
  });

  //ONCLICK SKIP A SCORE
  //when user clicks any given input tag field this will happen
  $("#yatzyTable").on("click", "input", function () {
    //gets the playerID from the clicked input-field
    inputPlayerID = $(this).attr("playerid");
    //gets the ID from the closest parent <tr> to the actually clicked input-field
    rowID = $(this).closest("tr").attr("id");

    //if the clicked input-fields belongs to the currentPlayer AND the input-field is empty then to this
    if (inputPlayerID == settings.currentPlayer && !this.value) {
      //gives the user an alert to ask if they really want to skip this input-field
      if ( confirm(lang[settings.lang]["skip"] + " " + lang[settings.lang][rowID].short + "?") ) {
        
        $(this).prop("disabled", true); //changes the clicked input to be disabled

        $("#suggestions").empty(); //if user has got any uggestions, remove all children of #suggestions

        $(":checkbox").prop("checked", false); //unchecks all checkboxes
        $(":checkbox").attr("disabled", true); //disables all checkboxes

        //selects all images within the div with class .dice and change the image source, then we also remove the class "checked"
        $(".dice img").attr("src", "img/dice/0.png").removeClass("checked");

        //if button rollDice is disabled (after 3 throws), enable it!
        document.getElementById("rollDice").disabled = false;

        settings.currentPlayer++;
        settings.currentThrow = 0;

        //this is a check to see if all players have finished one round
        if (players.length <= settings.currentPlayer) {
          //if rounds is more or equal to 15, then the game is finished
          if (settings.currentRound >= 15) {
            endGame();
          }
          //if its a new round then set currentPlayer to 1 and add +1 to currentRound
          settings.currentPlayer = 1;
          settings.currentRound++;
        }
      }
    }
  });

  //ONCLICK SELECT SUGGESTION
  //when user clicks any given suggestion this will happen
  $("#suggestions").on("click", ".selectScore", function () {
    this_rowID = $(this).attr("suggest");
    this_points = $(this).attr("points");
    this_playerid = $(this).attr("playerid");

    //selects the correct input-fields for player and the rowID AND add the points to the input
    //here we also trigger and 'change' event to sum/update the players score
    $('input[name="' + this_rowID + "-" + this_playerid + '"]').val( this_points );

    addScoreToYatzyTable(this_rowID, this_points, this_playerid);

    $("#suggestions").empty(); //if user has got any uggestions, remove all children of #suggestions

    $(":checkbox").prop("checked", false); //unchecks all checkboxes
    $(":checkbox").attr("disabled", true); //disables all checkboxes

    //selects all images within the div with class .dice and change the image source, then we also remove the class "checked"
    $("img[dice]").attr("src", "img/dice/0.png").removeClass("checked");

    //if button rollDice is disabled (after 3 throws), enable it!
    document.getElementById("rollDice").disabled = false;

    settings.currentPlayer++;
    settings.currentThrow = 0;

    //this is a check to see if all players have finished one round
    if (players.length <= settings.currentPlayer) {
      //if rounds is more or equal to 15, then the game is finished
      if (settings.currentRound >= 15) {
        endGame();
      }
      //if its a new round then set currentPlayer to 1 and add +1 to currentRound
      settings.currentPlayer = 1;
      settings.currentRound++;
    }
  });

  //ONCLICK ROLL DICE
  //When a player clicks the button "Roll dices" then do this:
  $("#rollDice").on("click", function () {
    throwCountSetAndCheck();
    //reset dices array to nothing
    dices = [null, 0, 0, 0, 0, 0, 0];
    //loop throug all dice images
    $(".dice img").each(function (e) {
      //if the image dont has class "checked" then to the following
      if (!$(this).hasClass("checked")) {
        //randomize the dice value , by calling the random generator func
        tempDiceRolled = rollDice();
        //change the image src to display the correct dice
        $(this).attr("src", "img/dice/" + tempDiceRolled + ".png");
        //add an attribute with the dice value
        $(this).attr("dicevalue", tempDiceRolled);
      }
      //save the dice current value to a string
      var tempDiceValue = $(this).attr("dicevalue");
      //add one to the dice index array
      dices[tempDiceValue]++;
    });
    //console.log(dices);
    calcDices();
  });

  //ONCLICK DICE CHECKBOXES
  $('.dice input[type="checkbox"]').on("click", function () {
    var diceID = $(this).attr("dice");
    //select the image with same "diceID" and get the attribute "dicevalue" from that image
    var diceValue = $('.dice img[dice="' + diceID + '"]').attr("dicevalue");
    //we check if the checkbox is marked or not
    var checkboxState = $(this).prop("checked");

    //if checkbox is checken then to this:
    if (checkboxState) {
      //change dice imgage if checkbox is checked and add class 'checked' to the image
      $('.dice img[dice="' + diceID + '"]').attr("src", "img/dice/" + diceValue + "-hold.png").addClass("checked");
    }
    //if checkbox is unchecked to this:
    else {
      //change dice imgage if checkbox is unchecked and remove class 'checked' from the image
      $('.dice img[dice="' + diceID + '"]').attr("src", "img/dice/" + diceValue + ".png").removeClass("checked");
    }
  });

  //ONCLICK ACCTUAL DICE THEN MARK CHECKBOX (just something extra to improve ux/ui)
  $(".dice img").on("click", function () {
    var diceID = $(this).attr("dice");
    var checkbox = $('input[dice="' + diceID + '"]');

    //if the checkbox isent disabled then trigger a click to 'hold' the dice
    if (!$(checkbox).prop("disabled")) {
      checkbox.trigger("click");
    }
  });

});

/*------------------------------*/
/*----------FUNCTIONS-----------*/
/*------------------------------*/

function addScoreToYatzyTable(rowID, value, playerID) {
  var bonus = 0;

  if (!value) { value = 0 } //fix if any value = ""  (if the value is empty in JS it will return NaN)
  //TODO: try to return the function if it hasent any value, and see waht happens

  //check if the current value should be in class/method/object players.upperScore or players.lowerScroe
  if ( rowID == "ones" || rowID == "twos" || rowID == "threes" || rowID == "fours" || rowID == "fives" || rowID == "sixes" ) {
    //set the correct value, and parse it as an integer
    players[playerID]["upperScore"][rowID] = parseInt(value);
  } else {
    //set the correct value, and parse it as an integer
    players[playerID]["lowerScore"][rowID] = parseInt(value);
  }

  //call the class/mothod/object function to calculate the total sum
  var countSum = players[playerID].CountSum();

  //write the total sum to the DOM
  $("#sum-" + playerID).html(countSum);

  //check if user has 63 points or more in the upperScore, then give 50p in bonus
  if (countSum >= 63) {
    bonus = 50;
  }

  //adds the bonus to the players class/method/object
  players[playerID]["bonus"] = bonus;

  //write the total sum to the DOM
  $("#bonus-" + playerID).html(bonus);

  //call the class/mothod/object function to calculate the total total
  var countTotal = players[playerID].CountTotal();

  //write the total total to the DOM
  $("#total-" + playerID).html(countTotal);
}

//this funtion creates all the columns in the yatzytable
function addPlayersToDOM(inputPlayers, nameInput = []) {
  playerID = 1;

  while (inputPlayers >= playerID) {
    var nameInputThis = nameInput[playerID - 1]; //array key fix -1

    var name = "P" + playerID; //sets defaut name
    if (nameInputThis) {
      name = nameInputThis; //if name is set then update name
    }

    //push a new class into the players array
    players.push(new Player(playerID, name));

    //for each TR in our yatzytable to this:
    $("#yatzyTable").find("tr").each(function () {
        var html = "";
        var rowID = $(this).attr("id");

        //sets a varabiable to hold the language settings, could be an string or an object
        var tempLangText = lang[settings.lang][rowID];

        //if the tempLangText is an object then select the short variable inside that object
        if (typeof tempLangText == "object") {
          tempLangText = lang[settings.lang][rowID]["short"];
        }

        //add the correct language to the DOM
        $(this).find("td:first").text(tempLangText);

        //if special row then add either name or just
        if ( rowID == "player" || rowID == "sum" || rowID == "bonus" || rowID == "total" ) {
          if (rowID == "player") {
            html += "<td>" + name + "</td>"; //name
          } else {
            html += '<td id="' + rowID + "-" + playerID + '">0</td>'; //0
          }
        } else {
          //creates an td with an input inside
          html += '<td><input class="tableInput" type="number" name="' + rowID + "-" + playerID + '" playerID="' + playerID + '" readonly /></td>';
        }
        //append the variable html to the end of the current <tr> that we are looping through
        $(this).append(html);
      });
    playerID++;
  }
}

function rollDice() {
  return Math.ceil(Math.random() * 6);
}

function throwCountSetAndCheck() {
  //enabables all checkboxes, so the player can hold the dices they want
  $("input[type=checkbox]").each(function () {
    this.disabled = false;
  });
  //plus 1 to the currentThrow
  settings.currentThrow++;
  //check if currentThrow is more or equal to 3
  if (settings.currentThrow >= 3) {
    //if more or equal to 3 then disable the throw dices button called by id "rollDice"
    document.getElementById("rollDice").disabled = true;
  }
}

function calcDices() {
  var currentPlayerID = settings.currentPlayer;
  var tempSum = 0;
  var pairs = [];
  var suggestScore = {};
  var suggestionsDIV = document.getElementById("suggestions");

  suggestScore.playerID = currentPlayerID;

  //count suggestion from upperScore, ones to sixes
  //check if dice has correct value, score is not set in object players and input isent disabled
  if ( dices[1] > 0 && !players[currentPlayerID].upperScore.ones && !$("input[name=ones-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.ones = dices[1] * 1;
  }
  if ( dices[2] > 0 && !players[currentPlayerID].upperScore.twos && !$("input[name=twos-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.twos = dices[2] * 2;
  }
  if ( dices[3] > 0 && !players[currentPlayerID].upperScore.threes && !$("input[name=threes-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.threes = dices[3] * 3;
  }
  if ( dices[4] > 0 && !players[currentPlayerID].upperScore.fours && !$("input[name=fours-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.fours = dices[4] * 4;
  }
  if ( dices[5] > 0 && !players[currentPlayerID].upperScore.fives && !$("input[name=fives-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.fives = dices[5] * 5;
  }
  if ( dices[6] > 0 && !players[currentPlayerID].upperScore.sixes && !$("input[name=sixes-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.sixes = dices[6] * 6;
  }

  //second loop through all dices and check lowerScore
  dices.forEach((value, index) => {
    if (value >= 2) {
      pairs.push(index); //this is only used to check for two pairs later on
      if ( !players[currentPlayerID].lowerScore.pair && !$("input[name=pair-" + currentPlayerID + "]").prop("disabled") ) {
        suggestScore.pair = index * 2; //if dices conaints more value > 2 this will be overwritten by the next value in the dices array
      }
    }
    if ( value >= 3 && !players[currentPlayerID].lowerScore.threeKind && !$("input[name=threeKind-" + currentPlayerID + "]").prop("disabled") ) {
      suggestScore.threeKind = index * 3;
    }
    if ( value >= 4 && !players[currentPlayerID].lowerScore.fourKind && !$("input[name=fourKind-" + currentPlayerID + "]").prop("disabled") ) {
      suggestScore.fourKind = index * 4;
    }
    if ( value >= 5 && !players[currentPlayerID].lowerScore.yatzy && !$("input[name=yatzy-" + currentPlayerID + "]").prop("disabled") ) {
      suggestScore.yatzy = 50;
    }
    tempSum += value * index;
  });

  if ( pairs.length == 2 && !players[currentPlayerID].lowerScore.twoPairs && !$("input[name=twoPairs-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.twoPairs = pairs[0] * 2 + pairs[1] * 2;
  }
  if ( !players[currentPlayerID].lowerScore.chance && !$("input[name=chance-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.chance = tempSum;
  }
  // checks to see if we get fullHouse, meaning if dices include 2 of something and 3 of something
  if ( dices.includes(2) && dices.includes(3) && !players[currentPlayerID].lowerScore.fullHouse && !$("input[name=fullHouse-" + currentPlayerID + "]").prop("disabled") ) {
    suggestScore.fullHouse = tempSum;
  }
  if ( dices.toString() == [null, 1, 1, 1, 1, 1, 0].toString() && !players[currentPlayerID].lowerScore.sStraight && !$("input[name=sStraight-" + currentPlayerID + "]").prop("disabled") ) {
    //check for small straight
    suggestScore.sStraight = tempSum;
  }
  if ( dices.toString() == [null, 0, 1, 1, 1, 1, 1].toString() && !players[currentPlayerID].lowerScore.bStraight && !$("input[name=bStraight-" + currentPlayerID + "]").prop("disabled") ) {
    //check for big straight
    suggestScore.bStraight = tempSum;
  }

  $(suggestionsDIV).empty();

  if (Object.keys(suggestScore).length == 1) {
    //why its not zero depens on that we always have a playerID inside it
    $(suggestionsDIV).append( '<div class="suggest">' + lang[settings.lang]["noMatch"] + "</div>" );
  }
  Object.keys(suggestScore).forEach(function (index) {
    // console.table(suggestScore)
    if (index == "playerID") {
      return;
    }
    var html = '<div class="suggest">' + lang[settings.lang][index].suggest + " <span>" + suggestScore[index] + ' p</span><div class="selectScore" playerID="' + suggestScore.playerID + '" suggest="' + index + '" points="' + suggestScore[index] + '" >' + lang[settings.lang]["select"] + "</div></div>";
    $(suggestionsDIV).append(html);
  });
}

function endGame() {
  //hide the div containg all yatzygame tables
  $("div.yatzyContainer").hide();
  //show the div containing the end game result
  $("div.endContainer").show();

  var sortedPlayers = players;
  sortedPlayers.shift(); //removes the first 'box' in the array, in our case null

  //sort the array to have the player with higest total at the first index
  sortedPlayers.sort(function (a, b) {
    return b.total - a.total;
  });

  //for each player in the array do this:
  sortedPlayers.forEach(function (index) {
    //append a div containing players name & players total inside the div with class 'winner'
    $(".winner").append( "<div>" + index.name + " - " + index.total + " p</div>" );
  });
}