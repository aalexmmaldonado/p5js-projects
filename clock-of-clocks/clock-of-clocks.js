////////////////////////////////////
///                              ///
///   Clock of Clocks            ///
///     v0.0.6                   ///
///       Alex Maldonado, 2022   ///
///                              ///
////////////////////////////////////

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

///   Notes   ///

// Clocks per digit: 4 wide, 6 tall
// Here is a diagram of the clocks and their digit index.
//  ----   ----   ----   ----
// | 0  | | 1  | | 2  | | 3  |
//  ----   ----   ----   ----
//  ----   ----   ----   ----
// | 4  | | 5  | | 6  | | 7  |
//  ----   ----   ----   ----
//  ----   ----   ----   ----
// | 8  | | 9  | | 10 | | 11 |
//  ----   ----   ----   ----
//  ----   ----   ----   ----
// | 12 | | 13 | | 14 | | 15 |
//  ----   ----   ----   ----
//  ----   ----   ----   ----
// | 16 | | 17 | | 18 | | 19 |
//  ----   ----   ----   ----
//  ----   ----   ----   ----
// | 20 | | 21 | | 22 | | 23 |
//  ----   ----   ----   ----

// TODO: Add acceleration option for states. So we do not instantaneously go to velocity.
// TODO: Adjust lerp parameter for a smoother stop.
// TODO: Adjust the lerp activation degrees based on velocity.





///    Global variables   ///

var useViewportSize = true; // If true, will overwrite totalWidth with the viewport size.
var useDivSize = null; // Use the div size. null if false, replace with "divname" if true.
var totalWidth = 2000;  // Total canvas width.




// Display information
var backgroundColor = 255;  // Display background color.
var numClocksHorizontal = 20;  // Number of clocks in a row.
var numClocksVertical = 8;  // Number of clocks in a column.
var manualFrameRate = 30;  // Frames per second.

// Unit information
var unitLength;  // Length of a single clock's unit cell.
var clockMargin;  // Margin between the unit cell edge and clock outline.

// Clock information
var clockStrokeWeight; // Stroke weight of the clock outline. 6 when 2000, 3 when 1000
var clockDiameterPercentOfUnit;  //  Ratio of clock diameter to unit cell length.
var clockDiameter;  // Diameter of the clock.
var clockOutlineStroke = 240;  // Stroke color of clock online.

// Hands information
var handLength;
var blankClockAngle = -225;  // Angle of clock hands when displaying the time.
var initialHandAngles = [0, -180];  // Clock hand angles when the display is first loaded.

// State information
var prepareTimeStateSeconds = 7;  // How many seconds before the next minute to switch to the time state.
var stopTimeStateSeconds = 4;  // How many seconds before the next minute to switch to the time state.
var minLerpT = 0.01;  // Maximum linear interpolation parameter allowed.
var maxLerpT = 0.04;  // Maximum linear interpolation parameter allowed.
var lerpWithinDegrees = 30;  // Enable linear interpolation if the hand is within this degrees.
var minAngularV;
var maxAngularV;

// Canvas information
var totalHeight;

function canvasSetup(resize=true) {
    // We have to divide the canvas into square units.
    // Each unit will contain a clock with some spacing from the cell edge.

    // Display information
    var desiredSize;
    if (useViewportSize) {
        desiredSize = getViewportSize();
        totalWidth = desiredSize[0] - 15
    } else if (useDivSize != null) {
        var desiredSize = document.getElementById(useDivSize).clientWidth;
        totalWidth = desiredSize[0] - 15
    }

    canvasMargin = 0.02 * totalWidth;  // Margin between the canvas and clocks on the edge.

    // Unit information
    unitLength = (totalWidth-(2*canvasMargin)) / numClocksHorizontal; // Length of a single clock's unit cell.
    clockMargin = 0.07 * unitLength;  // Margin between the unit cell edge and clock outline.

    // Clock information
    clockStrokeWeight = 0.00328571*totalWidth - 0.5;  // Stroke weight of the clock outline. 6 when 2000, 3 when 1000
    if (clockStrokeWeight < 1) {
        clockStrokeWeight = 1;
    }
    clockDiameterPercentOfUnit = 0.80;  //  Ratio of clock diameter to unit cell length.
    clockDiameter = clockDiameterPercentOfUnit * unitLength;  // Diameter of the clock.

    // Hands information
    handLength = clockDiameter/2 - clockStrokeWeight;  // The length of the clock hand.

    // State information
    minAngularV = 20/manualFrameRate;  // Minimum angular velocity in degrees/frame. (x degrees/s * s/frame)
    maxAngularV = 90/manualFrameRate;  // Maximum angular velocity in degrees/frame. (x degrees/s * s/frame)

    // Canvas information
    totalHeight = numClocksVertical*unitLength+canvasMargin*2;  // Calculates the total canvas height.

    createCanvas(totalWidth, totalHeight);
    display = new Display(totalWidth, totalHeight, canvasMargin);
    display.addAllClocks(unitLength, clockDiameterPercentOfUnit, handLength)
    display.initializeHands()
}



///   p5.js stuff   ///
var display;
var displayState;
var currentTime;

function setup() {
    frameRate(manualFrameRate);
    angleMode(DEGREES);

    canvasSetup(false);
}

function draw() {
    display.run()
}





///   Functions   ///

function getViewportSize() {
    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth,
        viewportheight = window.innerHeight
    }
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
        viewportwidth = document.documentElement.clientWidth,
        viewportheight = document.documentElement.clientHeight
    }   
    // older versions of IE
    else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth,
        viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }
    return [viewportwidth, viewportheight]
}

/**
 * Check if array 
 * @param {*} nestedArray 
 * @param {*} b 
 * @returns 
 */
 function checkArrayPresence(nestedArray, b) {
    let aString = JSON.stringify(nestedArray);
    let bString = JSON.stringify(b);
    var c = aString.indexOf(bString);
    if (c != -1) {
        return true
    } else {
        return false
    }
}

/**
 * Checks if two arrays are equal.
 * @param {array} a
 * @param {array} b
 * @returns {boolean}
 */
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Finding the index of an array inside a nested array
 * @param nestArr {Array} - A nested array to search.
 * @param arr {Array} - Array to search for in the nested array.
 * @return {number} Index of arr inside nestArr. Will return false if not found.
 */
 function getIndexArray(nestArr, arr){
    for (var i=0; i<nestArr.length; i++) {
        if (arraysEqual(nestArr[i], arr)) {
            return i;
        }
    }
    return false;
}

/**
 * Generates a random integer between two numbers.
 * @param {number} min Minimum number. If a float it rounds up.
 * @param {number} max Maximum number. If a float it rounds down.
 * @returns {number} A randomly generated integer.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * The clock indices used to display a specific digit of the time.
 * @param {*} digitID Digit index used to display the time. Digits 0 and
 *      1 are for the hour, 2 and 3 for the minute.
 * @returns {array} 2D array of [row_index, column_index] of clocks.
 */
function getDigitClockIndices(digitID) {
    if (digitID == 0) {
        clockStart = [1, 1];
    } else if (digitID == 1) {
        clockStart = [1, 5];
    } else if (digitID == 2) {
        clockStart = [1, 11];
    } else if (digitID == 3) {
        clockStart = [1, 15];
    } else {
        throw 'Digit ID must be 0, 1, 2, or 3.'
    }
    clockEnd = [clockStart[0]+5, clockStart[1]+3];

    clockIndices = [];
    for (i = clockStart[0]; i <= clockEnd[0]; i++) {
        for (j = clockStart[1]; j <= clockEnd[1]; j++) {
            clockIndices.push([i, j]);
        }
    }
    return clockIndices
}

/**
 * Get the current time.
 * @param {boolean} time24Hour Return the time in 24-hour format.
 *      Defaults to false.
 * @param {boolean} forDigits If the clock time is going to be used to display
 *      the time. Adds 30 seconds to the time to ensure the displayed digits
 *      are for the upcoming minute and not the current one.
 * @returns {array} The hour, minute, and seconds.
 */
function getClockTime(time24Hour=false, forDigits=false) {
    var time = new Date();
    if ((time.getSeconds() > 40) && (forDigits)) {
        // Adds time to get the next minute, not the current time.
        var time = new Date(time.getTime() + 30000)
    }
    let hour = time.getHours();
    let minute = time.getMinutes();
    let second = time.getSeconds();
    
    if (time24Hour == false) {
        if (hour > 12) {
            hour -= 12;
        } else if (hour == 0) {
            hour = 12;
        }
    }
    return [hour, minute, second];
}

/**
 * Provides clock hand angles to display a digit using a 4x6 grid of clocks.
 * @param {number} digit A number from 0 to 9.
 * @returns A 2D array of hand angles for the 23 clocks used to display the
 *      digit. Each element is [angle1, angle2] in degrees.
 */
function digitToClockHandAngles(digit) {
    if (digit == 0) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [-180, -270], [-90, -270],
            [-90, -270], [-90, -270], [-90, -270], [-90, -270],
            [-90, -270], [-90, -270], [-90, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180],
        ];
    } else if (digit == 1) {
        clockHandAngles = [
            [0, -270], [0, -180], [-180, -270], [blankClockAngle, blankClockAngle],
            [0, -90], [-180, -270], [-90, -270], [blankClockAngle, blankClockAngle],
            [blankClockAngle, blankClockAngle], [-90, -270], [-90, -270], [blankClockAngle, blankClockAngle],
            [blankClockAngle, blankClockAngle], [-90, -270], [-90, -270], [blankClockAngle, blankClockAngle],
            [0, -270], [-90, -180], [0, -90], [-180, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 2) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [0, -270], [0, -180], [-90, -180], [-90, -270],
            [-90, -270], [0, -270], [0, -180], [-90, -180],
            [-90, -270], [0, -90], [0, -180], [-180, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 3) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [0, -270], [0, -180], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [0, -270], [0, -180], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 4) {
        clockHandAngles = [
            [0, -270], [-180, -270], [0, -270], [-180, -270],
            [-90, -270], [-90, -270], [-90, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [blankClockAngle, blankClockAngle], [blankClockAngle, blankClockAngle], [-90, -270], [-90, -270],
            [blankClockAngle, blankClockAngle], [blankClockAngle, blankClockAngle], [0, -90], [-90, -180]
        ];
    } else if (digit == 5) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [0, -180], [-90, -180],
            [-90, -270], [0, -90], [0, -180], [-180, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [0, -270], [0, -180], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 6) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [0, -180], [-90, -180],
            [-90, -270], [0, -90], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [-180, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 7) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [blankClockAngle, blankClockAngle], [blankClockAngle, blankClockAngle], [-90, -225], [-90, -225],
            [blankClockAngle, blankClockAngle], [-45, -270], [-45, -270], [blankClockAngle, blankClockAngle],
            [blankClockAngle, blankClockAngle], [-90, -270], [-90, -270], [blankClockAngle, blankClockAngle],
            [blankClockAngle, blankClockAngle], [0, -90], [-90, -180], [blankClockAngle, blankClockAngle]
        ];
    } else if (digit == 8) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [-180, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [-90, -270], [0, -270], [-180, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    } else if (digit == 9) {
        clockHandAngles = [
            [0, -270], [0, -180], [0, -180], [-180, -270],
            [-90, -270], [0, -270], [-180, -270], [-90, -270],
            [-90, -270], [0, -90], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [-180, -270], [-90, -270],
            [0, -270], [0, -180], [-90, -180], [-90, -270],
            [0, -90], [0, -180], [0, -180], [-90, -180]
        ];
    }
    return clockHandAngles;
}

///   Classes   ///

/**
 * A clock hand.
 */
class Hand {

    /**
     * 
     * @param {array} origin The x,y coordinates of the center in pixels.
     * @param {number} length Length of the clock hand (line).
     */
    constructor(origin, length) {
        this.origin = origin;
        this.length = length;
    }

    /**
     * Calculates the end point of the clock hand.
     * @param {number} angle Clock hand angle.
     * @returns {array} Canvas coordinates of the hand end point.
     */
    calcHandEnd(angle) {
        let x = this.length * cos(angle);
        let y = this.length * sin(angle);
        return [this.origin[0]+x, this.origin[1]+y];
    }

    /**
     * Draws the clock hand.
     * @param {number} angle Clock hand angle.
     */
    drawHand(angle) {
        this.angle = angle;
        this.endLoc = this.calcHandEnd(this.angle);
        stroke(0);
        strokeWeight(clockStrokeWeight);
        line(this.origin[0], this.origin[1], this.endLoc[0], this.endLoc[1])
    }
}

/**
 * An analog clock, not much else.
 */
 class Clock {
    /**
     * 
     * @param {array} origin Center of the analog clock in pixels [width, height]
     * @param {number} diameter Diameter of the clock outline.
     * @param {number} handLength Length of the clock hands.
     */
    constructor(origin, diameter, handLength) {
        this.diameter = diameter;
        this.origin = origin;
        this.handLength = handLength;
        
        stroke(clockOutlineStroke);
        strokeWeight(clockStrokeWeight);
        noFill();
        circle(this.origin[0], this.origin[1], this.diameter);

        this.hands = [new Hand(origin, handLength), new Hand(origin, handLength)];
    }
}

/**
 * Manages the clock display.
 */
 class Display {
    /**
     * 
     * @param {number} totalWidth Total width of the canvas.
     * @param {number} totalHeight Total height of the canvas.
     * @param {number} canvasMargin Canvas margin for the clocks.
     */
    constructor(totalWidth, totalHeight, canvasMargin) {
        this.totalWidth = totalWidth;
        this.totalHeight = totalHeight;
        this.canvasMargin = canvasMargin;
        this.displayOptions = ['random'];
        this.currentState = 'none';

        this.clocks = [];  // All clocks in a nested array by row then column.
        this.handAngles = [];  // Angles.
        this.handNextStates = [];  // Angles of the next desired state.
        this.handVelocities = [];  // Radial hand velocities for patterns.
        this.lerpStatus = [];  // If linear interpolation should be used or not.
        this.lerpPara = [];  // Linear interpolation parameter.

        this.digitClocks = [];
        for (let i = 0; i < 4; i++) {
            this.digitClocks.push(getDigitClockIndices(i));
        }
        this.colonClocks = [
            [2, 9], [2, 10], [3, 9], [3, 10],
            [4, 9], [4, 10], [5, 9], [5, 10]
        ];
        this.colonHandAngles = [
            [0, -270], [-180, -270], [0, -90], [-90, -180],
            [0, -270], [-180, -270], [0, -90], [-90, -180]
        ];
    }

    /**
     * Add all clocks in a single row.
     * @param {number} y Y coordinate of all clocks in this row.
     */
     addClockRow(y) {
        this.clocks.push([]);
        for (let x = this.canvasMargin+this.unitLength/2; x < this.totalWidth-this.canvasMargin; x += this.unitLength) {
            this.clocks[this.clocks.length-1].push(
                new Clock(
                    [x, y], this.unitLength*this.clockDiameterPercentOfUnit, this.handLength
                )
            );
        }
    }

    /**
     * Adds all clocks to the canvas. Clocks are given a unit cell to occupy
     * and we specify the percent of total area (or length) used for the clock
     * to create some spacing between them. Does not add hands.
     * 
     * @param {number} unitLength Size, in pixels, of the unit square provided for each clock.
     * @param {number} clockDiameterPercentOfUnit Percent length of the unit used for the clock.
     * @param {number} handLength Length, in pixels, of both clock hands.
     */
    addAllClocks(unitLength, clockDiameterPercentOfUnit, handLength) {
        this.clocks = [];
        this.unitLength = unitLength;
        this.clockDiameterPercentOfUnit = clockDiameterPercentOfUnit;
        this.handLength = handLength;
        for (let y = this.canvasMargin+this.unitLength/2; y < this.totalHeight-this.canvasMargin; y += this.unitLength) {
            this.addClockRow(y);
        }
    }

    /**
     * Adds all clock hands and sets them to the initial angle.
     */
    initializeHands() {
        for (let i = 0; i < this.clocks.length; i++) {
            this.handAngles.push([]);
            this.handNextStates.push([]);
            this.handVelocities.push([]);
            this.lerpStatus.push([]);
            this.lerpPara.push([])

            for (let j = 0; j < this.clocks[0].length; j++) {
                let clock = this.clocks[i][j];
                this.handAngles[this.handAngles.length-1].push(
                    [initialHandAngles[0], initialHandAngles[1]]
                )
                this.handNextStates[this.handNextStates.length-1].push(
                    [initialHandAngles[0], initialHandAngles[1]]
                )
                this.handVelocities[this.handVelocities.length-1].push(
                    [0, 0]
                )
                this.lerpStatus[this.lerpStatus.length-1].push(
                    [null, null]
                )
                this.lerpPara[this.lerpStatus.length-1].push(
                    [null, null]
                )

                clock.hands[0].drawHand(initialHandAngles[0]);
                clock.hands[1].drawHand(initialHandAngles[1]);
            }
        }
    }

    clearCanvas() {
        background(backgroundColor);
        stroke(220);
        strokeWeight(5);
        rect(0, 0, totalWidth, totalHeight);
        display.addAllClocks(unitLength, clockDiameterPercentOfUnit, handLength);
    }

    /**
     * Normalizes the hand angle between -360 and 360.
     * @param {number} angle Hand angle.
     * @returns {number} Hand angle normalized between 0 and +-360.
     */
    normalizeAngle(angle) {
        // If angle == -361, this needs to be -1
        // If angle == 361, this needs to be 1
        if (angle > 360) {
            return angle-360;
        } else if (angle < -360) {
            return angle+360;
        } else {
            return angle;
        }
    }

    /**
     * Adjusts a reference state angle to be compatible with the hand's current
     * position and velocity. If the hand is rotating past the angle, we add
     * or remove 360 degrees.
     * @param {*} currentAngle 
     * @param {*} stateAngle 
     * @param {*} handVelocity 
     * @returns {number} 
     */
    unifyStateAnglesTransition(currentAngle, stateAngle, handVelocity) {
        var velocitySign = Math.sign(handVelocity);

        // At the beginning on the display sometimes the angular velocity is
        // zero. Since there is no current direction we just use the reference
        // state angle.
        if (handVelocity == 0) {
            return stateAngle;
        }
        
        // Add or remove 360 degrees to the reference state angle. Hard limit of
        // five times.
        for (let i = 0; i < 5; i++){
            var angleDiffSign = Math.sign(stateAngle - currentAngle);
            if (velocitySign != angleDiffSign) {
                stateAngle -= 360*angleDiffSign
            } else {
                break;
            }
        }
        return stateAngle;
    }

    /**
     * Check if the hand is close enough to enable linear interpolation.
     * @param {number} clockRow Row index of the clock.
     * @param {number} clockColumn Column index of the clock.
     * @param {number} handIdx Hand index.
     * @returns {boolean} If linear interpolation should be used.
     */
    checkLerp(clockRow, clockColumn, handIdx) {
        // Determine if we will reach the desired angle with the current
        // velocity within the time. If we do, we will hold off on enabling 
        // linear interpolation until we are within xyz degrees.
        var lerpWithinDegrees = 45;
        var currentAngle = this.handAngles[clockRow][clockColumn][handIdx]
        var finalAngle = this.handNextStates[clockRow][clockColumn][handIdx]
        var handAngularV = this.handVelocities[clockRow][clockColumn][handIdx]

        var time = getClockTime()
        var framesTillState = (60 - time[2]) * manualFrameRate

        // If you start the display on the minute then the velocity is zero
        // and linear interpolation must be used.
        if (handAngularV == 0) {
            return true;
        }

        
        if (Math.abs(finalAngle - currentAngle) <= lerpWithinDegrees) {
            return true;
        } else {
            var angleDiff = finalAngle - currentAngle;
            var maxDegreesPossible = handAngularV * (framesTillState - manualFrameRate);
            if (Math.abs(angleDiff) > Math.abs(maxDegreesPossible)) {
                // If we will not reach it in time. Speed up the angular velocity
                // by some amount.
                this.handVelocities[clockRow][clockColumn][handIdx] += 0.005 * Math.sign(handAngularV);
            }
            return false;
        }
    }

    /**
     * Calculates the linear interpolation parameter, a.
     * 
     * At the moment it just returns a random number. This might be used in the
     * future.
     * @param {number} clockRow Row index of the clock.
     * @param {number} clockColumn Column index of the clock.
     * @param {number} handIdx Hand index.
     */
    calcLerpPara(clockRow, clockColumn, handIdx) {
        var a = random(minLerpT, maxLerpT);
        this.lerpPara[clockRow][clockColumn][handIdx] = a;
    }

    /**
     * Draws all clock hands based on the display state and object properties.
     * @param {string} displayState The current display state.
     */
    updateHandAngles(displayState) {
        // Loops through all clocks.
        for (let clockRow = 0; clockRow < this.clocks.length; clockRow++) {
            for (let clockColumn = 0; clockColumn < this.clocks[0].length; clockColumn++) {
                let clock = this.clocks[clockRow][clockColumn];

                // Loops through all clock hands.
                for (let handIdx = 0; handIdx < 2; handIdx++) {
                    var newHandAngle;

                    // Calculates the next hand angle based on state.
                    if (displayState == 'time') {
                        // Linear interpolation of current hand position and the
                        // state position.
                        var useLerp = this.checkLerp(clockRow, clockColumn, handIdx);

                        // If we are outside the linear interpolation range we
                        // continue moving at the current velocity.
                        if (useLerp) {
                            newHandAngle = lerp(
                                this.handAngles[clockRow][clockColumn][handIdx],
                                this.handNextStates[clockRow][clockColumn][handIdx],
                                this.lerpPara[clockRow][clockColumn][handIdx]
                            );
                        } else {
                            newHandAngle = this.handAngles[clockRow][clockColumn][handIdx] 
                                + this.handVelocities[clockRow][clockColumn][handIdx];
                            // We do not normalize the new hand angle due to the
                            // way we unify state angles to the velocity. The
                            // state angle could be greater than 360, so we
                            // cannot normalize from 0 to 360. The will be 
                            // normalized again with the other display states.
                        }
                    } else if (displayState == 'random') {
                        // Calculates the next hand angle.
                        newHandAngle = this.handAngles[clockRow][clockColumn][handIdx] 
                            + this.handVelocities[clockRow][clockColumn][handIdx];
                        newHandAngle = this.normalizeAngle(newHandAngle);
                    }

                    // Draws and updates hand angle.
                    clock.hands[handIdx].drawHand(newHandAngle);
                    this.handAngles[clockRow][clockColumn][handIdx] = newHandAngle;
                }
            }
        }
    }

    /**
     * Performs all checks on state hand angles and updates the display object.
     * @param {number} clockRow Row index of the clock.
     * @param {number} clockColumn Column index of the clock.
     * @param {number} handIdx Hand index.
     * @param {number} stateAngle Reference state angle for a transition to.
     */
    updateStateHandAngle(clockRow, clockColumn, handIdx, stateAngle) {
        var currentAngle = this.handAngles[clockRow][clockColumn][handIdx];
        var currentVelocity = this.handVelocities[clockRow][clockColumn][handIdx];
        stateAngle = this.unifyStateAnglesTransition(
            currentAngle, stateAngle, currentVelocity
        );
        this.handNextStates[clockRow][clockColumn][handIdx] = stateAngle;
    }

    /**
     * Gets all digits to display the time.
     * @returns {array} First and second digits for hours then minutes.
     */
    getTimeDigits() {
        let time = getClockTime(false, true);  // false, true
        let hours = time[0];
        let minutes = time[1];

        if (hours < 10) {
            var hourDigit1 = 0;
            var hourDigit2 = hours;
        } else {
            var hourDigit1 = 1;
            var hourDigit2 = hours-10;
        }
        if (minutes < 10) {
            var minuteDigit1 = 0;
            var minuteDigit2 = minutes;
        } else {
            var minuteDigit1 = Math.floor(minutes/10);
            var minuteDigit2 = minutes - minuteDigit1*10;
        }

        return [hourDigit1, hourDigit2, minuteDigit1, minuteDigit2];
    }


    /**
     * Prepares and clears leftover information for the current display state.
     * For example: coordinate hand angles for all clocks and prepares for 
     * linear interpolation or sets angular velocities.
     * 
     * While the function is called every run, data is only stored when changing
     * states.
     * @param {string} state The current display state.
     */
    updateDisplayNextState(state) {
        // Arranges clocks to displays the time.
        if ((state == 'time') && (this.currentState != 'time'))  {
            // All clocks not used to display the digits and colon are put into
            // a "blank state" that make it easier to read the time.
            // Here we just set all clocks to this blank state and then change
            // the ones we need to in the following blocks.
            // We also calculate the linear interpolation parameter.
            for (let clockRow = 0; clockRow < this.clocks.length; clockRow++) {
                for (let clockColumn = 0; clockColumn < this.clocks[0].length; clockColumn++) {
                    for (let handIdx = 0; handIdx < 2; handIdx++) {
                        this.updateStateHandAngle(
                            clockRow, clockColumn, handIdx, blankClockAngle
                        );
                        this.calcLerpPara(clockRow, clockColumn, handIdx);
                    }
                }
            }

            // Retrieves the time to display the digits.
            var allDigits = this.getTimeDigits();
            // Loops through all four digits and stores the hand angles for
            // every digit in handNextStates.
            for (let iDigit = 0; iDigit < 4; iDigit++) {
                var digitHandAngles = digitToClockHandAngles(allDigits[iDigit])

                for (let i = 0; i < this.digitClocks[iDigit].length; i++) {
                    var clockRow = this.digitClocks[iDigit][i][0],
                        clockColumn = this.digitClocks[iDigit][i][1];
                    
                    for (let handIdx = 0; handIdx < 2; handIdx++) {
                        this.updateStateHandAngle(
                            clockRow, clockColumn, handIdx,
                            digitHandAngles[i][handIdx]
                        );
                    }
                }
            }

            // Stores the hand angles for the colon separating hours and minutes.
            for (let i = 0; i < this.colonClocks.length; i++) {
                var clockRow = this.colonClocks[i][0],
                    clockColumn = this.colonClocks[i][1];
                var colonHands = this.colonHandAngles[i];
                for (let handIdx = 0; handIdx < 2; handIdx++) {
                    this.updateStateHandAngle(
                        clockRow, clockColumn, handIdx, colonHands[handIdx]
                    );
                }
            }

            this.currentState = 'time';
        } else if ((state == 'random') && (this.currentState != 'random')) {
            // Random hand rotations.
            for (let i = 0; i < this.clocks.length; i++) {
                for (let j = 0; j < this.clocks[0].length; j++) {
                    let newVelocities = 
                        [
                            random(minAngularV, maxAngularV),
                            random(minAngularV, maxAngularV)
                        ];
                    // Make negative or not.
                    if (Math.random() < 0.5) {
                        newVelocities[0] *= -1;
                    }
                    if (Math.random() < 0.5) {
                        newVelocities[1] *= -1;
                    }
                    this.handVelocities[i][j] = newVelocities;
                }
            }

            this.currentState = 'random';
        }
    }

    /**
     * Run the clock display.
     */
    run() {
        this.clearCanvas();
        
        /**Changes the display state. Will start displaying the time if within
         * a specified time. If we no longer want to display the time, we
         * randomly select a display state for the remainder of the minute.
         */ 
        currentTime = getClockTime();
        if ((60-currentTime[2] <= prepareTimeStateSeconds) 
        || (currentTime[2] <= stopTimeStateSeconds)) {
            displayState = 'time';
        } else if ((displayState == 'time') || (displayState == undefined)) {
                var displayOptionIndex = getRandomInt(0, this.displayOptions.length)
                displayState = this.displayOptions[displayOptionIndex];
        }

        this.updateDisplayNextState(displayState);
        this.updateHandAngles(displayState);
    }
}