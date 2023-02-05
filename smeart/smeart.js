/////////////////////////////////////
///                               ///
///   smeart                      ///
///     v0.0.1dev                 ///
///       Alex Maldonado, 2023    ///
///                               ///
/////////////////////////////////////

/**
MIT License

Copyright (c) 2023 Alex M. Maldonado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/



///   NOTES   ///

/**
 * Press the space bar to smear or unsmear the dots. 
 * 
 */



///   CODE   ///

// Customizable parameters

// Select the color scheme.
var colorSchemeLabel = "rainbow";
// Used to automatically smear drops for production.
var startSmeared = true;
// Maximum fraction of smear length as total height
var maxSmearLengthFraction = 0.7;
// Draw a border around the canvas
var drawBorderCanvas = false;

// Number of random drops
var nRandomDrops = 40;




// Canvas size
var totalWidth = 1080;
var totalHeight = 1920;


var allDrops = [];
const minDropWidth = 20;
const maxDropWidth = 50;
var availableColorScheme = {
    "rainbow": [
        "#FF8585",
        "#FFC885",
        // "#FCFF99",
        "#AAFF99",
        "#9BF6FF",
        "#99C0FF",
        "#A899FF",
        "#FF99FF",
    ]
};







function setup() {
    createCanvas(totalWidth, totalHeight);
    background(255);

    createSmeart();
}



function drawBorder() {
    strokeWeight(10);
    stroke(150);
    noFill();
    rect(0, 0, totalWidth, totalHeight);
}

function randomDropParams(availableColors) {
    // Origin is the top part of the line.
    
    let randomOrigin = new Array(
        random(maxDropWidth, totalWidth-maxDropWidth),
        random(maxDropWidth, totalHeight-maxDropWidth)
    );
    randomWidth = random(minDropWidth, maxDropWidth);
    colorIndex = Math.floor(Math.random() * availableColors.length);
    colorSelection = availableColors[colorIndex];
    smearLength = random(5, totalHeight*maxSmearLengthFraction);
    return [randomOrigin, randomWidth, colorSelection, smearLength];
}


function addRandomDrops(nDrops, availableColors) {
    for (i = 0; i < nDrops; i++){
        randomOrigin = new Array(
            random(maxDropWidth, totalWidth-maxDropWidth),
            random(maxDropWidth, totalHeight-maxDropWidth)
        );
        const [dropOrigin, dropWidth, dropColor, smearLength] = randomDropParams(
            availableColors
        );
        newDrop = new Drop(dropOrigin, dropWidth, smearLength, dropColor);
        allDrops.push(newDrop);  // Adds it to list
    }
}




/**
 * Represents a drop of paint as a line that can be "smeared".
 */
class Drop {

    /**
     * 
     * @param {*} origin 
     * @param {*} dropWidth 
     * @param {*} smearLength 
     * @param {*} colorSelection Color as a hex value.
     */
    constructor(origin, dropWidth, smearLength, colorSelection) {
        this.origin = origin;
        this.dropWidth = dropWidth;
        this.smearLength = smearLength;
        this.colorSelection = colorSelection;
        this.isSmeared = false;
    }

    /**
     * Draw the drop of "paint".
     */
    place(smearLength=0) {
        strokeWeight(this.dropWidth);
        stroke(this.colorSelection);
        line(...this.origin, this.origin[0], this.origin[1]+smearLength);
        if (smearLength != 0) {
            this.isSmeared = true;
        } else {
            this.isSmeared = false;
        }
    }

    /**
     * Redraws the drop with the smear length
     */
    smear() {
        this.place(this.smearLength)
    }
}


function placeAllDrops() {
    clear();
    for (i = 0; i < allDrops.length; i++){
        allDrops[i].place();
    }
    if (drawBorderCanvas) {
        drawBorder();
    }
}


function smearAllDrops() {
    clear();
    for (i = 0; i < allDrops.length; i++){
        allDrops[i].smear();
    }
    if (drawBorderCanvas) {
        drawBorder();
    }
}


/**
 * Controls smearing and placing/"unsmearing" drops with the ENTER key
 */
function keyPressed() {
    if (keyCode == ENTER) {
        createSmeart();
    } else if (keyCode == 32) {  // space bar
        if (allDrops[0].isSmeared) {
            placeAllDrops();
        } else {
            smearAllDrops();
        }
    }
}


function createSmeart() {
    clear();
    allDrops = [];
    colorSelection = availableColorScheme[colorSchemeLabel];

    addRandomDrops(nRandomDrops, colorSelection)

    if (startSmeared) {
        smearAllDrops();
    } else {
        placeAllDrops();
    }
}

