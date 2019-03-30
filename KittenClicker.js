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

function getResource(game, resourceName) {
    return findIt(game.resPool.resources, it => it.name === resourceName || it.title === resourceName)
}

// Per the wiki there are 5 ticks per second http://bloodrizer.ru/games/kittens/wiki/index.php?page=Game+Mechanics
const ticksPerSecond = 5

// If the "Observe the Sky" button pops up, click it
function observeAstronomicalEvents(game) {
    if(game.calendar.observeRemainingTime > 0) {
        game.calendar.observeHandler()
    }
}

// If the specified resource is 99% at capacity, refine it into the specified refineTo target
function refineResourceIfMax(game, resourceName, refineTo) {
    var resource = getResource(game, resourceName)
    var percentFull = resource.value / resource.maxValue
    var enabledCheckbox = document.getElementById(`${resourceName}ConversionCheckbox`)
    var enabled = ( enabledCheckbox ? enabledCheckbox.checked : true)
    if(percentFull >= 0.99 && enabled) {
        // If we produce more resources in a second than are consumed by a single refinement,
        // refine one second's worth of resource production
        var refinementCost = findIt(game.workshop.getCraft(refineTo).prices, it => it.name === resourceName).val
        var resourcePerSecond = resource.perTickCached * ticksPerSecond
        var craftQuantity = Math.ceil(resourcePerSecond / refinementCost)
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

function spendGold(game, desiredResource) {
    var gold = getResource(game, "gold")
    if(gold.value / gold.maxValue >= 0.99) {
        var tradingPartnerName // = game.diplomacy.get(race)
        switch(desiredResource) {
            case "promote kittens":
                game.village.promoteKittens()
                return;
            case "wood":
                tradingPartnerName = "lizards"
                break;
            case "catnip":
                tradingPartnerName = "sharks"
                break;
            case "iron":
                tradingPartnerName = "griffins"
                break;
            case "minerals":
                tradingPartnerName = "nagas"
                break;
            case "titanium":
                // Zebras trade for 50 slabs, attempt to craft them
                var craftQuantity = Math.ceil(50 / game.getCraftRatio())
                var succeeded = game.workshop.craft("slab", craftQuantity)
                tradingPartnerName = "zebras"
                break;
            case "coal":
                // Spiders trade for 50 scaffolds, attempt to craft them
                var craftQuantity = Math.ceil(50 / game.getCraftRatio())
                var succeeded = game.workshop.craft("scaffold", craftQuantity)
                tradingPartnerName = "spiders"
                break;
            case "uranium":
                tradingPartnerName = "dragons"
                break;
        }
        var tradingPartner = game.diplomacy.get(tradingPartnerName)
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
    var labelElement = document.createElement("label")
    labelElement.innerHTML = label
    container.appendChild(labelElement)
    var checkbox = document.createElement("input")
    checkbox.id = `${resourceName}ConversionCheckbox`
    checkbox.type = "checkbox"
    checkbox.checked = true
    checkbox.style.display = "inline"
    labelElement.appendChild(checkbox)
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


    console.log("adding gold refine options")
    var goldRefineContainer = document.createElement("p")
    goldRefineContainer.style.textAlign = "right"
    goldRefineContainer.innerHTML = "gold 🡒 "

    var goldSelect = document.createElement("select")
    goldSelect.id = "goldSelect"
    var goldRefineOptions = ["promote kittens", "wood","catnip","iron","minerals","titanium","coal","uranium"]
    for(var i in goldRefineOptions) {
        var goldOptionElement = document.createElement("option")
        goldOptionElement.value = goldRefineOptions[i]
        goldOptionElement.text = goldRefineOptions[i]
        goldSelect.appendChild(goldOptionElement)
    }

    goldRefineContainer.appendChild(goldSelect)
    conversionControls.appendChild(goldRefineContainer)

    conversionControls.appendChild(createConversionCheckbox("oil 🡒 kerosene ", "oil"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#4EA24E'>uranium</span> 🡒 <span style='color:#4EA24E'>thorium</span>", "uranium"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#A00000'>unobtainium</span> 🡒 <span style='color:#A00000'>eludium</span>", "unobtainium"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#DBA901'>catpower</span> 🡒 hunt", "catpower"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:coral'>furs</span> 🡒 <span style='color:#DF01D7'>parchment</span>", "furs"))
    conversionControls.appendChild(createConversionCheckbox("<span style='color:#DF01D7'>culture</span> 🡒 <span style='color:#01A9DB'>manuscript</span>", "culture"))

    var scienceRefineContainer = document.createElement("p")
    scienceRefineContainer.style.textAlign = "right"
    scienceRefineContainer.innerHTML = "<span style='color:#01A9DB'>science</span> 🡒 "
    var scienceSelect = document.createElement("select")
    scienceSelect.id = "scienceSelect"
    scienceSelect.style.color = "#01A9DB"
    var compendiumOption = document.createElement("option")
    compendiumOption.value = "compendium"
    compendiumOption.text = "compendium"
    compendiumOption.style.color = "#01A9DB"
    scienceSelect.appendChild(compendiumOption)
    var blueprintOption = document.createElement("option")
    blueprintOption.value = "blueprint"
    blueprintOption.text = "blueprint"
    blueprintOption.style.color = "#01A9DB"
    scienceSelect.appendChild(blueprintOption)
    var idleOption = document.createElement("option")
    idleOption.value = "disabled"
    idleOption.text = "disabled"
    idleOption.style.color = "#01A9DB"
    scienceSelect.appendChild(idleOption)
    scienceRefineContainer.appendChild(scienceSelect)
    conversionControls.appendChild(scienceRefineContainer)

    conversionControls.appendChild(createConversionCheckbox("<span style='color:gray'>faith</span> 🡒 praise", "faith"))
    panel.appendChild(conversionControls)

    document.body.appendChild(panel)
}

function main() {
    var game = window.wrappedJSObject.game
    observeAstronomicalEvents(game)
    dispatchHunters(game)
    var goldSelect = document.getElementById("goldSelect")
    var selectedGoldTarget = goldSelect.options[goldSelect.selectedIndex].value
    spendGold(game, selectedGoldTarget)
    praiseTheSun(game)
    refineResourceIfMax(game, "catnip", "wood")
    refineResourceIfMax(game, "wood", "beam")
    refineResourceIfMax(game, "minerals", "slab")
    refineResourceIfMax(game, "iron", "plate")
    refineResourceIfMax(game, "coal", "steel")
    refineResource(game, "furs", "parchment")
    refineResourceIfMax(game, "culture", "manuscript")

    var scienceSelect = document.getElementById("scienceSelect")
    var selectedScienceTarget = scienceSelect.options[scienceSelect.selectedIndex].value
    if(selectedScienceTarget == "compendium") {
        // This mispelling of "compendium" matches the source code in the game
        // It must be mispelled here to work correctly.
        refineResourceIfMax(game, "science", "compedium")
    } else if (selectedScienceTarget === "blueprint") {
        // blueprints cost 25 compendiums, so if there are fewer than that many compendiums make one of those instead
        if(getResource(game, "compedium").value < 25) {
            refineResourceIfMax(game, "science", "compedium")
        } else {
            refineResourceIfMax(game, "science", "blueprint")
        }
    }

    refineResourceIfMax(game, "titanium", "alloy")
    refineResourceIfMax(game, "oil", "kerosene")
    refineResourceIfMax(game, "uranium", "thorium")
    refineResourceIfMax(game, "unobtainium", "eludium")
    restyle()
}

window.onload = function() {
    createControlPanel()
    setInterval(main, 500)
    console.log("KittenClicker loaded and running")
}
