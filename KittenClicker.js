
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
function getBuilding(game, name) {
    return findIt(game.bld.buildingsData, it => it.name === name || it.label === name)
}

// If the "Observe the Sky" button pops up, click it 
function observeCelestialEvents(game) {
    if(game.calendar.observeRemainingTime > 0) {
        game.calendar.observeHandler()
    }
}

// If the specified resource is 99% at capacity, refine it into the specified refineTo target
function refineResourceIfMax(game, resourceName, refineTo) {
    var resource = getResource(game, resourceName)
    var percentFull = resource.value / resource.maxValue
    if(percentFull >= 0.99) {
        var craftedSuccessfully = game.workshop.craft(refineTo, 1)
    }
}

function refineResource(game, resourceName, refineTo) {
    game.workshop.craft(refineTo, 1)
}

function spendCatpower(game) {
    var catpower = getResource(game, "catpower")
    if(catpower.value / catpower.maxValue >= 0.99) {
        game.village.huntMultiple(1)
    }
}

function spendGold(game) {
    var gold = getResource(game, "gold")
    if(gold.value / gold.maxValue >= 0.99) {
        
        var tradingPartner = game.diplomacy.get("zebras")
        game.diplomacy.tradeMultiple(tradingPartner, 1)
    }
}

function main() {
    var game = window.wrappedJSObject.game 
    observeCelestialEvents(game)
    spendCatpower(game)
    spendGold(game)
    refineResourceIfMax(game, "catnip", "wood")
    refineResourceIfMax(game, "wood", "beam")
    refineResourceIfMax(game, "minerals", "slab")
    refineResourceIfMax(game, "iron", "plate")
    refineResourceIfMax(game, "coal", "steel")
    refineResource(game, "furs", "parchment")
    refineResourceIfMax(game, "culture", "manuscript")
    // This mispelling of "compendium" matches the source code in the game 
    // It must be mispelled here to work correctly. 
    refineResourceIfMax(game, "science", "compedium")
    refineResourceIfMax(game, "titanium", "alloy")
    refineResourceIfMax(game, "oil", "kerosene")
}

setInterval(main, 500)
console.log("KittenClicker loaded and running")
