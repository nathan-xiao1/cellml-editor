/* eslint @typescript-eslint/no-var-requires: "off" */
import React, { Context, useEffect, useState, useRef } from "react";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import "react-reflex/styles.css";
import "./CreateImgModel.scss"
//import { convertSelectedElement } from '../../../converter/Converter';
//import LibCellMLParser from "../../../parser/parser";

//const libcellModule = require('libcellml.js/libcellml.common');

/*
const imagesOnCanvas = [] as any;

function renderScene() {
    requestAnimationFrame(renderScene);

    const canvas = document.getElementById('canvas') as  HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,
        canvas.width,
        canvas.height
    );


    for(let x = 0,len = imagesOnCanvas.length; x < len; x++) {
        const obj = imagesOnCanvas[x];
        obj.context.drawImage(obj.image,obj.x,obj.y);

    }
}

requestAnimationFrame(renderScene);

function handleDrag(ev: any): any
{
   console.log('apples');
   ev.preventDefault();
   ev.dataTransfer.setData("mouse_position_x", (ev.clientX - ev.target.offsetLeft));
   ev.dataTransfer.setData("mouse_position_y", (ev.clientY - ev.target.offsetTop));
  console.log(ev.dataTransfer.getData("mouse_position_x"));
  console.log(ev.dataTransfer.getData("mouse_position_y"));
  ev.dataTransfer.setData("element_id", ev.target.id);
  // const circle = document.getElementById(ev.dataTransfer.getData("import_container_image"));
 //  let mouse_position_x = ev.dataTransfer.getData("mouse")
}
function handleDrop(ev: any): any
{
  ev.preventDefault();
  const element = document.getElementById( ev.dataTransfer.getData("element_id"));
  const mouse_position_x = ev.dataTransfer.getData("mouse_position_x");
  const mouse_position_y = ev.dataTransfer.getData("mouse_position_y");
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  imagesOnCanvas.push({
    context: ctx,
    element: element,
    x: ev.clientX - canvas.offsetLeft - mouse_position_x,
    y: ev.clientY - canvas.offsetTop - mouse_position_y,
    
  });
}
function allowDrop(ev: any): any {
  ev.preventDefault();
}

window.addEventListener("load", function() {
  console.log('starting up');
  const canvas = this.document.getElementById('canvas');
  canvas.onmousedown = function(ev:any) {
    const downX = ev.offsetX;
    const downY = ev.offsetY;
    for (let x = 0; x < imagesOnCanvas.length; x++) {
      const obj = imagesOnCanvas[x];
      if(!isPointInRange(downX, downY, obj)) {
        continue;
      }
      startMove(obj,downX,downY);
      break;
    }
  }
}, false);

function isPointInRange(x: any, y: any, obj: any) {
  return !(x < obj.x ||
            x > obj.x + obj.width ||
            y < obj.y ||
            y > obj.y + obj.height);
}
function startMove(obj: any, downX: any, downY: any) {
  const canvas = document.getElementById('canvas');
  const origX = obj.x;
  const origY = obj.y;
  canvas.onmousemove = function (e) {
    const moveX = e.offsetX, moveY = e.offsetY;
    const diffX = moveX-downX, diffY = moveY-downY;
    obj.x = origX+diffX;
    obj.y = origY+diffY; 
  }
  canvas.onmouseup = function() {
    canvas.onmousemove = function() {console.log('up')};
  }
}

*/
enum Elements {
  model,
  component,
  units,
  unit,
  reset,
  variable,
  none
}

const strToElm = (element: string) => {
  switch(element) {
    case 'model': 
      return Elements.model;
    case 'component':
      return Elements.component;
    case 'units': 
      return Elements.units;
    case 'unit': 
      return Elements.unit;
    case 'reset': 
      return Elements.reset;
    case 'variable': 
      return Elements.variable;
    case 'none': 
      return Elements.none;
    default:
      console.log("invalid Element: " + element);
  }
}

const elmToStr = (element: Elements) => {
  switch(element) {
    case Elements.model: 
      return 'model';
    case Elements.component:
      return 'component';
    case Elements.units: 
      return 'units';
    case Elements.unit: 
      return 'unit';
    case Elements.reset: 
      return 'reset';
    case Elements.variable: 
      return 'variable';
    case Elements.none: 
      return 'none';
    default:
      console.log("invalid Element: " + element);
  }
}


















const valid = `<?xml version="1.0" encoding="UTF-8"?>
            <model xmlns="http://www.cellml.org/cellml/2.0#" 
              xmlns:cellml="http://www.cellml.org/cellml/2.0#" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              name="complex_encapsulation_example" 
              id="complex_encpsulation_example_id">
              <component name="root"/>
              <component name="L1_c1"/>
              <component name="L1_c2"/>
              <component name="L1_c3"/>
              <component name="L1_L2_c1"/>
              <encapsulation>
                <component_ref component="root">
                  <component_ref component="L1_c1">
                    <component_ref component="L1_L2_c1"/>
                  </component_ref>
                  <component_ref component="L1_c2"/>
                  <component_ref component="L1_c3"/>
                </component_ref>
              </encapsulation>
            </model>`;

const units = `<?xml version="1.0" encoding="UTF-8"?>
            <model xmlns="http://www.cellml.org/cellml/2.0#" 
              xmlns:cellml="http://www.cellml.org/cellml/2.0#" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              name="complex_encapsulation_example" 
              id="complex_encpsulation_example_id">

              <!-- Defining new base units called A: -->
              <units name="A"><units/>

              <!-- Defining new units called B, equivalent to 1000.A^2 -->
              <units name="B">
                <unit units="A" prefix="kilo" exponent="2"/>
              </units>

              <!-- Defining new units called C, equivalent to B^3/ms or (1000)^3.A^6/ms  -->
              <units name="C">
                <unit units="B" exponent="3"/>
                <unit units="second" prefix="milli" exponent="-1"/>
              </units>
            </model>`;

const test1 = `<?xml version="1.0" encoding="UTF-8"?>
            <model xmlns="http://www.cellml.org/cellml/2.0#" 
              xmlns:cellml="http://www.cellml.org/cellml/2.0#" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              name="complex_encapsulation_example" 
              id="complex_encpsulation_example_id">
              <component name="root">
                <a name="L1_c1"/>
                <a name="L1_c2"/>
                <a name="L1_c3"/>
              <component/>
              
            </model>`;

class Circle {
  x: number;
  y: number;
  radius: number; 
  colour: string;

  constructor(x: number, y: number, radius: number, colour: string) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colour = colour;
  }
  draw(context:any) {
    context.beginPath();
    context.lineWidth = 5;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
    this.loop_through_model(valid);
  }


  loop_through_model(model:string) {
    console.log('loop');
    const model_name = model.match(/(<.[^(><.)]+>)/);
    console.log(model_name);
  }



  draw_comp(context:any) {
    context.beginPath();
    context.lineWidth = 5;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = "silver";
    context.fill();
    context.stroke();
    context.closePath();
  }
  draw_unit(context:any) {
    context.beginPath();
    context.lineWidth = 5;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = "silver";
    context.fill();
    context.strokeStyle = 'rgb(180,180,140)';
    context.stroke();
    context.closePath();
  }
  draw_units(context:any) {
    context.beginPath();
    context.lineWidth = 5;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.strokeStyle = 'rgb(180,180,140)';
    context.stroke();
    context.closePath();
  }

 
}





// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// Data Structures for creating a model

// Model is the default class for an element
/*
  type: the string of the element type
  children: list of all that element instance children
  x: x coordinate of the element instance
  y: y coordinate of the element instance
  ctx: the context - the image/object of the element
*/
class ModelElement {
  type: string;
  children: ModelElement[];
  x: number;
  y: number;
  constructor(type: string, children: ModelElement[], x:number, y:number) {
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
  }
}

// Units is an Element
/* super: contains all the models stuff
   name:  name of the units */
class Units extends ModelElement {
  name: string;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              name: string) {
    super(type, children, x, y);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.name     = name;
  }
}


class Unit extends ModelElement {
  unit: string;
  prefix: number;
  multiplier: number;
  exponent: number;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              unit: string, prefix: number,
              multiplier: number, exponent: number) {
    super(type, children, x, y);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.unit     = unit;
    this.prefix   = prefix;
    this.multiplier= multiplier;
    this.exponent = exponent;
  }
}

class Component extends ModelElement {
  name: string;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              name: string) {
    super(type, children, x, y);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.name     = name;
  }
}

class Variable extends ModelElement {
  name: string;
  units: string;
  interface_: string;
  initial_value: string;

  constructor(type: string, children: ModelElement[], x: number, y: number, 
        name: string, units:string, interface_: string,
	initial_value: string) {
    super(type, children, x, y);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.name     = name;
    this.units    = units;
    this.interface_= interface_;
    this.initial_value =initial_value;
  }
}


class Reset extends ModelElement {
  variable: string;
  test_variable: string;
  order: string;
}

class TestValue extends ModelElement {

}
class ResetValue extends ModelElement {

}

class MathElem extends ModelElement {

}

class Encapsulation extends ModelElement {

}

class ComponentRef extends ModelElement {
  component: string;
}

class Connection extends ModelElement {
  component1: string;
  component2: string;
}

class MapVariables extends ModelElement {
  variable1: string;
  variable2: string;
}

class Import extends ModelElement {
  href: string;
}

class ImportUnits extends ModelElement {
  name: string;
  units_ref: string;
}

class ImportComponent extends ModelElement {
  name: string;
  comp_ref: string;
}


















// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------
interface CIMProps {
  hidden: boolean;
}

// Create Image Model is the element that 
const CreateImgModel: React.FunctionComponent<CIMProps> = (props: CIMProps) => {

  // The current element clicked on: starts on model
  const [clickedElement, setClickedElement] = useState('Model');

  const [posX, setDX] = useState(0);
  const [posY, setDY] = useState(0);
  
  const [currentElementImg, setCurrentElementImg] = useState('drag_component');

  const [modelname, setModelName] = useState('');

  // list containing all the Built-In Units from the Specification
  const list_of_inbuilt_units = ["ampere", "becquerel", "candela", "coulomb",
                                 "dimensionless", "farad", "gram", "gray", 
                                 "henry", "hertz", "joule", "katal", "kilogram", 
                                 "litre", "lumen", "lux", "metre", "mole", 
                                 "newton", "ohm", "pascal", "radian", "second", 
                                 "siemens", "sievert", "steradian", "tesla", 
                                 "volt", "watt", "weber"];

  const list_of_inbuilt_prefix= ["yotta", "zetta", "exa", "peta", "tera",
                                "tera", "giga", "mega", "kilo", "hecto", "deca", "deci", 
                                "centi", "milli", "micro", "nano", "pico", "femto", "atto",
                                "zepto", "yocto"];

  const refresh_img_string = "https://th.bing.com/th/id/R.a0f9ecff68de2452bbd2e2b8f2cf6823?rik=kBa%2bhNgCMimJ7A&riu=http%3a%2f%2fpng-4.findicons.com%2ffiles%2ficons%2f1681%2fsiena%2f256%2frefresh.png&ehk=cWh33o7o2VxqUvQ1bLqEhe91d1dRn9TSf7Debisq5YE%3d&risl=&pid=ImgRaw&r=0"

  const [imagesOnCanvas, setImagesonCanvas] = useState([]); 
  
  // list of all the elements in the model
  const [shapes_, setShapes] = useState([]);
  //const [modelElements, setModelElements] = useState([]);
  
  const [listofUnits, setListofUnits] = useState([]);
  const [listofComponents, setListofComponents] = useState([]);
  const [listofVariables, setListofVariables] = useState([]);
  

  const [listofReset, setListofReset] = useState([]);
  const [listofConnections, setListofConnections] = useState([]);
  const [listofImports, setListofImports] = useState([]);

  const [listofComponentRefs, setListofComponentRefs] = useState([]);


  // --------------------------------------------------------------
  // --------------------------------------------------------------
  // --------------------------------------------------------------

  const [validDrop, setValidDrop] = useState(true);

  const [validUnitIDDrop, setValidUnitIDDrop] = useState(true);
  const [validUnitUnitsDrop, setValidUnitUnitsDrop] = useState(true);
  const [validUnitPrefixDrop, setValidUnitPrefixDrop] = useState(true);
  const [validUnitMultDrop, setValidUnitMultDrop] = useState(true);
  const [validUnitExpDrop, setValidUnitExpDrop] = useState(true);

  const [validCompName, setValidCompName] = useState(true);

  const [validVarIDDrop, setValidVarIDDrop] = useState(true);
  const [validVarNameDrop, setValidVarNameDrop] = useState(true);
  const [validVarUnitsDrop, setValidVarUnitsDrop] = useState(true);
  const [validVarInterfaceDrop, setValidVarInterfaceDrop] = useState(true);
  const [validVarInitValueDrop, setValidVarInitValueDrop] = useState(true);

  const [validResetIDDrop, setValidResetIDDrop] = useState(true);
  const [validResetVarDrop, setValidResetVarDrop] = useState(true);
  const [validResetTestDrop, setValidResetTestDrop] = useState(true);
  const [validResetOrderDrop, setValidResetOrderDrop] = useState(true);

  const [validTestValueIDDrop, setValidTestValueIDDrop] = useState(true);
  const [validResetValueIDDrop, setValidResetValueIDDrop] = useState(true);
  const [validMathIDDrop, setValidMathIDDrop] = useState(true);

  const [validCompRefParentIDDrop, setValidCompRefParentIDDrop] = useState(true);
  const [validCompRefCompDrop, setValidCompRefCompDrop] = useState(true);

  const [validConnectionComp1Drop, setValidConnectionComp1Drop] = useState(true);
  const [validConnectionComp2Drop, setValidConnectionComp2Drop] = useState(true);
  
  const [validMapVariable1Drop, setValidMapVariable1Drop] = useState(true);
  const [validMapVariable2Drop, setValidMapVariable2Drop] = useState(true);

  const [validHrefDrop, setValidHrefDrop] = useState(true);

  const [validImportUnitsImpIDDrop, setValidImportUnitsImpIDDrop] = useState(true);
  const [validImportUnitsNameDrop, setValidImportUnitsNameDrop] = useState(true);
  const [validImportUnitsRefDrop, setValidImportUnitsRefDrop] = useState(true);

  const [validImportCompImpIDDrop, setValidImportCompImpIDDrop] = useState(true);
  const [validImportCompNameDrop, setValidImportCompNameDrop] = useState(true);
  const [validImportCompRefDrop, setValidImportCompRefDrop] = useState(true);

  // ---------------------------------------------------------------
  // ----------------------- MOVE ELEMENTS -------------------------
  // ---------------------------------------------------------------

  // shapes contains all the elements
  //let shapes_ = [] as any;
  
  // Sample shape (blue circle) to test movement
  //shapes_.push( {x:30, y:30, radius:15, color:'blue', element_type:'component'} );
  // shapes_.push( {x:100, y:-1, width:75, height:35, color:'red'} );

  // get canvas position relative to current window
  let offsetX_:number, offsetY_:number;
  function reOffset() {
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const BB = canvas.getBoundingClientRect();
    offsetX_ = BB.left;
    offsetY_ = BB.top;
    //console.log("offSetX: " + offsetX_ + " offsetY: " + offsetY_);
    drawAll();
  }

  
  function calculate_prefix(shape:any) {
    let prefix = "";
    if (shape.prefix == '') prefix = '';
    else if (shape.prefix.toLowerCase() == "yotta") prefix = "Y";
    else if (shape.prefix.toLowerCase() == "zetta") prefix = "Z";
    else if (shape.prefix.toLowerCase() == "exa") prefix = "E";
    else if (shape.prefix.toLowerCase() == "peta") prefix = "P";
    else if (shape.prefix.toLowerCase() == "tera") prefix = "T";
    else if (shape.prefix.toLowerCase() == "giga") prefix = "G";
    else if (shape.prefix.toLowerCase() == "mega") prefix = "M";
    else if (shape.prefix.toLowerCase() == "kilo") prefix = "k";
    else if (shape.prefix.toLowerCase() == "hecto") prefix = "h";
    else if (shape.prefix.toLowerCase() == "deca") prefix = "da";
    else if (shape.prefix.toLowerCase() == "deci") prefix = "d";
    else if (shape.prefix.toLowerCase() == "centi") prefix = "c";
    else if (shape.prefix.toLowerCase() == "milli") prefix = "m";
    else if (shape.prefix.toLowerCase() == "micro") prefix = "µ";
    else if (shape.prefix.toLowerCase() == "nano") prefix = "n";
    else if (shape.prefix.toLowerCase() == "pico") prefix = "p";
    else if (shape.prefix.toLowerCase() == "femto") prefix = "f";
    else if (shape.prefix.toLowerCase() == "atto") prefix = "a";
    else if (shape.prefix.toLowerCase() == "zepto") prefix = "z";
    else if (shape.prefix.toLowerCase() == "yocto") prefix = "y";
    else prefix = "";
    return prefix;
  }
  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================
  function drawArrow(ctx: any, fromx: number, fromy:number, tox: number, toy: number, arrow_color: string){
      const width = 15;
      const headlen = 10;
      // This makes it so the end of the arrow head is located at tox, toy, don't ask where 1.15 comes from
      const angle = Math.atan2(toy-fromy,tox-fromx);
      tox -= Math.cos(angle) * ((width*1.15));     
      toy -= Math.sin(angle) * ((width*1.15));
      
      //starting path of the arrow from the start square to the end square and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.strokeStyle = arrow_color;
      ctx.lineWidth = width;
      ctx.stroke();
      
      //starting a new path from the head of the arrow to one of the sides of the point
      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));
      
      //path from the side point of the arrow, to the other side point
      ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));
      
      //path from the side point back to the tip of the arrow, and then again to the opposite side point
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

      //draws the paths created above
      ctx.strokeStyle = arrow_color;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.fillStyle = "rgb(164, 190, 219)";
      ctx.fill();
  }

  // Draw a rectangle with curved edges
  function roundRect(ctx : any, x : number, y: number, width:number, height:number, radius:any, fill: boolean, stroke: boolean) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      const defaultRadius: any = {tl: 0, tr: 0, br: 0, bl: 0};
      
      for (const side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }

  }

  // just calculating the width of the element
  function calculate_width(shape_name:string) {
    // have a general size and if text too long increase the size to fit
    if (shape_name.length < 10) return 100; 
    else return 10*shape_name.length + 10; // add 10 for padding
  }
  // just calculating the width of the element
  function calculate_import_comp_ref_width(shape_name:string) {
    // have a general size and if text too long increase the size to fit
    if (shape_name.length < 10) return 100; 
    else return 7*shape_name.length + 7; // add 10 for padding
  }

  // calculating import template width: want a minimum of 300
  function calculate_import_width(shape_name: string) {
    if (shape_name.length * 10 < 300) return 300;
    else return 10*shape_name.length + 10;
  }

  function calculate_exponent(shape:any) {
    let exponent;
    if (shape.exponent == '') exponent = 1.0;
    else if (shape.exponent) exponent = shape.exponent;
    else exponent = 1.0;
    return exponent;
  }

  function calculate_units_base(shape: any) {
    if (shape.units) {
      const unit = shape.units;
      if (unit == "metre") return "m";
      else if (unit == "ampere") return "A";
      else if (unit == "becquerel") return "Bq";
      else if (unit == "candela") return "cd";
      else if (unit == "coulomb") return "C";
      else if (unit == "dimensionless") return " ";
      else if (unit == "farad") return "F";
      else if (unit == "gram") return "g";
      else if (unit == "gray") return "Gy";
      else if (unit == "henry") return "H";
      else if (unit == "hertz") return "Hz";
      else if (unit == "joule") return "J";
      else if (unit == "katal") return "kat";
      else if (unit == "kelvin") return "K";
      else if (unit == "kilogram") return "kg";
      else if (unit == "litre") return "L";
      else if (unit == "lumen") return "lm";
      else if (unit == "lux") return "lx";
      else if (unit == "mole") return "mol";
      else if (unit == "newton") return "N";
      else if (unit == "ohm") return "Ω";
      else if (unit == "pascal") return "Pa";
      else if (unit == "radian") return "rad";
      else if (unit == "second") return "s";
      else if (unit == "siemens") return "S";
      else if (unit == "sievert") return "Sv";
      else if (unit == "steradian") return "sr";
      else if (unit == "tesla") return "T";
      else if (unit == "volt") return "V";
      else if (unit == "watt") return "W";
      else if (unit == "weber") return "Wb";
      else if (unit == "degree Celsius") return "°C";
      else return shape.units;
  }
      else return "";
  }

  function calculate_multiplier(shape:any) {
    let multiplier;
    if (shape.multiplier == '') multiplier = 1.0;
    else if (shape.multiplier) multiplier = shape.multiplier;
    else multiplier = 1.0;
    return multiplier;
  }

  function calculate_variable_center_x(var_name: string, x_pos: number) {
    if (var_name.length == 1) return x_pos - 7;
    else return x_pos - (5*var_name.length);
  }

  function select_interface_type(shape:any) {
    let v_interface;
    if(shape.interface == "none") {v_interface = "";}
    else if (shape.interface == "private") {v_interface = "-"}
    else if (shape.interface == "public") {v_interface = "+"}
    else if (shape.interface == "public_and_private") {v_interface = "x"}
    else {v_interface = "";}
    return v_interface;
  }

  function drawDiamond(context:any, shape: any, x:number, y:number, width:number, height:number, inside_color: string, gradient_color: string, border_color: string) {
    context.beginPath();
    const grd = context.createRadialGradient(shape.x, shape.y, 5, shape.x + 30, shape.y + 40, 60);
    grd.addColorStop(0, inside_color);
    grd.addColorStop(1, gradient_color);
    context.fillStyle = grd;
    context.moveTo(x, y);   
    context.lineTo(x - width / 2, y + height / 2); // top left edge
    context.lineTo(x, y + height);                 // bottom left edge
    context.lineTo(x + width / 2, y + height / 2); // bottom right edge
    context.closePath();                           // finish triangle
    context.fill();
    highlight_stroke(context, shape, border_color);
    context.stroke();
  }

  function drawPentagon(context: any, shape:any, x:number, y:number, size:number, stroke:string, fill:string) {
    const numberOfSides = 5,
    step  = 2 * Math.PI / numberOfSides,  //Precalculate step value
    shift = (Math.PI / 180.0) * -18;      //Quick fix
    context.beginPath();
    for (let i = 0; i <= numberOfSides;i++) {
      const curStep = i * step + shift;
      context.lineTo (x + size * Math.cos(curStep), y + size * Math.sin(curStep));
    }
    context.lineWidth = 5;
    const grd = context.createRadialGradient(shape.x, shape.y, 5, shape.x + 30, shape.y + 40, 60);
    grd.addColorStop(0, stroke);
    grd.addColorStop(1, fill);
    context.fillStyle = grd;
    context.fill();
    highlight_stroke(context, shape, stroke);
    context.stroke();
  }

  // Give a gold/yellow border to help indicate which element is selected
  function highlight_stroke(context: any, shape: any, alt_color: string) {
    if (shapes_[selectedShapeIndex] != undefined) {
      if (shape.x == shapes_[selectedShapeIndex].x && shape.y == shapes_[selectedShapeIndex].y) {
        context.lineWidth = 5; 
        context.strokeStyle = "rgb(222, 190, 7)";
      } else { 
        context.strokeStyle = alt_color; 
        context.lineWidth = 3; 
      }
    } 
    else { 
      context.strokeStyle = alt_color; 
      context.lineWidth = 3; 
    }
  }

  // =============================================================================================
  // =============================================================================================
  // =============================================================================================
  // =============================================================================================
  // =============================================================================================

  // Clear the canvas and then redraw every time there is a new action
  function drawAll() {

    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // ========================================================================================
    // ========================================================================================
    // ========================================================================================
    // draw the lines between the elements
    for (let i = 0; i < shapes_.length; i++) {
      const shape = shapes_[i];
      if (shape.element_type == "units") {
        // Lines between units and unit children
        context.beginPath(); 
        context.lineWidth = 5;
        context.strokeStyle = "rgb(193, 2, 12)";
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].element_type == "unit" && shapes_[j].units_parent == shape.u_id) {
            drawArrow(context, shape.x + 50, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(255, 175, 175)");
          }
          else if (shapes_[j].element_type == "variable" && shapes_[j].units == shape.units_name) {
            drawArrow(context, shape.x + 50, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(255, 175, 175)");
          }
        }
        context.stroke();
      }
      else if (shape.element_type == "component") {
        context.beginPath();
        context.strokeStyle = "rgb(123,161,203)";
        context.fillStyle = "rgb(123,161,203)";
        context.lineWidth = 1;
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].comp_parent == shape.c_id && shapes_[j].element_type == "variable") {
            drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(175, 245, 185)");
          }
          else if (shapes_[j].comp_parent == shape.c_id && shapes_[j].element_type == "reset") {
            drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(175, 245, 185)");
          }
          else if (shapes_[j].comp_parent == shape.c_id && shapes_[j].element_type == "math") {
            drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(175, 245, 185)");
          }
          else if (shapes_[j].component == shape.name && shapes_[j].element_type == "component_ref") {
            drawArrow(context, shapes_[j].x, shapes_[j].y, shape.x + calculate_width(shape.name)/2, shape.y + 21, "rgb(175, 245, 185)");
          }

        }
        context.fill();
        context.stroke();
      }
      else if (shape.element_type == "reset") {
        // lines between children
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].comp_parent == shape.r_id && (shapes_[j].element_type == "test_val" || shapes_[j].element_type == "reset_val")) {
            drawArrow(context, shape.x, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(175, 245, 185)");
          }
          if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.variable) {
            drawArrow(context, shape.x, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(175, 245, 185)");
          }
        }
      }
      else if (shape.element_type == "encapsulation") {
        for (let i = 0; i < shapes_.length; i++) {
          if (shapes_[i].element_type == "component_ref" && shapes_[i].compf_parent == 0) {
            drawArrow(context, shape.x, shape.y + 21, shapes_[i].x, shapes_[i].y, "silver");
          }
        }
      }
      else if (shape.element_type == "component_ref") {
        // Lines between the component ref's and encapsulation/other comp refs
        for (let i = 0; i < shapes_.length; i++) {
          if (shapes_[i].element_type == "component_ref" && shapes_[i].c_id == shape.compf_parent) {
            drawArrow(context, shapes_[i].x, shapes_[i].y + 21, shape.x, shape.y, "silver");
          }
        }
      }
      else if (shape.element_type == "connection") {
        // draw the children lines between connection and map variables
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(115,50,115)";
          for (let i = 0; i < shapes_.length; i++) {
            if (shapes_[i].element_type == "map_var" && shapes_[i].conn_parent == shape.c_id) {
              context.fillText(shapes_[i].conn_parent, shape.x + 50 , shape.y + 50);
              context.fillText(shape.c_id, shape.x + 50 , shape.y + 50);
              drawArrow(context, shape.x, shape.y, shapes_[i].x, shapes_[i].y, "rgb(245, 206, 177)");
            }
          }
          for (let j = 0; j < shapes_.length; j++) {
            // Checking component 1 & 2
            if (shapes_[j].element_type == "component" && shapes_[j].name == shape.component1) {
              drawArrow(context, shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(191, 242, 211)");
            }
            if (shapes_[j].element_type == "component" && shapes_[j].name == shape.component2) {
              drawArrow(context, shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(191, 242, 211)");
            }
          }
          context.stroke();
      }
      else if (shape.element_type == "map_var") {
        // Draw the lines connection map variables and variable children
        context.beginPath();
        context.lineWidth = 5;
        context.strokeStyle = "rgb(115,50,115)";
        context.fillStyle   = "rgb(115,50,115)";
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.variable1 ) {
            drawArrow(context,shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(235, 211, 250)");
          }
          if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.variable2 ) {
            drawArrow(context,shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(235, 211, 250)");
          }
        }          
        context.setLineDash([]);
        context.stroke();
      }
      else if (shape.element_type == "import") {
        // draw the lines between import and units
        context.beginPath(); 
        context.lineWidth = 5;
        context.strokeStyle = "rgb(193, 2, 12)";
        for (let j = 0; j < shapes_.length; j++) {
          if ((shapes_[j].element_type == "import_units" && shapes_[j].import_parent == shape.i_id) || 
              (shapes_[j].element_type == "import_component" && shapes_[j].import_parent == shape.i_id)) {
            drawArrow(context, shape.x + 50, shape.y + 21, shapes_[j].x, shapes_[j].y, "pink");
          }
        }
        context.stroke();
      }
    }
    // ========================================================================================
    // ========================================================================================
    // ========================================================================================
    // draw the cellml elements
    for (let i = 0; i<shapes_.length; i++) {
      const shape = shapes_[i];
      if (shape.element_type) {
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        if (shape.element_type == "units") {
          // draw the red units element container
          context.beginPath();
          context.lineWidth = 3;
          roundRect(context, shape.x, shape.y, calculate_width(shape.units_name), 48, 5, true, true);
          context.font =  "16px Arial";
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.units_name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.units_name)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(254, 148, 155)");
          grd.addColorStop(1, "rgb(252, 36, 42)");
          context.fillStyle = grd;
          context.fill();       
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();

          // drawing the text for the element
          context.beginPath(); 
          context.fillStyle ='rgb(110, 1, 6)';
          context.font = "bold 18px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.fillText(shape.units_name, shape.x + 5, shape.y + 30);
          context.stroke();

          // draw the ID container (small circle at top right)
          context.beginPath();
          context.arc(shape.x + calculate_width(shape.units_name) - 5, shape.y + 5, 14, 0, 2 * Math.PI, false);
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();

          // draw the ID of the units
          context.beginPath();
          context.fillStyle = 'rgb(110, 1, 6)';
          context.font = "bold 16px Arial";
          context.fillText("#" + shape.u_id, shape.x - 17 + calculate_width(shape.units_name), shape.y + 10);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "unit") {

          // Just getting the values to display
          const units_value = calculate_units_base(shape);
          const prefix     = calculate_prefix(shape);
          const exponent   = calculate_exponent(shape);
          const multiplier = calculate_multiplier(shape);

          // create the 'unit' base - circle
          context.beginPath();
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(1, "rgb(242, 87, 95)");
          grd.addColorStop(0, "rgb(245, 137, 142)");
          context.fillStyle = grd;
          context.arc(shape.x, shape.y, 35, 0, Math.PI*2);
          context.fill();
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();

          // adding the text onto the circle
          context.beginPath();
          context.font =  "bold 16px Arial";
          let unit_string = "";
          if (shape.multiplier != undefined && shape.multiplier != 1 && shape.multiplier != "") unit_string += shape.multiplier + ".";
          if (prefix != undefined && prefix != "1" && prefix != "") unit_string += prefix + ".";
          unit_string += units_value;
          const unit_size = unit_string.length*11/3;
          context.strokeStyle = "rgb(110, 1, 6)";
          if (unit_string.length > 7) {roundRect(context, shape.x - unit_size - 15, shape.y - 15, unit_string.length*10, 30, 5, true, true);}
          context.fillStyle = "rgb(245, 139, 145)";
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;
          context.fill();
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();

          context.beginPath();
          context.fillStyle = "rgb(110, 1, 6)";
          context.fillText(unit_string, shape.x - unit_size - 5, shape.y + 5);
          context.stroke();

          context.beginPath();
          context.fillStyle = "rgb(110, 1, 6)";
          if (exponent != "" && exponent != undefined && exponent != "1") {context.fillText(exponent, shape.x + unit_size + 5, shape.y - 5);}
          context.stroke();

        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "component") {
          // The actual element container
          context.beginPath(); 
          context.lineWidth = 3;
          context.strokeStyle = "rgb(3, 83, 5)";
          roundRect(context, shape.x, shape.y, calculate_width(shape.name), 50, 5, true, true);
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.name)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();

          // The actual text of the components name
          context.strokeStyle="rgb(4, 131, 6)";
          context.font =  "bold 16px Arial";
          context.lineWidth = 3;
          context.fillStyle='rgb(2, 80, 4)';
          context.fillText(shape.name, shape.x + 15, shape.y + 30);
          highlight_stroke(context, shape, "rgb(4, 131, 6)");
          context.stroke();

          // Component ID shell
          context.beginPath();
          context.arc(shape.x + calculate_width(shape.name) - 5, shape.y + 5, 13, 0, 2 * Math.PI, false);
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(4, 131, 6)");
          context.stroke();

          // draw the ID of the units
          context.beginPath();
          context.fillStyle = 'rgb(2, 80, 4)';
          context.font = "bold 16px Arial";
          context.fillText("#" + shape.c_id, shape.x - 15 + calculate_width(shape.name), shape.y + 12);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "variable") {

          // Draw the container
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x, shape.y, 40, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          context.fillStyle= 'rgb(2, 80, 4)';
          context.lineWidth = 3;
          context.font =  "bold 18px Arial";
          context.fillText(shape.name, calculate_variable_center_x(shape.name, shape.x), shape.y + 8);
          highlight_stroke(context, shape, "rgb(4, 131, 6)");
          context.stroke();

          // draw the interface attribute onto the circle (x:both, +:public, -:private)
          context.beginPath();
          context.arc(shape.x + 35, shape.y -15, 15, 0, Math.PI * 2);
          context.fillStyle = "rgb(163, 234, 190)";
          context.fill();
          context.fillStyle= "black";
          highlight_stroke(context, shape, "rgb(4, 131, 6)");
          context.font =  "bold 16px Arial";
          context.fillText(select_interface_type(shape), shape.x + 30, shape.y - 10);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "reset") {

          // Draw the container
          context.beginPath();
          context.lineWidth = 5;
          context.arc(shape.x, shape.y, 40, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          context.stroke();
          // The variable reference
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(30, 70, 70)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          roundRect(context, shape.x - 50, shape.y - 40, calculate_width(shape.variable) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Var: " + shape.variable, shape.x - 40, shape.y - 26);
          context.stroke();
          // The test variable reference 
          context.beginPath();
          context.strokeStyle = "rgb(30, 70, 70)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          roundRect(context, shape.x - 50, shape.y + 20, calculate_width(shape.test_var) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Test_V: " + shape.test_var, shape.x - 40, shape.y + 35);
          context.stroke();

          // draw the ID circle
          context.beginPath();
          context.arc(shape.x + 55, shape.y, 15, 0, 2 * Math.PI, false);
          context.fillStyle = grd
          context.fill();
          context.lineWidth = 3;
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          context.stroke();

          // draw the ID of the reset element
          context.beginPath();
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          context.font = "bold 14px Arial";
          context.fillText("#" + shape.r_id, shape.x + 48, shape.y + 3);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "test_val" || shape.element_type == "reset_val") {

          // Add rectangle between the two
          context.beginPath();
          context.strokeStyle = "rgb(200, 253, 232)";
          context.fillStyle = "rgb(200, 253, 232)";
          highlight_stroke(context, shape, "rgb(175, 245, 185)");
          roundRect(context, shape.x, shape.y - 10, 100, 20, 1, true, true);
          context.stroke();

          // Draw Container
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x, shape.y, 35, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          context.stroke();

          // Add text depending on version
          context.beginPath();
          context.font = "bold 18px Arial";
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          if (shape.element_type == "test_val" ) context.fillText("Test: ", shape.x - 30, shape.y + 8);
          if (shape.element_type == "reset_val") context.fillText("Reset: ", shape.x - 30, shape.y + 8);

          // Add Math element to the right
          context.beginPath();
          roundRect(context, shape.x + 45, shape.y - 25, 100, 50, 10, true, true);
          const grd2 = context.createRadialGradient(shape.x + 125/2, shape.y + 25, 5, shape.x + 125/3, shape.y + 30, 100);
          grd2.addColorStop(0, "rgb(170, 190, 217)");
          grd2.addColorStop(1, "rgb(74, 114, 166)");
          context.fillStyle = grd2;
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          context.stroke();
          context.beginPath();
          context.strokeStyle = "rgb(43,65,96)";
          context.fillStyle = "rgb(43,65,96)";
          context.font = "bold 18px Arial"
          context.fillText("<Math>", shape.x + 62, shape.y + 7);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "math") {
          context.beginPath();
          roundRect(context, shape.x, shape.y, 125, 50, 10, true, true);
          const grd = context.createRadialGradient(shape.x + 125/2, shape.y + 25, 5, shape.x + 125/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(170, 190, 217)");
          grd.addColorStop(1, "rgb(74, 114, 166)");
          context.fillStyle = grd;
          context.fill();
          context.lineWidth = 3;
          highlight_stroke(context, shape, "rgb(65,100,147)");
          context.stroke();

          context.beginPath();
          context.strokeStyle = "rgb(43,65,96)";
          context.fillStyle = "rgb(43,65,96)";
          context.font = "bold 18px Arial"
          context.fillText("<Math>", shape.x + 30, shape.y + 30);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "encapsulation") {
          // Encapsulation box
          const encapsulation_height = 100;
          const encapsulation_width = 125;
          context.beginPath(); 
          context.lineWidth =2;
          context.fillStyle = "rgba(225, 225, 225, .8)";
          highlight_stroke(context, shape, "rgb(150, 150, 150)");
          roundRect(context, shape.x, shape.y, encapsulation_width, encapsulation_height, 10, true, true);
          roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, encapsulation_height - 5, 10, true, true);
          roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, 30, 5, true, true);
          context.stroke();
          // Text of encapsulate
          context.beginPath();
          context.fillStyle='rgb(65,65,65)';
          context.font =  "bold 18px Arial";
          context.strokeStyle="rgb(65,65,65)";
          context.fillText("Encapsulate", shape.x + 5, shape.y + 25);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "component_ref") {
          // The border for the element
          context.beginPath(); 
          context.lineWidth = 3;
          context.setLineDash([]);
          highlight_stroke(context, shape, "rgb(150, 150, 150)");
          roundRect(context, shape.x - 5, shape.y - 5, calculate_width(shape.component) + 9, 55, 5, true, true);
          context.stroke();

          context.beginPath();
          context.lineWidth = 3;
          highlight_stroke(context, shape,"rgb(3, 83, 5)");
          roundRect(context, shape.x - 2, shape.y - 2, calculate_width(shape.component) + 4, 50, 5, true, true);
          context.stroke();

          // Add the text to the encapsulated component
          context.beginPath();
          // Create component_ref gradient:
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.component)/2, shape.y + 25, 5, shape.x + calculate_width(shape.component)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          // Fill the inside of the component with the gradient created
          context.fillStyle = grd;
          context.fillRect(shape.x, shape.y, calculate_width(shape.component), 45);
          context.font =  "bold 18px Arial";
          context.strokeStyle="rgb(1, 65, 1)";
          context.fillStyle = "rgb(1, 65, 1)";
          context.fillText(shape.component, shape.x + 5, shape.y + 28);
          context.stroke();
          // draw the ID circle at bottom of the diamond
          context.beginPath();
          highlight_stroke(context, shape, "rgb(150, 150, 150)");
          context.arc(shape.x + calculate_width(shape.component), shape.y + 5, 15, 0, 2 * Math.PI, false);
          context.fillStyle = grd;
          context.fill();
          context.lineWidth = 2;
          context.stroke();

          context.beginPath();
          highlight_stroke(context, shape, "rgb(3, 83, 5)");
          context.arc(shape.x + calculate_width(shape.component), shape.y + 5, 13, 0, 2 * Math.PI, false);
          context.stroke();
          // draw the ID of the connection
          context.beginPath();
          context.fillStyle = "rgb(1, 65, 1)";
          context.font = "bold 14px Arial";
          context.fillText("#" + shape.c_id, shape.x + calculate_width(shape.component) - 10, shape.y + 8);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "connection") {
          
          // draw connection diamond
          let diamond_width;
          (shape.component1.length > shape.component2.length) ? diamond_width = calculate_width(shape.component1) : diamond_width = calculate_width(shape.component2);
          const diamond_height= 95;
          drawDiamond(context, shape, shape.x + diamond_width/4, shape.y - diamond_height/4, diamond_width , diamond_height, "rgb(245,209,188)", "rgb(230, 130, 70)", "rgb(225, 108, 34)");

          // draw the name boxes
          context.beginPath();
          context.fillStyle = "rgb(243, 196, 167)";
          context.font = "bold 16px Arial";
          highlight_stroke(context, shape, "rgb(255, 102, 0)");
          roundRect(context, shape.x - 20, shape.y - 10, calculate_width(shape.component1), 25, 5, true, true);
          roundRect(context, shape.x - 20, shape.y + 30, calculate_width(shape.component2), 25, 5, true, true);
          context.stroke();

          // draw the related components
          context.beginPath();
          context.fillStyle = "rgb(217, 87, 0)";
          context.fillText(shape.component1, shape.x - 10, shape.y + 7);
          context.fillText(shape.component2, shape.x - 10, shape.y + 47);
          context.font = "bold 24px Arial";   
          context.fillText("X", shape.x + diamond_width/4 - 10, shape.y + 30);
          context.stroke();
          context.font = "16px Arial";   

          // draw the ID circle at bottom of the diamond
          context.beginPath();
          context.arc(shape.x + diamond_width/4, shape.y + 70, 12, 0, 2 * Math.PI, false);
          context.fillStyle = "rgb(243, 196, 167)";
          context.fill();
          context.lineWidth = 2;
          highlight_stroke(context, shape, "rgb(255, 102, 0)");
          context.stroke();

          // draw the ID of the connection
          context.beginPath();
          context.fillStyle = "rgb(175, 70, 0)";
          context.font = "bold 14px Arial";
          context.fillText("#" + shape.c_id, shape.x + 15, shape.y + 75);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "map_var") {
          
          // Draw the pentagon for the map variable element
          context.beginPath();
          context.lineWidth = 5;
          let shape_width;
          const var1length = calculate_width(shape.variable1);
          const var2length = calculate_width(shape.variable2);
          (var1length > var2length) ? shape_width = var1length : shape_width = var2length;
          drawPentagon(context, shape, shape.x + shape_width/4, shape.y + shape_width/4, shape_width/2 , "rgb(185,100,185)", "rgb(230,205,230)");

          // Draw the boxes for the pentagon
          context.beginPath();
          context.fillStyle = "rgb(223,187,232)";
          context.font = "bold 16px Arial";
          context.lineWidth = 2;
          highlight_stroke(context, shape, "rgb(115,50,115)");
          roundRect(context, shape.x - 25, shape.y - 10, calculate_width(shape.variable1), 25, 5, true, true);
          roundRect(context, shape.x - 25, shape.y + shape_width/3, calculate_width(shape.variable2), 25, 5, true, true);
          context.stroke();

          // Write the names onto the element container
          context.beginPath();
          context.fillStyle='rgb(101, 39, 116)';
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;
          context.fillText(shape.variable1, shape.x - 15,  shape.y + 8);
          context.fillText("   X   ",  shape.x + shape_width/4 - 15,  shape.y + shape_width/4 + 5);
          context.fillText(shape.variable2, shape.x - 15,  shape.y + shape_width/3 + 20);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "import") {
          context.beginPath(); 
          context.lineWidth = 5;
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          roundRect(context, shape.x, shape.y, calculate_width(shape.href), 50, 5, true, true);
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.href)/2, shape.y + 25, 5, shape.x + calculate_width(shape.href)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(187, 222, 232)");
          grd.addColorStop(1, "rgb(105, 181, 203)");
          context.fillStyle = grd;
          context.fill();
          context.stroke();

          // The actual text of the components name
          context.beginPath();
          context.strokeStyle= "rgb(187, 222, 232)";
          context.lineWidth = 3;
          context.fillStyle= "rgb(63, 81, 181)";
          context.font='bold 12px Arial'
          context.fillText("Import from:", shape.x + 5, shape.y + 15);
          context.font =  "bold 16px Arial";
          context.fillText("/" + shape.href, shape.x + 5, shape.y + 35);
          context.stroke();
          // draw the ID container (small circle at top right)
          context.beginPath();
          context.arc(shape.x + calculate_width(shape.href) - 5, shape.y + 10, 14, 0, 2 * Math.PI, false);
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          context.stroke();
          context.beginPath();

          context.arc(shape.x + calculate_width(shape.href) - 5, shape.y + 10, 12, 0, 2 * Math.PI, false);
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(187,222,232)");
          context.stroke();
          // draw the ID of the units
          context.beginPath();
          context.fillStyle = "rgb(63, 81, 181)";
          context.font = "bold 16px Arial";
          context.fillText("#" + shape.i_id, shape.x - 17 + calculate_width(shape.href), shape.y + 14);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "import_units") {
          // draw the red 'units' element
          //name:i_name.value, units_ref:i_ref.value, import_parent: ref.value
          context.beginPath();
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          roundRect(context, shape.x, shape.y, calculate_width(shape.name), 50, 10, true, true);
          context.stroke();

          context.beginPath();
          context.lineWidth = 3;
          roundRect(context, shape.x + 3, shape.y + 3, calculate_width(shape.name) - 6, 44, 5, true, true);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.lineWidth = 3;
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.name)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(254, 148, 155)");
          grd.addColorStop(1, "rgb(252, 36, 42)");
          context.fillStyle = grd;
          context.fill();       
          context.stroke();
          // drawing the text for the element
          context.beginPath(); 
          context.fillStyle='rgb(110, 1, 6)';
          context.font = "bold 16px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.fillText(shape.name, shape.x + 15, shape.y + 30);
          context.font =  "bold 10px Arial";
          context.fillText("Imported: " + shape.units_ref + "", shape.x + 10, shape.y + 40);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
        else if (shape.element_type == "import_component") {
          // The actual element container
          context.beginPath(); 
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          // The border is blue to help indicate it's imported
          roundRect(context, shape.x, shape.y, calculate_width(shape.name), 50, 10, true, true);
          context.stroke();
          // The inner border is green to indicate it's a component
          context.beginPath();
          context.strokeStyle = "rgb(3, 83, 5)";
          context.lineWidth = 2;
          roundRect(context, shape.x + 3, shape.y + 3, calculate_width(shape.name) - 6, 44, 5, true, true);
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.name)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          // The actual text of the components name
          context.strokeStyle="rgb(4, 131, 6)";
          context.font =  "bold 16px Arial";
          context.lineWidth = 3;
          context.fillStyle='rgb(2, 80, 4)';
          context.fillText(shape.name, shape.x + 15, shape.y + 30);
          context.font =  "bold 10px Arial";
          context.fillText("Imported: (" + shape.comp_ref + ")", shape.x + 10, shape.y + 40);
          context.stroke();
        }
        // ========================================================================================
        // ========================================================================================
        // ========================================================================================
      }
    }
  }

  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================
  // ======================================================================================================








  // Manipulating the current element variables
  let isDragging_ = false;
  let startX_:number, startY_:number;
  let selectedShapeIndex: number;

  function isMouseInShape(mx: number, my: number, shape: any) {
    reOffset();
    //console.log(shape);

    if (shape == undefined) {
      selectedShapeIndex = -1;
      clear_input();
      change_element("model_children", "Model", "model_info", "drag_model");
    }

    if (shape != undefined) {
      console.log(shape);
      const dx = mx - shape.x;
      const dy = my - shape.y;

      if (shape.element_type == "units" || shape.element_type == "component" || 
          shape.element_type == "component_ref" || shape.element_type == "import" || 
          shape.element_type == "import_units" || shape.element_type == "import_component") {
        if (mx > shape.x && mx < shape.x + 120 && my > shape.y && my < shape.y + 50) return(true);
      } 
      else if (shape.element_type == "unit") {
        if(mx > shape.x - 25 && mx < shape.x + 25 && my > shape.y - 25 && my < shape.y + 25) return(true);
      }
      else if (shape.element_type == "variable" || shape.element_type == "reset") {
        if(mx > shape.x - 30 && mx < shape.x + 30 && my > shape.y - 30 && my < shape.y + 30) return(true);
      }
      else if (shape.element_type == "test_val" || shape.element_type == "reset_val") {
        if(mx > shape.x - 40 && mx < shape.x + 40 && my > shape.y - 40 && my < shape.y + 40) return(true);
      }
      else if (shape.element_type == "math") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 50) return(true);
      }
      else if (shape.element_type == "encapsulation") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 100) return(true);
      }
      else if (shape.element_type == "connection" || shape.element_type == "map_var") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 80) return(true);
      }
      

      else if(dx*dx+dy*dy<shape.radius*shape.radius){
          // yes, mouse is inside this circle
          return(true);
        }
        
    } else if (shape.width) {
      const rLeft=shape.x;
      const rRight=shape.x+shape.width;
      const rTop=shape.y;
      const rBott=shape.y+shape.height;
      // math test to see if mouse is inside rectangle
      if( mx>rLeft && mx<rRight && my>rTop && my<rBott){
          return(true);
      }
    }
    return(false);
  }

  // clicking on an element will display that specific element's information 
  function display_element_info(element: any) {
    console.log(element);

    console.log("valid");
    const type = element.element_type;
    if (type === "units") {
      change_element("units_children", "Units", "units_info", "drag_units");
      const u_name = document.getElementById('units_name_input') as HTMLInputElement;
      u_name.value = element.units_name;
    } 
    else if (type == "unit") {
      change_element("unit_children", "Unit", "unit_info", "drag_unit");
      const u_units = document.getElementById('units_ref_input') as HTMLInputElement;
      const u_ref   = document.getElementById('unit_ref_input') as HTMLInputElement;
      const u_prefix= document.getElementById('unit_prefix_input') as HTMLInputElement;
      const u_mult  = document.getElementById('unit_multiplier_input') as HTMLInputElement;
      const u_exp   = document.getElementById('unit_exp_input') as HTMLInputElement;

      u_units.value = element.units_parent;
      u_ref.value   = element.units;
      u_prefix.value= element.prefix;
      u_mult.value  = element.multiplier;
      u_exp.value   = element.exponent;
    }
    else if (type == "component") {
      change_element("component_children", "Component", "component_info", "drag_component");
      const c_name = document.getElementById('comp_name_input') as HTMLInputElement;
      c_name.value = element.name;
    }
    else if (type == "variable") {
      change_element("variable_children", "Variable", "variable_info", "drag_variable");
      const v_comp_ref = document.getElementById('var_comp_ref_input') as HTMLInputElement;
      const v_name = document.getElementById('var_name_input') as HTMLInputElement;
      const v_units = document.getElementById('var_units_input') as HTMLInputElement;
      const v_interface = document.getElementById('var_interface_input') as HTMLInputElement;
      const v_init = document.getElementById('var_init_input') as HTMLInputElement;

      v_comp_ref.value = element.comp_parent;
      v_name.value = element.name;
      v_units.value = element.units;
      v_interface.value = element.interface;
      v_init.value = element.initial_val;
    }
    else if (type == "reset") {
      change_element("reset_children", "Reset", "reset_info", "drag_reset");
      const r_ref = document.getElementById('reset_comp_ref_input') as HTMLInputElement;
      const r_var = document.getElementById('reset_var_input') as HTMLInputElement;
      const r_test = document.getElementById('reset_test_input') as HTMLInputElement;
      const r_ord = document.getElementById('reset_order_input') as HTMLInputElement;

      r_ref.value = element.comp_parent;
      r_var.value = element.variable;
      r_test.value = element.test_var;
      r_ord.value = element.order;
    }
    else if (type == "test_val") {
      change_element("test_value_children", "Test Value", "test_value_info", "drag_test_value")
      const c_ref = document.getElementById('tv_comp_ref') as HTMLInputElement;
      c_ref.value = element.comp_parent;
    }
    else if (type == "reset_val") {
      change_element("reset_value_children", "Reset Value", "reset_value_info", "drag_reset_value")
      const c_ref = document.getElementById('rv_comp_ref') as HTMLInputElement;
      c_ref.value = element.comp_parent;
    }
    else if (type == "math") {
      change_element("math_children", "Math", "math_info", "drag_math")
      const c_ref = document.getElementById('math_comp_ref_input') as HTMLInputElement;
      c_ref.value = element.comp_parent;
    }
    else if (type == "encapsulation") {
      change_element("encapsulation_children", "Encapsulation", "encapsulation_info", "drag_encapsulation")
    }
    else if (type == "component_ref") {
      change_element("component_ref_children", "Component Reference", "component_ref_info", "drag_comp_ref")
      const c_refp = document.getElementById('comp_ref_parent_id') as HTMLInputElement;
      c_refp.value = element.compf_parent;
      const c_refc = document.getElementById('comp_ref_comp_input') as HTMLInputElement;
      c_refc.value = element.component;
    }
    else if (type == "connection") {
      change_element("connection_children", "Connection", "connection_info", "drag_connection")
      const c1 = document.getElementById('connect_1_input') as HTMLInputElement;
      c1.value = element.component1;
      const c2 = document.getElementById('connect_2_input') as HTMLInputElement;
      c2.value = element.component2;
    }
    else if (type == "map_var") {
      change_element("map_variables_children", "Map Variables", "map_variables_info", "drag_map_variables")
      const ref = document.getElementById('map_connect_input') as HTMLInputElement;
      ref.value = element.conn_parent;
      const v1 = document.getElementById('map_var_1_input') as HTMLInputElement;
      v1.value = element.variable1;
      const v2 = document.getElementById('map_var_2_input') as HTMLInputElement;
      v2.value = element.variable2;
    }
    else if (type == "import") {
      change_element("import_children", "Import", "import_info", "drag_import")
      const href = document.getElementById('import_ref_input') as HTMLInputElement;
      href.value = element.href;
    }
    else if (type == "import_units") {
      change_element("import_units_children", "Import Units", "import_units_info", "drag_import_units")
      const ref = document.getElementById('import_parent_reference_u') as HTMLInputElement;
      ref.value = element.import_parent;
      const name = document.getElementById('import_units_name_input') as HTMLInputElement;
      name.value = element.href;
      const units = document.getElementById('import_units_ref_input') as HTMLInputElement;
      units.value = element.units_ref;
    }
    else if (type == "import_component") {
      change_element("import_component_children", "Import Component", "import_container_info", "drag_import_component")
      const ref = document.getElementById('import_parent_reference_c') as HTMLInputElement;
      ref.value = element.import_parent;
      const name = document.getElementById('import_comp_name_input') as HTMLInputElement;
      name.value = element.href;
      const comp = document.getElementById('import_comp_ref_input') as HTMLInputElement;
      comp.value = element.units_ref;
    }
    else {
      change_element("model_children", "Model", "model_info", "drag_model");
    }
  }

  function handleMouseDown(e: any) {
    e.preventDefault();
    e.stopPropagation();
    reOffset();
    startX_ = e.clientX - offsetX_;
    startY_ = e.clientY - offsetY_;
    console.log(startX_ + " | " + startY_);
    for (let i = 0; shapes_.length; i++) {
      if (isMouseInShape(startX_, startY_, shapes_[i])) {
        selectedShapeIndex = i;
        isDragging_ = true;
        display_element_info(shapes_[selectedShapeIndex]);
        return;
      }
    }
  }

  function handleMouseUp(e:any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    reOffset();
    isDragging_=false;
  }

  function handleMouseOut(e: any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    reOffset();
    isDragging_=false;
  }

  function handleMouseMove(e: any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    reOffset();
    const mouseX_ = e.clientX - offsetX_;
    const mouseY_ = e.clientY - offsetY_;

    const dx = mouseX_ - startX_;
    const dy = mouseY_ - startY_;
    const selectedShape = shapes_[selectedShapeIndex];

    selectedShape.x += dx;
    selectedShape.y += dy;
    drawAll();

    startX_ = mouseX_;
    startY_ = mouseY_;
  }



  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  /*
    The box (canvas) to allow an element to be dropped 

    event: takes in an event (mouse release)
  */
  const allowDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  };

  /*
    Drop the current element onto the canvas

    event: takes in an event (mouse release)
  */
  const dropElem = (event: React.DragEvent<HTMLCanvasElement>) => {

    event.preventDefault();
    event.stopPropagation();

    // Calculate the current canvas & mouse position so that the drop will drop where the mouse is
    const editor_canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const BB = editor_canvas.getBoundingClientRect();
    const editor_offsetX = BB.left;
    const editor_offsetY = BB.top;
    const editor_mouseX = event.clientX - editor_offsetX;
    const editor_mouseY = event.clientY - editor_offsetY;


    

    // Dropping the element will add it to the list of elements
    // ==============================================================================================
    if (clickedElement === "Units") {
      // Get the units value - an input from the user
      const un = document.getElementById("units_name_input") as HTMLInputElement;
      const units_name = un.value;

      if (validDrop) {
        // Calculating the units ID (smallest possible number not in the list)
        const sorted_units_list = listofUnits.sort(function(a,b) { return parseFloat(a.u_id) - parseFloat(b.u_id) });
        // in a sorted list the last element will we the last
        const highest_value = sorted_units_list[sorted_units_list.length - 1];
        const added_units_list = listofUnits;
        let units_id;
        if (sorted_units_list.length === 0) {
          units_id = 1;
          added_units_list.push({x: editor_mouseX, y: editor_mouseY, radius: 10, color: 'red', element_type: 'units', units_name: units_name, u_id: units_id});
        } else {
          units_id = highest_value.u_id + 1;
          added_units_list.push({x: editor_mouseX, y: editor_mouseY, radius: 10, color: 'red', element_type: 'units', units_name: units_name, u_id: units_id});
        }
        setListofUnits(added_units_list);
        // Add the dropped unit to the list of elements
        const shapes_2 = shapes_;
        shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 10, color: 'red', element_type: 'units', units_name: units_name, u_id: units_id});
        setShapes(shapes_2);
      }
      // Update the UI
      checkUnitsName();
    } 
    // ==============================================================================================
    else if (clickedElement === "Unit") {
      // units reference
      const units = document.getElementById("unit_ref_input") as HTMLInputElement;
      const units_value = units.value;
      // the values for thte unit - from the user
      const prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
      const prefix_value = prefix.value;

      const exponent = document.getElementById("unit_exp_input") as HTMLInputElement;
      const exponent_value = exponent.value;

      const multiplier = document.getElementById("unit_multiplier_input") as HTMLInputElement;
      const multiplier_value = multiplier.value;

      check_unit_input_values();
      if (validUnitIDDrop && validUnitUnitsDrop && validUnitMultDrop && validUnitExpDrop && validUnitPrefixDrop) {
        const ref = document.getElementById("units_ref_input") as HTMLInputElement;
        const ref_value = ref.value;
        // add to the list of all elements
        const shapes_2 = shapes_;
        shapes_2.push({x: editor_mouseX, y: editor_mouseY, radius: 10, color:'red', element_type: 'unit', units: units_value, 
                      prefix: prefix_value, multiplier: multiplier_value, exponent: exponent_value, units_parent: ref_value});
        setShapes(shapes_2);
      }
      check_unit_input_values();
    }
    // ==============================================================================================
    else if (clickedElement === "Component") {
      // get the component name - an input from the user
      const c = document.getElementById("comp_name_input") as HTMLInputElement;
      const comp_name = c.value;
      // get a sorted list to get the highest id
      const templistofcomp = listofComponents.sort(function(a,b) { return parseFloat(a.c_id) - parseFloat(b.c_id)});
      const shapes_2 = shapes_;
      // Add the dropped component
      let comp_id;
      if (templistofcomp.length === 0) {
        comp_id = 1;
        console.log('dropped 1')
      } else {
        comp_id = templistofcomp[templistofcomp.length - 1].c_id + 1;
        console.log('dropped: ' + comp_id);
      }
      // Updating the list of overall elements & list of components
      checkComponentName();
      if (validCompName) {
        templistofcomp.push({x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'component', name: comp_name, c_id: comp_id});
        setListofComponents(templistofcomp);
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'component', name: comp_name, c_id: comp_id});
        setShapes(shapes_2);
      }
      // Update UI
      checkComponentName();
    } 
    // ==============================================================================================
    else if (clickedElement === "Variable") {
      check_variable_input_values();
      const n     = document.getElementById("var_name_input") as HTMLInputElement;
      const u     = document.getElementById("var_units_input") as HTMLInputElement;
      const it    = document.getElementById("var_interface_input") as HTMLSelectElement;
      const init  = document.getElementById("var_init_input") as HTMLInputElement;
      const c_ref = document.getElementById("var_comp_ref_input") as HTMLInputElement;

      if (validVarIDDrop && validVarNameDrop && validVarUnitsDrop && validVarInterfaceDrop && validVarInitValueDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 10, color: 'green', element_type:'variable', 
                        name: n.value, units: u.value, interface: it.value, initial_val: init.value, comp_parent: c_ref.value})
        setShapes(shapes_2);
      }
      check_variable_input_values();
    }
    // ==============================================================================================
    else if (clickedElement === "Reset") {

      check_reset_input_values();
      const variable = document.getElementById("reset_var_input") as HTMLInputElement;
      const test_var = document.getElementById("reset_test_input") as HTMLInputElement;
      const v_order  = document.getElementById("reset_order_input") as HTMLInputElement;
      const c_ref    = document.getElementById("reset_comp_ref_input") as HTMLInputElement;

      const temp_reset_list = listofReset.sort(function(a,b) { return parseFloat(a.r_id) - parseFloat(b.r_id) });     
      const highest_value = temp_reset_list[temp_reset_list.length - 1];
      const added_reset_list = listofReset;
      let reset_id;
      (temp_reset_list.length === 0) ? reset_id = 1 : reset_id = highest_value.r_id + 1
      if (validResetIDDrop && validResetOrderDrop && validResetTestDrop && validResetVarDrop) {
        // push to reset list
        added_reset_list.push({x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'reset', 
                        variable: variable.value, test_var: test_var.value, order: v_order.value, comp_parent: c_ref.value, r_id: reset_id})
        setListofReset(added_reset_list);
        // push to all list
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'reset', 
                        variable: variable.value, test_var: test_var.value, order: v_order.value, comp_parent: c_ref.value, r_id: reset_id})
        setShapes(shapes_2);
      }    
      check_reset_input_values();
    } 
    // ==============================================================================================
    else if (clickedElement === "Test Value") {
      
      checkResetParent("tv_comp_ref");
      const c_ref = document.getElementById("tv_comp_ref") as HTMLInputElement;
      if (validTestValueIDDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'test_val', comp_parent: c_ref.value, math_var:''})
        setShapes(shapes_2);
      }
      checkResetParent("tv_comp_ref");
    } 
    else if (clickedElement === "Reset Value") {
      checkResetParent("rv_comp_ref");
      const c_ref = document.getElementById("rv_comp_ref") as HTMLInputElement;
      if (validResetValueIDDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'green', element_type:'reset_val', comp_parent: c_ref.value, math_var:''})
        setShapes(shapes_2);
      }
      checkResetParent("rv_comp_ref");
    } 
    // ==============================================================================================
    else if (clickedElement === "Math") {
      checkMathCompID();
      const m_ref = document.getElementById("math_comp_ref_input") as HTMLInputElement;
      if (validMathIDDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'math', comp_parent: m_ref.value})
        setShapes(shapes_2);
      }
      checkMathCompID();
    } 
    // ==============================================================================================
    else if (clickedElement === "Encapsulation") {
      let exists = 0;
      for (let i = 0; i < shapes_.length; i++) {
        if (shapes_[i].element_type == "encapsulation") exists = 1;
      }
      if (exists == 0) {
        // only 1 encapsulation is allowed
        const shapes_2 = shapes_;
        shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 20, color: 'silver', element_type: 'encapsulation'})
        setShapes(shapes_2);
      }
    } 
    // ==============================================================================================
    else if (clickedElement === "Component Reference") {

      const component = document.getElementById("comp_ref_comp_input") as HTMLInputElement;
      const comp_value = component.value;
      const parent_id = document.getElementById("comp_ref_parent_id") as HTMLInputElement;
      const parent_id_value = parent_id.value;

      const templistofComponentRefs = listofComponentRefs.sort(function(a,b) { return parseFloat(a.c_id) - parseFloat(b.c_id) });
      const highest_value = templistofComponentRefs[templistofComponentRefs.length - 1];
      const added_compr_list = listofComponentRefs;

      checkCompRefComp(); 
      checkCompRefID();
      if (validCompRefCompDrop && validCompRefParentIDDrop) {
        let comp_id;
        (templistofComponentRefs.length === 0) ? comp_id  = 1 : comp_id = highest_value.c_id + 1
        added_compr_list.push({x: editor_mouseX, y: editor_mouseY, radius:10, color: 'green', element_type:'component_ref', component: comp_value, c_id: comp_id, compf_parent: parent_id_value })

        const shapes_2 = shapes_;
        shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius:10, color: 'green', element_type:'component_ref', component: comp_value, c_id: comp_id, compf_parent: parent_id_value})
        setShapes(shapes_2);
      }
      checkCompRefComp(); 
      checkCompRefID();
    } 
    // ==============================================================================================
    else if (clickedElement === "Connection") {

      const comp1 = document.getElementById("connect_1_input") as HTMLInputElement;
      const comp2 = document.getElementById("connect_2_input") as HTMLInputElement;
      
      const sorted_connection = listofConnections.sort(function(a,b) { return parseFloat(a.c_id) - parseFloat(b.c_id) })
      const highest_value = sorted_connection[sorted_connection.length - 1];
      const added_conn_list = listofConnections;
      let conn_id;
      (sorted_connection.length === 0) ? conn_id = 1 : conn_id = highest_value.c_id + 1;
      checkConnectionComp();
      if (validConnectionComp1Drop && validConnectionComp2Drop) {
        // Push to the connection list
        added_conn_list.push({x: editor_mouseX, y: editor_mouseY, radius: 10, color:'orange', element_type: 'connection', 
                        component1:comp1.value, component2:comp2.value, c_id: conn_id});
        setListofConnections(added_conn_list);
        // Push to all
        const shapes_2 = shapes_;
        shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 10, color:'orange', element_type: 'connection', 
                        component1:comp1.value, component2:comp2.value, c_id: conn_id})
        setShapes(shapes_2);
      }
      checkConnectionComp();
    } 
    // ==============================================================================================
    else if (clickedElement === "Map Variables") {
      const c_ref = document.getElementById("map_connect_input") as HTMLInputElement;
      const map_v1 = document.getElementById("map_var_1_input") as HTMLInputElement;
      const map_v2 = document.getElementById("map_var_2_input") as HTMLInputElement;
      checkMapVariableRefID();
      checkMapVariablesVar();
      if (validMapVariable1Drop && validMapVariable2Drop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:35, color:'purple', element_type:'map_var', 
                        variable1: map_v1.value, variable2: map_v2.value, conn_parent: c_ref.value});
        setShapes(shapes_2);
      }
      checkMapVariableRefID();
      checkMapVariablesVar();
    } 
    // ==============================================================================================
    else if (clickedElement === "Import") {

      const href = document.getElementById("import_ref_input") as HTMLInputElement;
      const href_value = href.value;

      const sorted_imports = listofImports.sort(function(a,b) { return parseFloat(a.i_id) - parseFloat(b.i_id) })
      const highest_value = sorted_imports[sorted_imports.length - 1];

      const added_imp_list = listofImports;
      let imp_id;
      checkImportHREF();
      if (validHrefDrop) {
        (sorted_imports.length === 0) ? imp_id = 1 : imp_id = highest_value.i_id + 1;
        added_imp_list.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'import', href:href_value, i_id: imp_id});
        setListofImports(added_imp_list);

        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'import', href:href_value, i_id: imp_id});
        setShapes(shapes_2);
      }
      checkImportHREF();
    } 
    // ==============================================================================================
    else if (clickedElement === "Import Units") {
      check_import_units_values();
      const ref = document.getElementById("import_parent_reference_u") as HTMLInputElement;
      const i_name = document.getElementById("import_units_name_input") as HTMLInputElement;
      const i_ref = document.getElementById("import_units_ref_input") as HTMLInputElement;

      if (validImportUnitsImpIDDrop && validImportUnitsNameDrop && validImportUnitsRefDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'red', element_type:'import_units', name:i_name.value, units_ref:i_ref.value, import_parent: ref.value });
        setShapes(shapes_2);
      }
      check_import_units_values();
    } 
    // ==============================================================================================
    else if (clickedElement === "Import Component") {
      check_import_comp_values();
      const ref = document.getElementById("import_parent_reference_c") as HTMLInputElement;
      const i_name = document.getElementById("import_comp_name_input") as HTMLInputElement;
      const i_ref = document.getElementById("import_comp_ref_input") as HTMLInputElement;
      if (validImportCompImpIDDrop && validImportCompNameDrop && validImportCompRefDrop) {
        const shapes_2 = shapes_;
        shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'green', element_type:'import_component', name:i_name.value, comp_ref:i_ref.value, import_parent: ref.value})
        setShapes(shapes_2);
      }
      check_import_comp_values();
    } 
    
    drawAll();
  };



  const check_unit_input_values = () => {
    checkUnitName();
    checkUnitRef();
    checkUnitExp();
    checkUnitMul();
    checkUnitPrefix();
  }
  const check_variable_input_values = () => {
    checkVariableCompID();
    checkVariableInitValue();
    checkVariableName();
    checkVariableUnits();
  }
  const check_reset_input_values = () => {
    checkResetOrder();
    checkResetRef();
    checkResetTest();
    checkResetVar();
  }
  const check_import_comp_values = () => {
    checkImportUnitsImportRef("import_parent_reference_c")
    checkImportCompName();
    checkImportCompRef();
  }
  const check_import_units_values = () => {
    checkImportUnitsImportRef("import_parent_reference_u")
    checkImportUnitsName();
    checkImportUnitsRef();
  }
  const check_every_field = () => {
    checkUnitsName();
    check_unit_input_values();
    checkComponentName();
    check_variable_input_values();
    check_reset_input_values();
    checkResetParent("tv_comp_ref");
    checkResetParent("rv_comp_ref");
    checkMathCompID();
    checkCompRefComp(); 
    checkCompRefID();
    checkConnectionComp();
    checkMapVariableRefID();
    checkMapVariablesVar();
    checkImportHREF();
    check_import_units_values();
    check_import_comp_values();
  }

  const get_pos_elem = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log(posX + "-" + posY);
    setDX(event.pageX);
    setDY(event.pageY);
    console.log(posX + "-" + posY);
  };


  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // Dragging the element & get the cursor coordinates
  const dragElement = (event: React.DragEvent<HTMLDivElement>) => {
    const temp = event.target as HTMLImageElement;
    // set 'Text' to be the image id
    event.dataTransfer.setData("Text", temp.id);
    event.dataTransfer.setData("mouse_position_x", (event.clientX - temp.offsetLeft).toString());
    event.dataTransfer.setData("mouse_position_y", (event.clientY - temp.offsetTop).toString());
  };


  const checkValidName = () => {
    const model_name = document.getElementById("insert_name_box") as HTMLInputElement;
    console.log(model_name.value);
    setModelName(model_name.value);
    // regex is first is latin alphabetical then following alphanumeric or underscores
    if (model_name.value.match('^[a-zA-Z][_a-zA-Z]*')) {
      console.log('this is valid');
      document.getElementById("insert_name_box").style.borderColor = "black";
    } else {
      console.log('this isn\'t valid');
      document.getElementById("insert_name_box").style.borderColor = "red";
    }
  }
  
  // ============================================================================================
  // ============================================================================================
  // ============================================================================================
  // This function will just erase the whole canvas (blank) and delete all elements
  const restartCanvas = () => {
    // Clear the visual
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Clear the actual elements from their individual lists and overall cellml elements (shapes)
    setListofComponentRefs([]);
    setListofComponents([]);
    setListofConnections([]);
    setListofImports([]);
    setListofReset([]);
    setListofUnits([]);
    setListofVariables([]);
    setShapes([]); 
  }

  const change_element = (element_name: string, model_name: string, 
                          element_info: string, element_img: string) => {
    console.log('changed element');
    check_every_field();

    document.getElementById("model_children").style.display = 'none';
    document.getElementById("import_children").style.display = 'none';
    document.getElementById("import_units_children").style.display = 'none';
    document.getElementById("import_component_children").style.display = 'none';
    document.getElementById("units_children").style.display = 'none';
    document.getElementById("unit_children").style.display = 'none';
    document.getElementById("component_children").style.display = 'none';
    document.getElementById("variable_children").style.display = 'none';
    document.getElementById("reset_children").style.display = 'none';
    document.getElementById("test_value_children").style.display = 'none';
    document.getElementById("reset_value_children").style.display = 'none';
    document.getElementById("math_children").style.display = 'none';
    document.getElementById("encapsulation_children").style.display = 'none';
    document.getElementById("component_ref_children").style.display = 'none';
    document.getElementById("connection_children").style.display = 'none';
    document.getElementById("map_variables_children").style.display = 'none';
    
    document.getElementById("model_info").style.display = 'none';
    document.getElementById("units_info").style.display = 'none';
    document.getElementById("unit_info").style.display = 'none';
    document.getElementById("component_info").style.display = 'none';
    document.getElementById("variable_info").style.display = 'none';
    document.getElementById("reset_info").style.display = 'none';
    document.getElementById("test_value_info").style.display = 'none';
    document.getElementById("reset_value_info").style.display = 'none';
    document.getElementById("math_info").style.display = 'none';
    document.getElementById("encapsulation_info").style.display = 'none';
    document.getElementById("component_ref_info").style.display = 'none';
    document.getElementById("connection_info").style.display = 'none';
    document.getElementById("map_variables_info").style.display = 'none';
    document.getElementById("import_info").style.display = 'none';
    document.getElementById("import_units_info").style.display = 'none';
    document.getElementById("import_container_info").style.display = 'none';
    
    document.getElementById("drag_component").style.display = 'none';
    document.getElementById("drag_units").style.display = 'none';
    document.getElementById("drag_unit").style.display = 'none';
    document.getElementById("drag_variable").style.display = 'none';
    document.getElementById("drag_reset").style.display = 'none';
    document.getElementById("drag_test_value").style.display = 'none';
    document.getElementById("drag_reset_value").style.display = 'none';
    document.getElementById("drag_math").style.display = 'none';
    document.getElementById("drag_encapsulation").style.display = 'none';
    document.getElementById("drag_comp_ref").style.display = 'none';
    document.getElementById("drag_connection").style.display = 'none';
    document.getElementById("drag_map_variables").style.display = 'none';
    document.getElementById("drag_import").style.display = 'none';
    document.getElementById("drag_import_component").style.display = 'none';
    document.getElementById("drag_import_units").style.display = 'none';
    document.getElementById("drag_model").style.display = 'none';
    
    document.getElementById(element_name).style.display = 'block';                     
    document.getElementById(element_info).style.display = 'block';
    document.getElementById(element_img).style.display = 'block';

    setClickedElement(model_name);
    setCurrentElementImg(element_img);
    go_back_button();
    clear_input();
  }

  const clear_input = () => {
    const u_name = document.getElementById('units_name_input') as HTMLInputElement;
    u_name.value = "";
    const u_units = document.getElementById('units_ref_input') as HTMLInputElement;
    const u_ref   = document.getElementById('unit_ref_input') as HTMLInputElement;
    const u_prefix= document.getElementById('unit_prefix_input') as HTMLInputElement;
    const u_mult  = document.getElementById('unit_multiplier_input') as HTMLInputElement;
    const u_exp   = document.getElementById('unit_exp_input') as HTMLInputElement;
    u_units.value = "";
    u_ref.value   = "";
    u_prefix.value= "1";
    u_mult.value  = "1";
    u_exp.value   = "1";
    const c_name = document.getElementById('comp_name_input') as HTMLInputElement;
    c_name.value = "";
    const v_comp_ref = document.getElementById('var_comp_ref_input') as HTMLInputElement;
    const v_name = document.getElementById('var_name_input') as HTMLInputElement;
    const v_units = document.getElementById('var_units_input') as HTMLInputElement;
    const v_interface = document.getElementById('var_interface_input') as HTMLInputElement;
    const v_init = document.getElementById('var_init_input') as HTMLInputElement;
    v_comp_ref.value = "";
    v_name.value = "";
    v_units.value = "";
    v_interface.value = "none";
    v_init.value = "";
    const r_ref = document.getElementById('reset_comp_ref_input') as HTMLInputElement;
    const r_var = document.getElementById('reset_var_input') as HTMLInputElement;
    const r_test = document.getElementById('reset_test_input') as HTMLInputElement;
    const r_ord = document.getElementById('reset_order_input') as HTMLInputElement;
    r_ref.value = "";
    r_var.value = "";
    r_test.value = "";
    r_ord.value = "";
    const t_ref = document.getElementById('tv_comp_ref') as HTMLInputElement;
    t_ref.value = "";
    const rc_ref = document.getElementById('rv_comp_ref') as HTMLInputElement;
    rc_ref.value = "";
    const c_ref = document.getElementById('math_comp_ref_input') as HTMLInputElement;
    c_ref.value = "";
    const c_refp = document.getElementById('comp_ref_parent_id') as HTMLInputElement;
    c_refp.value = "0";
    const c_refc = document.getElementById('comp_ref_comp_input') as HTMLInputElement;
    c_refc.value = "";
    const c1 = document.getElementById('connect_1_input') as HTMLInputElement;
    c1.value = "";
    const c2 = document.getElementById('connect_2_input') as HTMLInputElement;
    c2.value = "";
    const ref = document.getElementById('map_connect_input') as HTMLInputElement;
    ref.value = "";
    const v1 = document.getElementById('map_var_1_input') as HTMLInputElement;
    v1.value = "";
    const v2 = document.getElementById('map_var_2_input') as HTMLInputElement;
    v2.value = "";
    const href = document.getElementById('import_ref_input') as HTMLInputElement;
    href.value = "";
    const ref2 = document.getElementById('import_parent_reference_u') as HTMLInputElement;
    ref2.value = "";
    const name2 = document.getElementById('import_units_name_input') as HTMLInputElement;
    name2.value = "";
    const units = document.getElementById('import_units_ref_input') as HTMLInputElement;
    units.value = "";
    const ref3 = document.getElementById('import_parent_reference_c') as HTMLInputElement;
    ref3.value = "";
    const name3 = document.getElementById('import_comp_name_input') as HTMLInputElement;
    name3.value = "";
    const comp3 = document.getElementById('import_comp_ref_input') as HTMLInputElement;
    comp3.value = "";          
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK UNITS -------------------------------------
  // ---------------------------------------------------------------------------------
  // Error Checking the names
  function checkUnitsName() {
    const units_name = document.getElementById("units_name_input") as HTMLInputElement;
    const name = units_name.value;
    // loop and look if name is already taken
    let units_name_exists = 0;
    for (let i = 0; i < listofUnits.length; i++) {
      if (listofUnits[i].units_name === name) units_name_exists = 1;
    }
    // check if the string inserted is valid
    if (units_name_exists == 1) {document.getElementById("units_name_input").style.borderColor = "#d64545"; setValidDrop(false)}
    else if (name.match('^[a-zA-Z]+[a-zA-Z0-9_]*$')) {document.getElementById("units_name_input").style.borderColor = "#45d651"; setValidDrop(true)}
    else {document.getElementById("units_name_input").style.borderColor = "#d64545"; setValidDrop(false)}
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK UNIT --------------------------------------
  // ---------------------------------------------------------------------------------
  const checkUnitName = () => {
    const unit_name = document.getElementById("unit_ref_input") as HTMLInputElement;
    const unit = unit_name.value;
    // loop through pre-existing units - if seen mark as 1, AKA invalid
    let si_unit_exists = 0;
    for (let i = 0; i<list_of_inbuilt_units.length; i++) {
      if (list_of_inbuilt_units[i] == unit) {si_unit_exists = 1; console.log('found')}
    }
    // check a list of all units added - if units name is the same as unit
    let units_exists = 0;
    for (let i = 0; i<listofUnits.length; i++) {
      if (listofUnits[i].units_name === unit) units_exists = 1;
    }
    if (si_unit_exists === 1) {document.getElementById("unit_ref_input").style.borderColor = "#45d651"; setValidUnitUnitsDrop(true)}
    else if (units_exists === 1) {document.getElementById("unit_ref_input").style.borderColor = "#45d651"; setValidUnitUnitsDrop(true)} 
    else { document.getElementById("unit_ref_input").style.borderColor = "#d64545"; setValidUnitUnitsDrop(false)}
  }

  const checkUnitRef = () => {
    const units_ref = document.getElementById("units_ref_input") as HTMLInputElement;
    const id = units_ref.value;
    let exists = 0;
    for (let i = 0; i < listofUnits.length; i++) {
      if (listofUnits[i].u_id == id) exists = 1;
    }
    if (exists == 1) {document.getElementById("units_ref_input").style.borderColor = "#45d651"; setValidUnitIDDrop(true)}
    else {document.getElementById("units_ref_input").style.borderColor = "#d64545"; setValidUnitIDDrop(false)}
  }

  const checkUnitMul = () => {
    const mul = document.getElementById("unit_multiplier_input") as HTMLInputElement;
    const value = mul.value;
    // exponent should be an integer or empty as it's optional
    if (value === "") {document.getElementById("unit_multiplier_input").style.borderColor = "#45d651"; setValidUnitMultDrop(true)} 
    else if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) {document.getElementById("unit_multiplier_input").style.borderColor = "#45d651"; setValidUnitMultDrop(true)} 
    else {document.getElementById("unit_multiplier_input").style.borderColor = "#d64545"; setValidUnitMultDrop(false)}
  }

  const checkUnitExp = () => {
    const exp = document.getElementById("unit_exp_input") as HTMLInputElement;
    const value = exp.value;
    // exponent should be an integer or empty as it's optional
    if (value === "") {document.getElementById("unit_exp_input").style.borderColor = "#45d651"; setValidUnitExpDrop(true)} 
    else if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) {	document.getElementById("unit_exp_input").style.borderColor = "#45d651"; setValidUnitExpDrop(true)} 
    else { document.getElementById("unit_exp_input").style.borderColor = "#d64545"; setValidUnitExpDrop(false)}
  }

  const checkUnitPrefix = () => {
    const prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
    const value = prefix.value;
    // check if part of the prefix table
    let si_prefix_exists = 0;
    for (let i = 0; i < list_of_inbuilt_prefix.length; i++) {
      if (list_of_inbuilt_prefix[i] === value) si_prefix_exists = 1;
    }
    // exponent should be an integer or empty as it's optional
    if (value === "") {document.getElementById("unit_prefix_input").style.borderColor = "#45d651"; setValidUnitPrefixDrop(true)} 
    else if (si_prefix_exists === 1) {document.getElementById("unit_prefix_input").style.borderColor = "#45d651"; setValidUnitPrefixDrop(true)} 
    else if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) { document.getElementById("unit_prefix_input").style.borderColor = "#45d651"; setValidUnitPrefixDrop(true)} 
    else { document.getElementById("unit_prefix_input").style.borderColor = "#d64545"; setValidUnitPrefixDrop(false)}
  }

  

  const check_inbuilt_names = () => {
    const unit = document.getElementById("unit_ref_input") as HTMLInputElement;
    const prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
    const multi = document.getElementById("unit_multiplier_input") as HTMLInputElement;
    const expo = document.getElementById("unit_exp_input") as HTMLInputElement;

    switch(unit.value) {
      case "ampere":
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        break;
      case "becquerel": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "second";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "candela": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "coulomb": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "second";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "dimensionless": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "farad": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "-1";
        }
        break;  
      case "gram": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "0.001";
	expo.value = "-1";
        }
        break; 
      case "gray": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "metre";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "2";
        }
        break;  
      case "henry": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "hertz": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "second";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "-1";
        }
        break;
      case "joule": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
        }
        break;
      case "katal": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "second";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "-1";
        }
        break;
      case "kelvin": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
	}
        break;
      case "kilogram": {
         document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
	}
        break;
      case "litre": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "metre";
	prefix.value = "0";
	multi.value = "0.001";
	expo.value = "3";
        }
        break;
      case "lumen": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "candela";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "lux": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "metre";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "-2";
        }
        break;
      case "metre": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
	}
        break;
      case "mole": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
	}
        break;
      case "newton": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "ohm": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "pascal": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "radian": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "dimensionless";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "second": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1.0";
	}
        break;
      case "siemens": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "-1";
        }
        break;
      case "sievert": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "metre";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "2";
        }
        break;
      case "steradian": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "dimensionless";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1"; 
        }
        break;
      case "tesla": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "volt": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "watt": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      case "weber": {
        document.getElementById("unit_ref_input").style.borderColor = "#45d651";
        const base = document.getElementById("unit_base_input") as HTMLInputElement;
        base.value = "kilogram";
	prefix.value = "0";
	multi.value = "1.0";
	expo.value = "1";
        }
        break;
      default:
        //document.getElementById("unit_ref_input").style.borderColor = "#d64545";
    }
  }

  // Check Inbuilt Prefix - Table 3.2: Prefix values
  // changes the prefix if appropriate name
  const check_inbuilt_prefix = () => {
    const unit = document.getElementById("unit_ref_input") as HTMLInputElement;
    const prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
    switch(unit.value) {
	case "yotta": {
		prefix.value = "24";
	}
	break;
	case "zetta": {
		prefix.value = "21";
	}
	break;
	case "exa": {
		prefix.value = "18";
	}
	break;
	case "peta": {
		prefix.value = "15";
	}
	break;
	case "tera": {
		prefix.value = "12";
	}
	break;
	case "giga": {
		prefix.value = "9";
	}
	break;
	case "mega": {
		prefix.value = "6";
	}
	break;
	case "kilo": {
		prefix.value = "3";
	}
	break;
	case "hecto": {
		prefix.value = "2";
	}
	break;
	case "deca": {
		prefix.value = "1";
	}
	break;
	case "deci": {
		prefix.value = "-1";
	}
	break;
	case "centi": {
		prefix.value = "-2";
	}
	break;
	case "milli": {
		prefix.value = "-3";
	}
	break;
	case "micro": {
		prefix.value = "-6";
	}
	break;
	case "nano": {
		prefix.value = "-9";
	}
	break;
	case "pico": {
		prefix.value = "-12";
	}
	break;
	case "femto": {
		prefix.value = "-15";
	}
	break;
	case "atto": {
		prefix.value = "-18";
	}
	break;
	case "zepto": {
		prefix.value = "-21";
	}
	break;
	case "yocto": {
		prefix.value = "-24";
	}
	break;
	default:
    }
  }

  // ---------------------------------------------------------------------------------
  // ---------------------------- CHECK COMPONENT ------------------------------------
  // ---------------------------------------------------------------------------------
  const checkComponentName = () => {
    const comp_name = document.getElementById("comp_name_input") as HTMLInputElement;
    const name = comp_name.value;
    let existing = 0;
    for (let i =0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === name) existing = 1;
    }

    if (existing === 1) {	document.getElementById("comp_name_input").style.borderColor = "#d64545"; setValidCompName(false);} 
    else if (name.match('^[a-zA-Z]+[a-zA-Z0-9_]*$')) { document.getElementById("comp_name_input").style.borderColor = "#45d651"; setValidCompName(true);} 
    else { document.getElementById("comp_name_input").style.borderColor = "#d64545"; setValidCompName(false);}
  }

  // ---------------------------------------------------------------------------------
  // ---------------------------- CHECK VARIABLES ------------------------------------
  // ---------------------------------------------------------------------------------
  const checkVariableCompID = () => {
    const comp_id = document.getElementById("var_comp_ref_input") as HTMLInputElement;
    const id = comp_id.value;
    let id_exists = 0;
    for (let i = 0; i < listofComponents.length; i++) {
      if(listofComponents[i].c_id == id) id_exists = 1;
    }
    // Only if the component id exists in the model
    if (id_exists == 1) { document.getElementById("var_comp_ref_input").style.borderColor = "#45d651"; setValidVarIDDrop(true)}
    else { document.getElementById("var_comp_ref_input").style.borderColor = "#d64545"; setValidVarIDDrop(false)}
  }
  
  const checkVariableName = () => {
    const var_name = document.getElementById("var_name_input") as HTMLInputElement;
    const name = var_name.value;
    let existing = 0;
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].name === name && shapes_[i].element_type == "variable") existing = 1;
    }
    if (existing === 1) { document.getElementById("var_name_input").style.borderColor = "#d64545"; setValidVarNameDrop(false)} 
    else if (name.match('^[a-zA-Z]+[a-zA-Z0-9_]*$')) { document.getElementById("var_name_input").style.borderColor = "#45d651"; setValidVarNameDrop(true)} 
    else { document.getElementById("var_name_input").style.borderColor = "#d64545"; setValidVarNameDrop(false)}
  }

  const checkVariableUnits = () => {
    const var_units = document.getElementById("var_units_input") as HTMLInputElement;
    const units = var_units.value;
    let exists = 0;
    // check if there exists a units in the cellml model
    for (let i =0; i<shapes_.length; i++) {
      if (shapes_[i].units_name == units && shapes_[i].element_type == "units") exists = 1;
    }
    // check the SI units for a valid units reference
    for (let i=0; i<list_of_inbuilt_units.length; i++) {
      if (list_of_inbuilt_units[i] === units) exists = 1;
    }
    if (exists === 1) { document.getElementById("var_units_input").style.borderColor = "#45d651"; setValidVarUnitsDrop(true)} 
    else { document.getElementById("var_units_input").style.borderColor = "#d64545"; setValidVarUnitsDrop(false)}
  }

  const checkVariableInitValue = () => {
    const var_init = document.getElementById("var_init_input") as HTMLInputElement;
    const init = var_init.value;
    let exists = 0;
    for (let i=0; i<shapes_.length; i++) {
        if(shapes_[i].name == init && shapes_[i].element_type == "variable") exists = 1;
    }
    // can be a real number string, or a variable reference & optional so may be empty
    if (exists === 1) { document.getElementById("var_init_input").style.borderColor = "#45d651"; setValidVarInitValueDrop(true)}
    else if (init == "") { document.getElementById("var_init_input").style.borderColor = "#45d651"; setValidVarInitValueDrop(true)}
    else if (init.match(/^[+-]?(\d*\.)?\d+$/) != null) { document.getElementById("var_init_input").style.borderColor = "#45d651"; setValidVarInitValueDrop(true)} 
    else { document.getElementById("var_init_input").style.borderColor = "#d64545"; setValidVarInitValueDrop(false)}
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK MATH --------------------------------------
  // ---------------------------------------------------------------------------------
  const checkMathCompID = () => {
    const c_ref = document.getElementById("math_comp_ref_input") as HTMLInputElement;
    const c_id = c_ref.value;
    let id_exists = 0;
    for (let i = 0; i < listofComponents.length; i++) {
      if(listofComponents[i].c_id == c_id) id_exists = 1;
    }
    // Only if the component id exists in the model
    if (id_exists == 1) { document.getElementById("math_comp_ref_input").style.borderColor = "#45d651"; setValidMathIDDrop(true)}
    else { document.getElementById("math_comp_ref_input").style.borderColor = "#d64545"; setValidMathIDDrop(false)}
  }
  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK RESET -------------------------------------
  // ---------------------------------------------------------------------------------
  const checkResetRef = () => {
    const var_ref = document.getElementById("reset_comp_ref_input") as HTMLInputElement;
    const id = var_ref.value;
    let id_exists = 0;
    for (let i = 0; i < listofComponents.length; i++) {
      if(listofComponents[i].c_id == id) id_exists = 1;
    }
    // Only if the component id exists in the model
    if (id_exists == 1) { document.getElementById("reset_comp_ref_input").style.borderColor = "#45d651"; setValidResetIDDrop(true)}
    else { document.getElementById("reset_comp_ref_input").style.borderColor = "#d64545"; setValidResetIDDrop(false)}
  }

  const checkResetVar = () => {
    const var_reset = document.getElementById("reset_var_input") as HTMLInputElement;
    const variable = var_reset.value;
    let exists = 0;
    for (let i =0; i < shapes_.length; i++) {
      if (shapes_[i].name === variable && shapes_[i].element_type == "variable") exists = 1;
    }
    if (exists === 1) {	document.getElementById("reset_var_input").style.borderColor = "#45d651"; setValidResetVarDrop(true)} 
    else { document.getElementById("reset_var_input").style.borderColor = "#d64545"; setValidResetVarDrop(false)}
  }

  const checkResetTest = () => {
    const test_reset = document.getElementById("reset_test_input") as HTMLInputElement;
    const variable = test_reset.value;
    let exists = 0;
    for (let i =0; i < shapes_.length; i++) {
      if (shapes_[i].name === variable && shapes_[i].element_type == "variable") exists = 1;
    }
    if (exists === 1) {	document.getElementById("reset_test_input").style.borderColor = "#45d651"; setValidResetTestDrop(true)} 
    else { document.getElementById("reset_test_input").style.borderColor = "#d64545"; setValidResetTestDrop(false)}
  }

  const checkResetOrder = () => {
    const ord_reset = document.getElementById("reset_order_input") as HTMLInputElement;
    const order = ord_reset.value;
    let exists = 0;
    for (let i = 0; i < listofReset.length; i++) {
      if (listofReset[i].order == order) exists = 1; 
    }
    if (exists == 1) { document.getElementById("reset_order_input").style.borderColor = "#d64545"; } 
    else if (ord_reset.value.match(/^[+-]?(\d*\.)?\d+$/) != null) { document.getElementById("reset_order_input").style.borderColor = "#45d651"; setValidResetOrderDrop(true)} 
    else { document.getElementById("reset_order_input").style.borderColor = "#d64545"; setValidResetOrderDrop(false)}
  }

  const checkResetParent = (input_string: string) => {
    const reset_parent = document.getElementById(input_string) as HTMLInputElement;
    const parent = reset_parent.value;

    let exists = 0;
    for (let i = 0; i < listofReset.length; i++) {
      if (listofReset[i].r_id == parent) exists = 1;
    }
    if (exists == 1) {document.getElementById(input_string).style.borderColor = "#45d651"; setValidTestValueIDDrop(true); setValidResetValueIDDrop(true)}
    else {document.getElementById(input_string).style.borderColor = "#d64545"; setValidTestValueIDDrop(false); setValidResetValueIDDrop(false)}

  }
  // ---------------------------------------------------------------------------------
  // ------------------------- CHECK COMPONENT REFERENCE -----------------------------
  // ---------------------------------------------------------------------------------
  const checkCompRefComp = () => {
    const component = document.getElementById("comp_ref_comp_input") as HTMLInputElement;
    let exists = 0;
    for (let i=0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === component.value) exists = 1;
    }
    if (exists ===1) {
      document.getElementById("comp_ref_comp_input").style.borderColor = "#45d651"; setValidCompRefCompDrop(true);
    } else {
      document.getElementById("comp_ref_comp_input").style.borderColor = "#d64545"; setValidCompRefCompDrop(false);
    }
  }

  const checkCompRefID = () => {
    const comp_ref_id = document.getElementById("comp_ref_parent_id") as HTMLInputElement;
    const parent = comp_ref_id.value;

    let exists = 0;
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "encapsulation" && parent == "1") exists = 1;
      if (shapes_[i].element_type == "component_ref" && shapes_[i].c_id == parent) exists = 1;
    }

    if (exists === 1) {
      document.getElementById("comp_ref_parent_id").style.borderColor = "#45d651"; setValidCompRefParentIDDrop(true);
    } else {
      document.getElementById("comp_ref_parent_id").style.borderColor = "#d64545"; setValidCompRefParentIDDrop(false);
    }
  }

  // ---------------------------------------------------------------------------------
  // ---------------------------- CONNECTION REFERENCE -------------------------------
  // ---------------------------------------------------------------------------------
  const checkConnectionComp = () => {

    const con1 = document.getElementById("connect_1_input") as HTMLInputElement;
    const con2 = document.getElementById("connect_2_input") as HTMLInputElement;
    let c1_exists = 0;
    let c2_exists = 0;
    for (let i=0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === con1.value) c1_exists = 1;
      if (listofComponents[i].name === con2.value) c2_exists = 1;
    }
    if (c1_exists === 1) {
      document.getElementById("connect_1_input").style.borderColor = "#45d651";
      setValidConnectionComp1Drop(true);
    }
    if (c2_exists === 1) {
      document.getElementById("connect_2_input").style.borderColor = "#45d651";
      setValidConnectionComp2Drop(true);
    }
    if (con1.value === con2.value) {
      document.getElementById("connect_1_input").style.borderColor = "#d64545";
      document.getElementById("connect_2_input").style.borderColor = "#d64545";
      setValidConnectionComp1Drop(false);
      setValidConnectionComp2Drop(false);
    } 
    if (c1_exists === 0) {document.getElementById("connect_1_input").style.borderColor = "#d64545"; setValidConnectionComp1Drop(false)}
    if (c2_exists === 0) {document.getElementById("connect_2_input").style.borderColor = "#d64545"; setValidConnectionComp2Drop(false);}
  }

  // ---------------------------------------------------------------------------------
  // -------------------------------- MAP VARIABLES ----------------------------------
  // ---------------------------------------------------------------------------------
  const checkMapVariablesVar = ()  => {
    const var1 = document.getElementById("map_var_1_input") as HTMLInputElement;
    const var2 = document.getElementById("map_var_2_input") as HTMLInputElement;
    let v1_exists = 0;
    let v2_exists = 0;
    for (let i =0; i<shapes_.length; i++) {
      if (shapes_[i].name === var1.value) v1_exists = 1;
      if (shapes_[i].name === var2.value) v2_exists = 1;
    }
    if (v1_exists === 1) {document.getElementById("map_var_1_input").style.borderColor = "#45d651"; setValidMapVariable1Drop(true)}
    if (v2_exists === 1) {document.getElementById("map_var_2_input").style.borderColor = "#45d651"; setValidMapVariable2Drop(true)}
    if (var1.value === var2.value) {
      document.getElementById("map_var_1_input").style.borderColor = "#d64545";
      document.getElementById("map_var_2_input").style.borderColor = "#d64545";
      setValidMapVariable1Drop(false);
      setValidMapVariable2Drop(false);
    } 
    if (v1_exists === 0) {document.getElementById("map_var_1_input").style.borderColor = "#d64545"; setValidMapVariable1Drop(false);}
    if (v2_exists === 0) {document.getElementById("map_var_2_input").style.borderColor = "#d64545"; setValidMapVariable1Drop(false);}
  }

  const checkMapVariableRefID = () => {
    const connection_ref = document.getElementById("map_connect_input") as HTMLInputElement;
    const id = connection_ref.value;
    let exists = 0;
    for (let i = 0; i < listofConnections.length; i++) {
      if (listofConnections[i].c_id == id) exists = 1;
    }
    if (id == "") {document.getElementById("map_connect_input").style.borderColor = "#d64545";setValidMathIDDrop(false)}
    if (exists == 1) {document.getElementById("map_connect_input").style.borderColor = "#45d651"; setValidMathIDDrop(true)}
    else {document.getElementById("map_connect_input").style.borderColor = "#d64545";setValidMathIDDrop(false)}
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------------ IMPORT -------------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportHREF = () => {
    const href = document.getElementById("import_ref_input") as HTMLInputElement;
    // anything non empty is acceptable 
    if (href.value !== "") {
      document.getElementById("import_ref_input").style.borderColor = "#45d651"; setValidHrefDrop(true);
    } else {
      document.getElementById("import_ref_input").style.borderColor = "#d64545"; setValidHrefDrop(false);
    }
  }

  const checkImportUnitsImportRef = (import_parent: string) => {
    const imprt_ref = document.getElementById(import_parent) as HTMLInputElement;
    const id = imprt_ref.value;

    let exists = 0;
    for (let i = 0; i < listofImports.length; i++) {
      if (listofImports[i].i_id == id) exists = 1;
    }

    if (exists === 1) {	document.getElementById(import_parent).style.borderColor = "#45d651"; setValidImportCompImpIDDrop(true); setValidImportUnitsImpIDDrop(true)} 
    else { document.getElementById(import_parent).style.borderColor = "#d64545"; setValidImportCompImpIDDrop(false); setValidImportUnitsImpIDDrop(false)}

  }
  // ---------------------------------------------------------------------------------
  // --------------------------------- IMPORT UNITS ----------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportUnitsName = () => {
    const name = document.getElementById("import_units_name_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofUnits.length; i++) {
      if (listofUnits[i].units_name === name.value) exists = 1;
    }
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "import_units" && shapes_[i].name == name.value) exists = 1;
    }

    console.log(exists)

    if (exists == 1) {document.getElementById("import_units_name_input").style.borderColor = "#d64545";}
    else if (name.value.match('^[a-zA-Z]+[a-zA-Z0-9_]*$')) {document.getElementById("import_units_name_input").style.borderColor = "#45d651"; setValidImportUnitsNameDrop(true)}
    else { document.getElementById("import_units_name_input").style.borderColor = "#d64545"; setValidImportUnitsNameDrop(false)}
  }
  
  const checkImportUnitsRef = () => {
    const ref = document.getElementById("import_units_ref_input") as HTMLInputElement;
    const u_ref = ref.value;
    let exists = 0;
    // if the referred units exists link up
    for (let i =0; i<listofUnits.length; i++) {
      if (listofUnits[i].units_name === u_ref) {exists = 1}
    }
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "import_units" && shapes_[i].name == u_ref) exists = 1;
    }
    if (u_ref != "") {	document.getElementById("import_units_ref_input").style.borderColor = "#45d651"; setValidImportUnitsRefDrop(true)} 
    else { document.getElementById("import_units_ref_input").style.borderColor = "#d64545"; setValidImportUnitsRefDrop(false)}
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------ IMPORT COMPONENTS --------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportCompName = () => {
    const name = document.getElementById("import_comp_name_input") as HTMLInputElement;
    let exists = 0;
    // check the model for other components
    for (let i =0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === name.value) exists = 1;
    }
    // check imported
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "import_component" && shapes_[i].name == name.value) exists = 1;
    }
    if (exists === 1) {	document.getElementById("import_comp_name_input").style.borderColor = "#d64545"; } 
    else if (name.value.match('^[a-zA-Z]+[a-zA-Z0-9_]*$')) { document.getElementById("import_comp_name_input").style.borderColor = "#45d651"; setValidImportCompNameDrop(true)} 
    else { document.getElementById("import_comp_name_input").style.borderColor = "#d64545"; setValidImportCompNameDrop(false)}
  }

  const checkImportCompRef = () => {
    const name = document.getElementById("import_comp_ref_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === name.value) exists = 1;
    }
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "import_component" && shapes_[i].name == name.value) exists = 1;
    }
    // hard coded: replace later with the imported list
    if (name.value != "") {	document.getElementById("import_comp_ref_input").style.borderColor = "#45d651"; setValidImportCompRefDrop(true)} 
    else { document.getElementById("import_comp_ref_input").style.borderColor = "#d64545"; setValidImportCompRefDrop(false)}
  }


  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // After the user is happy with what they have created they can generate the model
  const convert_to_text_model = () => {
    // first line of a cellml model
    const xml_version = `<?xml version="1.0" encoding="UTF-8"?>`;
    const new_line = "\n";
    const tab = "\t";
 
    const model_name_input = document.getElementById("insert_name_box") as HTMLInputElement;
    const model_name = model_name_input.value;    

    const model = `<model xmlns="http://www.cellml.org/cellml/2.0#" name="` + model_name + `">`;
    const model_end = `</model>`;

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // IMPORT & CHILDREN (IMPORT COMPONENT | IMPORT UNITS)
    const list_of_imports = [];
    for (let i = 0; i < listofImports.length; i++) {
      let has_children = 0;
      for (let j = 0; j < shapes_.length; j++) {
        if (listofImports[i].i_id == shapes_[j].import_parent && 
            (shapes_[j].element_type == "import_units" || shapes_[j].element_type == "import_component")) {
          has_children = 1;
          console.log(shapes_[j]); 
          console.log(listofImports[i]);
        } 
      }
      if (has_children == 0) list_of_imports.push(tab + `<import xlink:href="` + listofImports[i].href + `"/>` + new_line);
      else {
        let import_string = tab + `<import xlink:href="` + listofImports[i].href + `">`;

        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].import_parent == listofImports[i].i_id && shapes_[j].element_type == "import_units") {
            import_string += new_line + tab + tab;
            import_string += `<units units_ref="` + shapes_[j].name + `" name="` + shapes_[j].untis_ref + `"/>`
          }
          else if (shapes_[j].import_parent == listofImports[i].i_id && shapes_[j].element_type == "import_component") {
            import_string += new_line + tab + tab;
            import_string += `<component component_ref="` + shapes_[j].comp_ref + `" name="` + shapes_[j].name + `"/>`
          } 
        }
        import_string += new_line + tab + `</import>` + new_line;
        list_of_imports.push(import_string);

      }
    }

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // UNITS & CHILDREN (UNIT)
    const list_of_units = [];
    for (let i = 0; i < listofUnits.length; i++) {
      let has_children = 0;
      for (let j = 0; j < shapes_.length; j++) {
        if (listofUnits[i].u_id == shapes_[j].units_parent && shapes_[j].element_type == "unit") { 
          has_children = 1; 
          console.log(shapes_[j]); 
          console.log(listofUnits[i])
        } 
      }
      // check if single line element or has children
      if (has_children == 0) list_of_units.push(tab + `<units name="` + listofUnits[i].units_name + `"/>` + new_line);
      else {
        let units_string = tab + `<units name="` + listofUnits[i].units_name + `">`;
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].units_parent == listofUnits[i].u_id && shapes_[j].element_type == "unit") {
            units_string += new_line + tab + tab;
            units_string += `<unit units="` + shapes_[j].units + `" `;
            if (shapes_[j].multiplier != "") units_string += `multiplier="`+ shapes_[j].multiplier + `" `;
            if (shapes_[j].prefix     != "") units_string += `prefix="`    + shapes_[j].prefix + `" `;
            if (shapes_[j].exponent   != "") units_string += `exponent="`  + shapes_[j].exponent + `" `;
            units_string += `/>`;
          }
        }
        units_string += new_line + tab + `</units>` + new_line;
        list_of_units.push(units_string);
      }
    }

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // COMPONENT & CHILDREN (VARIABLE | MATH | RESET)
    const list_of_components = [];
    for (let i = 0; i < listofComponents.length; i++) {
      let has_children = 0;

      for (let j = 0; j < shapes_.length; j++) {
        if (shapes_[j].comp_parent == listofComponents[i].c_id && (shapes_[j].element_type == "variable" || 
            shapes_[j].element_type == "math" || shapes_[j].element_type == "reset")) {
          has_children = 1;
        }
        if (shapes_[j].element_type == "reset") console.log(shapes_[j]);
      }
      // if there is no children then it can be a single line object
      if (has_children == 0) list_of_components.push(tab + `<component name="` + listofComponents[i].name + `"/>` + new_line);
      // if it has children then 
      else {
        let comp_string = tab + `<component name="` + listofComponents[i].name + `">`;
        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].comp_parent == listofComponents[i].c_id && shapes_[j].element_type == "variable") {
            // create variable element string
            comp_string += new_line;
            comp_string += tab + tab;
            comp_string += `<variable name="` + shapes_[j].name + `" `;
            comp_string += `units="` + shapes_[j].units + `" `;
            if (shapes_[j].initial_val != "") comp_string += `initial_value="` + shapes_[j].initial_val +`" `;
            comp_string += `interface="` + shapes_[j].interface + `"`;
            comp_string += `/>`;
          }
          else if (shapes_[j].element_type == "math" && shapes_[j].comp_parent == listofComponents[i].c_id) {
            // create math element string
            comp_string += new_line;
            comp_string += tab + tab;
            comp_string += `<math xmlns="http://www.w3.org/1998/Math/MathML" xmlns:cellml="http://www.cellml.org/cellml/2.0#">`;
            comp_string += new_line;
            comp_string += tab;
            comp_string += tab + `</math>`;
          }
          else if (shapes_[j].comp_parent == listofComponents[i].c_id && shapes_[j].element_type == "reset") {
            // create math element string
            comp_string += new_line + tab + tab;
            comp_string += `<reset variable="` + shapes_[j].variable + `" `;
            comp_string += `test_variable="` + shapes_[j].test_var + `"`;
            if (shapes_[j].order != "") comp_string += ` order="` + shapes_[j].order + `"`;
            comp_string += `>`;

            comp_string += new_line + tab + tab + tab + `<test_value>`;
            comp_string += new_line + tab + tab + tab + `</test_value>`;
            comp_string += new_line + tab + tab + tab + `<reset_value>`;
            comp_string += new_line + tab + tab + tab + `</reset_value>`;
            
            comp_string += new_line + tab + tab + `</reset>`;
          }
        }
        comp_string += new_line + tab + `</component>` + new_line;
        list_of_components.push(comp_string);
      }
    }

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // CONNECTION & CHILDREN (MAP VARIABLES)
    const list_of_connections = [];
    
    for (let i = 0; i < listofConnections.length; i++) {
      let has_children = 0;
      for (let j = 0; j < shapes_.length; j++) {
        if (shapes_[j].conn_parent == listofConnections[i].c_id && shapes_[j].element_type == "map_var") {
          has_children = 1;
        }
        if (shapes_[j].element_type == "map_var") console.log(shapes_[j]);
      }
      if (has_children == 0) list_of_connections.push(tab + `<connection component_1="` + listofConnections[i].component1 + `" component_2="` + listofConnections[i].component2 + `"/>` + new_line);

      else {
        let connection_string = tab + `<connection component_1="` + listofConnections[i].component1 + `" component_2="` + listofConnections[i].component2 + `">`;

        for (let j = 0; j < shapes_.length; j++) {
          if (shapes_[j].conn_parent == listofConnections[i].c_id && shapes_[j].element_type == "map_var") {
            connection_string += new_line + tab + tab;
            connection_string += `<map_variables variable_1="` + shapes_[j].variable1 + `" variable_2="` + shapes_[j].variable2 + `"/>`;
          }
        }
        connection_string += new_line + tab + `</connection>` + new_line;
        list_of_components.push(connection_string);
      }
    }

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // ENCAPSULATION & CHILDREN (COMPONENT REF)
    let encap_string = "";
    let encapsualtion_exists = 0;
    for (let i = 0; i < shapes_.length; i++) {
      if (shapes_[i].element_type == "encapsulation") encapsualtion_exists = 1;
    }
    if (encapsualtion_exists == 1) {
      let has_children = 0;
      for (let i = 0; i < listofComponentRefs.length; i++) {
        if (listofComponentRefs[i].compf_parent == 0) has_children = 1;
      }
      if (has_children == 1) {
        encap_string += tab + `<encapsulation>`;
        for (let i = 0; i < listofComponentRefs.length; i++) {
          // below are the base cases for the component ref
          if (listofComponentRefs[i].compf_parent == "0") {
            encap_string = check_component_ref_string(encap_string, listofComponentRefs[i], 2);
          }
        }
        encap_string += new_line + tab + `</encapsulation>` + new_line;
      }
    }

    // ==================================================================================================
    // ==================================================================================================
    // ==================================================================================================
    // compiling everything together
    let final_model = "";
    final_model += xml_version + new_line;
    final_model += model + new_line;
    for (let i = 0; i < list_of_components.length; i++) {
      final_model += list_of_components[i];
    }
    for (let i = 0; i < list_of_units.length; i++) {
      final_model += list_of_units[i];
    }
    for (let i = 0; i < list_of_imports.length; i++) {
      final_model += list_of_imports[i];
    }
    for (let i = 0; i < list_of_connections.length; i++) {
      final_model += list_of_connections[i];
    }
    final_model += encap_string;
    final_model += model_end;
    console.log(final_model);


    // After creating a model string with appropriate tabbing and line spacing, create a new file
    const textToBLOB = new Blob([final_model], { type: 'text/plain' });
    let name = "";
    (model_name == "") ? name = "cellmlfile" : name = model_name
    const sFileName = name + '.cellml';
    const newLink = document.createElement("a");
    newLink.download = sFileName;

    if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
    }
    else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
        newLink.style.display = "none";
        document.body.appendChild(newLink);
    }

    newLink.click(); 

  }


  // Recursive function to construct the component refs with structure (tabs is depth)
  const check_component_ref_string = (encap_string: string, current_ref: any, deep: number) => {
    let has_children = 0;
    for (let i = 0; i < listofComponentRefs.length; i++) {
      // if there is an elemenet      
      if (listofComponentRefs[i].compf_parent == current_ref.c_id) {
        has_children = 1;
        console.log(current_ref.component + 'has children');
      }
    }

    let tabs = ""
    for (let t = 0; t < deep; t++) tabs += "\t";
    if (has_children == 0) {
      encap_string += "\n" + tabs + `<component_ref component="` + current_ref.component + `"/>`;
      return encap_string;
    } else {
      encap_string += "\n" + tabs + `<component_ref component="` + current_ref.component + `">`;
      for (let i = 0; i < listofComponentRefs.length; i++) {
        if (listofComponentRefs[i].compf_parent == current_ref.c_id) {
          encap_string = check_component_ref_string(encap_string, listofComponentRefs[i], deep + 1);
        }
      }
      encap_string += "\n" + tabs + `</component_ref>`;
      return encap_string;
    }
  }




  const on_hover_show_cellml_restrictions = (input_string: string) => {
    document.getElementById(input_string).style.display = "block";
  }

  const on_leave_close_cellml_restrictions = (input_string: string) => {
    document.getElementById(input_string).style.display = "none";
  }

  // top of page button to check console logs/funcitonality
  /*const debugbutnfunc = () => {
    const temp = modelElements;
    console.log(modelElements[0].ctx);
    modelElements[0].ctx.moveTo(200,200);

    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.height, canvas.width);

    const img = document.getElementById("img1") as HTMLImageElement;
    const x_dir = 200;
    const y_dir = 200;
    modelElements[0].ctx.drawImage(img, x_dir , y_dir);

    console.log('hello');
  }*/





  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  // Delete the currently selected cellml element
  async function delete_element() {
    // get the element to delete
    const element = shapes_[selectedShapeIndex];
    if (element == undefined) return;

    // loop through the individual lists and remove if it exists
    if (element.element_type == "units") {
      setListofUnits(listofUnits.filter(item => item.x != element.x && item.y != element.y));
    }
    else if (element.element_type == "component") {
      setListofComponents(listofComponents.filter(item => item.x != element.x && item.y != element.y));
    }
    else if (element.element_type == "connection") {
      setListofConnections(listofConnections.filter(item => item.x != element.x && item.y != element.y));
    }
    else if (element.element_type == "component_ref") {
      setListofComponentRefs(listofComponentRefs.filter(item => item.x != element.x && item.y != element.y));
    }
    else if (element.element_type == "import") {
      setListofImports(listofImports.filter(item => item.x != element.x && item.y != element.y));
    }
    else if (element.element_type == "reset") {
      setListofReset(listofReset.filter(item => item.x != element.x && item.y != element.y));
    }

    // loop through and add every element besides current element
    const deleted_shape_list = [];
    for (let i = 0; i < shapes_.length; i++) {
      if (i != selectedShapeIndex) deleted_shape_list.push(shapes_[i]);
    }
    setShapes(shapes_.filter(item => item.x != element.x && item.y != element.y));
    drawAll();
  }

  useEffect(() => {
    console.log('test if instant deletion');
    drawAll();
  }, [shapes_]);

  // Update the current cellml elemenet information
  const edit_element = () => {
    // If there is a valid element selected
    const element = shapes_[selectedShapeIndex];
    if (element == undefined) return;
    console.log('Edit element: ');
    console.log(element);
    
    if (element.element_type == "units") {
      const units_name = document.getElementById("units_name_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].units_name = units_name.value;
      for (let i = 0; i < listofUnits.length; i ++) {
        if (listofUnits[i].x == element.x && listofUnits[i].y == element.y) listofUnits[i].units_name = units_name.value;
      }
    }
    else if (element.element_type == "unit") {
      const unit_id     = document.getElementById("units_ref_input") as HTMLInputElement;
      const units       = document.getElementById("unit_ref_input") as HTMLInputElement;
      const unit_prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
      const unit_mult   = document.getElementById("unit_multiplier_input") as HTMLInputElement;
      const unit_exp    = document.getElementById("unit_exp_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].units_parent = unit_id.value;
      shapes_[selectedShapeIndex].units        = units.value;
      shapes_[selectedShapeIndex].prefix       = unit_prefix.value;
      shapes_[selectedShapeIndex].multiplier   = unit_mult.value;
      shapes_[selectedShapeIndex].exponent     = unit_exp.value;
    }
    else if (element.element_type == "component") {
      const comp_name = document.getElementById("comp_name_input") as HTMLInputElement;
      const temp_shapes = shapes_;
      temp_shapes[selectedShapeIndex].name = comp_name.value;
      setShapes(temp_shapes);
    }
    else if (element.element_type == "variable") {
      const comp_ref    = document.getElementById("var_comp_ref_input") as HTMLInputElement;
      const v_name      = document.getElementById("var_name_input") as HTMLInputElement;
      const v_units     = document.getElementById("var_units_input") as HTMLInputElement;
      const v_interface = document.getElementById("var_interface_input") as HTMLInputElement;
      const v_init      = document.getElementById("var_init_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].comp_parent = comp_ref.value;
      shapes_[selectedShapeIndex].name        = v_name.value;
      shapes_[selectedShapeIndex].units       = v_units.value;
      shapes_[selectedShapeIndex].interface   = v_interface.value;
      shapes_[selectedShapeIndex].initial_val = v_init.value;
    }
    else if (element.element_type == "reset") {
      const comp_ref = document.getElementById("reset_comp_ref_input") as HTMLInputElement;
      const r_var    = document.getElementById("reset_var_input") as HTMLInputElement;
      const r_test   = document.getElementById("reset_test_input") as HTMLInputElement;
      const r_order  = document.getElementById("reset_order_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].comp_parent = comp_ref.value;
      shapes_[selectedShapeIndex].name        = r_var.value;
      shapes_[selectedShapeIndex].units       = r_test.value;
      shapes_[selectedShapeIndex].interface   = r_order.value;
    }
    else if (element.element_type == "test_val") {
      const t_ref = document.getElementById("tv_comp_ref") as HTMLInputElement;
      shapes_[selectedShapeIndex].comp_parent = t_ref.value;
    }
    else if (element.element_type == "reset_val") {
      const r_ref = document.getElementById("rv_comp_ref") as HTMLInputElement;
      shapes_[selectedShapeIndex].comp_parent = r_ref.value;
    }
    else if (element.element_type == "math") {
      const m_ref = document.getElementById("math_comp_ref_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].comp_parent = m_ref.value;
    }
    else if (element.element_type == "component_ref") {
      const cr_id  = document.getElementById("comp_ref_parent_id") as HTMLInputElement;
      const cr_ref = document.getElementById("comp_ref_comp_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].compf_parent = cr_id.value;
      shapes_[selectedShapeIndex].component    = cr_ref.value;
    }
    else if (element.element_type == "connection") {
      const conn_1 = document.getElementById("connect_1_input") as HTMLInputElement;
      const conn_2 = document.getElementById("connect_2_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].component1 = conn_1.value;
      shapes_[selectedShapeIndex].component2 = conn_2.value;
    }
    else if (element.element_type == "map_var") {
      const m_conn = document.getElementById("map_connect_input") as HTMLInputElement;
      const m_var1 = document.getElementById("map_var_1_input") as HTMLInputElement;
      const m_var2 = document.getElementById("map_var_2_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].conn_parent = m_conn.value;
      shapes_[selectedShapeIndex].variable1   = m_var1.value;
      shapes_[selectedShapeIndex].variable2   = m_var2.value;
    }
    else if (element.element_type == "import") {
      const import_href = document.getElementById("import_ref_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].href = import_href.value;
    }
    else if (element.element_type == "import_units") {
      const i_import_ref = document.getElementById("import_parent_reference_u") as HTMLInputElement;
      const i_name       = document.getElementById("import_units_name_input") as HTMLInputElement;
      const i_units_ref   = document.getElementById("import_units_ref_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].import_parent = i_import_ref.value;
      shapes_[selectedShapeIndex].name          = i_name.value;
      shapes_[selectedShapeIndex].units_ref     = i_units_ref.value;      
    }
    else if (element.element_type == "import_component") {
      const i_import_ref = document.getElementById("import_parent_reference_c") as HTMLInputElement;
      const i_name       = document.getElementById("import_comp_name_input") as HTMLInputElement;
      const i_comp_ref   = document.getElementById("import_comp_ref_input") as HTMLInputElement;
      shapes_[selectedShapeIndex].import_parent = i_import_ref.value;
      shapes_[selectedShapeIndex].name          = i_name.value;
      shapes_[selectedShapeIndex].comp_ref      = i_comp_ref.value;
    }
    drawAll();
  }  


  const go_back_button = () => {
    console.log(clickedElement);
    console.log('went back');

    const temp = document.getElementById("example_back_button");
    temp.style.display = "none";
    const children = document.getElementById('element_children_block');
    children.style.display = "block";
    const model = document.getElementById('model_information_section');
    model.style.display = "block";
    const edit_btns = document.getElementById('cellml_element_btn_container');
    edit_btns.style.display = "block";
    const arrow = document.getElementById('arrowsizeforexample');
    arrow.style.display = "block";
    arrow.style.float ="right";
    const code0 = document.getElementById('encapsulate_example_code');
    code0.style.display = "none";
    const code = document.getElementById('connection_example_code');
    code.style.display = "none";
    const code2 = document.getElementById('units_example_code');
    code2.style.display = "none";
    const code3 = document.getElementById('reset_example_code');
    code3.style.display = "none";
    const code4 = document.getElementById('comp_example_code');
    code4.style.display = "none";
    const code5 = document.getElementById('import_example_code');
    code5.style.display = "none";
    const code6 = document.getElementById('model_example_code');
    code6.style.display = "none";
  }

  const change_to_example_view = () => {
    console.log('change to example view');
    console.log(clickedElement);


    const temp = document.getElementById("example_back_button");
    temp.style.display = "block";
    const children = document.getElementById('element_children_block');
    children.style.display = "none";
    const model = document.getElementById('model_information_section');
    model.style.display = "none";
    const edit_btns = document.getElementById('cellml_element_btn_container');
    edit_btns.style.display = "none";
    const arrow = document.getElementById('arrowsizeforexample');
    arrow.style.display = "none";
    
    if (clickedElement == "Connection" || clickedElement == "Map Variables") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "block";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    } else if (clickedElement == "Units" || clickedElement == "Unit") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "block";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    } else if (clickedElement == "Component" || clickedElement == "Variable") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "block";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    } 
    else if (clickedElement == "Reset Value" || clickedElement == "Test Value" || clickedElement == "Reset" || clickedElement == "Math") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "block";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    }
    else if (clickedElement == "Encapsulation" || clickedElement == "Component Reference") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "block";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    } else if (clickedElement == "Import" || clickedElement == "Import Units" || clickedElement == "Import Component") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "block";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "none";
    } else if (clickedElement == "Model") {
      const code0 = document.getElementById('encapsulate_example_code');
      code0.style.display = "none";
      const code = document.getElementById('connection_example_code');
      code.style.display = "none";
      const code2 = document.getElementById('units_example_code');
      code2.style.display = "none";
      const code3 = document.getElementById('reset_example_code');
      code3.style.display = "none";
      const code4 = document.getElementById('comp_example_code');
      code4.style.display = "none";
      const code5 = document.getElementById('import_example_code');
      code5.style.display = "none";
      const code6 = document.getElementById('model_example_code');
      code6.style.display = "block";
    }
    
  }


  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // The create image section: returning the whole section
  return (
    <div
    className={`container ${props.hidden ? "hidden" : ""}`}>
      <link href="https://emoji-css.afeld.me/emoji.css" rel="stylesheet"></link>
      <div>
        {/* ============================ Model name section =========================== */}
        <div className="tooltip-wrap">
          <label id="create_model_title" htmlFor="insert_name_box"> NEW MODEL: </label>
          <input id="insert_name_box" type="text" placeholder='model_name' onKeyUp={checkValidName}/>
          <div className="tooltip-content">
            <p>
              <b>Valid Model Name: </b> 
              alphabetical (a-z | A-Z) first, 
              followed by alphanumeric or underscores (a-z | A-Z | 1-9 | _)
            </p>
          </div> 
        </div>
        {/* ========================= Generate and Post buttons ======================== */}
        <div>
          <button className="modelbuttons" onClick={restartCanvas}>Restart Model <img id="model_refresh_img" src={refresh_img_string}/> </button>
          <button className="modelbuttons generatemodel" onClick={convert_to_text_model}>Generate Model ✔️</button>
        </div>
         {/* ========================= Just some styling padding ======================== */}
        <div className="model_padding"> </div>
         {/* ========================= The Canvas and Element Container ======================== */}        
        <div id="canvas_and_model_container">
          <canvas id="graphCanvas" height="500" width="1000" 
                  onDrop={dropElem} onDragOver={allowDrop} 
                  onMouseDown={(event)=>handleMouseDown(event)}
                  onMouseOut={(event)=>handleMouseOut(event)} 
                  onMouseUp={(event)=>handleMouseUp(event)}  
                  onMouseMove={(event)=>handleMouseMove(event)}></canvas>
                  
          <div id="element_info">
            <div id="current_cellml_element_name">{clickedElement} </div>
          <div id="model_information_section">
            
            <div id="model_info" className="elem_info">
              Model Name: {modelname}
            </div>

            <div id="element_drag_img">

              <img id="drag_component" className="element_img" 
                 src="https://i.imgur.com/mQJ9btp.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_units" className="element_img" 
                 src="https://i.imgur.com/knSsOjz.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_unit" className="element_img" 
                 src="https://i.imgur.com/CZZxCSc.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_variable" className="element_img" 
                 src="https://i.imgur.com/UOaalhF.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_reset" className="element_img" 
                 src="https://i.imgur.com/N8yCmOx.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_test_value" className="element_img" 
                 src="https://i.imgur.com/I19zwvu.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_reset_value" className="element_img" 
                 src="https://i.imgur.com/s11N2VD.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_math" className="element_img" 
                 src="https://i.imgur.com/UtPNPLH.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_encapsulation" className="element_img" 
                 src="https://i.imgur.com/HiSWon1.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_comp_ref" className="element_img" 
                 src="https://i.imgur.com/5H9sHhw.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_connection" className="element_img" 
                 src="https://i.imgur.com/ptHOCqp.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_map_variables" className="element_img" 
                 src="https://i.imgur.com/T13MxYS.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_import" className="element_img" 
                 src="https://i.imgur.com/YPNhhi2.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_import_units" className="element_img" 
                 src="https://i.imgur.com/iKJCCXI.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_import_component" className="element_img" 
                 src="https://i.imgur.com/uNnCsVZ.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_model" className="element_img" 
                 src="https://i.imgur.com/R9a7Awr.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
            </div>



            {/* === UNITS === */}
            <div id="units_info" className="elem_info">
              <div> Name: 
                <input id="units_name_input" className="elem_info_input" placeholder="units name" onKeyUp={checkUnitsName} 
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_units_name")} onMouseOut={() => on_leave_close_cellml_restrictions("cellml_units_name")}></input>
                <div id="cellml_units_name" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a unique name in the model</li>
                    <li>Can't be a name of built-in units</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === UNIT === */}
            <div id="unit_info" className="elem_info">
              <div> 
                <div> Units Parent ID:
                <input id="units_ref_input" className="elem_info_input" placeholder="units id" onKeyUp={checkUnitRef}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_unit_ref")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_unit_ref")}></input>
                <div id="cellml_unit_ref" className="cellml_restrictions">
                  Is an ID number to connect this unit with parent units element.
                </div>
              </div>
              <div> Units: 
                <input id="unit_ref_input" className="elem_info_input" list="different_si_units" placeholder="type of unit" onKeyUp={checkUnitName} 
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_unit_name")} onMouseOut={() => on_leave_close_cellml_restrictions("cellml_unit_name")}></input>
                <datalist id="different_si_units">
                  <option>ampere</option>
                  <option>becquerel</option>
                  <option>candela</option>
                  <option>dimensionless</option>
                  <option>farad</option>
                  <option>gram</option>
                  <option>gray</option>
                  <option>henry</option>
                  <option>hertz</option>
                  <option>joule</option>
                  <option>katal</option>
                  <option>kelvin</option>
                  <option>kilogram</option>
                  <option>litre</option>
                  <option>lumen</option>
                  <option>lux</option>
                  <option>metre</option>
                  <option>mole</option>
                  <option>newton</option>
                  <option>ohm</option>
                  <option>pascal</option>
                  <option>radian</option>
                  <option>second</option>
                  <option>siemens</option>
                  <option>sievert</option>
                  <option>steradian</option>
                  <option>tesla</option>
                  <option>volt</option>
                  <option>watt</option>
                  <option>weber</option>
                </datalist>
                <div id="cellml_unit_name" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a name of a units element in the model</li>
                    <li>Unit may be any built in unit element</li>
                  </ul>
                </div>
              </div>
              </div>

              <div> Prefix*:
                <input id="unit_prefix_input" className="elem_info_input" placeholder="" defaultValue="" onKeyUp={checkUnitPrefix} list="different_si_prefix"
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_unit_prefix")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_unit_prefix")}></input>
                <datalist id="different_si_prefix">
                  <option>yotta</option>
                  <option>zetta</option>
                  <option>exa</option>
                  <option>peta</option>
                  <option>tera</option>
                  <option>giga</option>
                  <option>mega</option>
                  <option>kilo</option>
                  <option>hecto</option>
                  <option>deca</option>
                  <option>deci</option>
                  <option>centi</option>
                  <option>milli</option>
                  <option>micro</option>
                  <option>nano</option>
                  <option>pico</option>
                  <option>femto</option>
                  <option>atto</option>
                  <option>zepto</option>
                  <option>yocto</option>
                </datalist>
                <div id="cellml_unit_prefix" className="cellml_restrictions">
                  <ul>
                    <li>Can be a real integer number </li>
                    <li>Can be a string of a pre existing prefix value</li>
                    <li>This field is optional (deafults to 1)</li>
                  </ul>
                </div>
              </div>

              <div> Multiplier*:
                <input id="unit_multiplier_input" className="elem_info_input" placeholder="" defaultValue="" onKeyUp={checkUnitMul}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_unit_mult")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_unit_mult")}></input>
                <div id="cellml_unit_mult" className="cellml_restrictions">
                  <ul>
                    <li>Must be a real integer number </li>
                    <li>Decimal is also a valid type</li>
                    <li>This field is optional (deafults to 1)</li>
                  </ul>
                </div>
              </div>

              <div> Exponent*:
                <input id="unit_exp_input" className="elem_info_input" placeholder="" defaultValue="" onKeyUp={checkUnitExp}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_unit_exp")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_unit_exp")}></input>
                <div id="cellml_unit_exp" className="cellml_restrictions">
                  <ul>
                    <li>Must be a real integer number </li>
                    <li>Decimal is also a valid type</li>
                    <li>This field is optional (deafults to 1)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* === COMPONENT === */}
            <div id="component_info" className="elem_info">
              <div> Name: 
                <input id="comp_name_input" className="elem_info_input" placeholder="comp name" onKeyUp={checkComponentName}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_component_name")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_component_name")}></input>
                <div id="cellml_component_name" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a unique name in the cellml model</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === VARIABLE === */}
            <div id="variable_info" className="elem_info">
              
              <div> Component Parent ID: 
                <input id="var_comp_ref_input" className="elem_info_input" placeholder="ID of component" onKeyUp={checkVariableCompID}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_ref")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_ref")}></input>
                <div id="cellml_var_ref" className="cellml_restrictions">
                  Is the component reference to connect this variable with a component, determine by the component ID
                </div>
              </div>

              <div> Name: 
                <input id="var_name_input" className="elem_info_input" placeholder="var_name" onKeyUp={checkVariableName}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_name")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_name")}></input>
                <div id="cellml_var_name" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a unique name in the cellml model</li>
                  </ul>
                </div>
              </div>

              <div> Units:
                <input id="var_units_input" className="elem_info_input" list="different_si_units" placeholder="units" onKeyUp={checkVariableUnits}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_units")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_units")}></input>
                <datalist id="different_si_units">
                  <option>ampere</option>
                  <option>becquerel</option>
                  <option>candela</option>
                  <option>dimensionless</option>
                  <option>farad</option>
                  <option>gram</option>
                  <option>gray</option>
                  <option>henry</option>
                  <option>hertz</option>
                  <option>joule</option>
                  <option>katal</option>
                  <option>kelvin</option>
                  <option>kilogram</option>
                  <option>litre</option>
                  <option>lumen</option>
                  <option>lux</option>
                  <option>metre</option>
                  <option>mole</option>
                  <option>newton</option>
                  <option>ohm</option>
                  <option>pascal</option>
                  <option>radian</option>
                  <option>second</option>
                  <option>siemens</option>
                  <option>sievert</option>
                  <option>steradian</option>
                  <option>tesla</option>
                  <option>volt</option>
                  <option>watt</option>
                  <option>weber</option>
                </datalist>
                <div id="cellml_var_units" className="cellml_restrictions">
                    <ul>
                      <li>Must be a valid units element reference</li>
                      <li>If you don't desire a unit then use 'dimensionless'</li>
                    </ul>
                </div>
              </div>

              <div> Interface:
                <select id="var_interface_input" className="elem_info_input" placeholder="none" defaultValue="none">
                  <option value="public">Public (+)</option>
                  <option value="private">Private (-)</option>
                  <option value="public_and_private">Public & Private (X)</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div> Initial_Value (*):
                <input id="var_init_input" className="elem_info_input" placeholder="initial value" onKeyUp={checkVariableInitValue}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_init")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_init")}></input>
                <div id="cellml_var_init" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid integer or valid variable reference</li>
                    <li>Is an optional field</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === RESET === */}
            <div id="reset_info" className="elem_info">
              <div> Component Parent ID: 
                <input id="reset_comp_ref_input" className="elem_info_input" placeholder="component ref" onKeyUp={checkResetRef}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_comp_ref")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_comp_ref")}></input>
                <div id="cellml_reset_comp_ref" className="cellml_restrictions">
                  Is the Component ID to make a connection between this reset element and the component element
                </div>
              </div>
              <div> Variable: 
                <input id="reset_var_input" className="elem_info_input" placeholder="variable" onKeyUp={checkResetVar}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_var")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_var")}></input>
                <div id="cellml_reset_var" className="cellml_restrictions">
                  Must be a valid variable element reference
                </div>
              </div>
              <div> Test Variable: 
                <input id="reset_test_input" className="elem_info_input" placeholder="test variable" onKeyUp={checkResetTest}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_test")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_test")}></input>
                <div id="cellml_reset_test" className="cellml_restrictions">
                  Must be a valid variable element reference
                </div>
              </div>
              <div> Order: 
                <input id="reset_order_input" className="elem_info_input" placeholder="order" onKeyUp={checkResetOrder}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_order_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_order_restrictions")}></input>
                <div id="cellml_reset_order_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid integer number</li>
                    <li>Must be unique in the model</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === RESET - TEST VALUE === */}
            <div id="test_value_info" className="elem_info">
              <div> Reset Parent ID: 
                <input id="tv_comp_ref" className="elem_info_input" placeholder="reset parent" onKeyUp={() => checkResetParent("tv_comp_ref")}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_test_v")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_test_v")}></input>
                <div id="cellml_reset_test_v" className="cellml_restrictions">
                  Is the Reset ID to make a connection between this reset test element and the parent reset element
                </div> 
              </div>
            </div>
            {/* === RESET - RESET VALUE === */}
            <div id="reset_value_info" className="elem_info">
              <div> Reset Parent ID: 
                <input id="rv_comp_ref" className="elem_info_input" placeholder="reset parent" onKeyUp={() => checkResetParent("rv_comp_ref")}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_reset_value")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_reset_value")}></input>
                <div id="cellml_reset_value" className="cellml_restrictions">
                  Is the Reset ID to make a connection between this reset test element and the parent reset element
                </div> 
              </div>
            </div>

            {/* === MATH === */}
            <div id="math_info" className="elem_info">
              <button className="elem_info_input" 
                      onMouseOver={() => on_hover_show_cellml_restrictions("cellml_math_elem")} 
                      onMouseOut={() => on_leave_close_cellml_restrictions("cellml_math_elem")}>
                More Info</button>
              <div> Component Parent ID: 
                <input id="math_comp_ref_input" className="elem_info_input" placeholder="ID of component" onKeyUp={checkMathCompID}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_math_c_ref")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_math_c_ref")}></input>
                <div id="cellml_math_c_ref" className="cellml_restrictions">
                  Is the component reference to connect this variable with a component, determine by the component ID
                </div>
              </div>

              <div id="cellml_math_elem" className="cellml_restrictions"> 
                To implement use equation viewer after creating the model 
              </div>
            </div>
            
            {/* === ENCAPSULATION === */}
            <div id="encapsulation_info" className="elem_info">
              <button className="elem_info_input" 
                      onMouseOver={() => on_hover_show_cellml_restrictions("cellml_encap_elem")} 
                      onMouseOut={() => on_leave_close_cellml_restrictions("cellml_encap_elem")}>
                More Info</button>
              <div id="cellml_encap_elem" className="cellml_restrictions"> 
                Encapsulation just captures all chosen component_ref children and
                a silver encapsulation is used with lines to indicate all the children
              </div>
            </div>

            {/* === COMPONENT REF === */}
            <div id="component_ref_info" className="elem_info">
              <div> Component Ref Parent: 
                <input id="comp_ref_parent_id" className="elem_info_input" placeholder="1" defaultValue="1" onKeyUp={checkCompRefID}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_comp_ref_ref")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_comp_ref_ref")}></input>
                <div id="cellml_comp_ref_ref" className="cellml_restrictions">
                  Must be an integer number inicating an ID
                  <ul>
                    <li>ID = 1 means a connection to encapsulation</li>
                    <li>else ID indicates the parent component ref ID</li>
                  </ul>
                </div>
              </div>
              <div> Component: 
                <input id="comp_ref_comp_input" className="elem_info_input" placeholder="component" onKeyUp={checkCompRefComp}
                      onMouseOver={() => on_hover_show_cellml_restrictions("cellml_comp_ref_component")} 
                      onMouseOut={() => on_leave_close_cellml_restrictions("cellml_comp_ref_component")}></input>
                <div id="cellml_comp_ref_component" className="cellml_restrictions">
                  Must be a valid component element reference
                </div>
              </div>
            </div>

            {/* === CONNECTION === */}
            <div id="connection_info" className="elem_info">
              <div> Component 1: 
                <input id="connect_1_input" className="elem_info_input" placeholder="comp_ref_1" onKeyUp={checkConnectionComp}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_connection_1")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_connection_1")}></input>
                <div id="cellml_connection_1" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid component reference</li>
                    <li>Must be the components name (not ID) </li>
                    <li>Component 1 can't be equal to component 2</li>
                  </ul>
                </div>
              </div>
              <div> Component 2: 
                <input id="connect_2_input" className="elem_info_input" placeholder="comp_ref_2" onKeyUp={checkConnectionComp}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_connection_2")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_connection_2")}></input>
                <div id="cellml_connection_2" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid component reference</li>
                    <li>Must be the components name (not ID) </li>
                    <li>Component 1 can't be equal to component 2</li>
                  </ul>
                </div>
              </div>
            </div>
    
            {/* === MAP VARIABLES === */}
            <div id="map_variables_info" className="elem_info">
              <div> Connection Ref: 
                <input id="map_connect_input" className="elem_info_input" placeholder="component" onKeyUp={checkMapVariableRefID}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_connection_parent")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_connection_parent")}></input>
                <div id="cellml_connection_parent" className="cellml_restrictions">
                  The ID of a connection element which connects this Map Variable element and the connection element
                </div>
              </div>
              <div> Variable 1: 
                <input id="map_var_1_input" className="elem_info_input" placeholder="variable_1" onKeyUp={checkMapVariablesVar}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_1")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_1")}></input>
                <div id="cellml_var_1" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid variable reference</li>
                    <li>Must be the varaible's name (not ID) </li>
                    <li>Variable 1 can't be equal to variable 2</li>
                    <li>Only one map_variables item between any two variables</li>
                  </ul>
                </div>
              </div>
              <div> Variable 2: 
                <input id="map_var_2_input" className="elem_info_input" placeholder="variable_2" onKeyUp={checkMapVariablesVar}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_var_2_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_var_2_restrictions")}></input>
                <div id="cellml_var_2_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Must be a valid variable reference</li>
                    <li>Must be the variable's name (not ID) </li>
                    <li>Variable 1 can't be equal to variable 2</li>
                    <li>Only one map_variables item between any two variables</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === IMPORT === */}
            <div id="import_info" className="elem_info">
              <div> HREF: 
                <input id="import_ref_input" className="elem_info_input" placeholder="component" onKeyUp={checkImportHREF}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_restrictions")}></input>
                <div id="cellml_import_restrictions" className="cellml_restrictions">
                  HREF should be a valid locator of XLink specification
                </div>
              </div>
            </div>

            {/* === IMPORT UNITS === */}
            <div id="import_units_info" className="elem_info">
              <div> Import Reference: 
                <input id="import_parent_reference_u" className="elem_info_input" placeholder="import_u_ref" onKeyUp={() => checkImportUnitsImportRef("import_parent_reference_u")}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_units_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_units_restrictions")}></input>
                <div id="cellml_import_units_restrictions" className="cellml_restrictions">
                  An ID to determine what Imported element the imported units should connect to
                </div>
              </div>
              <div> Name: 
                <input id="import_units_name_input" className="elem_info_input" placeholder="import_u_name" onKeyUp={checkImportUnitsName}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_units_name_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_units_name_restrictions")}></input>
                <div id="cellml_import_units_name_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Can't be the same as another units name or imported units name</li>
                  </ul>
                </div>
              </div>
              <div> Units Reference: 
                <input id="import_units_ref_input" className="elem_info_input" placeholder="import_u_ref" onKeyUp={checkImportUnitsRef}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_units_ref_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_units_ref_restrictions")}></input>
                <div id="cellml_import_units_ref_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be identical to another units name in the cellml model</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* === IMPORT COMPONENT === */}
            <div id="import_container_info" className="elem_info">
              <div> Import Reference: 
                <input id="import_parent_reference_c" className="elem_info_input" placeholder="import_u_ref" onKeyUp={() => checkImportUnitsImportRef("import_parent_reference_c")}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_comp_imp_ref_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_comp_imp_ref_restrictions")}></input>
                <div id="cellml_import_comp_imp_ref_restrictions" className="cellml_restrictions">
                  An ID to determine what Imported element the imported units should connect to
                </div>
              </div>
              <div> Name: 
                <input id="import_comp_name_input" className="elem_info_input" placeholder="import_c_name" onKeyUp={checkImportCompName}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_comp_name_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_comp_name_restrictions")}></input>
                <div id="cellml_import_comp_name_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Can't be the same as another component name or imported component name, must be unique</li>
                  </ul>
                </div>
              </div>
              <div> Component Ref: 
                <input id="import_comp_ref_input" className="elem_info_input" placeholder="import_c_ref" onKeyUp={checkImportCompRef}
                       onMouseOver={() => on_hover_show_cellml_restrictions("cellml_import_comp_ref_restrictions")} 
                       onMouseOut={() => on_leave_close_cellml_restrictions("cellml_import_comp_ref_restrictions")}></input>
                <div id="cellml_import_comp_ref_restrictions" className="cellml_restrictions">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be identical to another component name in the cellml model or imported models</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
            
          {/* ========================= Each element has children ======================== */}
          <div id="element_children_block" className="children_section">
            <div className="children"> Children </div>
            <div id="model_children" className="children_list">
              <ul>
                <li>Component</li>
                <li>Connection</li>
                <li>Encapsulation</li>
                <li>Import</li>
                <li>Units</li>
              </ul>
            </div>
            <div id="import_children" className="children_list">
              <ul>
                <li>Import Component</li>
                <li>Import Units</li>
              </ul>
            </div>
            <div id="import_units_children" className="children_list"></div>
            <div id="import_component_children" className="children_list"></div>

            <div id="units_children" className="children_list">
              <ul>
                <li>Unit</li>
              </ul>
            </div>
            <div id="unit_children" className="children_list"></div>
            <div id="component_children" className="children_list">
              <ul>
                <li>Math</li>
                <li>Reset</li>
                <li>Variable</li>
              </ul>
            </div>
            <div id="variable_children" className="children_list"></div>
            <div id="reset_children" className="children_list">
              <ul>
                <li>Reset Value (needed)</li>
                <li>Test Value (needed)</li>
              </ul>
            </div>
            <div id="test_value_children" className="children_list">
              <ul>
                <li>Math</li>
              </ul>
            </div>
            <div id="reset_value_children" className="children_list">
              <ul>
                <li>Math</li>
              </ul>
            </div>
            <div id="math_children" className="children_list"></div>
            <div id="encapsulation_children" className="children_list">
              <ul>
                <li>Component Ref</li>
              </ul>
            </div>
            <div id="component_ref_children" className="children_list">
              <ul>
                <li>Component Ref</li>
              </ul>
            </div>
            <div id="connection_children" className="children_list">
              <ul>
                <li>Map Variables</li>
              </ul>
            </div>
            <div id="map_variables_children" className="children_list"></div>
          </div>

          

          <div className="children_section">
              <button id="example_section_btn" className="example_btn_style" onClick={change_to_example_view}>Example <span id="arrowsizeforexample">➤</span></button>
          </div>

          <div id="example_code_section">

            <div id="encapsulate_example_code" className="example_text_code">
              <p className="example_text">{`<component name="grandad"/>`}</p>
              <p className="example_text">{`<component name="aunt"/>`}</p>
              <p className="example_text">{`<component name="father"/>`}</p>
              <p className="example_text">{`<component name="child"/>`}</p>
              <p className="example_text">{`<component name="orphan">`}</p>
              <p className="example_text">{`<encapsulation>`}</p>
              <p className="example_text tab_code">{`<component_ref component="grandad">`}</p>
              <p className="example_text tab_code2">{`<component_ref component="aunt"/>`}</p>
              <p className="example_text tab_code2">{`<component_ref component="father">`}</p>
              <p className="example_text tab_code3">{`<component_ref component="child"/>`}</p>
              <p className="example_text tab_code2">{`</component_ref>`}</p>
              <p className="example_text tab_code">{`</component_ref>`}</p>
              <p className="example_text">{`</encapsulation>`}</p>
              <img src="https://i.imgur.com/oLUyeRL.png" className="encap_example_img"/>
            </div>

            <div id="connection_example_code" className="example_text_code">
              <p className="example_text">{`<component name="house_of_capulet">`}</p>
              <p className="example_text tab_code">{`<variable name="juliet" interface_type="public">`}</p>
              <p className="example_text">{`</component>`}</p>
              <p className="example_text">{`<component name="house_of_montague">`}</p>
              <p className="example_text tab_code">{`<variable name="romeo" interface_type="public">`}</p>
              <p className="example_text">{`</component>`}</p>
              <p className="example_text ">{`<connection component_1="montague" component_2="capulet">`}</p>
              <p className="example_text tab_code">{`<map_variables variable_1="romeo" variable_2="juliet">`}</p>
              <p className="example_text ">{`</connection>`}</p>
              <img src="https://i.imgur.com/GDr6J1r.png" className="conn_example_img"/>
            </div>

            <div id="reset_example_code" className="example_text_code">
              <p className="example_text">{`<component name="Sisyphus">`}</p>
              <p className="example_text tab_code">{`<variable name="time" units="second"/>`}</p>
              <p className="example_text tab_code">{`<variable name="position" units="dimensionless"/>`}</p>
              <p className="example_text tab_code commented_code_example">{`<!-- The first reset represents all midnight times. -->`}</p>
              <p className="example_text tab_code">{`<reset variable="position" test_variable="time" order="2">`}</p>
              <p className="example_text tab_code2">{`<test_value>`}</p>
              <p className="example_text tab_code2">{` <math>...</math> `}</p>
              <p className="example_text tab_code2">{`</test_value>`}</p>
              <p className="example_text tab_code2">{`<test_value>`}</p>
              <p className="example_text tab_code2">{` <math>...</math> `}</p>
              <p className="example_text tab_code2">{`</test_value>`}</p>
              <p className="example_text tab_code">{`</reset>`}</p>
              <p className="example_text">{`</component>`}</p>
              <img src="https://i.imgur.com/mE8jqlZ.png" className="reset_example_img"></img>
            </div>

            <div id="comp_example_code" className="example_text_code">
              <p className="example_text ">{`<component name="mass_into_energy">`}</p>
              <p className="example_text tab_code">{`<math>`}</p>
              <p className="example_text tab_code">{` ... `}</p>
              <p className="example_text tab_code">{`</math>`}</p>
              <p className="example_text tab_code">{`<variable name="E" units="joule"/>`}</p>
              <p className="example_text tab_code">{`<variable name="m" units="kilogram"/>`}</p>
              <p className="example_text tab_code">{`<variable name="c" units="metre_per_second"/>`}</p>
              <p className="example_text ">{`</component>`}</p>
              <img src="https://i.imgur.com/Azp4WfF.png" className="comp_example_img"></img>
            </div>

            <div id="units_example_code" className="example_text_code">
              <p className="example_text commented_code_example">{`<!-- Defining new base units called A: -->`}</p>
              <p className="example_text ">{` <units name="A"/>`}</p>
              <p className="example_text commented_code_example">{`<!-- Defining new units called B, equivalent to 1000.A^2 -->`}</p>
              <p className="example_text ">{` <units name="B">`}</p>
              <p className="example_text tab_code">{`<unit units="A" prefix="kilo" exponent="2"/>`}</p>
              <p className="example_text ">{` </units>`}</p>
              <p className="example_text commented_code_example">{`<!-- Defining new units called C, equivalent to B^3/ms or (1000)^3.A^6/ms  -->`}</p>
              <p className="example_text">{`<units name="C">`}</p>
              <p className="example_text tab_code">{`<unit units="B" exponent="3"/>`}</p>
              <p className="example_text tab_code">{`<unit units="second" prefix="milli" exponent="-1"/>`}</p>
              <p className="example_text">{`</units>`}</p>
              <img src="https://i.imgur.com/Hh36SGl.png" className="unit_example_img"/>
            </div>
            <div id="import_example_code" className="example_text_code">
              <p className="file_example_text remove_code_top">/looney_tunes.cellml</p>
              <p className="example_text">{`<model name="looney_tunes">`}</p>
              <p className="example_text tab_code">{`<component name="bugs_bunny"/>`}</p>
              <p className="example_text tab_code">{`<component name="daffy_duck"/>`}</p>
              <p className="example_text tab_code">{`<units name="potOfPaint"/>`}</p>
              <p className="example_text">{"</model>"}</p>
              <p className="file_example_text">/space_jam2_movie.cellml</p>
              <p className="example_text">{`<model name="space_jam">`}</p>
              <p className="example_text tab_code">{`<component name="lebron"/>`}</p>
              <p className="example_text tab_code">{`<import xlink:href="looney_tunes.cellml" xmlns:xlink="http://www.w3.org/1999/xlink">`}</p>
              <p className="example_text tab_code">{`<component name="bugs" component_ref="bugs_bunny"/>`}</p>
              <p className="example_text tab_code">{`<units name="potOfPaint" units_ref="twoLitrePot"/>`}</p>
              <p className="example_text tab_code">{`</import>`}</p>
              <p className="example_text">{"</model>"}</p>
              <img src="https://i.imgur.com/1I9knjg.png" className="import_example_img"/>
            </div>  
            <div id="model_example_code" className="example_text_code">
              <p className="example_text">{`<model name="myModel">`}</p>
              <p className="example_text tab_code">{`<component name="comp1">`}</p>
              <p className="example_text tab_code">{` ... `}</p>
              <p className="example_text tab_code">{`</component>`}</p>
              <p className="example_text tab_code">{`<units name="myUnits">`}</p>
              <p className="example_text tab_code">{` ... `}</p>
              <p className="example_text tab_code">{`</units>`}</p>
              <p className="example_text">{"</model>"}</p>
              <img src="https://i.imgur.com/aaVgRK2.png" className="model_example_img"/>
            </div>
            

          </div>

          <div id="cellml_element_btn_container">
            <button className="cellml_element_edit_btns" onClick={edit_element}>Update</button>
            <button className="cellml_element_edit_btns" onClick={delete_element}>Delete</button>
          </div>
          <button id="example_back_button" className="cellml_element_edit_btns" onClick={go_back_button}>Back </button>
        </div>
      </div>
    </div>
    



    <div id="element_information_items_set" className="flex-container">

      <div id="units_container" className="flex-item">
        <img id="units_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/knSsOjz.png" 
             onClick={()=>change_element("units_children", "Units", "units_info", "drag_units")}>
        </img>
        <div className="bottomtext bottom_unit">Units</div>
      </div>

      <div id="unit_container"  className="flex-item">
        <img id="unit_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/CZZxCSc.png" 
             onClick={()=>change_element("unit_children", "Unit", "unit_info", "drag_unit")}>
        </img>
        <div className="bottomtext bottom_unit">Unit</div>
      </div>

      <div id="component_container"  className="flex-item">
        <img id="component_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/mQJ9btp.png"  
             onClick={()=>change_element("component_children", "Component", "component_info", "drag_component")}/>
        <div className="bottomtext bottom_comp">Component</div>
      </div>

      <div id="variable_container"  className="flex-item">
        <img id="variable_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/UOaalhF.png" 
            onClick={()=>change_element("variable_children", "Variable", "variable_info", "drag_variable")}>
        </img>
        <div className="bottomtext bottom_comp">Variable</div>
      </div>

      <div id="reset_container" className="flex-item">
        <img id="reset_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/N8yCmOx.png"
             onClick={()=>change_element("reset_children", "Reset", "reset_info", "drag_reset")}>
        </img>
        <div className="bottomtext bottom_comp">Reset</div>
      </div>

      <div id="test_value_container" className="flex-item">
        <img id="test_value_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/I19zwvu.png"
             onClick={()=>change_element("test_value_children", "Test Value", "test_value_info", "drag_test_value")}>
        </img>
        <div className="bottomtext bottom_comp">Test Value</div>
      </div>

      <div id="reset_value_container" className="flex-item">
        <img id="reset_value_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/s11N2VD.png"
             onClick={()=>change_element("reset_value_children", "Reset Value", "reset_value_info", "drag_reset_value")}>
        </img>
        <div className="bottomtext bottom_comp">Reset Value</div>
      </div>

      <div id="math_container" className="flex-item">
        <img id="math_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/UtPNPLH.png" 
             onClick={()=>change_element("math_children", "Math", "math_info", "drag_math")}>
        </img>
        <div className="bottomtext bottom_comp">Math</div>
      </div>

      <div id="encapsulation_container" className="flex-item">
        <img id="encapsulation_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/HiSWon1.png" 
             onClick={()=>change_element("encapsulation_children", "Encapsulation", "encapsulation_info", "drag_encapsulation")}>
        </img>
        <div className="bottomtext bottom_encap">Encapsulation</div>
      </div>

      <div id="component_ref_container" className="flex-item">
        <img id="component_ref_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/5H9sHhw.png" 
             onClick={()=>change_element("component_ref_children", "Component Reference", "component_ref_info", "drag_comp_ref")}>
        </img>
        <div className="bottomtext bottom_encap compreftext">Component Reference</div>
      </div>

      <div id="connection_container" className="flex-item">
        <img id="connection_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/ptHOCqp.png" 
             onClick={()=>change_element("connection_children", "Connection", "connection_info", "drag_connection")}>
        </img>
        <div className="bottomtext bottom_connection">Connection</div>
      </div>

      <div id="map_variables_container" className="flex-item">
        <img id="map_variables_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/T13MxYS.png"
             onClick={()=>change_element("map_variables_children", "Map Variables", "map_variables_info", "drag_map_variables")}>
        </img>
        <div className="bottomtext bottom_connection">Map Variables</div>
      </div>

      <div id="import_container" className="flex-item">
        <img id="import_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/YPNhhi2.png" 
             onClick={()=>change_element("import_children", "Import", "import_info", "drag_import")}>
        </img>
        <div className="bottomtext bottom_import">Import</div>
      </div>

      <div id="import_units_container" className="flex-item">
        <img id="import_units_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/iKJCCXI.png" 
             onClick={()=>change_element("import_units_children", "Import Units", "import_units_info", "drag_import_units")}>
        </img>
        <div className="bottomtext bottom_import">Import Units</div>
      </div>

      <div id="import_component_container" className="flex-item">
        <img id="import_component_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/uNnCsVZ.png" 
             onClick={()=>change_element("import_component_children", "Import Component", "import_container_info", "drag_import_component")}>
        </img>
        <div className="bottomtext bottom_import">Import Comp.</div>
      </div>

      <div id="model_container" className="flex-item">
        <img id="model_container_image" className="element_img" draggable="false"
             src="https://i.imgur.com/R9a7Awr.png"
             onClick={()=>change_element("model_children", "Model", "model_info", "drag_model")}>
        </img>
        <div className="bottomtext">Model</div>
      </div>
    </div>
  </div>
  );
};

export default CreateImgModel;


/*
<div
        className="box1"
        onDragStart={(event) => dragStartHandler(event, PHOTO_URL)}
        draggable={true}
      >
        <img src={PHOTO_URL} alt="Cute Dog" />
      </div>

      <div
        className="box2"
        onDragStart={(event) => dragStartHandler(event, "Kindacode.com")}
        draggable={true}
      >
        <h2>Kindacode.com</h2>
      </div>

      <div className="box3" onDragOver={allowDrop} onDrop={dropHandler}>
        {content.endsWith(".jpeg") ? <img src={content} /> : <h2>{content}</h2>}
      </div>
*/


/*
export default class RenderButton extends React.Component {
  

  load_image(){
    const canvas = document.getElementById("import_container_image") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 10;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = "red";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "red";
    context.stroke();
    
  }



  regexTest() {
    console.log(valid);

    const model = document.createElement('html');
    model.innerHTML = units;
    console.log(model);
    const model_name = model.getElementsByTagName('model')[0].getAttribute("name");
    console.log(model_name);
    console.log(model.getElementsByTagName('units').length);
    


    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 300;
    canvas.style.background = "white";
    
    ctx.fillStyle = "blue";
    circle.draw(ctx);
    circle2.draw_comp(ctx);
    circle3.draw_comp(ctx);
    circle4.draw_comp(ctx);




    const len = model.getElementsByTagName("*").length;
    console.log(len);
    for (let i = 0; i<len; i++) {
      console.log(`--------------- ${i} ---------------`);
      console.log(model.getElementsByTagName("*")[i]);
      console.log(`------------------------------------`);
      
    }


  }






  async buttonClicked() {
    console.log('clicked');
    
    //const libcellml = await libcellModule();
    //const parser = new libcellml.Parser();
    // Make model
    
  //  const sampleModel = `<?xml version="1.0" encoding="UTF-8"?>
  //  <model xmlns="http://www.cellml.org/cellml/2.0#" name="test"/>
  //  `;
   // const m = parser.parseModel(sampleModel);
    //const convertedModel = convertSelectedElement(Elements.model, m);
    //console.log(convertedModel);
    



    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 300;
    canvas.style.background = "white";
    
    ctx.fillStyle = "blue";
    circle.draw(ctx);
    circle2.draw_comp(ctx);
    circle3.draw_comp(ctx);
    circle4.draw_comp(ctx);
  //  const myWindow = window.open(url, "_blank", "width=200,height=100");

  }

  buttonClicked2() {
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;
    canvas.style.background = "white";
    circle_A.draw_unit(ctx);
    circle_B.draw_units(ctx);
    circle_Ba.draw_unit(ctx);
    circle_Ca.draw_unit(ctx);
    circle_Cb.draw_unit(ctx);
    circle_C.draw_units(ctx);
  }



  buttonTopDown() {
    console.log('*****');


    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    canvas.height = 180;
    canvas.width = 500;
    canvas.style.background = "white";

    
    
    circle_AA.draw_unit(ctx);
    circle_AB.draw_units(ctx);
    circle_ABa.draw_unit(ctx);
    circle_AC.draw_units(ctx);
    circle_ACa.draw_unit(ctx);
    circle_ACb.draw_unit(ctx);
    
    ctx.font = "30px Arial";
    ctx.fillStyle = '#000000';
    ctx.fillText("A", 40, 90);
    ctx.fillText("B", 192, 170);
    ctx.fillText("C", 382, 175);

    const canvasA = document.getElementById('myChart2') as HTMLCanvasElement;
    const ctxA = canvasA.getContext('2d');
    canvasA.height = 180;
    canvasA.width = 500;
    canvasA.style.background = "white";
    circle_AA.draw_unit(ctxA);
    ctxA.fillText("A", 40, 90);


    const canvasB = document.getElementById('myChart3') as HTMLCanvasElement;
    const ctxB = canvasB.getContext('2d');
    canvasB.height = 180;
    canvasB.width = 500;
    canvasB.style.background = "white";
    circle_A2B.draw_units(ctxB);
    circle_A2Ba.draw_unit(ctxB);
    
    ctxB.font = "30px Arial";
    ctxB.fillStyle = '#000000';
    ctxB.fillText("1000*A^2", 40, 90);


    const canvasC = document.getElementById('myChart4') as HTMLCanvasElement;
    const ctxC = canvasC.getContext('2d');
    canvasC.height = 180;
    canvasC.width = 500;
    canvasC.style.background = "white";
    circle_A2C.draw_units(ctxC);
    circle_A2Ca.draw_unit(ctxC);
    circle_A2Cb.draw_unit(ctxC);
    ctxC.font = "30px Arial";
    ctxC.fillStyle = '#000000';
    ctxC.fillText("B^3", 40,110);
    ctxC.fillText("ms^-1", 105,110);
    
  }

  drag(event: DragEvent) {
    console.log('s');
  }

  handleDragEvent = (e: DragEvent) => {
    e.preventDefault();
    // Do something
    console.log("s");
  };



  //------------------------------------------------
  //------------------------------------------------
  //------------------------------------------------
  pos: number[] = [];
  testDrop(event: DragEvent) {
    event.preventDefault();
    
    const data = event.dataTransfer.getData("Text");
    const img = document.getElementById("img1");
    const dx = this.pos[0] - img.offsetLeft;
    const dy = this.pos[1] - img.offsetTop;

    const canvas = document.getElementById('graphCanvas') as HTMLCanvasElement;
    const temp = document.getElementById(data) as CanvasImageSource;
    canvas.getContext("2d").drawImage(temp, event.pageX - dx, event.pageY - dy);

  }

  testAllowDrop(event: DragEvent) {
    event.preventDefault();
  }

  testGetPos(event: DragEvent) {
    this.pos = [event.pageX, event.pageY];
  }

  testDrag(event: DragEvent) {
    event.dataTransfer.setData("Text", (event.target as HTMLElement).id);
  }

  //------------------------------------------------
  //------------------------------------------------
  //------------------------------------------------

  render(): React.ReactNode {
    return (
      <div>
        
        Show variable names: <input type="checkbox"></input>
        <button onClick={this.regexTest}>Regex</button>
	<button onClick={this.buttonClicked}> Render</button>
  <button onClick={this.buttonClicked2}> Render Units and Unit</button>
  <button onClick={this.buttonTopDown}>List of Models</button>
  <br/>

  <h2>Create Model: Visual Mode</h2>
	<div id="model_container">
		<p id="model_title">Model Name: </p>
		<input id="model_name"></input>
	</div>


  <div>
    Test Canvas
    <canvas id='graphCanvas' width="300" height="300" onDragOver={()=>this.testAllowDrop(event)} onDrop={()=>this.testDrop(event)}></canvas>
    <img id="img1" draggable="true" 
         src="http://static.tumblr.com/vcbmwcj/foumiteqs/arrow_up_alt1.svg"/>
         
  </div>



	<div id="element_properties"> 
		===
    <canvas id='canvas' width="500" height="300"></canvas>
	</div>
	<div id="element_information_items_set" className="flex-container">
		<div id="import_container" className="flex-item">
      <img id="import_container_image" className="element_img" draggable="true" onClick={()=>console.log('sss')}></img>
			<div className="bottomtext">Import</div>
		</div>
		<div id="import_units_container" className="flex-item">
      <canvas id="import_units_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Import Units</div>
		</div>
		<div id="import_component_container" className="flex-item">
      <canvas id="import_component_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Import Component</div>
		</div>
		<div id="units_container" className="flex-item">
      <canvas id="units_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Units</div>
		</div>
		<div id="unit_container"  className="flex-item">
      <canvas id="unit_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Unit</div>
		</div>
		<div id="component_container"  className="flex-item">
      <canvas id="component_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Component</div>
		</div>
		<div id="variable_container"  className="flex-item">
      <canvas id="variable_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Variable</div>
		</div>
		<div id="reset_container" className="flex-item">
      <canvas id="reset_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Reset</div>
		</div>
		<div id="test_value_container" className="flex-item">
      <canvas id="test_value_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Test Value</div>
		</div>
		<div id="reset_value_container" className="flex-item">
      <canvas id="reset_value_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Reset Value</div>
		</div>
		<div id="math_container" className="flex-item">
      <canvas id="math_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Math</div>
		</div>
		<div id="encapsulation_container" className="flex-item">
      <canvas id="encapsulation_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Encapsulation</div>
		</div>
		<div id="component_ref_container" className="flex-item">
      <canvas id="component_ref_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Component Reference</div>
		</div>
		<div id="connection_container" className="flex-item">
      <canvas id="connection_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Connection</div>
		</div>
		<div id="map_variables_container" className="flex-item">
      <canvas id="map_variables_container_image" className="element_img" onClick={()=>console.log('sss')}></canvas>
			<div className="bottomtext">Map Variables</div>
		</div>
	</div>


  <h1>---------------------</h1>
  <h1>Create your own model:</h1>
  <button>Test custom</button>
  <ul id="drag">
    <li className="new-item">Drag me down1</li>
    <li className="new-item">Drag me down2</li>
    <li className="new-item">Drag me down3</li>
    <li id="new-item4">Drag me down4</li>
  </ul>
  <canvas id="canvas" width="300" height="300"></canvas>
  <h1>---------------------</h1>

  <canvas id="myChart"></canvas>
  <div>complex_encapsulation_example</div>
  <br/>
  <canvas id="myChart2"></canvas>
  <div>A</div>
  <br/>
  <canvas id="myChart3"></canvas>
  <div>B</div>
  <br/>
  <canvas id="myChart4"></canvas>
  <div>C</div>

  



  <br/>
      </div>
    );
  }
}

*/
