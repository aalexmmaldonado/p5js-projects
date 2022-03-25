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

// Canvas size will be A4
var totalWidth = 842;
var totalHeight = 595;

function setup() {
    pixelDensity(5);
    createCanvas(totalWidth, totalHeight);
    background(255);
    angleMode(DEGREES);

    // Generate random variables.
    var maxGuassLength = dist(0, 0, totalWidth, totalHeight)*2;
    /*
    // Color options from https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51
    var colorOptions = [
        [38, 70, 83], [42, 157, 143], [233, 196, 106],
        [244, 162, 97], [231, 111, 81]
    ];
    */
    /*
    // Color options from https://coolors.co/palette/fbf8cc-fde4cf-ffcfd2-f1c0e8-cfbaf0-a3c4f3-90dbf4-8eecf5-98f5e1-b9fbc0
    var colorOptions = [
        [251, 248, 204], [253, 228, 207], [255, 207, 210], [241, 192, 232],
        [207, 186, 240], [163, 196, 243], [144, 219, 244], [142, 236, 245],
        [152, 245, 225], [185, 251, 192]
    ];
    */
    // Color options from https://coolors.co/palette/f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590
    globalThis.colorOptions = [
        [249, 65, 68], [243, 114, 44], [248, 150, 30], [249, 199, 79],
        [22, 50, 59], [67, 170, 139], [87, 117, 144]
    ];

    drawGaussian(maxGuassLength, colorOptions);
}

function mouseClicked() {
    var maxGuassLength = dist(0, 0, totalWidth, totalHeight)*2;
    drawGaussian(maxGuassLength, colorOptions);
}

function genGaussParams() {
    var prefactor = random(25, 200);
    var sigma = random(5, 100);
    var gaussCenterX = random((1/3)*totalWidth, (2/3)*totalWidth);
    var gaussCenterY = random((1/3)*totalHeight, (2/3)*totalHeight);
    var angle = random(0, 360);
    return [prefactor, sigma, gaussCenterX, gaussCenterY, angle];
}

function drawGaussian(maxGuassLength, colorOptions) {
    let prefactor, sigma, gaussCenterX, gaussCenterY, angle;
    [prefactor, sigma, gaussCenterX, gaussCenterY, angle] = genGaussParams()

    console.log('Gaussian prefactor: ', prefactor);
    console.log('Gaussian sigma: ', sigma);
    console.log('Gaussian center: ', gaussCenterX, ', ', gaussCenterY);
    console.log('Gaussian rotation: ', angle, ' degrees');

    var cAboveValue = random(colorOptions);
    var cAbove = color(cAboveValue);
    var colorOptionsRemaining = [];
    for (let i = 0; i < colorOptions.length; i++) {
        if (colorOptions[i] != cAboveValue) {
            colorOptionsRemaining.push(colorOptions[i]);
        }
    }
    var cBelow = random(colorOptionsRemaining)

    var gaussCurve = computeGaussian(
        prefactor,
        sigma, 0, -maxGuassLength/2, maxGuassLength/2
    );

    // Draw below rectangle.
    push();
    strokeWeight(1);
    stroke(cAbove);
    fill(cAbove);
    translate(gaussCenterX, gaussCenterY);
    rotate(angle);
    rect(-maxGuassLength/2, 0, maxGuassLength, maxGuassLength);
    pop();
    
    // Draw above rectangle.
    push();
    strokeWeight(1);
    stroke(cBelow);
    fill(cBelow);
    translate(gaussCenterX, gaussCenterY);
    rotate(angle);
    rect(-maxGuassLength/2, 0, maxGuassLength, -maxGuassLength);
    pop();

    // Draw Gaussian curve.
    push();
    strokeWeight(6);
    beginShape();
    stroke(255);
    fill(cBelow);
    translate(gaussCenterX, gaussCenterY);
    rotate(angle);
    for (let i = 0; i < gaussCurve[0].length; i++) {
        let x = gaussCurve[0][i];
        let y = gaussCurve[1][i];
        curveVertex(x, y);
    }
    endShape();
    pop();
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
function computeGaussian(prefactor, sigma, mu, xMin, xMax, numXValues=10000) {
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

