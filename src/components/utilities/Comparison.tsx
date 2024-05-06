// THIS COMPONENT WAS USED TO DEBUG AND COMPARE MY EXTRACTION WITH THE EXPECTED
// OUTPUT. IT CAN BE IMPORTED INTO APP.JS AND HELPFUL INFORMATION WAS LOGGED TO
// THE CONSOLE.

import React from 'react';
import expectedHexDataOutputSource from './expectedHexDataOutput';
// import expectedHexDataOutputSource from './hexData';
import myHexDataOutputSource from './myHexDataOutput';

const Comparison: React.FC = () => {

    function findFirstMismatch(expected: string, actual: string): number {
        // Find the shorter length to avoid out-of-bounds errors
        const minLength = Math.min(expected.length, actual.length);
      
        // Iterate through the characters to find the first mismatch
        for (let i = 0; i < minLength; i++) {
          if (expected[i] !== actual[i]) {
            // Return the index where the mismatch occurs
            return i;
          }
        }
      
        // If one string is shorter, there's a mismatch at the shorter string's end
        if (expected.length !== actual.length) {
          return minLength; // Mismatch due to length difference
        }
      
        // If no mismatch is found, return -1 to indicate they are identical
        return -1;
      }
      
      // Example data
      const expectedHexDataOutput = expectedHexDataOutputSource;
      const myHexDataOutput = myHexDataOutputSource;
      
      // Find the first mismatch index
      const mismatchIndex = findFirstMismatch(expectedHexDataOutput, myHexDataOutput);
      
      if (mismatchIndex >= 0) {
        console.log(mismatchIndex)
        console.log(`Mismatch found here: \n${myHexDataOutput[mismatchIndex-5]}${myHexDataOutput[mismatchIndex-4]}${myHexDataOutput[mismatchIndex-3]}${myHexDataOutput[mismatchIndex-2]}${myHexDataOutput[mismatchIndex-1]} ${myHexDataOutput[mismatchIndex]} ${myHexDataOutput[mismatchIndex+1]}${myHexDataOutput[mismatchIndex+2]}${myHexDataOutput[mismatchIndex+3]}`);
      } else {
        console.log('The strings are identical');
      }

    return <div>
        Comparison works!<br />
    </div>
};

export default Comparison