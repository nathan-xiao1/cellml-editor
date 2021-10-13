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
  ctx: CanvasRenderingContext2D;
  constructor(type: string, children: ModelElement[], x:number, y:number, 
              ctx:CanvasRenderingContext2D) {
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.ctx      = ctx;
  }
}

// Units is an Element
/* super: contains all the models stuff
   name:  name of the units */
class Units extends ModelElement {
  name: string;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              ctx: CanvasRenderingContext2D, name: string) {
    super(type, children, x, y, ctx);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.ctx      = ctx;
    this.name     = name;
  }
}


class Unit extends ModelElement {
  unit: string;
  prefix: number;
  multiplier: number;
  exponent: number;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              ctx: CanvasRenderingContext2D, unit: string, prefix: number,
              multiplier: number, exponent: number) {
    super(type, children, x, y, ctx);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.ctx      = ctx;
    this.unit     = unit;
    this.prefix   = prefix;
    this.multiplier= multiplier;
    this.exponent = exponent;
  }
}

class Component extends ModelElement {
  name: string;
  constructor(type: string, children: ModelElement[], x: number, y: number, 
              ctx: CanvasRenderingContext2D, name: string) {
    super(type, children, x, y, ctx);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.ctx      = ctx;
    this.name     = name;
  }
}

class Variable extends ModelElement {
  name: string;
  units: string;
  interface_: string;
  initial_value: string;

  constructor(type: string, children: ModelElement[], x: number, y: number, 
        ctx: CanvasRenderingContext2D, name: string, units:string, interface_: string,
	initial_value: string) {
    super(type, children, x, y, ctx);
    this.type     = type;
    this.children = children;
    this.x        = x;
    this.y        = y;
    this.ctx      = ctx;
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

// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------

const CreateImgModel: React.FunctionComponent = () => {

  // The current element clicked on
  const [content, setContent] = useState<string>("Drop Something Here");
  const [posX, setDX] = useState(0);
  const [posY, setDY] = useState(0);
  const [clickedElement, setClickedElement] = useState('Model');
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

  
  const [imagesOnCanvas, setImagesonCanvas] = useState([]); 
  
  // list of all the elements in the model
  const [modelElements, setModelElements] = useState([]);
  const [listofUnits, setListofUnits] = useState([]);
  const [listofComponents, setListofComponents] = useState([]);
  const [listofVariables, setListofVariables] = useState([]);
  

  // ---------------------------------------------------------------
  // ----------------------- MOVE ELEMENTS -------------------------
  // ---------------------------------------------------------------

  // shapes contains all the elements
  //let shapes_ = [] as any;
  const [shapes_, setShapes] = useState([]);
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

  


  // Clear the canvas and then redraw every time there is a new action
  function drawAll() {
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    console.log(shapes_);
    for (let i = 0; i<shapes_.length; i++) {
      const shape = shapes_[i];
      if (shape.element_type) {
        if (shape.element_type == "units") {
          context.beginPath(); 
          context.rect(shape.x - 25, shape.y - 34, 120, 60);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x, shape.y);
          context.stroke();
        }
        else if (shape.element_type == "unit") {
          for (let i = 0; i< shapes_.length; i++) {
            if (shape.units === shapes_[i].units_name) {
              context.beginPath();
              context.moveTo(shape.x, shape.y);
              context.lineTo(shapes_[i].x, shapes_[i].y);
              context.stroke();
              console.log('match');
            }
          }
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(73,177,75)";
          context.stroke();
          // draw the connection lines between units and unit
        }
        else if (shape.element_type == "component") {
          context.beginPath(); 
          context.rect(shape.x - 25, shape.y - 34, 120, 60);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="red";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.name, shape.x, shape.y);
          context.stroke();
        }
        else if (shape.element_type == "variable") {
          context.beginPath(); 
          context.rect(shape.x - 25, shape.y - 34, 120, 60);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="orange";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.name, shape.x, shape.y);
          context.stroke();
        }
        else if (shape.element_type == "reset") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "blue";
          context.stroke();
        }
        else if (shape.element_type == "test_val") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(40,175,230)";
          context.stroke();
        }
        else if (shape.element_type == "reset_val") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(60,210,190)";
          context.stroke();
        }
        else if (shape.element_type == "math") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }
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
        }
        else if (shape.element_type == "component_ref") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }
        else if (shape.element_type == "connection") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "purple";
          context.stroke();
        }
        else if (shape.element_type == "map_var") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }
        // a box containing the imported module
        else if (shape.element_type == "import") {
          context.beginPath(); 
          context.rect(shape.x - 25, shape.y - 34, 120, 60);
          context.fillStyle='black';
          context.strokeStyle=shape.color;
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.font='bold 12px Arial'
          context.fillText("Import from:", shape.x, shape.y - 20);
          context.font =  "16px Arial";
          context.fillText("/" + shape.href, shape.x, shape.y);
          context.stroke();
        }
        else if (shape.element_type == "import_units") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }
        else if (shape.element_type == "import_component") {
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "white";
          context.fill();
          context.lineWidth = 5;
          context.strokeStyle = "grey";
          context.stroke();
        }


      } else if (shape.radius) {
        context.beginPath();
        context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
        context.fillStyle=shape.color;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = "black";
        context.stroke();
      } else if (shape.width) {
        context.fillStyle=shape.color;
        context.fillRect(shape.x,shape.y,shape.width,shape.height);
      }
    }
  }

  // Manipulating the current element variables
  let isDragging_ = false;
  let startX_:number, startY_:number;
  let selectedShapeIndex: number;

  function isMouseInShape(mx: number, my: number, shape: any) {
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
    isDragging_=false;
  }

  function handleMouseOut(e: any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    isDragging_=false;
  }

  function handleMouseMove(e: any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
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



  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  // The box (canvas) to allow an element to be dropped
  const allowDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  };

  // Drop the element onto the canvas
  const dropElem = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const img = document.getElementById(currentElementImg) as HTMLImageElement;
    const dx = posX - img.offsetLeft;
    const dy = posY - img.offsetTop;
    /*console.log("dx and dy")
    console.log(dx);
    console.log(dy);
    console.log("mouse position")
    console.log(event.dataTransfer.getData("mouse_position_x"));
    console.log(event.dataTransfer.getData("mouse_position_y"));*/

    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    const x_dir = (event.pageX - dx);
    const y_dir = (event.pageY - dy);

    const aaa = parseInt(event.dataTransfer.getData("mouse_position_x"));
    const bbb = parseInt(event.dataTransfer.getData("mouse_position_y"));

    console.log('x_dir: ' + x_dir + ', y_dir: ' + y_dir);

    
    const temp = imagesOnCanvas;
    temp.push({
      context: context,
      image: img,
      x: event.clientX - canvas.offsetLeft - aaa,
      y: event.clientY - canvas.offsetTop - bbb,
      width: img.offsetWidth,
      height: img.offsetHeight
    });
    setImagesonCanvas(temp);

    console.log('clicked element: ' + clickedElement);

    console.log(listofUnits);
    // dropping the element will add it to the overall list
    if (clickedElement === "Units") {
      const un = document.getElementById("units_name_input") as HTMLInputElement;
      const units_name = un.value;
      const newUnits = new Units('Units', [], x_dir, y_dir, context, units_name);
      const templistofunits = listofUnits;
      templistofunits.push(newUnits);
      setListofUnits(templistofunits);
      //context.fillText(units_name, x_dir - 25 , y_dir);
      checkUnitsName();

      // need to change so if not valid then can't
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:15, color:'green', element_type:'units', units_name: units_name})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Unit") {
      const base = document.getElementById("unit_base_input") as HTMLInputElement;
      const unit_ref_input_src = document.getElementById("unit_ref_input") as HTMLInputElement;
      const unit_ref_input = unit_ref_input_src.value;
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'green', element_type:'unit', units:unit_ref_input, base:'', prefix:'', multiplier:'', exponent:''})
      setShapes(shapes_2);
    }
    else if (clickedElement === "Component") {
      const c = document.getElementById("comp_name_input") as HTMLInputElement;
      const comp_name = c.value;
      const new_element = new Component('Component', [], x_dir, y_dir, context, comp_name);
      console.log(new_element)
      const templistofcomp = listofComponents;
      templistofcomp.push(new_element);
      setListofComponents(templistofcomp);
      //context.fillText(comp_name, x_dir - 25 , y_dir);
      checkComponentName();

      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'green', element_type:'component', name: comp_name})
      setShapes(shapes_2);
    } 
    
    else if (clickedElement === "Variable") {
      const n = document.getElementById("var_name_input") as HTMLInputElement;
      const u = document.getElementById("var_units_input") as HTMLInputElement;
      const it = document.getElementById("var_interface_input") as HTMLSelectElement;
      const init = document.getElementById("var_init_input") as HTMLInputElement;
      
      const new_element = new Variable('Variable', [], x_dir, y_dir, context, 
              n.value, u.value, it.value, init.value);
      const templistofvar = listofVariables;
      templistofvar.push(new_element);
      setListofVariables(templistofvar);
      //context.fillText(n.value, x_dir - 25 , y_dir);

      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'variable', name:'', units:'', interface:'', initial_val:''})
      setShapes(shapes_2);
    }
    else if (clickedElement === "Reset") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'rgb(76,175,80)', element_type:'reset', variable:'', test_var:'', order:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Test Value") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'test_val', variable:'', test_var:'', order:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Reset Value") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'reset_val', math_var:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Math") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'math'})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Encapsulation") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'encapsulation'})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Component Reference") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'component_ref', component: ''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Connection") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'connection', component1:'', component2:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Map Variables") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'map_var', variable1:'', variable2:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Import") {
      const href = document.getElementById("import_ref_input") as HTMLInputElement;
      const href_value = href.value;
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'rgb(102,102,102)', element_type:'import', href:href_value})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Import Units") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'import_units', name:'', units_ref:''})
      setShapes(shapes_2);
    } 
    else if (clickedElement === "Import Component") {
      const shapes_2 = shapes_;
      shapes_2.push( {x:x_dir, y:y_dir, radius:35, color:'pink', element_type:'import_component', name:'', comp_ref:''})
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
  
  const restartCanvas = () => {
    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.height, canvas.width);
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

  const qqq = `<?xml version="1.0" encoding="UTF-8"?>
<model xmlns="http://www.cellml.org/cellml/2.0#" name="Apples">
<component name="apples">
    <variable name="a" units="ms" interface="public_and_private"/>
    <variable name="b" units="ms" interface="public_and_private"/>
    <variable name="c" units="ms" interface="private"/>
  </component>`
  const convert_to_text_model = () => {
   // console.log(qqq);

  }

  // top of page button to check console logs/funcitonality
  const debugbutnfunc = () => {
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
  }

  

  


  // The displayed information
  return (
    <div className="container">{/*<button onClick={debugbutnfunc}>Debug Button</button>*/}
      <div>
        <div className="tooltip-wrap">
          <label id="create_model_title" htmlFor="insert_name_box">Create A New Model: </label>
          <input id="insert_name_box" type="text" placeholder='model_name' onKeyUp={checkValidName}/>
          <div className="tooltip-content">
            <p>
              <b>Valid Model Name: </b> 
              alphabetical (a-z | A-Z) first, 
              followed by alphanumeric or underscores (a-z | A-Z | 1-9 | _)
            </p>
          </div> 
        </div>

        
        <button className="restart_model_button generate_model_button" onClick={restartCanvas}>Restart Model</button>
        <button className="generate_model_button" onClick={convert_to_text_model}>Generate Model</button>

        <img src="https://cdn.pixabay.com/photo/2016/08/25/07/30/red-1618916_640.png" width="50px" height="50px" onClick={reOffset}/>

        <div>===========================================================================================</div>
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
              <div> Variable: 
                <input id="reset_var_input" className="elem_info_input" placeholder="var_ref" onKeyUp={checkResetVar}></input>
              </div>
              <div> Test Variable: 
                <input id="reset_test_input" className="elem_info_input" placeholder="test_var" onKeyUp={checkResetTest}></input>
              </div>
              <div> Order: 
                <input id="reset_order_input" className="elem_info_input" placeholder="order" onKeyUp={checkResetOrder}></input>
              </div>
            </div>

            <div id="test_value_info" className="elem_info">
              <div> Needs Math Element </div>
            </div>
            <div id="reset_value_info" className="elem_info">
              <div> Needs Math Element </div>
            </div>
            <div id="math_info" className="elem_info">
              <div> Edit Later </div>
            </div>
            <div id="encapsulation_info" className="elem_info">
              <div> Needs Component Ref Element </div>
            </div>

            <div id="component_ref_info" className="elem_info">
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
              <div> Name: 
                <input id="import_units_name_input" className="elem_info_input" placeholder="import_u_name" onKeyUp={checkImportUnitsName}></input>
              </div>
              <div> Units Ref: 
                <input id="import_units_ref_input" className="elem_info_input" placeholder="import_u_ref" onKeyUp={checkImportUnitsRef}></input>
              </div>
            </div>

            <div id="import_container_info" className="elem_info">
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
