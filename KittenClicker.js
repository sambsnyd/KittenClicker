/*
function findIt(array, predicate) {
    for(int i = 0; i < array.length; i++) {
        var current = array[i]
        if(predicate(current)) {
            return current;
        }
    }
    return null; 
}

function getResourceCount(game, name) {
    var resources = game.resPool.resources 
    var theThing = findIt(resources, it => it.name === "starchart")
    return theThing 
}
*/

function observeCelestialEvents() {
    try {
        var game = window.wrappedJSObject.game 
        if(game.calendar.observeRemainingTime > 0) {
            game.calendar.observeHandler()
            //var starcharts = getResourceCount(game, "starchart")
            console.log(`Observed Celestial Event.`)
            console.log(`Starcharts:  are now ????`)
        }
    } catch (e) {
        console.log(`Problem running observeCelestialEvents: ${e}`)
    }
}

function main() {
    observeCelestialEvents()
}

setInterval(main, 500)
