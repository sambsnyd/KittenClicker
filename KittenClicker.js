// Primary purpose of this simple clicker is to prevent resources from reaching their cap and having production go to waste


// Arrays reached via wrappedJSObject throw access denied exceptions if you try to call their find() method
// This likely has something to do with how Firefox sandboxes objects accessed via wrappedJSObject
function findIt(arr, predicate, defaultWhenMissing = null) {
    for(var i = 0; i < arr.length; i++) {
        if(predicate(arr[i])) {
            return arr[i];
        }
    }
    return defaultWhenMissing;
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
    var enabledCheckbox = document.getElementById(`${resourceName}ConversionCheckbox`)
    var enabled = ( enabledCheckbox ? enabledCheckbox.checked : true)
    if(percentFull >= 0.99 && enabled) {
        var craftedSuccessfully = game.workshop.craft(refineTo, craftQuantity)
    }
}

function refineResource(game, resourceName, refineTo, craftQuantity=1) {
    var enabledCheckbox = document.getElementById(`${resourceName}ConversionCheckbox`)
    var enabled = ( enabledCheckbox ? enabledCheckbox.checked : true)
    if(enabled) {
        game.workshop.craft(refineTo, craftQuantity)
    }
}

function dispatchHunters(game) {
    var catpower = getResource(game, "catpower")
    var enabledCheckbox = document.getElementById("catpowerConversionCheckbox")
    var enabled = ( enabledCheckbox ? enabledCheckbox.checked : true)
    if(catpower.value / catpower.maxValue >= 0.99 && enabled) {
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

function praiseTheSun(game) {
    var resource = getResource(game, "faith")
    var percentFull = resource.value / resource.maxValue
    var enabledCheckbox = document.getElementById("faithConversionCheckbox")
    var enabled = ( enabledCheckbox ? enabledCheckbox.checked : true)
    if(percentFull >= 0.99 && enabled) {
        game.religion.praise()
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

function createConversionCheckbox(label, resourceName) {
    var container = document.createElement("p")
    container.style.textAlign = "right"
    container.innerHTML = label
    var checkbox = document.createElement("input")
    checkbox.id = `${resourceName}ConversionCheckbox`
    checkbox.type = "checkbox"
    checkbox.checked = true
    checkbox.style.display = "inline"
    container.appendChild(checkbox)
    return container
}

function createControlPanel() {
    var panel = document.createElement("div")
    panel.id = "kittenClickerControlPanel"
    panel.style.width = "auto"
    panel.style.height = "auto"
    panel.style.position = "fixed"
    panel.style.bottom = "40px"
    panel.style.right = "20px"
    panel.style.border = "2px solid #00b7ff"
    panel.style.backgroundColor = "black"
    panel.style.color = "white"
    panel.style.padding = "5px"
    panel.style.fontFamily = "Roboto,sans-serif"

    var heading = document.createElement("b")
    heading.innerText = "Auto Refinement Controls ▼"
    heading.style.cursor="pointer"
    heading.addEventListener("click", function(){ 
        var conversionControls = document.getElementById("conversionControls")
        if(conversionControls.style.display === "none") {
            heading.innerText = "Auto Refinement Controls ▼"
            conversionControls.style.display = "block"
        } else {
            heading.innerText = "Auto Refinement Controls ▲"
            conversionControls.style.display = "none"
        }
    })
    panel.appendChild(heading)

    var conversionControls = document.createElement("div")
    conversionControls.id = "conversionControls"
    conversionControls.style.width = "100%"

    conversionControls.appendChild(createConversionCheckbox("catnip 🡒 wood ", "catnip"))
    conversionControls.appendChild(createConversionCheckbox("wood 🡒 beam ", "wood"))
    conversionControls.appendChild(createConversionCheckbox("minerals 🡒 slab ", "minerals"))
    conversionControls.appendChild(createConversionCheckbox("coal 🡒 <span style='color:gray'>steel</span> ", "coal"))
    conversionControls.appendChild(createConversionCheckbox("iron 🡒 plate ", "iron"))
    conversionControls.appendChild(createConversionCheckbox("titanum 🡒 <span style='color:gray'>alloy</span> ", "titanium"))
    conversionControls.appendChild(createConversionCheckbox("oil 🡒 kerosene ", "oil"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#4EA24E'>uranium</span> 🡒 <span style='color:#4EA24E'>thorium</span>", "uranium"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#A00000'>unobtainium</span> 🡒 <span style='color:#A00000'>eludium</span>", "unobtainium"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#DBA901'>catpower</span> 🡒 hunt", "catpower"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:coral'>furs</span> 🡒 <span style='color:#DF01D7'>parchment</span>", "furs"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#DF01D7'>culture</span> 🡒 <span style='color:#01A9DB'>manuscript</span>", "culture"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#01A9DB'>science</span> 🡒 <span style='color:#01A9DB'>compendium</span>", "science"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#01A9DB'>compendium</span> 🡒 <span style='color:#01A9DB'>blueprint</span>", "compendium"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:gray'>faith</span> 🡒 praise", "faith"))
    panel.appendChild(conversionControls)

    document.body.appendChild(panel)
}

function main() {
    var game = window.wrappedJSObject.game
    observeAstronomicalEvents(game)
    dispatchHunters(game)
    dispatchTraders(game, "zebras")
    praiseTheSun(game)
    refineResourceIfMax(game, "catnip", "wood", 100)
    refineResourceIfMax(game, "wood", "beam")
    refineResourceIfMax(game, "minerals", "slab")
    refineResourceIfMax(game, "iron", "plate")
    refineResourceIfMax(game, "coal", "steel")
    refineResource(game, "furs", "parchment")
    refineResourceIfMax(game, "culture", "manuscript")
    // This mispelling of "compendium" matches the source code in the game
    // It must be mispelled here to work correctly.
    refineResourceIfMax(game, "science", "compedium")
    refineResourceIfMax(game, "science", "blueprint")
    refineResourceIfMax(game, "titanium", "alloy")
    refineResourceIfMax(game, "oil", "kerosene")
    refineResourceIfMax(game, "uranium", "thorium")
    refineResourceIfMax(game, "unobtainium", "eludium")
    restyle()
}

window.onload = function() {
    if(window.wrappedJSObject.game === null) {
        // Game hasn't fully loaded yet, nothing to do
        return
    }
    createControlPanel()
    setInterval(main, 500)
    console.log("KittenClicker loaded and running")
}
