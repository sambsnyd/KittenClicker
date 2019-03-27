
// Arrays reached via wrappedJSObject throw access denied exceptions if you try to call their find() method 
function findIt(arr, predicate) {
    for(var i = 0; i < arr.length; i++) {
        if(predicate(arr[i])) {
            return arr[i];
        }
    }
    return null; 
}

function getResource(name) {
    return findIt(window.wrappedJSObject.game.resPool.resources , it => it.name === name || it.title === name) 
}

// If the "Observe the Sky" button pops up, click it 
function observeCelestialEvents() {
    var game = window.wrappedJSObject.game 
    if(game.calendar.observeRemainingTime > 0) {
        game.calendar.observeHandler()
    }
}

// If the specified resource is 99% at capacity, refine it into the specified refineTo target
function refineResourceIfMax(resourceName, refineTo) {
    var resource = getResource(resourceName)
    var percentFull = resource.value / resource.maxValue
    if(percentFull >= 0.99) {
        var game = window.wrappedJSObject.game 
        var craftedSuccessfully = game.workshop.craft(refineTo, 1)
        if(!craftedSuccessfully) {
            console.log(`Failed to craft ${refineTo}, probably missing another component`)
        }
    }
}

function refineResource(resourceName, refineTo) {
    var game = window.wrappedJSObject.game 
    game.workshop.craft(refineTo, 1)
}

function spendCatpower() {
    var catpower = getResource("catpower")
    if(catpower.value / catpower.maxValue >= 0.99) {
        var game = window.wrappedJSObject.game 
        game.village.huntMultiple(1)
    }
}

function main() {
    observeCelestialEvents()
    spendCatpower()
    refineResourceIfMax("catnip", "wood")
    refineResourceIfMax("wood", "beam")
    refineResourceIfMax("minerals", "slab")
    refineResourceIfMax("iron", "plate")
    refineResourceIfMax("coal", "steel")
    refineResource("furs", "parchment")
    refineResourceIfMax("culture", "manuscript")
    refineResourceIfMax("science", "compendium")
}

setInterval(main, 500)
console.log("KittenClicker loaded and running")
