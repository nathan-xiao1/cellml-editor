// let convert = require('xml-js');
import convert from 'xml-js';
// import openmath2mathml from './openmath2mathml';

const om2mmjs = (obj, parent) => {

    // Depth first search algo
    if (obj.elements) {
    
        // Swap elements if one of them is degree
        const index = obj.elements.findIndex((e) => {
            return e.name === 'OMS' && e.attributes.name === 'root' && e.attributes.cd === 'arith1';
            });
        if (index > -1) {
            // Change current first node to be inside degree node
            const tmp = obj.elements[index+2];
            obj.elements[index+2] = obj.elements[index+1];
            obj.elements[index+1] = {
                type: 'element',
                name: 'degree',
                elements: [tmp]
            }
        }
        
        // const t = obj.elements[index+1];
        // const degreeNode = {
        //     name:   'degree',
        //     elements: [t]
        // }
        // obj.elements[index+1] = degreeNode;
        obj.elements.forEach((o) => {om2mmjs(o, obj)});
    }

    if (obj.type === "element") {
        if (!obj.attributes) {
            obj.attributes = {};
        }
        let textNode;
        switch (obj.name) {
            case 'OMOBJ':
                obj.name = 'math';
                obj.attributes = [];
                obj.attributes.xmlns='http://www.w3.org/1998/Math/MathML';
                break;
            case 'OMI':
                obj.name = 'cn';
                // obj.attributes.type='integer';
                break;
            case 'OMV':
                obj.name = 'ci';
                textNode = {
                    type:   'text',
                    text:   obj.attributes.name
                }
                delete obj.attributes.name;
                obj.elements = [textNode];
                break;
            case 'OMA':
                // If subscript, since algo is dfs children already ci's
                if (obj.attributes.style && obj.attributes.style === 'sub') {
                    obj.name = 'ci';
                    // Look into next 2 children ci's
                    // console.log(JSON.stringify(obj.elements, null, 2));
                    const c1 = obj.elements[0].elements[0].text;
                    const c2 = obj.elements[1].elements[0].text;
                    textNode = {
                        type: 'text',
                        text: c1 + '_' + c2,
                    }
                    obj.elements = [textNode];
                } else {
                    obj.name = 'apply';
                }
                delete obj.attributes;
                break;
            case 'OMF':
                obj.name = 'cn';
                textNode = {
                    type:   'text',
                    text:   obj.attributes.dec
                }
                obj.elements = [textNode];
                delete obj.attributes.dec;
                break;
            case 'OMS':
                switch (obj.attributes.cd) {
                    case 'arith1':
                        switch (obj.attributes.name) {
                            case 'plus':
                                obj.name = 'plus';
                                delete obj.attributes;
                                break;
                            case 'minus':
                                obj.name = 'minus';
                                delete obj.attributes;
                                break;
                            case 'times':
                                obj.name = 'times';
                                delete obj.attributes;
                                break;
                            case 'divide':
                                obj.name = 'divide';
                                delete obj.attributes;
                                break;
                            case 'power':
                                obj.name = 'power';
                                delete obj.attributes;
                                break;
                            case 'root':
                                obj.name = 'root';
                                delete obj.attributes;
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'relation1':
                        switch (obj.attributes.name) {
                            case 'eq':
                                obj.name = 'eq';
                                delete obj.attributes;
                                break;
                            default:
                                break;
                        }
                        break;
                    case 'calculus1':
                        switch (obj.attributes.name) {
                            case 'diff':
                                obj.name = 'diff';
                                delete obj.attributes;
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        
        if (obj.attributes === {}) {
            delete obj.attributes;
        }
        
        if (obj.attributes && obj.attributes['cellml:units']) {
            obj.attributes.cellml_units = obj.attributes['cellml:units'];
            delete obj.attributes['cellml:units'];
        }
    }

    return obj;
}


const opemath2mathml = (openmathStr) => {
    let js = convert.xml2js(openmathStr, {compact: false});
    // console.log(JSON.stringify(js, null, 2));
    let converted_js = om2mmjs(js, null);
    // console.log(JSON.stringify(converted_js, null, 2));
    let options = {compact: false, ignoreComment: true, spaces: 4};
    return convert.json2xml(converted_js, options);
}

export default opemath2mathml;
