/////////////////////////////////////
///                               ///
///   Gaussian Borders            ///
///     v0.0.1                    ///
///       Alex Maldonado, 2022    ///
///                               ///
/////////////////////////////////////

/**
MIT License

Copyright (c) 2022 Alex M. Maldonado

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

// Canvas size will be A4 at 72 ppi
var totalWidth = 595;
var totalHeight = 842;

var maxGuassLength = Math.sqrt((totalWidth)**2+(totalHeight)**2);

function setup() {
    
    createCanvas(totalWidth, totalHeight);
    background(240);
    
    var transX = 300;
    var transY = 400;
    var angle = PI/3.0;
    var gaussCurve = arraysEqual(100, 30, 0, -maxGuassLength/2, maxGuassLength/2);
    
    var c = color(66, 135, 245);
    // Draw rectangle.
    push();
    stroke(c);
    fill(c);
    //translate(-maxGuassLength/2, 0);
    translate(transX, transY);
    rotate(angle);
    //rect(0, 0, maxGuassLength, -maxGuassLength);
    rect(0, 0, 100, -100);
    pop();

    // Draw Gaussian curve.
    push();
    strokeWeight(4);
    beginShape();
    fill(c);
    for (let i = 0; i < gaussCurve[0].length; i++) {
        let x = gaussCurve[0][i];
        let y = gaussCurve[1][i];
        curveVertex(x, y);
    }
    translate(transX, transY);
    rotate(angle);
    endShape();
    pop();

    strokeWeight(10);
    point(300, 600);
}

/**
 * Generates array by interpolating between two values.
 * @param {float} startValue First value in the array.
 * @param {float} stopValue Last value in the array.
 * @param {float} size  Number of items in the array (including bounds).
 * @returns {array}
 */
function linspace(startValue, stopValue, size) {
    var arr = [];
    var step = (stopValue - startValue) / (size - 1);
    for (var i = 0; i < size; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}

/**
 * Computes Gaussian function given a range of inputs.
 * @param {float} prefactor
 * @param {float} sigma
 * @param {float} mu
 * @param {float} xMin
 * @param {float} xMax
 * @param {float} numXValues
 * @returns {array}
 */
function arraysEqual(prefactor, sigma, mu, xMin, xMax, numXValues=5000) {
    var xValues = linspace(xMin, xMax, numXValues);
    var yValues = [];
    for (let i = 0; i < xValues.length; i++) {
        let x = xValues[i];
        var exponent = (-((x-mu)**2))/(2*sigma**2)
        yValues.push(
            prefactor*exp(exponent)
        )
    }
    return [xValues, yValues];
}

