/* eslint @typescript-eslint/no-var-requires: "off" */
import React, { Context, useState } from "react";
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
// Create Image Model is the element that 
const CreateImgModel: React.FunctionComponent = () => {

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


  function checkModelInformation() {
    console.log(shapes_);



    const temp = listofComponents.sort(function(a,b) { return parseFloat(a.u_id) - parseFloat(b.u_id)});
    console.log(temp);
  }


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
    console.log("offSetX: " + offsetX_ + " offsetY: " + offsetY_);
    drawAll();
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
    context.strokeStyle= border_color;
    context.moveTo(x, y);   
    context.lineTo(x - width / 2, y + height / 2); // top left edge
    context.lineTo(x, y + height);                 // bottom left edge
    context.lineTo(x + width / 2, y + height / 2); // bottom right edge
    context.closePath();                           // finish triangle
    context.fill();
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
    context.strokeStyle = stroke;
    context.lineWidth = 5;
    const grd = context.createRadialGradient(shape.x, shape.y, 5, shape.x + 30, shape.y + 40, 60);
    grd.addColorStop(0, stroke);
    grd.addColorStop(1, fill);
    context.fillStyle = grd;
    context.fill();
    context.stroke();
  }

  // Clear the canvas and then redraw every time there is a new action
  function drawAll() {
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log(shapes_);
    for (let i = 0; i<shapes_.length; i++) {
      const shape = shapes_[i];
      if (shape.element_type) {
        // ========================================================================================
        if (shape.element_type == "units") {
          // draw the lines
          context.beginPath(); 
          context.lineWidth = 5;
          context.strokeStyle = "rgb(193, 2, 12)";
          for (let j = 0; j < shapes_.length; j++) {
            if (shapes_[j].element_type == "unit" && shapes_[j].units_parent == shape.u_id) {
              drawArrow(context, shape.x + 50, shape.y + 21, shapes_[j].x, shapes_[j].y, "pink");
            }
          }
          // draw the red element
          context.beginPath();
          context.lineWidth = 3;
          roundRect(context, shape.x, shape.y, calculate_width(shape.units_name), 48, 5, true, true);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.lineWidth = 3;
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.units_name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.units_name)/3, shape.y + 30, 100);
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
          context.fillText(shape.units_name, shape.x + 5, shape.y + 30);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "unit") {
          
          // Just getting the values to display
          const prefix     = shape.prefix;
          const exponent   = calculate_exponent(shape);
          const multiplier = calculate_multiplier(shape);
          // create the 'unit' base - circle
          context.beginPath();
          context.lineWidth = 3;
          context.strokeStyle = "rgb(193, 2, 12)";
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(254, 148, 155)");
          grd.addColorStop(1, "rgb(252, 36, 42)");
          context.fillStyle = grd;
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fill();
          context.stroke();
          // adding the text onto the circle
          context.beginPath();
          context.strokeStyle = "rgb(193, 2, 12)";
          context.fillStyle = "rgb(110, 1, 6)";
          context.font =  "bold 16px Arial";
          context.fillText(prefix, shape.x - 5, shape.y + 8);
          context.font =  "bold 14px Arial";
          context.fillText(exponent, shape.x - 20 + (prefix.length)*10, shape.y - 8);
          context.font =  "bold 16px Arial";
          if (multiplier != 1) context.fillText(multiplier + "*", shape.x - (prefix.length)*10 + 10, shape.y + 8);
          context.lineWidth = 5;
          context.fill();
          context.stroke();

        }
        // ========================================================================================
        else if (shape.element_type == "component") {
          // The variable lines from component
          context.beginPath();
          context.strokeStyle = "rgb(123,161,203)";
          context.fillStyle = "rgb(123,161,203)";
          context.lineWidth = 1;
          for (let j = 0; j < shapes_.length; j++) {
            if (shapes_[j].comp_parent == shape.c_id && shapes_[j].element_type == "variable") {
              drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(123, 161, 203)");
            }
            else if (shapes_[j].comp_parent == shape.c_id && shapes_[j].element_type == "reset") {
              drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(120, 205, 182)");
            }
          }
          context.fill();
          context.stroke();
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
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "variable") {
          // Draw the container
          context.beginPath();
          context.lineWidth = 2;
          context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          context.strokeStyle = "rgb(4, 131, 6)";
          context.fillStyle= "black";
          context.lineWidth = 3;
          context.font =  "bold 18px Arial";
          context.fillText(shape.name, calculate_variable_center_x(shape.name, shape.x), shape.y + 8);
          context.stroke();
          // draw the interface attribute onto the circle (x:both, +:public, -:private)
          context.beginPath();
          context.arc(shape.x + 25, shape.y -15, 10, 0, Math.PI * 2);
          context.fillStyle = "rgb(163, 234, 190)";
          context.fill();
          context.fillStyle= "black";
          context.lineWidth = 3;
          context.strokeStyle = "rgb(4, 131, 6)";
          context.font =  "bold 16px Arial";
          context.fillText(select_interface_type(shape), shape.x + 21, shape.y - 9);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "reset") {

          for (let j = 0; j < shapes_.length; j++) {
            if (shapes_[j].comp_parent == shape.r_id && (shapes_[j].element_type == "test_val") || shapes_[j].element_type == "reset_val") {
              drawArrow(context, shape.x, shape.y + 21, shapes_[j].x, shapes_[j].y, "rgb(120, 205, 182)");
            }
          }

          // Draw the container
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.stroke();

          // The order element
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x + 25, shape.y, 13, 0, Math.PI * 2);
          context.fillStyle = grd;
          context.fill();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "black";
          context.font = "bold 18px Arial";
          context.fillText(shape.order, shape.x + 22, shape.y + 5);
          context.stroke();

          // The variable reference
          context.beginPath();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          roundRect(context, shape.x - 35, shape.y - 40, calculate_width(shape.variable), 20, 5, true, true);
          context.stroke();
          context.beginPath();
          context.font = "bold 14px Arial";
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Var: " + shape.variable, shape.x - 32, shape.y - 26);
          context.stroke();

          // The test variable reference 
          context.beginPath();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          roundRect(context, shape.x - 35, shape.y + 20, calculate_width(shape.test_var), 20, 5, true, true);
          context.stroke();
          context.beginPath();
          context.font = "bold 14px Arial";
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("T_Var: " + shape.test_var, shape.x - 32, shape.y + 36);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "test_val" || shape.element_type == "reset_val") {
          // Draw the container
          context.beginPath();
          context.lineWidth = 4;
          context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.stroke();
          // Draw Math Element - temp for now
          context.beginPath();
          context.font = "bold 20px Arial";
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          if (shape.element_type == "test_val" ) context.fillText("T Math", shape.x - 20, shape.y + 10);
          if (shape.element_type == "reset_val") context.fillText("R Math", shape.x - 20, shape.y + 10);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "math") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "encapsulation") {
          context.beginPath(); 
          context.rect(shape.x - 25, shape.y - 34, 120, 60);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="grey";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x, shape.y);
          context.stroke();

          for (let i = 0; i < shapes_.length; i++) {
            if (shapes_[i].element_type == "component_ref" && shapes_[i].compf_parent == 0) {
              drawArrow(context, shape.x, shape.y + 21, shapes_[i].x, shapes_[i].y, "silver");
            }
          }

        }
        // ========================================================================================
        else if (shape.element_type == "component_ref") {
          //c_id: comp_id, compf_parent:
          for (let i = 0; i < shapes_.length; i++) {
            if (shapes_[i].element_type == "component_ref" && shapes_[i].c_id == shape.compf_parent) {
              drawArrow(context, shapes_[i].x, shapes_[i].y + 21, shape.x, shape.y, "silver");
            }
          }
          // The border for the element
          context.beginPath(); 
          context.lineWidth = 3;
          context.setLineDash([]);
          context.rect(shape.x, shape.y, calculate_width(shape.component), 45);
          context.strokeStyle = "black";
          context.stroke();
          // Create component_ref gradient:
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.component)/2, shape.y + 25, 5, shape.x + calculate_width(shape.component)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          // Fill the inside of the component with the gradient created
          context.fillStyle = grd;
          context.fillRect(shape.x, shape.y, calculate_width(shape.component), 45);
          // Add the text to the encapsulated component
          context.beginPath();
          context.font =  "bold 18px Arial";
          context.strokeStyle="rgb(1, 65, 1)";
          context.fillStyle = "rgb(1, 65, 1)";
          context.fillText(shape.component, shape.x + 5, shape.y + 28);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "connection") {
          // draw the children lines between connection and map variables
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(115,50,115)";
          for (let i = 0; i < shapes_.length; i++) {
            if (shapes_[i].element_type == "map_var") {
              console.log(shapes_[i].conn_parent);
              console.log(shape.c_id);
            }
            
            if (shapes_[i].element_type == "map_var" && shapes_[i].conn_parent == shape.c_id) {
              context.fillText(shapes_[i].conn_parent, shape.x + 50 , shape.y + 50);
              context.fillText(shape.c_id, shape.x + 50 , shape.y + 50);
              drawArrow(context, shape.x, shape.y, shapes_[i].x, shapes_[i].y, "rgb(245, 206, 177)");
            }
          }
          context.stroke();
         

          let component1name = "";
          let component2name = "";
          for (let j = 0; j < shapes_.length; j++) {
            // Checking component 1 & 2
            if (shapes_[j].element_type == "component" && shapes_[j].name == shape.component1) {
                component1name = shapes_[j].name;
                drawArrow(context, shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(191, 242, 211)");
            }
            else if (shapes_[j].element_type == "component" && shapes_[j].name == shape.component2) {
                component2name = shapes_[j].name;
                drawArrow(context, shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(191, 242, 211)");
              }
          }
          // draw connection diamond
          let diamond_width;
          (component1name.length > component2name.length) ? diamond_width = calculate_width(component1name) : diamond_width = calculate_width(component2name);
          const diamond_height= 95;
          context.lineWidth = 3;
          drawDiamond(context, shape, shape.x + diamond_width/4, shape.y - diamond_height/4, diamond_width , diamond_height, "rgb(245,209,188)", "rgb(230, 130, 70)", "rgb(225, 108, 34)");
          // draw the name boxes
          context.beginPath();
          context.fillStyle = "rgb(243, 196, 167)";
          context.strokeStyle = "rgb(255, 102, 0)";
          context.font = "bold 16px Arial";
          context.lineWidth = 2;
          roundRect(context, shape.x - 20, shape.y - 10, calculate_width(component1name), 25, 5, true, true);
          roundRect(context, shape.x - 20, shape.y + 30, calculate_width(component2name), 25, 5, true, true);
          context.stroke();
          // draw the related components
          context.beginPath();
          context.fillStyle = "rgb(217, 87, 0)";
          context.fillText(shape.component1, shape.x, shape.y + 7);
          context.fillText(shape.component2, shape.x, shape.y + 47);
          context.font = "bold 24px Arial";  
          context.fillText("X", shape.x + diamond_width/4 - 10, shape.y + 30);
          context.stroke();
          context.font = "16px Arial";     
        }
        // ========================================================================================
        else if (shape.element_type == "map_var") {
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          for (let j = 0; j < shapes_.length; j++) {
            // Checking component 1 & 2
            if (shapes_[j].element_type == "variable") {
                console.log(shape);
                console.log(shapes_[j]);
                console.log(shapes_[j].name);
                console.log(shape.map_v1);
                console.log(shape.map_v2);
            }
            if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.variable1 ) {
               drawArrow(context,shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(235, 211, 250)");
            }
            if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.variable2 ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              drawArrow(context,shape.x, shape.y, shapes_[j].x, shapes_[j].y, "rgb(235, 211, 250)");
            }
          }
          context.stroke();
          context.setLineDash([]);

          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          let var1name = "";
          let var2name = "";
          for (let j = 0; j < shapes_.length; j++) {
            if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.map_v1 ) {
                var1name = shapes_[j].name;
            }
            if (shapes_[j].element_type == "variable" && shapes_[j].name == shape.map_v2 ) {
                var2name = shapes_[j].name;
              }
          }

          let shape_width;
          (var1name.length > var2name.length) ? shape_width = calculate_width(var1name) : shape_width = calculate_width(var2name);

          drawPentagon(context, shape, shape.x + shape_width/4, shape.y + shape_width/4, shape_width/2 , "rgb(185,100,185)", "rgb(230,205,230)");

          context.beginPath();
          context.fillStyle='black';
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;

          context.fillText(var1name, shape.x + 10, shape.y);
          context.fillText("   x   ", shape.x + 10 , shape.y + 25);
          context.fillText(var2name, shape.x + 10, shape.y + 50);
          context.stroke();
        }
        // ========================================================================================
        // a box containing the imported module
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
          context.beginPath(); 
          context.lineWidth = 5;
          context.strokeStyle = "rgb(63, 81, 181)";
          roundRect(context, shape.x, shape.y, calculate_width(shape.href), 50, 5, true, true);
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.href)/2, shape.y + 25, 5, shape.x + calculate_width(shape.href)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(187, 222, 232)");
          grd.addColorStop(1, "rgb(105, 181, 203)");
          context.fillStyle = grd;
          context.fill();
          // The actual text of the components name
          context.strokeStyle= "rgb(187, 222, 232)";
          context.lineWidth = 3;
          context.fillStyle= "rgb(63, 81, 181)";
          context.font='bold 12px Arial'
          context.fillText("Import from:", shape.x + 5, shape.y + 15);
          context.font =  "bold 16px Arial";
          context.fillText("/" + shape.href, shape.x + 5, shape.y + 35);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "import_units") {
          // draw the red 'units' element
          //name:i_name.value, units_ref:i_ref.value, import_parent: ref.value
          context.beginPath();
          context.lineWidth = 3;
          roundRect(context, shape.x, shape.y, calculate_width(shape.name), 48, 5, true, true);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(103, 103, 203)";
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
          context.fillText(shape.name, shape.x + 5, shape.y + 30);
          context.stroke();
        }
        // ========================================================================================
        else if (shape.element_type == "import_component") {
          
          context.fill();
          context.stroke();
          // The actual element container
          context.beginPath(); 
          context.lineWidth = 3;
          context.strokeStyle = "rgb(103, 103, 203)";
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
          context.stroke();
        }
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
    if (shape.radius) {
      const dx = mx - shape.x;
      const dy = my - shape.y;
      if(dx*dx+dy*dy<shape.radius*shape.radius){
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
    } 
    else if (type == "unit") {
      change_element("unit_children", "Unit", "unit_info", "drag_unit");
    }
    else if (type == "component") {
      change_element("component_children", "Component", "component_info", "drag_component");
    }
    else if (type == "variable") {
      change_element("variable_children", "Variable", "variable_info", "drag_variable");
    }
    else if (type == "reset") {
      change_element("reset_children", "Reset", "reset_info", "drag_reset");
    }
    else if (type == "test_val") {
      change_element("test_value_children", "Test Value", "test_value_info", "drag_test_value")
    }
    else if (type == "reset_val") {
      change_element("reset_value_children", "Reset Value", "reset_value_info", "drag_reset_value")
    }
    else if (type == "math") {
      change_element("math_children", "Math", "math_info", "drag_math")
    }
    else if (type == "encapsulation") {
      change_element("encapsulation_children", "Encapsulation", "encapsulation_info", "drag_encapsulation")
    }
    else if (type == "component_ref") {
      change_element("component_ref_children", "Component Reference", "component_ref_info", "drag_comp_ref")
    }
    else if (type == "connection") {
      change_element("connection_children", "Connection", "connection_info", "drag_connection")
    }
    else if (type == "map_var") {
      change_element("map_variables_children", "Map Variables", "map_variables_info", "drag_map_variables")
    }
    else if (type == "import") {
      change_element("import_children", "Import", "import_info", "drag_import")
    }
    else if (type == "import_units") {
      change_element("import_units_children", "Import Units", "import_units_info", "drag_import_units")
    }
    else if (type == "import_component") {
      change_element("import_component_children", "Import Component", "import_container_info", "drag_import_component")
    }
    else {
      change_element("model_children", "Model", "model_info", "drag_model")
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

      const ref = document.getElementById("units_ref_input") as HTMLInputElement;
      const ref_value = ref.value;
      // add to the list of all elements
      const shapes_2 = shapes_;
      shapes_2.push({x: editor_mouseX, y: editor_mouseY, radius: 10, color:'red', element_type: 'unit', units: units_value, 
                     prefix: prefix_value, multiplier: multiplier_value, exponent: exponent_value, units_parent: ref_value});
      setShapes(shapes_2);
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
      templistofcomp.push({x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'component', name: comp_name, c_id: comp_id});
      setListofComponents(templistofcomp);
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'component', name: comp_name, c_id: comp_id});
      setShapes(shapes_2);
      // Update UI
      checkComponentName();
    } 
    // ==============================================================================================
    else if (clickedElement === "Variable") {
      const n     = document.getElementById("var_name_input") as HTMLInputElement;
      const u     = document.getElementById("var_units_input") as HTMLInputElement;
      const it    = document.getElementById("var_interface_input") as HTMLSelectElement;
      const init  = document.getElementById("var_init_input") as HTMLInputElement;
      const c_ref = document.getElementById("var_comp_ref_input") as HTMLInputElement;

      const shapes_2 = shapes_;
      shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 10, color: 'green', element_type:'variable', 
                      name: n.value, units: u.value, interface: it.value, initial_val: init.value, comp_parent: c_ref.value})
      setShapes(shapes_2);
    }
    // ==============================================================================================
    else if (clickedElement === "Reset") {
      const variable = document.getElementById("reset_var_input") as HTMLInputElement;
      const test_var = document.getElementById("reset_test_input") as HTMLInputElement;
      const v_order  = document.getElementById("reset_order_input") as HTMLInputElement;
      const c_ref    = document.getElementById("reset_comp_ref_input") as HTMLInputElement;

      const temp_reset_list = listofReset.sort(function(a,b) { return parseFloat(a.r_id) - parseFloat(b.r_id) });     
      const highest_value = temp_reset_list[temp_reset_list.length - 1];
      const added_reset_list = listofReset;
      let reset_id;
      (temp_reset_list.length === 0) ? reset_id = 1 : reset_id = highest_value.r_id + 1
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
    // ==============================================================================================
    else if (clickedElement === "Test Value") {
      const c_ref = document.getElementById("tv_comp_ref") as HTMLInputElement;
      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius: 10, color:'green', element_type:'test_val', comp_parent: c_ref.value, math_var:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Reset Value") {
      const c_ref = document.getElementById("rv_comp_ref") as HTMLInputElement;
      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'green', element_type:'reset_val', comp_parent: c_ref.value, math_var:''})
      setShapes(shapes_2);
    } 
    // ==============================================================================================
    else if (clickedElement === "Math") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'math'})
      setShapes(shapes_2);
    } 
    // ==============================================================================================
    else if (clickedElement === "Encapsulation") {
      // only 1 encapsulation is allowed
      const shapes_2 = shapes_;
      shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius: 20, color: 'silver', element_type: 'encapsulation'})
      setShapes(shapes_2);
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
      let comp_id;
      (templistofComponentRefs.length === 0) ? comp_id  = 1 : comp_id = highest_value.c_id + 1
      added_compr_list.push({x: editor_mouseX, y: editor_mouseY, radius:10, color: 'green', element_type:'component_ref', component: comp_value, c_id: comp_id, compf_parent: parent_id_value })

      const shapes_2 = shapes_;
      shapes_2.push( {x: editor_mouseX, y: editor_mouseY, radius:10, color: 'green', element_type:'component_ref', component: comp_value, c_id: comp_id, compf_parent: parent_id_value})
      setShapes(shapes_2);
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
    // ==============================================================================================
    else if (clickedElement === "Map Variables") {
      const c_ref = document.getElementById("map_connect_input") as HTMLInputElement;
      const map_v1 = document.getElementById("map_var_1_input") as HTMLInputElement;
      const map_v2 = document.getElementById("map_var_2_input") as HTMLInputElement;

      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:35, color:'purple', element_type:'map_var', 
                      variable1: map_v1.value, variable2: map_v2.value, conn_parent: c_ref.value});
      setShapes(shapes_2);
    } 
    // ==============================================================================================
    else if (clickedElement === "Import") {

      const href = document.getElementById("import_ref_input") as HTMLInputElement;
      const href_value = href.value;

      const sorted_imports = listofImports.sort(function(a,b) { return parseFloat(a.i_id) - parseFloat(b.i_id) })
      const highest_value = sorted_imports[sorted_imports.length - 1];

      const added_imp_list = listofImports;
      let imp_id;
      (sorted_imports.length === 0) ? imp_id = 1 : imp_id = highest_value.i_id + 1;
      added_imp_list.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'import', href:href_value, i_id: imp_id});
      setListofImports(added_imp_list);
      console.log('highest: ')
      console.log(highest_value);

      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'blue', element_type:'import', href:href_value, i_id: imp_id});
      setShapes(shapes_2);
    } 
    // ==============================================================================================
    else if (clickedElement === "Import Units") {

      const ref = document.getElementById("import_parent_reference_u") as HTMLInputElement;
      const i_name = document.getElementById("import_units_name_input") as HTMLInputElement;
      const i_ref = document.getElementById("import_units_ref_input") as HTMLInputElement;

      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'red', element_type:'import_units', name:i_name.value, units_ref:i_ref.value, import_parent: ref.value });
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Import Component") {

      const ref = document.getElementById("import_parent_reference_c") as HTMLInputElement;
      const i_name = document.getElementById("import_comp_name_input") as HTMLInputElement;
      const i_ref = document.getElementById("import_comp_ref_input") as HTMLInputElement;

      const shapes_2 = shapes_;
      shapes_2.push( {x:editor_mouseX, y:editor_mouseY, radius:10, color:'green', element_type:'import_component', name:i_name.value, units_ref:i_ref.value, import_parent: ref.value})
      setShapes(shapes_2);
    } 

    console.log(listofVariables);

    //context.drawImage(img, x_dir -60 , y_dir -60, 100, 100);
    drawAll();

  };





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

  }

  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK UNITS -------------------------------------
  // ---------------------------------------------------------------------------------
  // Error Checking the names
  const checkUnitsName = () => {
    const model_name = document.getElementById("units_name_input") as HTMLInputElement;

    // loop through pre-existing units - if seen mark as 1, AKA invalid
    let units_exists = 0;
    for (let i = 0; i<list_of_inbuilt_units.length; i++) {
      if (list_of_inbuilt_units[i] == model_name.value) units_exists = 1;
    }

    // loop and look if name is already taken
    let local_units = 0;
    const cun = document.getElementById("units_name_input") as HTMLInputElement;
    const current_units_name = cun.value;
    for (let i = 0; i<listofUnits.length; i++) {
	if (listofUnits[i].name === current_units_name) local_units = 1;
    }

    // check if the string inserted is valid
    if (units_exists == 1) {
      document.getElementById("units_name_input").style.borderColor = "#d64545";
    } else if (local_units == 1) {
      document.getElementById("units_name_input").style.borderColor = "#d64545";
    } else if (model_name.value.match('^[a-zA-Z][_a-zA-Z]*')) {
      document.getElementById("units_name_input").style.borderColor = "#45d651";
    } else {
      document.getElementById("units_name_input").style.borderColor = "#d64545";
    }
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK UNIT --------------------------------------
  // ---------------------------------------------------------------------------------

  const checkUnitMul = () => {
     const mul = document.getElementById("unit_multiplier_input") as HTMLInputElement;
     const value = mul.value;
     // exponent should be an integer
     if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) {
	document.getElementById("unit_multiplier_input").style.borderColor = "#45d651";
     } else {
	document.getElementById("unit_multiplier_input").style.borderColor = "#d64545";
     }
  }
  const checkUnitExp = () => {
     const exp = document.getElementById("unit_exp_input") as HTMLInputElement;
     const value = exp.value;
     // exponent should be an integer
     if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) {
	document.getElementById("unit_exp_input").style.borderColor = "#45d651";
     } else {
	document.getElementById("unit_exp_input").style.borderColor = "#d64545";
     }
  }
  const checkUnitPrefix = () => {
     const prefix = document.getElementById("unit_prefix_input") as HTMLInputElement;
     const value = prefix.value;
     // exponent should be an integer
     if (value.match(/^[+-]?(\d*\.)?\d+$/) != null) {
	document.getElementById("unit_prefix_input").style.borderColor = "#45d651";
     } else {
	document.getElementById("unit_prefix_input").style.borderColor = "#d64545";
     }
  }

  const checkUnitName = () => {
    // check if it's a default unit
    check_inbuilt_names();
    // check a list of all units added
    let local_units = 0;
    const cun = document.getElementById("unit_ref_input") as HTMLInputElement;
    const current_units_name = cun.value;
    for (let i = 0; i<listofUnits.length; i++) {
	if (listofUnits[i].name === current_units_name) local_units = 1;
    }

    if (local_units === 1) {
      document.getElementById("unit_ref_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("unit_ref_input").style.borderColor = "#d64545";
    }
    // check if the name corresponds to a prefix
    check_inbuilt_prefix();
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
    let existing = 0;
    for (let i =0; i<listofComponents.length; i++) {
	if (listofComponents[i].name === comp_name.value) existing = 1;
    }
    if (existing === 1) {
	document.getElementById("comp_name_input").style.borderColor = "#d64545";  
    } else if (comp_name.value.match('^[a-zA-Z][_a-zA-Z]*')) {
      document.getElementById("comp_name_input").style.borderColor = "#45d651";
    } else {
      document.getElementById("comp_name_input").style.borderColor = "#d64545";
    }
  }

  // ---------------------------------------------------------------------------------
  // ---------------------------- CHECK VARIABLES ------------------------------------
  // ---------------------------------------------------------------------------------
  const checkVariableName = () => {
    const var_name = document.getElementById("var_name_input") as HTMLInputElement;
    let existing = 0;
    for (let i =0; i<listofVariables.length; i++) {
	if (listofVariables[i].name === var_name.value) existing = 1;
    }
    if (existing === 1) {
	document.getElementById("var_name_input").style.borderColor = "#d64545";  
    } else if (var_name.value.match('^[a-zA-Z][_a-zA-Z]*')) {
      document.getElementById("var_name_input").style.borderColor = "#45d651";
    } else {
      document.getElementById("var_name_input").style.borderColor = "#d64545";
    }
  }

  const checkVariableUnits = () => {
    const var_units = document.getElementById("var_units_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofUnits.length; i++) {
      if (listofUnits[i].name === var_units.value) exists = 1;
    }
    for (let i=0; i<list_of_inbuilt_units.length; i++) {
      if (list_of_inbuilt_units[i] === var_units.value) exists = 1;
    }

    if (exists === 1) {
	document.getElementById("var_units_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("var_units_input").style.borderColor = "#d64545";
    }
  }

  const checkVariableInitValue = () => {
    const var_init = document.getElementById("var_init_input") as HTMLInputElement;
    // may be a valid resource or a valid real number
    let exists = 0;
    for (let i=0; i<listofVariables.length; i++) {
        if(listofVariables[i].name === var_init.value) exists = 1;
    }
    if (exists === 1) {
	document.getElementById("var_init_input").style.borderColor = "#45d651";
    }
    else if (var_init.value.match(/^[+-]?(\d*\.)?\d+$/) != null) {
	document.getElementById("var_init_input").style.borderColor = "#45d651";
    } 
    // note: need to add the case of r = sx10E
    else {
	document.getElementById("var_init_input").style.borderColor = "#d64545";
    }
  }
  // ---------------------------------------------------------------------------------
  // ------------------------------- CHECK RESET -------------------------------------
  // ---------------------------------------------------------------------------------
  const checkResetVar = () => {
    const var_reset = document.getElementById("reset_var_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofVariables.length; i++) {
      if (listofVariables[i].name === var_reset.value) exists = 1;
    }
    if (exists === 1) {
	document.getElementById("reset_var_input").style.borderColor = "#45d651";
    } else {
	document.getElementById("reset_var_input").style.borderColor = "#d64545";
    }
  }

  const checkResetTest = () => {
    const test_reset = document.getElementById("reset_test_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofVariables.length; i++) {
      if (listofVariables[i].name === test_reset.value) exists = 1;
    }
    if (exists === 1) {
	document.getElementById("reset_test_input").style.borderColor = "#45d651";
    } else {
	document.getElementById("reset_test_input").style.borderColor = "#d64545";
    }
  }

  const checkResetOrder = () => {
    const ord_reset = document.getElementById("reset_order_input") as HTMLInputElement;
    if (ord_reset.value.match(/^[+-]?(\d*\.)?\d+$/) != null) {
	document.getElementById("reset_order_input").style.borderColor = "#45d651";
    } else {
	document.getElementById("reset_order_input").style.borderColor = "#d64545";
    }
    // TODO: make sure order is not repeated (unique to that variable)
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
      document.getElementById("comp_ref_comp_input").style.borderColor = "#45d651";
    } else {
      document.getElementById("comp_ref_comp_input").style.borderColor = "#d64545";
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
    if (c1_exists === 1) document.getElementById("connect_1_input").style.borderColor = "#45d651";
    if (c2_exists === 1) document.getElementById("connect_2_input").style.borderColor = "#45d651";
    if (con1.value === con2.value) {
      document.getElementById("connect_1_input").style.borderColor = "#d64545";
      document.getElementById("connect_2_input").style.borderColor = "#d64545";
    } 
    if (c1_exists === 0) document.getElementById("connect_1_input").style.borderColor = "#d64545";
    if (c2_exists === 0) document.getElementById("connect_2_input").style.borderColor = "#d64545";
  }

  // ---------------------------------------------------------------------------------
  // -------------------------------- MAP VARIABLES ----------------------------------
  // ---------------------------------------------------------------------------------
  const checkMapVariablesVar = ()  => {
    const var1 = document.getElementById("map_var_1_input") as HTMLInputElement;
    const var2 = document.getElementById("map_var_2_input") as HTMLInputElement;
    let v1_exists = 0;
    let v2_exists = 0;
    for (let i =0; i<listofVariables.length; i++) {
      if (listofVariables[i].name === var1.value) v1_exists = 1;
      if (listofVariables[i].name === var2.value) v2_exists = 1;
    }
    if (v1_exists === 1) document.getElementById("map_var_1_input").style.borderColor = "#45d651";
    if (v2_exists === 1) document.getElementById("map_var_2_input").style.borderColor = "#45d651";
    if (var1.value === var2.value) {
      document.getElementById("map_var_1_input").style.borderColor = "#d64545";
      document.getElementById("map_var_2_input").style.borderColor = "#d64545";
    } 
    if (v1_exists === 0) document.getElementById("map_var_1_input").style.borderColor = "#d64545";
    if (v2_exists === 0) document.getElementById("map_var_2_input").style.borderColor = "#d64545";
  }

  // ---------------------------------------------------------------------------------
  // ------------------------------------ IMPORT -------------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportHREF = () => {
    const href = document.getElementById("import_ref_input") as HTMLInputElement;
    // hard coded: replace for valid link
    if (href.value === "dorothy.cellml") {
      document.getElementById("import_ref_input").style.borderColor = "#45d651";
    } else {
      document.getElementById("import_ref_input").style.borderColor = "#d64545";
    }
  }
  // ---------------------------------------------------------------------------------
  // --------------------------------- IMPORT UNITS ----------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportUnitsName = () => {
    const name = document.getElementById("import_units_name_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofUnits.length; i++) {
      if (listofUnits[i].name === name.value) exists = 1;
    }
    // hard coded: replace later with the imported list
    if (exists === 1) {
	document.getElementById("import_units_name_input").style.borderColor = "#d64545";  
    } else if (exists === 0) {
        document.getElementById("import_units_name_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("import_units_name_input").style.borderColor = "#d64545";
    }
  }
  const checkImportUnitsRef = () => {
    const name = document.getElementById("import_units_ref_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofUnits.length; i++) {
      if (listofUnits[i].name === name.value) exists = 1;
    }
    // hard coded: replace later with the imported list
    if (exists === 1) {
	document.getElementById("import_units_ref_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("import_units_ref_input").style.borderColor = "#d64545";
    }
  }
  // ---------------------------------------------------------------------------------
  // ------------------------------ IMPORT COMPONENTS --------------------------------
  // ---------------------------------------------------------------------------------
  const checkImportCompName = () => {
    const name = document.getElementById("import_comp_name_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === name.value) exists = 1;
    }
    // hard coded: replace later with the imported list
    if (exists === 1) {
	document.getElementById("import_comp_name_input").style.borderColor = "#d64545";  
    } else if (exists === 0) {
        document.getElementById("import_comp_name_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("import_comp_name_input").style.borderColor = "#d64545";
    }
  }
  const checkImportCompRef = () => {
    const name = document.getElementById("import_comp_ref_input") as HTMLInputElement;
    let exists = 0;
    for (let i =0; i<listofComponents.length; i++) {
      if (listofComponents[i].name === name.value) exists = 1;
    }
    // hard coded: replace later with the imported list
    if (exists === 1) {
	document.getElementById("import_comp_ref_input").style.borderColor = "#45d651";  
    } else {
      document.getElementById("import_comp_ref_input").style.borderColor = "#d64545";
    }
  }
  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------
  // After the user is happy with what they have created they can generate the model
  const convert_to_text_model = () => {
    console.log(shapes_);


    const xml_version = `<?xml version="1.0" encoding="UTF-8"?>`;
    const new_line = "\n";


    const model_name_input = document.getElementById("insert_name_box") as HTMLInputElement;
    const model_name = model_name_input.value;

    const model = `<model xmlns="http://www.cellml.org/cellml/2.0#" name="` + model_name + `">`;
    const model_end = `</model>`;

    console.log(xml_version + new_line + model + new_line + model_end);
    

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
  // The create image section: returning the whole section
  return (
    <div className="container">
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
        


        <div id="model_padding"> </div>
        <div id="canvas_and_model_container">
          <canvas id="graphCanvas" onDrop={dropElem} onDragOver={allowDrop} height="500" width="1000" onMouseDown={(event)=>handleMouseDown(event)}
                  onMouseOut={(event)=>handleMouseOut(event)} onMouseUp={(event)=>handleMouseUp(event)}  onMouseMove={(event)=>handleMouseMove(event)}></canvas>
          <div id="element_info">{clickedElement}
          <div>
            <div id="model_info" className="elem_info">
              <div>Name: {modelname}</div>
            </div>
            <div id="element_drag_img">

              <img id="drag_component" className="element_img" 
                 src="https://cdn.pixabay.com/photo/2016/08/25/07/30/red-1618916_640.png" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_units" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-009688.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_unit" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-03a9f4.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_variable" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-ff5722.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_reset" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-4caf50.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_test_value" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-8bc34a.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_reset_value" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-cddc39.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_math" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-3f51b5.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_encapsulation" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-607d8b.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_comp_ref" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-e91e63.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_connection" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-673ab7.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_map_variables" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-ffc107.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>

              <img id="drag_import" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-666666.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_import_units" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-ba352c.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_import_component" className="element_img" 
                 src="https://svgsilh.com/svg/1618916-027468.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
          
              <img id="drag_model" className="element_img" 
                 src="https://svgsilh.com/svg/1618916.svg" 
                 draggable={true} 
                 onMouseOver={(event) => get_pos_elem(event)} 
                 onDragStart={(event) => dragElement(event)}/>
            </div>




            <div id="units_info" className="elem_info tooltip-wrap2">
              <div> Name: 
                <input id="units_name_input" className="elem_info_input" placeholder="units_name" onKeyUp={checkUnitsName}></input>
                <div className="tooltip-content2">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a unique name in the model</li>
                    <li>Can't be a name of built-in units</li>
                  </ul>
                </div>
              </div>
            </div>



            <div id="unit_info" className="elem_info tooltip-wrap2">
              <div> Units: 
                <input id="unit_ref_input" className="elem_info_input" placeholder="units_ref" onKeyUp={checkUnitName}></input>
                <div className="tooltip-content2">
                  {/*<ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a name of a units element in the model</li>
                    <li>Unit may be any built in unit element</li>
		  </ul>*/}
                </div>
              </div>
              <div> Units reference:
                <input id="units_ref_input" className="elem_info_input" placeholder="1"></input>
              </div>
              <div> Base:
                <input id="unit_base_input" className="elem_info_input" placeholder="base_element"></input>
              </div>
              <div> Prefix*:
                <input id="unit_prefix_input" className="elem_info_input" defaultValue="0" onKeyUp={checkUnitPrefix}></input>
		<div className="tooltip-content2">
			{/*Must be a valid number & default is 0*/}
                </div>
              </div>
              <div> Multiplier*:
                <input id="unit_multiplier_input" className="elem_info_input" defaultValue="1.0" onKeyUp={checkUnitMul}></input>
		<div className="tooltip-content2">
			{/*Must be a valid number & default is 1.0*/}
                </div>
              </div>
              <div> Exponent*:
                <input id="unit_exp_input" className="elem_info_input" defaultValue="1.0" onKeyUp={checkUnitExp}></input>
		<div className="tooltip-content2">
			{/*Must be a valid number & default is 1.0*/}
                </div>
              </div>
            </div>
            
            <div id="component_info" className="elem_info tooltip-wrap2">
              <div> Name: 
                <input id="comp_name_input" className="elem_info_input" placeholder="comp_name" onKeyUp={checkComponentName}></input>
                <div className="tooltip-content2">
                  <div className="tooltip-content2">
                  <ul>
                    <li>Alphabetical first (A-Z | a-z), followed by alphanumeric or underscore (A-Z | a-z | 0-9 | _)</li>
                    <li>Must be a unique name in the model</li>
                  </ul>
                </div>
                </div>
              </div>
            </div>

            <div id="variable_info" className="elem_info">
              <div> Component Reference: 
                <input id="var_comp_ref_input" className="elem_info_input" placeholder="var_name" onKeyUp={checkVariableName}></input>
              </div>
              <div> Name: 
                <input id="var_name_input" className="elem_info_input" placeholder="var_name" onKeyUp={checkVariableName}></input>
              </div>
	<div> Units: 
                <input id="var_units_input" className="elem_info_input" placeholder="units" onKeyUp={checkVariableUnits}></input>
              </div>
              <div> Interface (*):
                <select id="var_interface_input" className="elem_info_input" placeholder="none">
			<option value="public">Public</option>
			<option value="private">Private</option>
			<option value="public_and_private">Public & Private</option>
			<option value="none">None</option>
		</select>
              </div>
              <div> Initial_Value (*):
                <input id="var_init_input" className="elem_info_input" placeholder="initial_value" onKeyUp={checkVariableInitValue}></input>
              </div>
            </div>

            <div id="reset_info" className="elem_info">
              <div> Component Reference: 
                <input id="reset_comp_ref_input" className="elem_info_input" placeholder="var_name" defaultValue="a" onKeyUp={checkVariableName}></input>
              </div>
              <div> Variable: 
                <input id="reset_var_input" className="elem_info_input" placeholder="var_ref" defaultValue="b" onKeyUp={checkResetVar}></input>
              </div>
              <div> Test Variable: 
                <input id="reset_test_input" className="elem_info_input" placeholder="test_var" defaultValue="c" onKeyUp={checkResetTest}></input>
              </div>
              <div> Order: 
                <input id="reset_order_input" className="elem_info_input" placeholder="order" defaultValue="d" onKeyUp={checkResetOrder}></input>
              </div>
            </div>

            <div id="test_value_info" className="elem_info">
              <div> Component Reference: 
                <input id="tv_comp_ref" className="elem_info_input" placeholder="var_name" onKeyUp={checkVariableName}></input>
              </div>
              <div> Needs Math Element </div>
            </div>
            <div id="reset_value_info" className="elem_info">
              <div> Component Reference: 
                <input id="rv_comp_ref" className="elem_info_input" placeholder="var_name" onKeyUp={checkVariableName}></input>
              </div>
              <div> Needs Math Element </div>
            </div>
            <div id="math_info" className="elem_info">
              <div> Edit Later </div>
            </div>
            <div id="encapsulation_info" className="elem_info">
              <div> Needs Component Ref Element </div>
            </div>

            <div id="component_ref_info" className="elem_info">
              <div> Component Ref Parent: 
                <input id="comp_ref_parent_id" className="elem_info_input" placeholder="0" defaultValue="1" onKeyUp={checkCompRefComp}></input>
              </div>
              <div> Component: 
                <input id="comp_ref_comp_input" className="elem_info_input" placeholder="component" onKeyUp={checkCompRefComp}></input>
              </div>
            </div>
    
            <div id="connection_info" className="elem_info">
              <div> Component 1: 
                <input id="connect_1_input" className="elem_info_input" placeholder="comp_ref_1" onKeyUp={checkConnectionComp}></input>
              </div>
              <div> Component 2: 
                <input id="connect_2_input" className="elem_info_input" placeholder="comp_ref_2" onKeyUp={checkConnectionComp}></input>
              </div>
            </div>
    
            <div id="map_variables_info" className="elem_info">
              <div> Connection Ref: 
                <input id="map_connect_input" className="elem_info_input" placeholder="component" onKeyUp={checkCompRefComp}></input>
              </div>
              <div> Variable 1: 
                <input id="map_var_1_input" className="elem_info_input" placeholder="variable_1" onKeyUp={checkMapVariablesVar}></input>
              </div>
              <div> Variable 2: 
                <input id="map_var_2_input" className="elem_info_input" placeholder="variable_2" onKeyUp={checkMapVariablesVar}></input>
              </div>
            </div>

            <div id="import_info" className="elem_info">
              <div> HREF: 
                <input id="import_ref_input" className="elem_info_input" placeholder="component" onKeyUp={checkImportHREF}></input>
              </div>
            </div>

            <div id="import_units_info" className="elem_info">
              <div> Import Reference: 
                <input id="import_parent_reference_u" className="elem_info_input" placeholder="import_u_ref" onKeyUp={checkImportUnitsRef}></input>
              </div>
              <div> Name: 
                <input id="import_units_name_input" className="elem_info_input" placeholder="import_u_name" onKeyUp={checkImportUnitsName}></input>
              </div>
              <div> Units Ref: 
                <input id="import_units_ref_input" className="elem_info_input" placeholder="import_u_ref" onKeyUp={checkImportUnitsRef}></input>
              </div>
            </div>

            <div id="import_container_info" className="elem_info">
              <div> Import Reference: 
                <input id="import_parent_reference_c" className="elem_info_input" placeholder="import_u_ref" onKeyUp={checkImportUnitsRef}></input>
              </div>
              <div> Name: 
                <input id="import_comp_name_input" className="elem_info_input" placeholder="import_c_name" onKeyUp={checkImportCompName}></input>
              </div>
              <div> Units Ref: 
                <input id="import_comp_ref_input" className="elem_info_input" placeholder="import_c_ref" onKeyUp={checkImportCompRef}></input>
              </div>
            </div>
    
          </div>
            

            
            <div id="children_section">
              <div id="children">Children</div>
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
              <div id="import_units_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
              <div id="import_component_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
              <div id="units_children" className="children_list">
                <ul>
                  <li>Unit</li>
                </ul>
              </div>
              <div id="unit_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
              <div id="component_children" className="children_list">
                <ul>
                  <li>Math</li>
                  <li>Reset</li>
                  <li>Variable</li>
                </ul>
              </div>
              <div id="variable_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
              <div id="reset_children" className="children_list">
                <ul>
                  <li>Reset Value</li>
                  <li>Test Value</li>
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
              <div id="math_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
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
              <div id="map_variables_children" className="children_list">
                <ul>
                  <li>N/A</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        
        <div>===========================================================================================</div>
       {/*} <img id="img1" src="http://static.tumblr.com/vcbmwcj/foumiteqs/arrow_up_alt1.svg" 
             draggable={true} onMouseOver={(event) => get_pos_elem(event)} 
    onDragStart={(event) => dragElement(event)} />*/}
      </div>
    



        <div id="element_information_items_set" className="flex-container">

          <div id="units_container" className="flex-item">
            <img id="units_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-009688.svg"
                 onClick={()=>change_element("units_children", "Units", "units_info", "drag_units")}>
            </img>
            <div className="bottomtext">Units</div>
          </div>

          <div id="unit_container"  className="flex-item">
            <img id="unit_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-03a9f4.svg"
                 onClick={()=>change_element("unit_children", "Unit", "unit_info", "drag_unit")}>
            </img>
            <div className="bottomtext">Unit</div>
          </div>

          <div id="component_container"  className="flex-item">
            <img id="component_container_image" className="element_img" 
                 src="https://cdn.pixabay.com/photo/2016/08/25/07/30/red-1618916_640.png" 
                 onClick={()=>change_element("component_children", "Component", "component_info", "drag_component")}/>
            <div className="bottomtext">Component</div>
          </div>

          <div id="variable_container"  className="flex-item">
            <img id="variable_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-ff5722.svg"
                onClick={()=>change_element("variable_children", "Variable", "variable_info", "drag_variable")}>
            </img>
            <div className="bottomtext">Variable</div>
          </div>

          <div id="reset_container" className="flex-item">
            <img id="reset_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-4caf50.svg"
                 onClick={()=>change_element("reset_children", "Reset", "reset_info", "drag_reset")}>
            </img>
            <div className="bottomtext">Reset</div>
          </div>

          <div id="test_value_container" className="flex-item">
            <img id="test_value_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-8bc34a.svg"
                 onClick={()=>change_element("test_value_children", "Test Value", "test_value_info", "drag_test_value")}>
            </img>
            <div className="bottomtext">Test Value</div>
          </div>

          <div id="reset_value_container" className="flex-item">
            <img id="reset_value_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-cddc39.svg"
                 onClick={()=>change_element("reset_value_children", "Reset Value", "reset_value_info", "drag_reset_value")}>
            </img>
            <div className="bottomtext">Reset Value</div>
          </div>

          <div id="math_container" className="flex-item">
            <img id="math_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-3f51b5.svg"
                 onClick={()=>change_element("math_children", "Math", "math_info", "drag_math")}>
            </img>
            <div className="bottomtext">Math</div>
          </div>

          <div id="encapsulation_container" className="flex-item">
            <img id="encapsulation_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-607d8b.svg"
                 onClick={()=>change_element("encapsulation_children", "Encapsulation", "encapsulation_info", "drag_encapsulation")}>
            </img>
            <div className="bottomtext">Encapsulation</div>
          </div>

          <div id="component_ref_container" className="flex-item">
            <img id="component_ref_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-e91e63.svg"
                 onClick={()=>change_element("component_ref_children", "Component Reference", "component_ref_info", "drag_comp_ref")}>
            </img>
            <div className="bottomtext">Component Ref</div>
          </div>

          <div id="connection_container" className="flex-item">
            <img id="connection_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-673ab7.svg"
                 onClick={()=>change_element("connection_children", "Connection", "connection_info", "drag_connection")}>
            </img>
            <div className="bottomtext">Connection</div>
          </div>

          <div id="map_variables_container" className="flex-item">
            <img id="map_variables_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-ffc107.svg"
                 onClick={()=>change_element("map_variables_children", "Map Variables", "map_variables_info", "drag_map_variables")}>
            </img>
            <div className="bottomtext">Map Variables</div>
          </div>

          <div id="import_container" className="flex-item">
            <img id="import_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-666666.svg"
                 onClick={()=>change_element("import_children", "Import", "import_info", "drag_import")}>
            </img>
            <div className="bottomtext">Import</div>
          </div>

          <div id="import_units_container" className="flex-item">
            <img id="import_units_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-ba352c.svg"
                 onClick={()=>change_element("import_units_children", "Import Units", "import_units_info", "drag_import_units")}>
            </img>
            <div className="bottomtext">Import Units</div>
          </div>

          <div id="import_component_container" className="flex-item">
            <img id="import_component_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916-027468.svg"
                 onClick={()=>change_element("import_component_children", "Import Component", "import_container_info", "drag_import_component")}>
            </img>
            <div className="bottomtext">Import Comp.</div>
          </div>

          <div id="model_container" className="flex-item">
            <img id="model_container_image" className="element_img" 
            src="https://svgsilh.com/svg/1618916.svg"
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
