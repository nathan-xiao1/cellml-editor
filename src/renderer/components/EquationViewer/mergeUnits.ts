import convert, {Element, ElementCompact} from 'xml-js';
import format from 'xml-formatter';
import { diffLines } from 'diff';

const new1 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <apply>
        <eq/>
        <ci>L</ci>
        <apply>
            <plus/>
            <ci>R</ci>
            <cn cellml:units="per_millisecond">10.613</cn>
        </apply>
    </apply>
</math>
`;

const old1 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <apply>
        <eq/>
        <ci>L</ci>
        <apply>
            <plus/>
            <ci>R</ci>
            <cn>10.614</cn>
        </apply>
    </apply>
</math>
`;

const new2 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
<apply>
    <eq/>
    <cn>10.613</cn>
    <apply>
        <plus/>
        <ci>R</ci>
        <apply>
            <plus/>
            <ci>M</ci>
            <cn>10.613</cn>
        </apply>
    </apply>
</apply>
</math>
`;

const old2 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <apply>
        <eq/>
        <cn cellml:units="per_millisecond">10.613</cn>
        <apply>
            <plus/>
            <ci>R</ci>
            <cn cellml:units="per_millisecond">10.613</cn>
        </apply>
    </apply>
</math>
`;

const removeParent = (key : any, value : any) : any => {
  if (key === 'parent') return undefined;
  return value;
}

const mergeCn = (newmml: string, oldmml: string) : string => {
    const newxml = format(newmml, { indentation: '', collapseContent: true });
    const oldxml = format(oldmml, { indentation: '', collapseContent: true });
    // let patched = (oldxml.split('\n').length === newxml.split('\n').length) ? mergeSingleValueChange(newxml, oldxml) : newxml;
    // return mergeUnitsChange(patched, oldxml);
    return (oldxml.split('\n').length === newxml.split('\n').length) ? mergeSingleValueChange(newxml, oldxml) : mergeUnitsChange(newxml, oldxml);
}

const mergeUnitsChange = (newmml: string, oldmml: string) : string => {
    const regex = /<\s*cn\s*.*\s*>\s*(?<value>[0-9.]+)\s*<\s*\/cn\s*>/gm;
    const newxml = format(newmml, { indentation: '', collapseContent: true });
    const oldxml = format(oldmml, { indentation: '', collapseContent: true });
    const oldMatches = [...oldxml.matchAll(regex)];
    let patchedmml = newxml;
    // const newMatches = [...newmml.matchAll(regex)];
    // let i = 0;
    // while (oldMatches.length > 0 && newMatches.length > 0) {
    //     // patchedmml.slice(i).match(regex);
    //     const diff = oldMatches[0].length - newMatches[0].length;
    //     patchedmml = patchedmml.slice(0, i + (newMatches[0].index || 0)) + oldMatches[0][0] + patchedmml.slice(i + (newMatches[0].index || 0) + newMatches[0][0].length);
    //     i += diff;
    //     oldMatches.shift();
    //     newMatches.shift();
    // }
    let i = 0;
    while (oldMatches.length > 0) {
        const newMatches = [...patchedmml.matchAll(regex)];
        if (newMatches.length < i) return format(patchedmml, { indentation: '    ', collapseContent: true });
        const newMatch = newMatches[i];
        const index = newMatch.index;
        if (index !== undefined) {
            patchedmml = patchedmml.slice(0, index) + oldMatches[0][0] + patchedmml.slice(newMatch[0].length + index);
        }
        i++;
        oldMatches.shift();
    }
    
    return format(patchedmml, { indentation: '    ', collapseContent: true });
}



const mergeSingleValueChange = (newmml : string, oldmml : string) : string => {
    const newxml = format(newmml, { indentation: '', collapseContent: true });
    const oldxml = format(oldmml, { indentation: '', collapseContent: true });
    
    const patchedLines = newxml.split('\n');
    
    const diff = diffLines(oldxml, newxml);
    let count = 0;
    let i = 0
    while (i < diff.length) {
        // if (diff[i] && diff[i].count)
        count += diff[i].count || 0;
        if (diff[i].removed && i+1 < diff.length && diff[i+1].added) {
            const newLineJs = <ElementCompact> convert.xml2js(diff[i].value, {compact: true});
            const patchedLineJs = newLineJs;
            if (newLineJs['cn']) {
                const oldLineJs = <ElementCompact> convert.xml2js(diff[i+1].value, {compact: true});
                if (oldLineJs['cn'] && oldLineJs['cn']['_attributes']) {
                    patchedLineJs['cn']._attributes = oldLineJs['cn']['_attributes'];
                    patchedLines[count] = convert.js2xml(patchedLineJs);
                }
            }
        }
        i++;
    }
    
    return format(patchedLines.join('\n'), { indentation: '    ', collapseContent: true });
}

export default mergeCn;

// console.log(mergeSingleValueChange(new1, old1));
// console.log(mergeUnitsChange(new2, old2));
// console.log(newxml);

// console.log(mergeSingleValueChange(new1, old1));
// console.log(mergeUnitsChange(new2, old2));
// console.log(mergeCn(new1, old1));
// console.log(mergeCn(new2, old2));
