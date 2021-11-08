// const string = `
// <math xmlns="http://www.w3.org/1998/Math/MathML">
//     <apply>
//         <eq/>
//         <ci>L</ci>
//         <apply>
//             <plus/>
//             <ci>R</ci>
//             <cn>10.613</cn>
//         </apply>
//     </apply>
//     <apply>
//         <eq/>
//         <ci>i</ci>
//         <apply>
//             <times/>
//             <ci>g</ci>
//             <apply>
//                 <minus/>
//                 <ci>V</ci>
//                 <ci>L</ci>
//             </apply>
//         </apply>
//     </apply>
// </math>
// `;

const startApply = /<\s*apply.*>/gm;
const endApply = /<\s*\/apply\s*>/gm;

export interface MatchResult {
  foundMatch : boolean;
  multipleApplies? : boolean;
  startOff? : number;
  endOff? : number;
}

const findApplyMatches = (string : string) : MatchResult[] => {
  const startApplyMatches = [...string.matchAll(startApply)];
  const endApplyMatches = [...string.matchAll(endApply)];
  const results : MatchResult[] = [];
  while (startApplyMatches.length > 0) {
    const r = completeStack(startApplyMatches, endApplyMatches);
    if (r.foundMatch) {
      delete r.multipleApplies;
      results.push(r);
    }
  }
  return results;
}

const findApplyMatch  = (string : string, offset : number) : MatchResult => {
  
  const startApplyMatches = [...string.matchAll(startApply)];
  const endApplyMatches = [...string.matchAll(endApply)];
  
  let r : MatchResult;
  do {
    // console.log(startApplyMatches.length, endApplyMatches.length);
    r = completeStack(startApplyMatches, endApplyMatches);
    // console.log(r);
    // console.log(startApplyMatches.length, endApplyMatches.length);
    if (r.foundMatch && r.startOff <= offset && offset <= r.endOff) {
      return r;
    }
  } while (r.foundMatch);
  
  return { foundMatch: false, multipleApplies: false };
}

// Find complete stack where (soonest result where there is a matching open and closing tags for each apply)
const completeStack = (startMatches : RegExpMatchArray[], endMatches : RegExpMatchArray[]) : MatchResult => {
  //
  let count = 0;
  let startOff : number | undefined;
  
  while (startMatches.length > 0 && endMatches.length > 0) {
    const startMatch = startMatches[0];
    const endMatch = endMatches[0];
    // Found start match
    if (startMatch.index < endMatch.index) {
      if (startOff === undefined) startOff = startMatch.index;
      count++;
      startMatches.shift();
    // Found end match
    } else {
      if (count > 0) {
        count--;
      }
      endMatches.shift();
      if (count === 0 && startOff !== undefined) {
        const endOff : number = endMatch.index + endMatch[0].length;
        const r : MatchResult = {
          foundMatch : true,
          startOff : startOff,
          endOff: endOff,
          multipleApplies: startMatches.length > 0
        } 
        return r;
      }
    }
  }
  
  while (endMatches.length > 0) {
    const endMatch = endMatches[0];
    if (count > 0) {
      count--;
    }
    endMatches.shift();
    if (count === 0 && startOff !== undefined) {
      const endOff = endMatch.index + endMatch[0].length;
      const r : MatchResult = {
        foundMatch : true,
        startOff : startOff,
        endOff: endOff,
        multipleApplies: startMatches.length > 0
      } 
      return r;
    }
  }

  
  const r : MatchResult = {
    foundMatch : false,
    multipleApplies: false
  }
  return r;
}

export default findApplyMatch;
export {findApplyMatches};
// const r = setup(string, 300);
// console.log('Result: ', r);