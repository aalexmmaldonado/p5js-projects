/////////////////////////////////////
///                               ///
///   smeart                      ///
///     v0.0.1                    ///
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

// Canvas size will be A4
var totalWidth = 842;
var totalHeight = 595;


var allDots = [];
const minDotWidth = 10;
const maxDotWidth = 30;
var availableColorScheme = {
    "rainbow": [
        "#FF8585",
        "#FFC885",
        "#FCFF99",
        "#AAFF99",
        "#9BF6FF",
        "#99C0FF",
        "#A899FF",
        "#FF99FF",
    ]
};
var colorSchemeLabel = "rainbow";





function setup() {
    pixelDensity(5);
    createCanvas(totalWidth, totalHeight);
    background(255);
    angleMode(DEGREES);

    addDots(totalWidth, totalHeight, 50, availableColorScheme[colorSchemeLabel]);
}




/**
 * Create all dots of "paint" and draw them onto the canvas.
 * @param {*} canvasWidth 
 * @param {*} canvasHeight 
 * @param {*} nDots 
 * @param {*} availableColors 
 * @returns 
 */
function addDots(canvasWidth, canvasHeight, nDots, availableColors) {
    for (i = 0; i < nDots; i++){
        randomOrigin = new Array(
            random(maxDotWidth, canvasWidth-maxDotWidth),
            random(maxDotWidth, canvasHeight-maxDotWidth)
        );
        randomWidth = random(minDotWidth, maxDotWidth);
        colorIndex = Math.floor(Math.random() * availableColors.length);
        colorSelection = availableColors[colorIndex];
        newDot = new Dot(randomOrigin, randomWidth, 20, colorSelection);
        newDot.put();
        allDots.push(newDot);
    }

    return allDots;
}


/**
 * A simple dot object to represent paint
 */
class Dot {

    constructor(origin, dotWidth, smearLength, colorSelection) {
        this.origin = origin;
        this.dotWidth = dotWidth;
        this.smearLength = smearLength;
        this.colorSelection = colorSelection;
    }

    /**
     * Draw the dot of "paint".
     */
    put() {
        noStroke();
        fill(this.colorSelection);
        circle(...this.origin, this.dotWidth);
    }
}
