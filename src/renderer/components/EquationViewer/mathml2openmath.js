import convert from 'xml-js';

const recursive = (obj, parent) => {

    // Depth first search algo
    if (obj.elements) {
        // console.log("found obj's elements")
        // if (obj.name==='OMS') {
        //     let elements = obj.elements;
        //     delete obj.elements;
        //     elements.forEach((o) => { recursive(o, null)});
        //     parent.elements = elements;
        //     parent.elements.unshift(obj);
        // } else {
        
        // Swap elements if one of them is degree
        const index = obj.elements.findIndex((e) => e.name === 'degree');
        if (index > -1) {
            const tmp = obj.elements[index+1];
            obj.elements[index+1] = obj.elements[index];
            obj.elements[index] = tmp;
        }
        obj.elements.forEach((o) => {recursive(o, obj)});
        // }
    }

    if (obj.type === "element") {
        // console.log("found element");
        // if (obj.name === "math" && obj.attributes.xmlns === "http://www.w3.org/1998/Math/MathML") {
        //     // console.log("converting math to OMOBJ");
        //     obj.name = "OMOBJ";
        //     obj.attributes.xmlns = "http://www.openmath.org/OpenMath";
        // }
        // if (obj.name === "cn") {
        //     obj.name = "OMF"
        // }
        if (!obj.attributes) {
            obj.attributes = {};
        }
        switch (obj.name) {
            case "math":
                obj.name = "OMOBJ";
                obj.attributes.xmlns = "http://www.openmath.org/OpenMath";
                obj.attributes.version = '2.0';
                obj.attributes.cdbase='http://www.openmath.org/cd';
                break;
            case "cn":
                switch (obj.attributes.type) {
                    case "rational":
                        obj.name = "OMS";
                        obj.attributes.name = "rational";
                        obj.attributes.cd = "nums1";
                        break;
                    case "complex-cartesian":
                        obj.name = "OMS";
                        obj.attributes.name = "complex_cartesian";
                        obj.attributes.cd = "complex1";
                        break;
                    case "complex-polar":
                        obj.name = "OMS";
                        obj.attributes.name = "complex_polar";
                        obj.attributes.cd = "complex1";
                        break;
                    case "integer":
                        obj.name = "OMI";
                        break;
                    default:
                        // Check if integer first then convert to integer instead
                        obj.name = "OMF";
                        obj.attributes.dec = obj.elements[0].text;
                        delete obj.elements;
                    break;
                }
                obj.attributes.mathml_type = obj.attributes.type;
                delete obj.attributes.type;
            break;
            case "cd":
                switch (obj.attributes.type) {
                    case "integer":
                        obj.name = "OMS";
                        obj.attributes.name = "based_integer";
                        obj.attributes.cd = "nums1";
                        break;
                    default:
                        break;
                }
                break;
            case "ci": {
                // console.log(obj.elements[0].text.include('_'));
                // console.log(JSON.stringify(obj.elements[0], null, 2));
                // console.log(obj.elements[0].text);
                // console.log(obj.elements[0].text.includes('_'));
                // if (obj.elements[0] && obj.elements[0].text.includes('_')) {
               
                if (obj.elements[0] && obj.elements[0].text.includes('_')) {
                    // TODO: turn string into list of subscripts
                    const toks = obj.elements[0].text.split('_');
                    
                    const r = (toks) => {
                        if (toks.length > 1) {
                            const elements = [
                                {
                                    type: 'element',
                                    name: 'OMV',
                                    attributes: { name: toks[0] }
                                },
                                r(toks.slice(1))
                            ];
                            const curr = {
                                type: 'element',
                                name: 'OMA',
                                attributes: { style: 'sub' },
                                elements: elements
                            };
                            // console.log(JSON.stringify(curr, null, 2));
                            return curr;
                        }
                        const curr = {
                            type: 'element',
                            name: 'OMV',
                            attributes: { name: toks[0] }
                        };
                        // console.log(JSON.stringify(curr, null, 2));
                        return curr;
                    }
                        
                    // }
                    // Convert last 2 nodes
                    // let curr = {
                    //     name: 'OMA',
                    //     attributes: { style: 'sub' },
                    //     elements: [
                    //         {
                    //             name: 'OMV',
                    //             attributes: { name: toks[toks.length-2] }
                    //         },
                    //         {
                    //             name: 'OMV',
                    //             attributes: { name: toks[toks.length-1] }
                    //         }
                    //     ]
                    // }
                    // let i = toks.length-3;
                    // while (i > 0) {
                    //     curr = {
                    //         name: 'OMA',
                    //         attributes: { style: 'sub' },
                    //         elements: [
                    //             {
                    //                 name: 'OMV',
                    //                 attributes: { name: toks[i] }
                    //             }, 
                    //             curr
                    //         ]
                        
                    //     };
                    //     i--;
                    // }
                    obj.name = 'OMA';
                    obj.attributes.style = 'sub';
                    // console.log(JSON.stringify(JSON.parse(r(toks)), null, 2));
                    obj.elements = r(toks).elements;
                    
                    // console.log(JSON.stringify(obj, null, 2));
                } else {
                    obj.name = "OMV";
                    // TODO replace with empty input field if no text
                    obj.attributes.name = obj.elements[0].text;
                    delete obj.elements;
                }

            
                // obj.name = "OMV";
                // // TODO replace with empty input field if no text
                // obj.attributes.name = obj.elements[0].text;
                
                break;
            }
            case "apply":
                obj.name = "OMA";
                break;
            case "quotient":
                obj.name = "OMS";
                obj.attributes.name = "quotient";
                obj.attributes.cd = "integer1";
                break;
            case "factorial":
                obj.name = "OMS"
                obj.attributes.name = "factorial";
                obj.attributes.cd = "integer1";
                break;
            case "divide":
                obj.name = "OMS"
                obj.attributes.name = "divide";
                obj.attributes.cd = "arith1";
                break;
            case "minus":
                obj.name = "OMS"
                obj.attributes.name = "minus";
                obj.attributes.cd = "arith1";
                break;
            case "plus":
                obj.name = "OMS"
                obj.attributes.name = "plus";
                obj.attributes.cd = "arith1";
                break;
            case "power":
                obj.name = "OMS"
                obj.attributes.name = "power";
                obj.attributes.cd = "arith1";
                break;
            case "times":
                obj.name = "OMS"
                obj.attributes.name = "times";
                obj.attributes.cd = "arith1";
                break;
            case "root": // TODO
                // Find degree node, insert as second child of apply
                obj.name = "OMS"
                obj.attributes.name = "root";
                obj.attributes.cd = "arith1";
                // const index = parent.elements.findIndex((node) => { return node.name === 'degree'});
                break
            case "eq":
                obj.name = "OMS"
                obj.attributes.name = "eq";
                obj.attributes.cd = "relation1";
                break;
            case 'degree':
                
                if (obj.elements) {
                    // DFS so children are already converted
                    let child = obj.elements[0];
                    delete obj.elements;
                    Object.assign(obj, child);
                }
                break;
            default:
                break;
        }
        
        if (obj.attributes === {}) {
            delete obj.attributes;
        }
        
        if (obj.attributes['cellml:units']) {
            obj.attributes.cellml_units = obj.attributes['cellml:units'];
            delete obj.attributes['cellml:units'];
        }
    }
    return obj;
}


const mathml2openmath = (openMathStr) => {
    let js = convert.xml2js(openMathStr, {compact: false});
    // console.log(JSON.stringify(js, null, 2));
    // return '';
    let converted_js = recursive(js, null);
    let options = {compact: false, ignoreComment: true, spaces: 2};
    // console.log(js);
    console.log(JSON.stringify(converted_js, null, 2));
    return convert.json2xml(converted_js, options);
}

export default mathml2openmath;
// exports.convert = mathml2openmath;
