document.addEventListener("DOMContentLoaded", function(){

// DOM variables
var root, RollDiceBtn, dice, HoldBtn, NumericalDiceValue, PlayerBox, 
    PlayerOneGlobalScore, PlayerTwoGlobalScore, SettingsWrapper,
    PlayerGlobalScore, NewGameBtn, SettingsBtn, MainBoard, LightThemeBtn,
    DarkThemeBtn, AutomaticThemeBtn, ThemeBtn, FontSelectorBtnLabel,
    FontSelectorMenu, FontSelectorBtn, FontSelectorComponent, GlobalScoreSetter;

root = document.querySelector(':root');
MainBoard = document.getElementById('main-board');
SettingsWrapper = document.getElementById('settings-wrapper');
SettingsBtn = document.getElementById('settings-btn');
ThemeBtn = document.querySelectorAll('.theme-btn');
ColorSelectionBtn  = document.querySelectorAll('.color-selection-btn');
GradientPalette = document.querySelectorAll('.gradient-palette');
RollDiceBtn = document.getElementById('roll-dice-btn');
dice = document.getElementById('dice');
HoldBtn = document.getElementById('hold-btn');
NumericalDiceValue = document.getElementById('numerical-dice-value');
PlayerBox = document.querySelectorAll('.player-box');
PlayerOneGlobalScore = document.getElementById('player1-global-score');
PlayerTwoGlobalScore = document.getElementById('player2-global-score');
PlayerGlobalScore = document.querySelectorAll('player-global-score');
NewGameBtn = document.getElementById('new-game-btn');
FontSelectorBtn = document.getElementById('font-selector-btn');
FontSelectorMenu = document.getElementById('font-selector-menu');
FontSelectorComponent = document.querySelectorAll('.font-selector-component');
FontSelectorBtnLabel = document.getElementById('font-selector-btn-label');
GlobalScoreSetter = document.getElementById('global-score-setter');

// Regular variables
var RollValue, RoundScore, NumToWord, MaxGlobalScore, FallBackFonts;
RollValue = 0;
RoundScore = 0;
NumToWord = "";
MaxGlobalScore = 20;
FallBackFonts = " 'Trebuchet', 'Verdana', 'Tahoma', 'Arial Narrow', 'Helvetica', 'Geneva', sans-serif";
var DiceValues = {
    1:'one',
    2:'two', 
    3:'three',
    4:'four',
    5:'five',
    6:'six'
};

visibilityToggle();

// Puts an indicating icon that reveals who the current player is
// based on which player side currently has the 'is-active-player' class.
// By default Player 1 is the active player when the page loads. 
// It is meant to work specifically with the activePlayerToggle function, 
// as a callback function. After the active status of a player changes 
// due to activePlayerToggle, visibilityToggle will then make the active
// player indicator visible.
function visibilityToggle(){
    PlayerBox.forEach(function(node){
        if(node.classList.contains('is-active-player') == true){
            node.querySelector('.active-player-indicator').classList.remove('hide-me');
        } else{
            node.querySelector('.active-player-indicator').classList.add('hide-me');
        }
    });
}

function activePlayerToggle(callback){
    PlayerBox.forEach(function(node){
        if(node.classList.contains('is-active-player') == true){
            node.classList.remove('is-active-player');
        } else{
            node.classList.add('is-active-player');
        }
        callback();
    });
}

function changeDice(number){
    NumToWord = DiceValues[number];
    dice.className = "fas fa-dice-" + NumToWord;
    NumericalDiceValue.innerHTML = number;
}

function clearFields(){
    PlayerOneGlobalScore.innerHTML = 0;
    PlayerTwoGlobalScore.innerHTML = 0;
    NumericalDiceValue.innerHTML = '0';
    dice.className = 'fas fa-dice';

    if(PlayerBox[0].classList.contains('is-active-player') == false){
        activePlayerToggle(visibilityToggle);
    }
}

// This function takes two arguments. One is the target node('root' in this case) while
// the other takes an object literal with property-value pairs used to replace those
// that correspond with the property-value pairs in the node/element that was passed as 
// the first argument(bait and switch basically). It constructs a new array, consisting
// of multiple arrays which are themselves made of the property-value pair that the
// Object.entries() function returns and stores them in PropertyEntries.
// The function then loops through PropertyEntries, extacts the property-value pair of
// each array member and sets the properties (setProperty()) on the target node(root).
var updateProperty = (node, obj) => {
    var PropertyEntries = Object.entries(obj); // PropertyEntries = [[key, value],[key, value], etc]
    var property;
    var value;
    // Loops through the newly created array of arrays(PropertyEntries) and grabs
    // the first(entry[0]) and second(entry[1]) values of each array entry. 
    PropertyEntries.forEach(entry => {
        property = entry[0];
        value = entry[1];
        node.style.setProperty(property, value);
    });   
}

// Sets styles on the --primary-color and --secondary-color variables
var changeThemeColor = (node, primary, secondary) => {
    node.style.setProperty('--primary-color', primary);
    node.style.setProperty('--secondary-color', secondary);
};

// Returns the property value of a an element. Both the target element and 
// proptery are passed in as args.
//NB: getPropertyValue() returns all hex code as rgb.
var propertyValueExtractor = (node, property) => {
    var PropertyValues = window.getComputedStyle(node);
    var FetchedPropertyValue = PropertyValues.getPropertyValue(property);
    return FetchedPropertyValue;
};

// This function works hand in hand with propertyValueExtractor() and all it
// does is extract the gradient color values from the 'background-image' css property.
// This is necessary because propertyValueExtractor returns a string containing all 
// the necessary syntax for background-image to work:
// e.g. 'linear-gradient(to right, #15bd87, #85948b)'
// In addition to this all hex code returned by getPropertyValue() is converted to 
// rgb so 'linear-gradient(to right, #15bd87, #85948b)' looks like this:
//        'linear-gradient(to right, rgb(21, 189, 135), rgb(51, 233, 173)'
// In order to strip away the unncessary syntax and just leave the rgb values I had to
// remove all alpha characters and re-add 'rgb' to the stripped string. 
// That is done in the for loop which also stores the rgb values in an array.
// The array values can be accessed by indexing them e.g. index[0] = primary index[1] = secondary.
// For now it only works with 2 rgb colors.
var gradientColorExtractor = (node, property) => {
    var PropertyString = propertyValueExtractor(node, property);
    PropertyString = PropertyString.replace(/\s|[a-z]|[A-Z]|\-/g, '');
    PropertyString = PropertyString.slice(2, -1);
    PropertyString = PropertyString.replace('),(',') (');
    PropertyStringArray = PropertyString.split(" ");

    for(var i in PropertyStringArray){
        PropertyStringArray[i] = 'rgb' + PropertyStringArray[i];
    }
  
    return PropertyStringArray;
};

// Variables that are set the rgba values for box shadows to the default on 
// light theme and dark theme shadow. They are global because the values are
// used by both the theme setting button and accent setting button. 
var  LightBoxShadowRgba = 'rgba(21,189,135, 0.5)';
var  DarkBoxShadowRgba = 'rgba(0,0,0,0.6)';

// This function sets the color of the shadow based on the theme used and accent 
// color selected. You'll notice that when the theme is dark black shadows are used
// while accent color shadows(with alpha) is applied when the light theme is set.
GradientPalette.forEach(el => {
    el.addEventListener('click', () =>  {
        var SetBoxShadowTheme = gradientColorExtractor(el, 'background-image')[0]
        SetBoxShadowTheme = SetBoxShadowTheme.replace('rgb','rgba');
        SetBoxShadowTheme = SetBoxShadowTheme.replace(')',',0.50)');
         LightBoxShadowRgba = SetBoxShadowTheme;
        var PrimaryColor = gradientColorExtractor(el, 'background-image')[0];
        var SecondaryColor = gradientColorExtractor(el, 'background-image')[1];
        changeThemeColor(root, PrimaryColor, SecondaryColor);
        if(MainBoard.classList.contains('light-theme-applied') == true){
            // Sets accent color box shadows.
            root.style.setProperty('--primary-color-box-shadow-sm', '0 8px 16px ' + SetBoxShadowTheme);
            root.style.setProperty('--primary-color-box-shadow-xsm', '0 4px 5px ' + SetBoxShadowTheme);
        } else{
            // Sets black box shadows.
            root.style.setProperty('--primary-color-box-shadow-sm', '0 8px 16px ' + DarkBoxShadowRgba);
            root.style.setProperty('--primary-color-box-shadow-xsm', '0 4px 5px ' + DarkBoxShadowRgba);
        }
    })
});

// Displays the settings menu
SettingsBtn.addEventListener('click', () => {
    if(SettingsWrapper.classList.contains('no-display')){
        SettingsWrapper.classList.remove('no-display');
    } else{
        SettingsWrapper.classList.add('no-display');
        FontSelectorMenu.classList.add('no-display');
    }
});

// Disables JS's stupid default propagation mechanic that lets
// the event start with a descendant element and bubble up to 
// the intended element. StackOverflow to the rescue.
SettingsWrapper.addEventListener('click', e => {
    e = window.event || e; 
    if(this === e.target) {
        FontSelectorMenu.classList.add('no-display');
    }
})

// Sets the light theme or dark theme
ThemeBtn.forEach(node =>{
    node.addEventListener('click', () => {
        if(node.id == 'light-theme-btn'){
            MainBoard.classList.add('light-theme-applied');
            MainBoard.classList.remove('dark-theme-applied');
            updateProperty(root, LightTheme);
            if(MainBoard.classList.contains('light-theme-applied') == true){
                root.style.setProperty('--primary-color-box-shadow-sm', '0 8px 16px ' +  LightBoxShadowRgba);
                root.style.setProperty('--primary-color-box-shadow-xsm', '0 4px 5px ' +  LightBoxShadowRgba);
            }
        } else if(node.id == 'dark-theme-btn'){
            MainBoard.classList.remove('light-theme-applied');
            MainBoard.classList.add('dark-theme-applied');
            updateProperty(root, DarkTheme);
            if(MainBoard.classList.contains('dark-theme-applied') == true){
                root.style.setProperty('--primary-color-box-shadow-sm', '0 8px 16px ' + DarkBoxShadowRgba);
                root.style.setProperty('--primary-color-box-shadow-xsm', '0 4px 5px ' + DarkBoxShadowRgba);
            }
        } else if(node.id == 'automatic-theme-btn'){
            alert('feature not operational yet');
        }
    });
});

ColorSelectionBtn.forEach( node =>{
    node.addEventListener('click', () =>{
        // console.log('you clicked ' + node.classList);
    });
});

// Toggles the font selection menu when clicked
FontSelectorBtn.addEventListener('click', () =>{
    if(FontSelectorMenu.classList.contains('no-display') == true){
        FontSelectorMenu.classList.remove('no-display');
    }else{
        FontSelectorMenu.classList.add('no-display');
    }
})

// Updates the font used when a component is click
FontSelectorComponent.forEach(component => {
    component.addEventListener('click', () =>{
        FontSelectorBtnLabel.innerHTML = component.innerHTML;
        var UpdatedFontFamilyValue = FontSelectorBtnLabel.innerHTML + ", " + FallBackFonts;
        root.style.setProperty('font-family', UpdatedFontFamilyValue);
        // console.log(UpdatedFontFamilyValue);
    });
});

// Sets the maximum value for the highscore however it has to be a value between 6 and 20000000
// as set by min and max attribute on the input element that is responsible for settings the
// maximum score. 
GlobalScoreSetter.addEventListener('change', () => {
    MaxGlobalScore = GlobalScoreSetter.value;
});

NewGameBtn.addEventListener('click', () => {
    clearFields();
});

RollDiceBtn.addEventListener('click', function(){
    RollValue = Math.floor((Math.random() * 6) + 1);
    changeDice(RollValue);

    var ActivePlayerFlag = false;
    var ActiveStatus = "";
    var CurrentRoundScore;

    PlayerBox.forEach(function(node){
       ActiveStatus = node.classList.contains('is-active-player');
       CurrentRoundScore = node.querySelector('.player-current-round-score');

       if(ActiveStatus == true){ // locks score changes to the current player class elements
            if(RollValue != 1){
                RoundScore += RollValue;
                CurrentRoundScore.innerHTML = RoundScore;
                scoreCheckFlag = true;
            }
            else{
                RoundScore = 0;
                CurrentRoundScore.innerHTML = RoundScore;
                ActivePlayerFlag = true; 
                // For some reason trying at call activePLayerToogle() here causes issues
                // when ran inside the forEach loop so I've added a var called functCallFag
                // which acts as a flag for whether or not activePlayerToogle() should be called.
                // An if statement outside the loop will check the value of of countCallFlag and 
                // determine whether or not activePLayerToggle() should be called.             
            }
       }

            
    });

    if(ActivePlayerFlag == true){activePlayerToggle(visibilityToggle);}

});
 
var MutationCallback = (node) =>{
    var tally = parseInt(node.innerHTML, 10);

    if(tally >= MaxGlobalScore){
        alert("A high score reached! High Score: " + MaxGlobalScore);
    }
}

var MutationConfig = {childList: true}
var PlayerOneObserver = new MutationObserver(() => {MutationCallback(PlayerOneGlobalScore);});
var PlayerTwoObserver = new MutationObserver(() => {MutationCallback(PlayerTwoGlobalScore);});
PlayerOneObserver.observe(PlayerOneGlobalScore, MutationConfig);
PlayerTwoObserver.observe(PlayerTwoGlobalScore, MutationConfig);

HoldBtn.addEventListener('click', function(){
    var ActiveStatus, GlobalTotal;
    ActiveStatus = "";
    PlayerBox.forEach(function(node){
        ActiveStatus = node.classList.contains('is-active-player');
        var CurrentRoundScore = node.querySelector('.player-current-round-score');
        GlobalTotal = node.querySelector('.player-global-score');
        if(ActiveStatus == true){
            GlobalTotal.innerHTML = parseInt(GlobalTotal.innerHTML) + RoundScore;
            RoundScore = 0;
            CurrentRoundScore.innerHTML = 0;
        }
     });
     activePlayerToggle(visibilityToggle);   
});

var LightTheme = {
    "--theme-txt-color-inverted" : "#000",
    "--theme-txt-color-inverted-contrasted" : "#555",
    "--theme-color": "#fff",
    "--theme-color-contrasted" : "#f5f5f5",
    "--theme-txt-color" : "#fff",
    "--txt-shadow-xsm" : "0 10px 10px rgba(0,0,0,0.1)",
    "--board-btn-shadow" : "0 2px 3px -1px rgba(0,0,0,.08), 0 5px 10px -2px rgba(0,0,0,.15)",
    "--board-btn-background" : "rgba(0,0,0,0.07)"
}

var DarkTheme = {
    "--theme-txt-color-inverted" : "#000",
    "--theme-txt-color-inverted-contrasted" : "#d8d8d8",
    "--theme-color": "#222",
    "--theme-color-contrasted" : "#333",
    "--theme-txt-color" : "#222",
    "--txt-shadow-xsm" : "0 10px 10px rgba(0,0,0,0.5)",
    "--board-btn-shadow" : "0 2px 3px -1px rgba(0,0,0,.08), 0 5px 10px -2px rgba(0,0,0,0.4)",
    "--board-btn-background" : "rgba(255,255,255,0.07)"
}

// console.log(window.getComputedStyle(root));

});
