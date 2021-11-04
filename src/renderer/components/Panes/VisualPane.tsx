import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { MathJaxContext, MathJax, MathJax2Config, MathJaxContextProps } from 'better-react-mathjax';
// Import interface which normally isn't public to extend it
import { MathMLInputProcessor } from 'better-react-mathjax/MathJax2';
import { IDOM, Prefix } from "Types";
import "./TreePane/TreePane.scss";

import "./VisualPane.scss";
import { DoubleArrow } from "@material-ui/icons";
import shape from "@material-ui/core/styles/shape";

interface TPProps {
  dom?: IDOM;
  filepath? : string;
  onClickHandler: (lineNum: number) => void;
}

// List of all the cellml elements
let cellml_elements = [] as any;
// Manipulating the current element variables
let isDragging_ = false;
let startX_:number, startY_:number;
let selectedShapeIndex: number;

const defaultStr = `
<math xmlns="http://www.w3.org/1998/Math/MathML" xmlns:cellml="http://www.cellml.org/cellml/2.0#">
      <mrow>
    <mrow>
    <msup>
        <mi>x</mi>
        <mn>2</mn>
    </msup>
        <mo>+</mo>
    <mrow>
        <mn>4</mn>
        <mo>&InvisibleTimes;</mo>
        <mi>x</mi>
    </mrow>
        <mo>+</mo>
        <mn>4</mn>
    </mrow>
    <mo>=</mo>
    <mn>0</mn>
</mrow>
    </math>
`;

const defaultStr2 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <apply>
        <eq/>
        <ci>i</ci>
        <apply>
            <times/>
            <ci>g</ci>
            <apply>
                <minus/>
                <ci>V</ci>
                <ci>L</ci>
            </apply>
        </apply>
    </apply>
</math>
`;

const temp_math = `<cn units="cellml:dimensionless">123</cn>`;



interface MathMLInputProcessorE extends MathMLInputProcessor {
    useMathMLspacing?: boolean;
    extensions?: string[];
}

const extensions : MathMLInputProcessorE = { extensions: ["content-mathml.js"]};

const config : MathJax2Config = {
    MathML: extensions
}

interface EFProps {
    mathmlstr?: string;
}



export default class VisualPane extends React.Component<TPProps> {

  private fs = require('fs');

  private num_children = 0;

  showfile() {
    this.fs.readFile('file.txt', function (err:any, data:any) {
    if (err) {
	return console.error(err);
    }
    console.log("Asynchronous read: " + data.toString());
    });
  }




  testXMLconvert = (dom: IDOM) => {
    console.log("read file");
    //console.log(dom);
    const test_file = 'C:\\Users\\admin\\Downloads\\finalversion\\cellml-editor\\example\\SodiumChannelModel-Test.cellml';

    // read the actual file 
    this.fs.readFile(test_file, function (err:any, data:any) {
      if (err) {  return console.error(err); }

      
      // data.toString is the text read
      console.log("Asynchronous read: " + data.toString());
      // get the canvas to draw on
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.clearRect(0, 0, canvas.width, canvas.height);
      cellml_elements = [];

      // function to draw a diamond (for connection)
      function drawDiamond(context:any, x:number, y:number, width:number, height:number) {
        context.beginPath();
        context.fillStyle = "red";
        context.strokeStyle="purple";
        context.moveTo(x, y);   
        context.lineTo(x - width / 2, y + height / 2); // top left edge
        context.lineTo(x, y + height);                 // bottom left edge
        context.lineTo(x + width / 2, y + height / 2); // bottom right edge
        context.closePath();                           // finish triangle
        context.fill();
        context.stroke();
      }
      // function to draw pentagon (for map variables) 
      function drawPentagon(context: any, x:number, y:number, size:number) {
        const numberOfSides = 5,
        step  = 2 * Math.PI / numberOfSides,  //Precalculate step value
        shift = (Math.PI / 180.0) * -18;      //Quick fix

        context.beginPath();
        for (let i = 0; i <= numberOfSides;i++) {
          const curStep = i * step + shift;
          context.lineTo (x + size * Math.cos(curStep), y + size * Math.sin(curStep));
        }

        context.strokeStyle = "#000000";
        context.lineWidth = 5;
        context.stroke();
      }

      

      // BUNCH OF FUNCTIONS SINCE HAD ERRORS OUTSIDE OF A READ - may fix in future
      // Set up all the units and unit children
      function check_unit_elements(elemNode: any, x_pos: number, y_pos: number) {

        console.log('elem node:')
        console.log(elemNode);
        console.log(elemNode.getAttribute('name'));
        
        // get all the 'units' elements unit children 
        const unit_list = elemNode.querySelectorAll("unit");
        console.log(unit_list);
        
        for (let i = 0; i < unit_list.length; i++) {
          console.log(unit_list[i]);
          console.log(unit_list[i].getAttribute('exponent'));
          const unit_x_pos = 150;
          const unit_y_pos = 10 + cellml_elements.length*50;

          let exp, mult, pref, un;
          (unit_list[i].getAttribute('exponent'))   ? exp  = unit_list[i].getAttribute('exponent')   : exp  = '';
          (unit_list[i].getAttribute('multiplier')) ? mult = unit_list[i].getAttribute('multiplier') : mult = '';
          (unit_list[i].getAttribute('prefix'))     ? pref = unit_list[i].getAttribute('prefix')     : pref = '';
          (unit_list[i].getAttribute('units'))      ? un   = unit_list[i].getAttribute('units')      : un   = '';
          console.log('exp: ' + exp + ' mult: ' + mult + ' pref: ' + pref + ' units: ' + un);

          cellml_elements.push({x:unit_x_pos, y:unit_y_pos, radius:30, color:'green', element_type:'unit', units:un, prefix:pref, multiplier:mult, exponent:exp, units_parent:elemNode.getAttribute('name')})
        }
      }

      function check_component_elements(elemNode: any, x_pos: number, y_pos: number) {
        const variable_list = elemNode.querySelectorAll("variable");
        const math_list     = elemNode.querySelectorAll("math");
        const reset_list    = elemNode.querySelectorAll("reset");
        const comp_x_pos = 180;
        const comp_y_pos = 10 + cellml_elements.length*50;
        for (let i = 0; i < variable_list.length; i++) {     
          let v_name, v_units, v_interface, v_initial;
          (variable_list[i].getAttribute('name'))          ? v_name      = variable_list[i].getAttribute('name') : v_name = '';
          (variable_list[i].getAttribute('units'))         ? v_units     = variable_list[i].getAttribute('units') : v_units = '';
          (variable_list[i].getAttribute('interface'))     ? v_interface = variable_list[i].getAttribute('interface') : v_interface = '';
          (variable_list[i].getAttribute('initial_value')) ? v_initial   = variable_list[i].getAttribute('initial_value') : v_initial = '';
          cellml_elements.push({x:comp_x_pos, y:comp_y_pos + i*60, radius:30, color:'green', element_type:'variable', name:v_name, units:v_units, interface:v_interface, initial_value:v_initial, var_parent: elemNode.getAttribute('name')})
        }
        for (let i = 0; i < math_list.length; i++) {
          console.log("***********");
          console.log("MathML");
          console.log(math_list[i]);
          console.log(typeof math_list[i]);
          console.log("***********");
          cellml_elements.push( {x:comp_x_pos, y:comp_y_pos, radius:35, color:'pink', element_type:'math', mathml_format: math_list[i]})
        }
        for (let i = 0; i < reset_list.length; i++) {
          console.log(i);
          let r_varbl, r_testv, r_order;
          (reset_list[i].getAttribute('variable')) ? r_varbl = reset_list[i].getAttribute('variable'): r_varbl = '';
          (reset_list[i].getAttribute('test_variable')) ? r_testv = reset_list[i].getAttribute('test_variable'): r_testv = '';
          (reset_list[i].getAttribute('order')) ? r_order = reset_list[i].getAttribute('order'): r_order = '';
          cellml_elements.push( {x:comp_x_pos, y:comp_y_pos + i*60 + variable_list.length*60, radius:30, color:'rgb(76,175,80)', element_type:'reset', variable:r_varbl, test_variable:r_testv, order:r_order, res_parent: elemNode.getAttribute('name')})
          check_reset_and_test_elements(reset_list[i], x_pos, y_pos);
        }
      }

      // every reset element requires 2 children elements: [Test Value, Reset Value]
      function check_reset_and_test_elements(elemNode: any, x_pos: number, y_pos: number) {

        console.log("**************");
        console.log(elemNode);
        console.log(elemNode.querySelectorAll("test_value"));
        console.log(elemNode.querySelectorAll("reset_value"));
        console.log("**************");

        const test_value_list = elemNode.querySelectorAll("test_value");
        const reset_value_list = elemNode.querySelectorAll("reset_value");
        const value_x_pos = 160;
        const value_y_pos = 10 + cellml_elements.length*50;

        let total = 0;
        for (let i =0; i<test_value_list.length; i++) {
          // since order is unique
          cellml_elements.push( {x:value_x_pos, y:value_y_pos + total*60, radius:30, color:'purple', element_type:'test_value', reset_parent: elemNode.getAttribute('order')})
          total ++;
          // need to add math element
        }
        for (let j = 0; j < reset_value_list.length; j++) {
          cellml_elements.push( {x:value_x_pos, y:value_y_pos + total*60, radius:30, color:'purple', element_type:'reset_value', reset_parent: elemNode.getAttribute('order')})
          total++;
          // need to add math element
        }
      }

      function check_connection_elements(elemNode: any, x_pos: number, y_pos: number, i:number) {
        const map_variables_list = elemNode.querySelectorAll("map_variables");
        const conn_x = 240;
        const conn_y = 10 + cellml_elements.length*50;

        for (let i = 0; i<map_variables_list.length; i++) {
          let var1, var2;
          (map_variables_list[i].getAttribute('variable_1')) ? var1 = map_variables_list[i].getAttribute('variable_1') : var1 = '';
          (map_variables_list[i].getAttribute('variable_2')) ? var2 = map_variables_list[i].getAttribute('variable_2') : var2 = '';
          cellml_elements.push({x:conn_x, y:conn_y + i*50, radius:35, color:'purple', element_type:'map_variables', variable_1: var1, variable_2: var2, connection_ref: elemNode.getAttribute('component_1') + "_x_" + elemNode.getAttribute('component_2')})
        }
      }

      function check_encapsulation_elements(elemNode: any, x_pos: number, y_pos: number) {
        const comp_ref_list = elemNode.querySelectorAll("component_ref");
        const cref_x = 150;
        const cref_y = 10 + cellml_elements.length*50;

        for (let i = 0; i < comp_ref_list.length; i++) {
          let comp;
          (comp_ref_list[i].getAttribute('component')) ? comp = comp_ref_list[i].getAttribute('component') : comp = '';
          cellml_elements.push({x:cref_x, y:cref_y + i*50, radius:35, color:'purple', element_type:'component_ref', component: comp})
        }
        //if(comp_ref_list.length != 0) {check_encapsulation_elements}// should loop though more component ref's
      }

      function check_import_elements(elemNode: any, x_pos: number, y_pos: number) {
        console.log(elemNode);
        const href = elemNode.getAttribute('xlink:href');
        const imp_unt_list = elemNode.querySelectorAll("variable");
        const imp_com_list = elemNode.querySelectorAll("component");
        const imp_x = 90;
        const imp_y = 10 + cellml_elements.length*50;

        for (let i = 0; i < imp_com_list.length; i++) {
          console.log(imp_com_list[i].getAttribute("name"));
          cellml_elements.push( {x:imp_x, y:imp_y + i*50, radius:35, color:'green', element_type:'component', name: imp_com_list[i].getAttribute("name"), component_ref:imp_com_list[i].getAttribute("component_ref"), href_reference: href});
          check_component_elements(elemNode, imp_x, imp_y);
        }
        for (let j = 0; j < imp_unt_list.length; j++) {
          let u_name, u_ref;
          (imp_unt_list[j].getAttribute('name')) ? u_name = imp_unt_list[j].getAttribute('name') : u_name = '';
          (imp_unt_list[j].getAttribute('units_ref')) ? u_ref = imp_unt_list[j].getAttribute('units_ref') : u_ref = '';
          cellml_elements.push({x:imp_x, y:imp_y + j*50, radius:35, color:'green', element_type:'variable', name:u_name, units_ref: u_ref})
          check_unit_elements(elemNode, imp_x, imp_y);
        }
      }

      const parser = new DOMParser();
      const xmlDOM = parser.parseFromString(data.toString(), 'application/xml');
      // xmlDom convers the text into a dom like style
      

      



      

      // Check all the base components [Units, Component, Connection, Encapsulation, Import]

      
      //{dom.children.length > 0 ? dom.children.map((element) => this.domToTreeItem(element)) : null} // this is the tree level model
      // check every units element in the DOM
      const cellml_units = xmlDOM.querySelectorAll('units');
      cellml_units.forEach(elemNode => {
        const x_pos = 10
        const y_pos = 10 + cellml_elements.length*50;
        cellml_elements.push( {x:x_pos, y:y_pos, radius:15, color:'green', element_type:'units', units_name: elemNode.getAttribute('name')})
        // checking the units children: [unit]
        check_unit_elements(elemNode, x_pos, y_pos);
      });

      const cellml_components = xmlDOM.querySelectorAll('component');
      cellml_components.forEach(elemNode => {
        const comp_x = 10;
        const comp_y = 10 + cellml_elements.length*50;
        cellml_elements.push( {x:comp_x, y:comp_y, radius:35, color:'green', element_type:'component', name: elemNode.getAttribute('name')});
        // checking the components children: [Math, Reset, Variable]
        check_component_elements(elemNode, comp_x, comp_y);
      })

      const cellml_connections = xmlDOM.querySelectorAll('connection');
      for (let k = 0; k<cellml_connections.length;k++) {
        const elemNode = cellml_connections[k];
        const conn_x = 10;
        const conn_y = 10 + cellml_elements.length*50;
        cellml_elements.push({x:conn_x, y:conn_y, radius:35, color:'green', element_type:'connection', component_1: elemNode.getAttribute('component_1'), component_2: elemNode.getAttribute('component_2'), connection_parent: elemNode.getAttribute('component_1') + "_x_" +  elemNode.getAttribute('component_2')});
        check_connection_elements(elemNode, conn_x, conn_y, k);
      }
     

      const cellml_encapsulations = xmlDOM.querySelectorAll('encapsulation');
      cellml_encapsulations.forEach(elemNode => {
        const encap_x = 10;
        const encap_y = 10 + cellml_elements.length*50;
        cellml_elements.push({x:encap_x, y:encap_y, radius:35, color:'green', element_type:'encapsulation'});
        check_encapsulation_elements(elemNode, encap_x, encap_y);
      })
      const cellml_imports = xmlDOM.querySelectorAll('import');
      cellml_imports.forEach(elemNode => {
        const imp_x = 10;
        const imp_y = 10 + cellml_elements.length*50;
        cellml_elements.push({x:imp_x, y:imp_y, radius:35, color:'green', element_type:'import', href: elemNode.getAttribute('xlink:href')});
        check_import_elements(elemNode, imp_x, imp_y);
      });


      // Update The Canvas Depending on the Elements list
      canvas.height = cellml_elements.length*50 + 100;
      for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        if (shape.element_type=="units") {
          
          context.beginPath(); 
          // draw lines between elements
          for (let j = 0; j < cellml_elements.length; j++) {
            
            context.moveTo(shape.x, shape.y);
            if (cellml_elements[j].element_type == "unit" && cellml_elements[j].units_parent == shape.units_name) {
              console.log('found match: ' + cellml_elements[j].units)
              context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              
            }
          }
          // drawing the container
          context.rect(shape.x, shape.y, 100, 42);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillStyle = "#51DCFF";
          context.fill();
          context.fillRect(shape.x,shape.y,shape.width,shape.height);         
          context.stroke();
          // drawing the text for the element
          context.beginPath(); 
          context.fillStyle='black';
          context.fillText(shape.units_name, shape.x + 5, shape.y + 25);
          context.stroke();
        } else if (shape.element_type == "unit") {

          let prefix;
          if (shape.prefix == '') prefix = 0;
          else if (+(shape.prefix)) prefix = shape.prefix;
          else if (shape.prefix == "yotta") prefix = 24;
          else if (shape.prefix == "zetta") prefix = 21;
          else if (shape.prefix == "exa") prefix = 18;
          else if (shape.prefix == "peta") prefix = 15;
          else if (shape.prefix == "tera") prefix = 12;
          else if (shape.prefix == "giga") prefix = 9;
          else if (shape.prefix == "mega") prefix = 6;
          else if (shape.prefix == "kilo") prefix = 3;
          else if (shape.prefix == "hecto") prefix = 2;
          else if (shape.prefix == "deca") prefix = 1;
          else if (shape.prefix == "deci") prefix = -1;
          else if (shape.prefix == "centi") prefix = -2;
          else if (shape.prefix == "milli") prefix = -3;
          else if (shape.prefix == "micro") prefix = -6;
          else if (shape.prefix == "nano") prefix = -9;
          else if (shape.prefix == "pico") prefix = -12;
          else if (shape.prefix == "femto") prefix = -15;
          else if (shape.prefix == "atto") prefix = -18;
          else if (shape.prefix == "zepto") prefix = -21;
          else if (shape.prefix == "yocto") prefix = -24;
          else prefix = 0;

          let exponent;
          if (shape.exponent == '') exponent = 1.0;
          else if (shape.exponent) exponent = shape.exponent;
          else exponent = 1.0;

          let multiplier;
          if (shape.multiplier == '') multiplier = 1.0;
          else if (shape.multiplier) multiplier = shape.multiplier;
          else multiplier = 1.0;

          context.beginPath();
          context.fillStyle='black';
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.font =  "16px Arial";
          context.fillText(prefix, shape.x, shape.y + 10);
          context.font =  "12px Arial";
          context.fillText(exponent, shape.x + 10, shape.y - 10);
          context.font =  "16px Arial";
          context.fillText(multiplier + "*", shape.x - 20, shape.y + 10);

          context.lineWidth = 5;
          context.strokeStyle = "rgb(73,177,75)";
          context.stroke();
        }
        else if (shape.element_type == "component") {

          //var_parent - draw connecting lines 
          context.beginPath();
          for (let j = 0; j < cellml_elements.length; j++) {
            context.moveTo(shape.x, shape.y);
            if (cellml_elements[j].var_parent == shape.name && cellml_elements[j].element_type == "variable") {
              context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
            }
          }
          context.stroke();
          // draw compoennt square
          context.beginPath(); 
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="orange";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          console.log(shape);
          context.fillText(shape.name, shape.x + 5, shape.y + 25);
          context.stroke();
        }
        else if (shape.element_type == "variable") {
          //console.log('variable name: ' + shape.name);
          context.beginPath();
          context.arc(shape.x,shape.y,shape.radius,0,Math.PI*2);
          context.fillStyle= "black";
          context.lineWidth = 5;
          context.font =  "16px Arial";
          context.strokeStyle = "rgb(245,139,22)";
          context.fillText(shape.name, shape.x - 5, shape.y + 7);
          context.stroke();
          // draw the interface attribute onto the circle
          context.beginPath();
          context.arc(shape.x + 25,shape.y -15,10,0,Math.PI*2);
          context.fillStyle = "white";
          context.fill();
          context.fillStyle= "black";
          context.lineWidth = 3;
          context.font =  "16px Arial";
          context.strokeStyle = "rgb(245,139,22)";
          let v_interface;
          if(shape.interface == "none") {v_interface = "";}
          else if (shape.interface == "private") {v_interface = "-"}
          else if (shape.interface == "public") {v_interface = "+"}
          else if (shape.interface == "public_and_private") {v_interface = "x"}
          else {v_interface = "";}
          context.fillText(v_interface, shape.x + 22, shape.y - 12);
          context.stroke();
        }
        else if (shape.element_type == "import") {
          context.beginPath();
          // drawing the container
          context.rect(shape.x, shape.y, 100, 42);
          context.font =  "16px Arial";
          context.strokeStyle="purple";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);         
          context.stroke();
          // drawing the text for the element
          context.beginPath(); 
          context.fillStyle='black';
          context.fillText(shape.href, shape.x + 5, shape.y + 25);
          context.stroke();
        }
        else if ((shape.element_type == "reset") || (shape.element_type == "test_value") || (shape.element_type == "reset_value")) {
          context.beginPath(); 
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='red';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x + 5, shape.y + 25);
          context.stroke();
        }
        else if (shape.element_type == "connection") {
          console.log('C1: ' + shape.component_1);
          console.log('C2: ' + shape.component_2);
          // draw the connecting lines
          context.beginPath();
          context.lineWidth = 2;
          context.setLineDash([10,10]);
          for (let j = 0; j < cellml_elements.length; j++) {
            context.moveTo(shape.x + 150, shape.y);
            // If component 1 is found
            if (cellml_elements[j].element_type == "component" && 
                cellml_elements[j].name == shape.component_1) {
              console.log('found match 1: ' + cellml_elements[j].name)
              //context.lineTo(cellml_elements[j].x, cellml_elements[j].y); // lines ugly
            }
            else if (cellml_elements[j].element_type == "component" && 
              cellml_elements[j].name == shape.component_2) {
                console.log('found match 2: ' + cellml_elements[j].name)
                //context.lineTo(cellml_elements[j].x, cellml_elements[j].y); // lines ugly
              }
          }
          context.stroke();
          // draw connection diamond
          drawDiamond(context, shape.x + 100, shape.y, 75, 100);
          // draw the name
          context.beginPath();
          context.setLineDash([]);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillText(shape.component_1, shape.x + 25, shape.y + 25);
          context.fillText("x", shape.x + 5, shape.y + 35);
          context.fillText(shape.component_2, shape.x + 25, shape.y + 45);
          context.stroke();        
        }
        else if (shape.element_type == "map_variables") {

          drawPentagon(context, shape.x, shape.y, 50);

          context.beginPath();
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='black';
          context.font =  "16px Arial";
          context.strokeStyle="blue";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText("appples", shape.x + 5, shape.y + 25);
          context.stroke();
        }
        else if (shape.element_type == "math" || (shape.element_type == "encapsulation") || (shape.element_type == "component_ref") || (shape.element_type == "connection")) {
          context.beginPath(); 
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='purple';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x + 5, shape.y + 25);
          context.stroke();
        }
        else if (shape.element_type == "map_variabless") {
          context.beginPath(); 
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='yellow';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x + 5, shape.y + 25);
          context.stroke();
        }
      }
      console.log(cellml_elements);
    });
    
  }





  
  /*check_unit_element(elemNode: any) {
    console.log(elemNode);
        console.log(elemNode.getAttribute('name'));
  }*/

  domToTreeItem(dom: IDOM): React.ReactNode {
    if (!dom) return null;

    console.log('Test:')
    console.log(dom);

    return (
      <TreeItem
        key={dom.id}
        nodeId={dom.id.toString()}
        label={dom.name}
        onLabelClick={(event) => {
          event.preventDefault();
          this.props.onClickHandler(dom.lineNumber);
          console.log(dom);
        }}
        onClick={(event) => {
          this.generateModel("canvas"+dom.id, dom);
        }}
      > 
        <canvas id={"canvas"+dom.id} className="sub-canvas"></canvas>
        {dom.children.length > 0 ? dom.children.map((element) => this.domToTreeItem(element)) : null}
      </TreeItem>
    );
  }


  // This function is called when viewing the parts in the model
  generateModel = (canvas_name:string, dom:IDOM) => {
    console.log("opened");
    console.log(canvas_name);
    console.log(dom);
    const c = document.getElementById(canvas_name) as HTMLCanvasElement;
    const ctx = c.getContext("2d") as CanvasRenderingContext2D;

    // just to test writing to a specific canvas
    /*ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.stroke();
    console.log(c);*/
    let element;
    if (dom.name === "variable") {
      element = "https://svgsilh.com/svg/1618916-ef3225.svg";
    } else {
      element = "https://svgsilh.com/svg/1618916.svg";
    }

    this.drawBaseElementTree(element,c);
    for (let i =0; i<dom.children.length; i++) {
      this.drawElementsTree(c, element, 2, dom.children.length, i)
    }
    
  }

  drawBaseElementTree = (imagesrc: string, c:HTMLCanvasElement) => {
    const ctx: CanvasRenderingContext2D = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const element = document.createElement("img");
    element.src = imagesrc;
    const x_size = 60;
    const y_size = 60;
    const x_location = 5;
    const y_location = c.height/2;
    ctx.drawImage(element, x_location, y_location, x_size, y_size);
  }

  drawElementsTree = (canvas:HTMLCanvasElement, imagesrc: string, how_deep: number, num_children: number, current_pos:number) => {
    console.log('res');
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    const element = document.createElement("img");
    element.src = imagesrc;
    const x_size = 50;
    const y_size = 50;
    const x_location = 100;
    
    context.drawImage(element, x_location, 10+(current_pos*x_size), x_size, y_size);
    
  }




  addimage() {
    //console.log(this.props.filepath);
    console.log('C:\\Users\\admin\\Downloads\\finalversion\\cellml-editor\\example\\SodiumChannelModel-Test.cellml');
    console.log(this.props.dom);
    console.log(this.props.dom.children.length);
  }


  renderModel = () => {
    console.log('render');
    
   // const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
   // const context: CanvasRenderingContext2D = canvas.getContext("2d"); 

    console.log(this.props.filepath);
    console.log(this.props.dom);
    console.log(this.props.dom.children.length);
    const temp = this.props.dom.children.length;
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    canvas.width = temp*50 + 200;
    canvas.height = (temp*50 + 200);

  }

  // recursively call each children element list and then draw a
  // circle in an appropriate position
  recursiveImages = () => {
    console.log("-------------");
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    for (let i =0; i<this.props.dom.children.length; i++) {
      //console.log(this.props.dom.children[i].name);
      
      this.num_children++;
      //console.log(this.num_children);

      const current_element = this.props.dom.children[i]; 
      


      switch(this.props.dom.children[i].name) {
        // -------------------------- Model Element ------------------------
        case 'model': {
            const element_src = "https://svgsilh.com/svg/1618916.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ------------------------- Import Element -------------------------
        case 'import': {
            const element_src = "https://svgsilh.com/svg/1618916-666666.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ----------------------- Import Units Element ---------------------
        case 'import_units': {
            const element_src = "https://svgsilh.com/svg/1618916-ba352c.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // --------------------- Import Component Element -------------------
        case 'import_component': {
            const element_src = "https://svgsilh.com/svg/1618916-027468.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // -------------------------- Units Element -------------------------
        case 'units': {
            const element_src = "https://svgsilh.com/svg/1618916-009688.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // --------------------------- Unit Element -------------------------
        case 'unit': {
            const element_src = "https://svgsilh.com/svg/1618916-03a9f4.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ------------------------ Component Element -----------------------
        case 'component': {
            const element_src = "https://svgsilh.com/svg/1618916-ef3225.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ------------------------ Variable Element -----------------------
        case 'variable': {
            const element_src = "https://svgsilh.com/svg/1618916-ff5722.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // -------------------------- Reset Element ------------------------
        case 'reset': {
            const element_src = "https://svgsilh.com/svg/1618916-4caf50.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ----------------------- Test Value Element ----------------------
        case 'test_value': {
            const element_src = "https://svgsilh.com/svg/1618916-8bc34a.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ----------------------- Reset Value Element ---------------------
        case 'reset_value': {
            const element_src = "https://svgsilh.com/svg/1618916-cddc39.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // --------------------------- Math Element ------------------------
        case 'math_children': {
            const element_src = "https://svgsilh.com/svg/1618916-3f51b5.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ----------------------- Encapsulation Element -------------------
        case 'encapsulation': {
            const element_src = "https://svgsilh.com/svg/1618916-607d8b.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // -------------------- Component Reference Element ----------------
        case 'component_ref': {
            const element_src = "https://svgsilh.com/svg/1618916-e91e63.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ------------------------ Connection Element ---------------------
        case 'connection': {
            const element_src = "https://svgsilh.com/svg/1618916-673ab7.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        // ----------------------- Map Variables Element --------------------
        case 'map_variables': {
            const element_src = "https://svgsilh.com/svg/1618916-ffc107.svg";
            this.drawBaseElement(element_src);
            this.recurse(current_element, element_src, 1);
          }
          break;
        default:

      }
    }
  }
  
  // recurse through the list of children for that particular element
  recurse = (children: any, element_src: string, how_deep: number) => {
   /* console.log('Recurse: ------');
    console.log("Children:");
    console.log(children);
    
    console.log("Recurse Called:" + how_deep);*/
    console.log(children);
    const new_element_src = element_src;
 /*   if (children.name === "model") {
      new_element_src = "https://svgsilh.com/svg/1618916.svg";
    } else if (children.name === "import") {
      new_element_src = "https://svgsilh.com/svg/1618916-666666.svg";
    } else if (children.name === "import_units") {
      new_element_src = "https://svgsilh.com/svg/1618916-ba352c.svg";
    } else if (children.name === "import_component") {
      new_element_src = "https://svgsilh.com/svg/1618916-027468.svg";
    } else if (children.name === "units") {
      new_element_src = "https://svgsilh.com/svg/1618916-009688.svg";
    } else if (children.name === "unit") {
      new_element_src = "https://svgsilh.com/svg/1618916-03a9f4.svg";
    } else if (children.name === "component") {
      new_element_src = "https://svgsilh.com/svg/1618916-ef3225.svg";
    } else if (children.name === "variable") {
      new_element_src = "https://svgsilh.com/svg/1618916-ff5722.svg";
    } else if (children.name === "reset") {
      new_element_src = "https://svgsilh.com/svg/1618916-4caf50.svg";
    } else if (children.name === "test_value") {
      new_element_src = "https://svgsilh.com/svg/1618916-8bc34a.svg";
    } else if (children.name === "reset_value") {
      new_element_src = "https://svgsilh.com/svg/1618916-cddc39.svg";
    } else if (children.name === "math_children") {
      new_element_src = "https://svgsilh.com/svg/1618916-3f51b5.svg";
    } else if (children.name === "encapsulation") {
      new_element_src = "https://svgsilh.com/svg/1618916-607d8b.svg";
    } else if (children.name === "component_ref") {
      new_element_src = "https://svgsilh.com/svg/1618916-e91e63.svg";
    } else if (children.name === "connection") {
      new_element_src = "https://svgsilh.com/svg/1618916-673ab7.svg";
    } else if (children.name === "map_variables") {
      new_element_src = "https://svgsilh.com/svg/1618916-ffc107.svg";
    } else {
      new_element_src = "https://th.bing.com/th/id/R.0aeb8371109ca441859b9fcf90e0cc8c?rik=wQd8UNUdmQfUjA&riu=http%3a%2f%2fimages.clipartpanda.com%2fsilver-clipart-silver-circle-clipart-1.jpg&ehk=nlwc0OYI4UQt7TdQhBjKbhxp%2bxBrQ%2bOTkJlq3vNdGwI%3d&risl=&pid=ImgRaw&r=0";
    }
    */
    console.log(children.name);
    

    if (how_deep == 1) {
      console.log(">")
    } else if (how_deep == 2) {
      console.log(">>")
    } else if (how_deep == 3) {
      console.log(">>>")
    } else if (how_deep == 4) {
      console.log(">>>>")
    } else if (how_deep == 5) {
      console.log(">>>>>")
    } else if (how_deep == 0) {
      console.log("<|")
    } else {
      console.log(">>>>>>")
    }

    if (children !== undefined || children.children !== undefined || 
        children.children.length != 0) {
      how_deep++;
      for (let i = 0; i<children.children.length; i++) {
        this.drawelement(new_element_src, how_deep, children.children.length, i);
        this.recurse(children.children[i], new_element_src, how_deep);
      }
    }
  }


  // function to draw the element onto the canvas
  /*
    imagesrc: the image url
    how_deep: how far current element is inside the container
    num_children: number of children in current element
    current_pos: used to determine current position
  */
  drawelement = (imagesrc: string, how_deep: number, num_children: number, current_pos:number) => {

    // get the canvas
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    // create the element and then add it to the canvas
    const element = document.createElement("img");
    element.src = imagesrc;

    // get the size of the element to draw
    let x_size;
    let y_size;
    let x_location;
    let y_location;

    // if there is more than one child then you need more than 1 circle - you split
    if (num_children <= 1) {
      x_size = (canvas.width+1)/this.props.dom.children.length;
      y_size = (canvas.height+1)/this.props.dom.children.length;
      x_location = 3 + how_deep*x_size;
      y_location = this.num_children*y_size - y_size;
      context.drawImage(element, x_location, y_location, x_size, y_size);
    } else {
      x_size = (canvas.width+1)/this.props.dom.children.length;
      x_location = 3 + how_deep*x_size;
      
      y_size = (canvas.height+1)/this.props.dom.children.length;
      y_location = this.num_children*y_size - y_size;

      x_size = x_size/num_children;
      y_size = y_size/num_children;

      // the y location should be different relative to the element's current position
      y_location = y_location + current_pos*y_size;

      context.drawImage(element, x_location, y_location, x_size, y_size);
    }

    // adding lines between the different elements
    /*context.beginPath();
    context.moveTo(x_location + 3*x_size/4,y_location + 3*y_size/4);
    context.lineTo(x_location+x_size*5/4, y_location + 3*y_size/4);
    context.stroke();*/
  }


  

  // ----------------------------------------------------------------------
  // -------------------------- DRAW BASE ELEMENT -------------------------
  // ----------------------------------------------------------------------
  // draw a base element onto the canvas
  drawBaseElement = (imagesrc: string) => {
    // get the canvas to draw on
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    // unblur the pixelated element
    context.imageSmoothingEnabled = false;
    // get the correct element
    const element = document.createElement("img");
    element.src = imagesrc;
    // size of the element's circle (based on size of canavs)
    const x_size = (canvas.width+1)/this.props.dom.children.length;
    const y_size = (canvas.height+1)/this.props.dom.children.length;
    // location to put the element
    const x_location = 1;
    const y_location = this.num_children*y_size - y_size;
    // draw the base element onto the canvas
    context.drawImage(element, x_location, y_location, x_size, y_size);
  }
  


  

  dropElem = (event: React.DragEvent<HTMLCanvasElement>) => {
    console.log('drop element');
  }

  allowDrop = (event: React.DragEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  }

  handleMouseDown(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const BB = canvas.getBoundingClientRect();
    const offsetX_ = BB.left;
    const offsetY_ = BB.top;
    const startX_ = e.clientX - offsetX_;
    const startY_ = e.clientY - offsetY_;

    console.log("Offset: " + offsetX_ + " | " + offsetY_);
    console.log("Start: " + startX_ + " | " + startY_);
    
    for (let i = 0; cellml_elements.length; i++) {
      //for (let i = 0; shapes_.length; i++) {
      if (this.isMouseInShape(startX_, startY_, cellml_elements[i])) {
        console.log('valid element');
        selectedShapeIndex = i;
        isDragging_ = true;
        return;
      }
    }
  }

  isMouseInShape(mx: number, my: number, shape: any) {
    const rLeft  = shape.x
    const rRight = shape.x;
    const rTop   = shape.y;
    const rBott  = shape.y;
    // math test to see if mouse is inside the shape

    /*let encap_x = 0;
    let encap_y = 0;
    let number_of_comp_ref = 2;
    for (let i = 0; i < cellml_elements.length; i++ ) {
      if (cellml_elements[i].element_type == "encapsulation") {
        encap_x = cellml_elements[i].x;
        encap_y = cellml_elements[i].y;
      }
      if (cellml_elements[i].element_type == "component_ref") number_of_comp_ref ++;
    }
    const encapsulation_height = 50 * number_of_comp_ref;
    const encapsulation_width = (50 * number_of_comp_ref) / 1.5;
    if (shape.element_type == "component_ref") {
      if (mx>rLeft && mx<rRight + this.calculate_width(shape.component) && my>rTop && my<rBott + 50 &&
          mx > encap_x && mx < encap_x + encapsulation_width &&
          my > encap_y && my < encap_y + encapsulation_height) {
          console.log("current element is COMPONENT REF");
          return(true); 
      } else {
        return(false);
      }
    }*/


    // Standard Rectangle Shape: Units
    if( mx>rLeft && mx<rRight + 100 && my>rTop && my<rBott + 50 && shape.element_type == "units"){
      console.log("current element is UNITS");
      return(true);
    }
    // Standard Circular Shape: Unit
    else if( mx>rLeft - 25 && mx<rRight + 25 && my>rTop - 25 && my<rBott + 25 && shape.element_type == "unit"){
      console.log("current element is UNIT");
      return(true);
    }
    // Standard Circular Shape: Component
    else if( mx>rLeft && mx<rRight + 100 && my>rTop && my<rBott + 50 && shape.element_type == "component"){
      console.log("current element is COMPONENT");
      return(true);
    }
    // Standard Circular Shape: Variable
    else if( mx>rLeft - 25 && mx<rRight + 25 && my>rTop - 25 && my<rBott + 25 && shape.element_type == "variable"){
      console.log("current element is VARIABLE");
      return(true);
    }

    else if (shape.element_type == "component_ref") {
      if (mx>rLeft && mx<rRight + this.calculate_width(shape.component) && my>rTop && my<rBott + 50) {
        console.log("current element is COMPONENT REF");
        return(true);
      }
    }

    // in case i miss another element or error
    else if( mx>rLeft && mx<rRight + 100 && my>rTop && my<rBott + 50){
      console.log(shape.element_type);
        return(true);
    }
    return(false);
  }

  handleMouseOut(e: any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    isDragging_=false;
  }

  handleMouseUp(e:any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    isDragging_=false;
  }

  handleMouseMove(e:any) {
    if (!isDragging_) {return;}
    e.preventDefault();
    e.stopPropagation();
    
    //console.log(cellml_elements.length);
    //console.log("x: " + cellml_elements[selectedShapeIndex].x + " y: " + cellml_elements[selectedShapeIndex].y);

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const BB = canvas.getBoundingClientRect();
    const offsetX_ = BB.left;
    const offsetY_ = BB.top;
    const mouseX_ = e.clientX - offsetX_;
    const mouseY_ = e.clientY - offsetY_;

    const dx = mouseX_ - startX_;
    const dy = mouseY_ - startY_;

    const selectedShape = cellml_elements[selectedShapeIndex];

    // move encapsulated elements if that was the selected element
    if (selectedShape.element_type == "encapsulation") {
      // selectX and selectY is the encapsualted X & Y coordinates
      const selectX = selectedShape.x;
      const selectY = selectedShape.y;
      for (let i = 0; i < cellml_elements.length; i++) {
        if (cellml_elements[i].element_type == "component_ref") {
          // childX and childY is the component ref's X & Y coordinates
          const childX = cellml_elements[i].x;
          const childY = cellml_elements[i].y;
          // difference between the two elements
          // is positive since the component ref is bound to the encapsulation shell
          const diffX = Math.abs(selectX - childX);
          const diffY = Math.abs(selectY - childY);
          // every component ref will be dragged with the encapsulated section
          cellml_elements[i].x = diffX + mouseX_;
          cellml_elements[i].y = diffY + mouseY_;
        }
      }
    }

    // check if component ref can be moved - only want to move within the encapsulation
    if (selectedShape.element_type == "component_ref") {
      let encap_x = 0;
      let encap_y = 0;
      let number_of_comp_ref = 2;
      for (let i = 0; i < cellml_elements.length; i++ ) {
        if (cellml_elements[i].element_type == "encapsulation") {
          encap_x = cellml_elements[i].x;
          encap_y = cellml_elements[i].y;
        }
        if (cellml_elements[i].element_type == "component_ref") number_of_comp_ref ++;
      }
      const encapsulation_height = 50 * number_of_comp_ref;
      const encapsulation_width = (50 * number_of_comp_ref) / 1.5;
      // Move the component ref within the encapsulated section
      if (selectedShape.x > encap_x - this.calculate_width(selectedShape.component) && selectedShape.x < encap_x + encapsulation_width - this.calculate_width(selectedShape.component) &&
          selectedShape.y > encap_y - 50 && selectedShape.y < encap_y + encapsulation_height - 50) {
        selectedShape.x = mouseX_;
        selectedShape.y = mouseY_;
      } 
      // in the case of dragging out of bounds - drop the thing and push back to a valid position
      // If shape goes past the right - push back to the left to set back in bounds
      if (selectedShape.x + this.calculate_width(selectedShape.component) >= encap_x + encapsulation_width) {
        selectedShape.x = mouseX_ - this.calculate_width(selectedShape.component) - 10;
        isDragging_ = false;
      }
      // If shape goes left of encapsulation - push to right to set back in bounds
      if (selectedShape.x <= encap_x) {
        selectedShape.x = mouseX_ + 20;
        isDragging_ = false;
      }
      // If shape goes above encapsulation - push down to set back in bounds
      if (selectedShape.y <= encap_y + 30) {
        selectedShape.y = mouseY_ + 20;
        isDragging_ = false;
      }
      // If shape is under encapsulation - push up to set in bounds
      if (selectedShape.y + 60 >= encap_y + encapsulation_height) {
        selectedShape.y = mouseY_ - 20;
        isDragging_ = false;
      }
    } 
       
    // other units can freely move
    else if (selectedShape.element_type == "component" || selectedShape.element_type == "variable" || selectedShape.element_type == "units" ||
             selectedShape.element_type == "unit" || selectedShape.element_type == "import" || selectedShape.element_type == "reset" || 
             selectedShape.element_type == "test_value" || selectedShape.element_type == "reset_value" || selectedShape.element_type == "math" ||
             selectedShape.element_type == "encapsulation" || selectedShape.element_type == "connection" || selectedShape.element_type == "map_variables") {
      selectedShape.x = mouseX_;
      selectedShape.y = mouseY_;
    }
    else {
      console.log('move is invalid');
    }

    this.drawModel(canvas);
    startX_ = mouseX_;
    startY_ = mouseY_;
  }

  // just calculating the width of the element
  calculate_width(shape_name:string) {
      // have a general size and if text too long increase the size to fit
      if (shape_name.length < 10) return 100; 
      else return 10*shape_name.length + 10; // add 10 for padding
    }

  // calculating import template width: want a minimum of 300
  calculate_import_width(shape_name: string) {
    if (shape_name.length * 10 < 300) return 300;
    else return 10*shape_name.length + 10;
  }
  


  // Draw an arrow line between two points
  // Assistance from: https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
  draw_canvas_arrow( context: any, fromx : number, fromy: number, tox: number, toy: number ) {
    
    const dx = tox - fromx;
    const dy = toy - fromy;
    const headlen = 15; // length of head in pixels
    const angle = Math.atan2( dy, dx );
    context.setLineDash([2,2]);
    context.beginPath();
    context.moveTo( fromx, fromy );
    context.lineTo( tox, toy );
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.moveTo( tox - headlen * Math.cos( angle - Math.PI / 6 ), toy - headlen * Math.sin( angle - Math.PI / 6 ) );
    context.lineTo( tox, toy );
    context.lineTo( tox - headlen * Math.cos( angle + Math.PI / 6 ), toy - headlen * Math.sin( angle + Math.PI / 6 ) );
    context.stroke();
  }

  canvas_arrow(context: any, fromx: number, fromy: number, tox: number, toy: number, r: number){
    const x_center = tox;
    const y_center = toy;

    let angle;
    let x;
    let y;

    context.beginPath();

    angle = Math.atan2(toy-fromy,tox-fromx)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.moveTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;

    context.lineTo(x, y);

    context.closePath();

    context.fill();
}
  drawArrow(ctx: any, fromx: number, fromy:number, tox: number, toy: number, arrow_color: string){
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

  calculate_variable_center_x(var_name: string, x_pos: number) {
    if (var_name.length == 1) return x_pos - 7;
    else return x_pos - (5*var_name.length);
  }

  calculate_prefix_pos(prefix_name: string, x_pos: number) {
    return x_pos - prefix_name.length;
  }

  drawModel(canvas: HTMLCanvasElement) {
    // Update The Canvas Depending on the Elements list
    canvas.height = cellml_elements.length*50 + 100;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0,0,canvas.width, canvas.height);

    // function to draw a diamond (for connection)
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

      // function to draw pentagon (for map variables) 
      function drawPentagon(context: any, x:number, y:number, size:number) {
        const numberOfSides = 5,
        step  = 2 * Math.PI / numberOfSides,  //Precalculate step value
        shift = (Math.PI / 180.0) * -18;      //Quick fix
        context.beginPath();
        for (let i = 0; i <= numberOfSides;i++) {
          const curStep = i * step + shift;
          context.lineTo (x + size * Math.cos(curStep), y + size * Math.sin(curStep));
        }
        context.strokeStyle = "rgb(185,100,185)";
        context.lineWidth = 5;
        context.fillStyle = "rgb(230,205,230)";
        context.fill();
        context.stroke();
      }
      
      

      function calculate_prefix(shape:any) {
        let prefix;
        if (shape.prefix == '') prefix = '';
        else if (+(shape.prefix)) prefix = shape.prefix;
        else if (shape.prefix == "yotta") prefix = "Y";
        else if (shape.prefix == "zetta") prefix = "Z";
        else if (shape.prefix == "exa") prefix = "E";
        else if (shape.prefix == "peta") prefix = "P";
        else if (shape.prefix == "tera") prefix = "T";
        else if (shape.prefix == "giga") prefix = "G";
        else if (shape.prefix == "mega") prefix = "M";
        else if (shape.prefix == "kilo") prefix = "k";
        else if (shape.prefix == "hecto") prefix = "h";
        else if (shape.prefix == "deca") prefix = "da";
        else if (shape.prefix == "deci") prefix = "d";
        else if (shape.prefix == "centi") prefix = "c";
        else if (shape.prefix == "milli") prefix = "m";
        else if (shape.prefix == "micro") prefix = "µ";
        else if (shape.prefix == "nano") prefix = "n";
        else if (shape.prefix == "pico") prefix = "p";
        else if (shape.prefix == "femto") prefix = "f";
        else if (shape.prefix == "atto") prefix = "a";
        else if (shape.prefix == "zepto") prefix = "z";
        else if (shape.prefix == "yocto") prefix = "y";

        if (shape.prefix) return prefix;
        else return shape.prefix;
       
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

      function select_interface_type(shape:any) {
        let v_interface;
        if(shape.interface == "none") {v_interface = "";}
        else if (shape.interface == "private") {v_interface = "-"}
        else if (shape.interface == "public") {v_interface = "+"}
        else if (shape.interface == "public_and_private") {v_interface = "x"}
        else {v_interface = "";}
        return v_interface;
      }

      // Do the lines first to make it less ugly
      for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        if (shape.element_type == "connection") {
          // draw the children lines between connection and map variables
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(115,50,115)";
          for (let i = 0; i < cellml_elements.length; i++) {
            if (cellml_elements[i].element_type == "map_variables" && cellml_elements[i].connection_ref == shape.connection_parent) {
              this.drawArrow(context, shape.x, shape.y, cellml_elements[i].x, cellml_elements[i].y, "rgb(245, 206, 177)");
            }
          }
          context.stroke();
          // draw connection lines between the components
          context.beginPath();
          context.lineWidth = 3;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          let component1name = "";
          let component2name = "";
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) {
                this.drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211)");
                component1name = cellml_elements[j].name;
            }
            else if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) {
                this.drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211)");
                component2name = cellml_elements[j].name;
              }
          }
          context.stroke();
        }
        if (shape.element_type=="units") {
          // draw lines between units and unit elements
          context.beginPath(); 
          context.lineWidth = 5;
          context.strokeStyle = "rgb(193, 2, 12)";
          for (let j = 0; j < cellml_elements.length; j++) {
            //context.moveTo(shape.x + 50, shape.y + 21); // rectangle has width 50 and height 25
            if (cellml_elements[j].element_type == "unit" && cellml_elements[j].units_parent == shape.units_name) {
              //context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              this.drawArrow(context, shape.x + 50, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "pink");
            }
          }
        }
        if (shape.element_type == "component") {
          
          // The variable lines from component
          context.beginPath();
          context.strokeStyle = "rgb(123,161,203)";
          context.fillStyle = "rgb(123,161,203)";
          context.lineWidth = 1;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].var_parent == shape.name && cellml_elements[j].element_type == "variable") {
              this.drawArrow(context, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(123, 161, 203)");
            }
            else if (cellml_elements[j].res_parent == shape.name && cellml_elements[j].element_type == "reset") {
              this.drawArrow(context, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(120, 205, 182)");
            }
          }
          context.fill();
          context.stroke();
        }
        if (shape.element_type == "reset") {

          // Draw the connecting arrows
          //reset_parent: "test" + elemNode.getAttribute('order')
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].reset_parent == shape.order && (cellml_elements[j].element_type == "test_value") || cellml_elements[j].element_type == "reset_value") {
              this.drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(120, 205, 182)");
            }
          }
        }
        if (shape.element_type == "map_variables") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([10,10]);
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_1 ) {
               this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250)");
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_2 ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250)");
            }
          }
          context.stroke();
          context.setLineDash([]);
        }
      }

      for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        if (shape.element_type == "connection") {
          let component1name = "";
          let component2name = "";
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) {
                component1name = cellml_elements[j].name;
            }
            else if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) {
                component2name = cellml_elements[j].name;
              }
          }
          // draw connection diamond
          let diamond_width;
          (component1name.length > component2name.length) ? diamond_width = this.calculate_width(component1name) : diamond_width = this.calculate_width(component2name);
          const diamond_height= 95;
          context.lineWidth = 3;
          drawDiamond(context, shape, shape.x + diamond_width/4, shape.y - diamond_height/4, diamond_width , diamond_height, "rgb(245,209,188)", "rgb(230, 130, 70)", "rgb(225, 108, 34)");
          // draw the name boxes
          context.beginPath();
          context.fillStyle = "rgb(243, 196, 167)";
          context.strokeStyle = "rgb(255, 102, 0)";
          context.font = "bold 16px Arial";
          context.lineWidth = 2;
          this.roundRect(context, shape.x - 20, shape.y - 10, this.calculate_width(component1name), 25, 5, true, true);
          this.roundRect(context, shape.x - 20, shape.y + 30, this.calculate_width(component2name), 25, 5, true, true);
          context.stroke();
          // draw the related components
          context.beginPath();
          context.fillStyle = "rgb(217, 87, 0)";
          context.fillText(shape.component_1, shape.x, shape.y + 7);
          context.fillText(shape.component_2, shape.x, shape.y + 47);
          context.font = "bold 24px Arial";  
          context.fillText("X", shape.x + diamond_width/4 - 10, shape.y + 30);
          context.stroke();
          context.font = "16px Arial";        
        }
        else if (shape.element_type=="units") {
          // drawing the container
          context.beginPath();
          context.lineWidth = 3;
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.units_name), 48, 5, true, true);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.lineWidth = 3;
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.units_name)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.units_name)/3, shape.y + 30, 100);
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
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "unit") {
          const units_value = calculate_units_base(shape);
          // Just getting the values to display
          const prefix     = calculate_prefix(shape);
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
          if (shape.multiplier) {
            context.fillText(prefix, shape.x - 15 + 10*(shape.multiplier.length), shape.y + 8);
            context.fillText(units_value, shape.x + 10*(prefix.length) - 15 + 10*(shape.multiplier.length), shape.y + 8);
            context.font =  "bold 14px Arial";
            context.fillText(exponent, shape.x - 20 + (prefix.length)*10 + (units_value)*10 + 10*(shape.multiplier.length), shape.y - 8);
            context.font =  "bold 16px Arial";
          } else {
            context.fillText(prefix, shape.x - 15, shape.y + 8);
            context.fillText(units_value, shape.x + 11*(prefix.length) - 15, shape.y + 8);
            context.font =  "bold 14px Arial";
            console.log(exponent);
            if (exponent != 1) context.fillText(exponent, shape.x + 10*(units_value.length), shape.y - 8);
            context.font =  "bold 16px Arial";
          }
          
          if (multiplier != 1) context.fillText(multiplier + "*", shape.x - (prefix.length)*11 - 15, shape.y + 8);
          context.lineWidth = 5;
          context.fill();
          context.stroke();
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "component") {
          // The actual element container
          context.beginPath(); 
          context.lineWidth = 3;
          context.strokeStyle = "rgb(3, 83, 5)";
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.name), 50, 5, true, true);
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.name)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.name)/3, shape.y + 30, 100);
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
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
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
          context.fillText(shape.name, this.calculate_variable_center_x(shape.name, shape.x), shape.y + 8);
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
          // Add the initial value if they have one
          if (shape.initial_value) {
            context.beginPath();
            this.roundRect(context, shape.x, shape.y + 15, 50, 20, 5, true, true);
            context.fillStyle = "rgb(163, 234, 190)";
            context.fill();
            context.strokeStyle = "rgb(4, 131, 6)";
            context.font = "bold 14px Arial";
            context.fillStyle = "black";
            context.fillText("IV: " + shape.initial_value, shape.x + 5, shape.y + 30);
            context.stroke();
          }
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "reset") {
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
          this.roundRect(context, shape.x - 35, shape.y - 40, this.calculate_width(shape.variable), 20, 5, true, true);
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
           this.roundRect(context, shape.x - 35, shape.y + 20, this.calculate_width(shape.test_variable), 20, 5, true, true);
          context.stroke();
          context.beginPath();
          context.font = "bold 14px Arial";
          context.strokeStyle = "rgb(2, 80, 4)";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("T_Var: " + shape.test_variable, shape.x - 32, shape.y + 36);
          context.stroke();

        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "test_value" || shape.element_type == "reset_value") {
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
          if (shape.element_type == "test_value" ) context.fillText("T Math", shape.x - 20, shape.y + 10);
          if (shape.element_type == "reset_value") context.fillText("R Math", shape.x - 20, shape.y + 10);
          context.stroke();
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "import") {
          let import_children = 2;
          // connecting the import children with lines
          context.beginPath();
          context.strokeStyle = "rgb(195,105,5)";
          context.fillStyle = "rgb(195,105,5)";
          context.lineWidth = 2;
          for (let j = 0; j < cellml_elements.length; j++) {
            context.moveTo(shape.x + this.calculate_width(shape.href)/2, shape.y + 21);
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].href_reference == shape.href) {
              context.lineTo(cellml_elements[j].x + this.calculate_width(cellml_elements[j].name)/2, cellml_elements[j].y + 20);
              import_children += 1;
            }
          }
          context.fill();
          context.stroke();
          context.closePath();
          
          // drawing the import container + header
          context.strokeStyle = "rgb(29, 66, 111)";
          context.fillStyle = "rgb(230, 239, 249, 0.8)";
          context.setLineDash([10,2]);
          context.lineWidth = 2;
          this.roundRect(context, shape.x, shape.y, this.calculate_import_width(shape.href), import_children*50, 10, true, true);
          context.setLineDash([]);
          this.roundRect(context, shape.x + 2.5, shape.y + 2.5, this.calculate_import_width(shape.href) - 5, import_children*50 - 5, 10, true, true);
          this.roundRect(context, shape.x + 2.5, shape.y + 2.5, this.calculate_import_width(shape.href) - 5, 30, 5, true, true);

          context.beginPath();
          context.fillStyle='rgb(65,65,65)';
          context.font =  "bold 18px Arial";
          context.strokeStyle="rgb(65,65,65)";
          context.fillText(shape.href, shape.x + 15, shape.y + 25);
          context.stroke();
        }
        
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "map_variables") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([10,10]);
          let var1name = "";
          let var2name = "";
          for (let j = 0; j < cellml_elements.length; j++) {
            //context.moveTo(shape.x, shape.y);
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_1 ) {
               // context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
               //this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250)");
                var1name = cellml_elements[j].name;
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_2 ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              //this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250)");
                var2name = cellml_elements[j].name;
              }
          }
          context.stroke();
          context.setLineDash([]);

          let shape_width;
          (var1name.length > var2name.length) ? shape_width = this.calculate_width(var1name) : shape_width = this.calculate_width(var2name);
          //drawDiamond(context, shape.x + diamond_width/4, shape.y - diamond_height/4, diamond_width , diamond_height);
          drawPentagon(context, shape.x + shape_width/4, shape.y + shape_width/4, shape_width/2);

          context.beginPath();
          context.fillStyle='black';
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;

          context.fillText(var1name, shape.x + 10, shape.y);
          context.fillText("   x   ", shape.x + 10 , shape.y + 25);
          context.fillText(var2name, shape.x + 10, shape.y + 50);
          context.stroke();
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "encapsulation") {
          
          context.lineWidth = 2;
          // Iterate through the list of everything to calculate the encapsulated elements
          let number_of_comp_ref = 2; // 2 extra to allow more space for the elements
          for (let i = 0; i < cellml_elements.length; i++) {
            if (cellml_elements[i].element_type == "component_ref") number_of_comp_ref ++;
          }
          const encapsulation_height = 50 * number_of_comp_ref;
          const encapsulation_width = (50 * number_of_comp_ref) / 1.5;

          // To change the color on the rectangle, just manipulate the context
          context.strokeStyle = "rgb(150, 150, 150)";
          context.fillStyle = "rgba(225, 225, 225, .5)";
          this.roundRect(context, shape.x, shape.y, encapsulation_width, encapsulation_height, 10, true, true);
          this.roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, encapsulation_height - 5, 10, true, true);
          this.roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, 30, 5, true, true);

          context.beginPath();
          context.fillStyle='rgb(65,65,65)';
          context.font =  "bold 24px Arial";
          context.strokeStyle="rgb(65,65,65)";
          context.fillText("Encapsulated", shape.x + 15, shape.y + 25);
          context.stroke();

          // Manipulate it again
          context.strokeStyle = "#0f0";
          context.fillStyle = "#ddd";
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "component_ref") {
          // The border for the element
          context.beginPath(); 
          context.lineWidth = 3;
          context.setLineDash([]);
          context.rect(shape.x, shape.y, this.calculate_width(shape.component), 45);
          context.strokeStyle = "black";
          context.stroke();
          // Create component_ref gradient:
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.component)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.component)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          // Fill the inside of the component with the gradient created
          context.fillStyle = grd;
          context.fillRect(shape.x, shape.y, this.calculate_width(shape.component), 45);
          // Add the text to the encapsulated component
          context.beginPath();
          context.font =  "bold 18px Arial";
          context.strokeStyle="rgb(1, 65, 1)";
          context.fillStyle = "rgb(1, 65, 1)";
          context.fillText(shape.component, shape.x + 5, shape.y + 28);
          context.stroke();

          // Draw some connecting lines between the components and the encapsulated components
          context.lineWidth = 2;
          for (let cr = 0 ; cr < cellml_elements.length; cr++) {
            if (cellml_elements[cr].element_type == "component") {
              if (cellml_elements[cr].name == shape.component) {
                this.draw_canvas_arrow(context, shape.x, shape.y, cellml_elements[cr].x + this.calculate_width(shape.component)/2, cellml_elements[cr].y + 45);
              }
            }
          }
        }

        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "math") {
          console.log("____________")
          console.log('found math: ')
          console.log(shape.mathml_format);
          console.log(shape.mathml_format.outerHTML);
          console.log(typeof shape);
          console.log("____________")
          context.beginPath(); 
          /*context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='red';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;*/
         // context.fillRect(shape.x,shape.y,shape.width,shape.height);
         // context.fillText("dingos", shape.x + 5, shape.y + 25);

         /* const mathjax_example = document.getElementById("mathjaxexample") as any;
          mathjax_example.dangerouslySetInnerHTML = {__html: shape.mathml_format.outerHTML};
          
          "<div dangerouslySetInnerHTML={{__html: defaultStr}}/>";*/
          //context.fillText("documenat", 100, 100);

          //defaultStr = shape.mathml_format.outerHTML;
          /*const temp = document.getElementById("mathjaxexample") as any;
          console.log(temp);
          context.drawImage(temp, shape.x + 5, shape.y + 25);*/

          const mathjax = document.getElementById("mathjaxexample");

          console.log(mathjax);
          const mathjax_children = mathjax.childNodes;
          console.log(mathjax_children);
          const mathjax_span_2 = mathjax_children[2];
          console.log(mathjax_children[1])
          console.log(mathjax_span_2);
          const mathjax_svg = mathjax_span_2.childNodes;
          console.log(mathjax_svg[0]);
          const svg_elem = mathjax_svg[0] as any;
          console.log(typeof svg_elem);
          console.log(svg_elem.outerHTML);




          context.stroke();

          
        }

        else if (shape.element_type == "test") {
          context.beginPath(); 
          context.rect(shape.x, shape.y, 100, 42);
          context.fillStyle='yellow';
          context.font =  "16px Arial";
          context.strokeStyle="rgb(61,146,61)";
          context.lineWidth = 5;
          context.fillRect(shape.x,shape.y,shape.width,shape.height);
          context.fillText(shape.units_name, shape.x + 5, shape.y + 25);
          context.stroke();
        }
      }
  }
  






  roundRect(ctx : any, x : number, y: number, width:number, height:number, radius:any, fill: boolean, stroke: boolean) {
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



  /*<canvas id="graphCanvas" onDrop={dropElem} onDragOver={allowDrop} height="500" width="1000" onMouseDown={(event)=>handleMouseDown(event)}
                  onMouseOut={(event)=>handleMouseOut(event)} onMouseUp={(event)=>handleMouseUp(event)}  onMouseMove={(event)=>handleMouseMove(event)}></canvas>*/

  //<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
   //       <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
          

  changeinnermath() {
    console.log('change math');
    
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    
    context.beginPath();
    //context.drawImage(img, 10, 10);
    
    const svg_container = document.getElementById("mathjaxexample");
    const children = svg_container.childNodes;
    console.log(children);
    console.log(children[1]);
    console.log(children[2]);
    console.log(children[3]);
    console.log(children[4]);    
    console.log(children[5]);
    

    const math2nd = children[2];
    const svg = math2nd.childNodes;
    console.log(svg);
    console.log(svg[0]);
    console.log(svg[1]);

    const svg_math_content = svg[1] as HTMLElement;
    svg_math_content.innerHTML = temp_math;

    svg_math_content.innerHTML = temp_math;

    const a = document.getElementsByClassName("MJX_Assistive_MathML")[0] as HTMLElement;
    a.innerHTML = temp_math;

    const temp = svg[0] as HTMLElement;
    console.log(temp.outerHTML); 
    //context.drawImage(svg_img, 10, 10);
    const base64data = btoa(unescape(encodeURIComponent(temp.outerHTML)));
    const image = new Image();
    image.src=`data:image/svg+xml;base64,${base64data}`;

    console.log(image);

    context.drawImage(image, 0, 0);
    context.stroke();




  }
  
  render(): React.ReactNode {
    return (
      <html>
        <head>

        </head>
    <body>
      <div className="tree-pane">
        <h3>Full Model</h3>
        <canvas id="myCanvas" width="1200" height="800" onDrop={this.dropElem} onDragOver={this.allowDrop} onMouseDown={(event)=>this.handleMouseDown(event)}
                onMouseOut={(event)=>this.handleMouseOut(event)} onMouseUp={(event)=>this.handleMouseUp(event)}
                onMouseMove={(event) => this.handleMouseMove(event)}></canvas>
        <div>Render Image</div> 

        <div id="tttttttttt">
          <button onClick={this.changeinnermath}>Change math</button>
          <img />

          <MathJaxContext version={2} config={config}> 
            <MathJax inline={true}>
                <div id="mathjaxexample" dangerouslySetInnerHTML={{__html: defaultStr}}/>
            </MathJax>
          </MathJaxContext>
           
        </div>


        <button onClick={this.addimage}>Temp</button>

        <button onClick={this.renderModel}>Render Model</button>
        <button onClick={this.recursiveImages}>ABC</button>


        <button onClick={()=>this.testXMLconvert(this.props.dom)}>Test Convert</button>

        <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
	
          {this.props.dom && this.domToTreeItem(this.props.dom)}
        </TreeView>
      </div>
            </body>
        
      </html>
      
    );
  }
}
