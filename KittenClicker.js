// Primary purpose of this simple clicker is to prevent resources from reaching their cap and having production go to waste


// Arrays reached via wrappedJSObject throw access denied exceptions if you try to call their find() method
// This likely has something to do with how Firefox sandboxes objects accessed via wrappedJSObject
function findIt(arr, predicate) {
    for(var i = 0; i < arr.length; i++) {
        if(predicate(arr[i])) {
            return arr[i];
        }
    }
    return null;
}

function getResource(game, name) {
    return findIt(game.resPool.resources, it => it.name === name || it.title === name)
}

// If the "Observe the Sky" button pops up, click it
function observeAstronomicalEvents(game) {
    if(game.calendar.observeRemainingTime > 0) {
        game.calendar.observeHandler()
    }
}

// If the specified resource is 99% at capacity, refine it into the specified refineTo target
function refineResourceIfMax(game, resourceName, refineTo, craftQuantity=1) {
    var resource = getResource(game, resourceName)
    var percentFull = resource.value / resource.maxValue
    if(percentFull >= 0.99) {
        var craftedSuccessfully = game.workshop.craft(refineTo, craftQuantity)
    }
}

function refineResource(game, resourceName, refineTo, craftQuantity=1) {
    game.workshop.craft(refineTo, craftQuantity)
}

function dispatchHunters(game) {
    var catpower = getResource(game, "catpower")
    if(catpower.value / catpower.maxValue >= 0.99) {
        game.village.huntMultiple(1)
    }
}

function dispatchTraders(game, race) {
    var gold = getResource(game, "gold")
    if(gold.value / gold.maxValue >= 0.99) {
        var tradingPartner = game.diplomacy.get(race)
        game.diplomacy.tradeMultiple(tradingPartner, 1)
    }
}

// Parchment is "abundant" when there's enough that crafting a manuscript would still leave enough parchment to spend on a chapel or amphitheatre, whichever of the two is more expensive 
function refineManuscriptWhenParchmentAbundant(game) {
    var resource = getResource(game, "culture")
    var percentFull = resource.value / resource.maxValue
    if(percentFull >= 0.99) {
        var chapelParchmentCost = findIt(game.bld.getPrices("chapel"), it => it.name === "parchment").val
        var amphitheatreParchmentCost = findIt(game.bld.getPrices("amphitheatre"), it => it.name === "parchment").val
        var currentParchment = getResource(game, "parchment").value
        if(currentParchment > Math.max(chapelParchmentCost,amphitheatreParchmentCost) + 25) {
            game.workshop.craft("manuscript", 1)
        }
    }
}

function restyle() {
    var toolbarIcons = document.getElementsByClassName("toolbarIcon")
    for(var i = 0; i < toolbarIcons.length; i++) {
        // The power display is hard to read, give it a glow to make it stand out from the black background 
        if(toolbarIcons[i].style.color === "green") {
            toolbarIcons[i].style.textShadow = "0px 1px 1px #fff, 1px 0px 1px #fff, 0px -1px 1px #fff, -1px 0px 1px #fff"
        }
    }
}

function main() {
    var game = window.wrappedJSObject.game
    if(game === null) {
        // Game hasn't fully loaded yet, nothing to do
        return
    }
    observeAstronomicalEvents(game)
    dispatchHunters(game)
    dispatchTraders(game, "zebras")
    refineResourceIfMax(game, "catnip", "wood", 100)
    refineResourceIfMax(game, "wood", "beam")
    refineResourceIfMax(game, "minerals", "slab")
    refineResourceIfMax(game, "iron", "plate")
    refineResourceIfMax(game, "coal", "steel")
    refineResource(game, "furs", "parchment")
    refineManuscriptWhenParchmentAbundant(game)
    // This mispelling of "compendium" matches the source code in the game
    // It must be mispelled here to work correctly.
    refineResourceIfMax(game, "science", "compedium")
    refineResourceIfMax(game, "titanium", "alloy")
    refineResourceIfMax(game, "oil", "kerosene")

    restyle()
}

window.onload = function() {
    setInterval(main, 500)
    console.log("KittenClicker loaded and running")
}
