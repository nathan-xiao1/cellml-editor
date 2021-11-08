import React, { useState } from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
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

const defaul3 = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
                    <mi>a</mi><mo>&#x2260;</mo><mn>0</mn>
                  </math>,
                  there are two solutions to
                  <math xmlns="http://www.w3.org/1998/Math/MathML">
                    <mi>a</mi><msup><mi>x</mi><mn>2</mn></msup>
                    <mo>+</mo> <mi>b</mi><mi>x</mi>
                    <mo>+</mo> <mi>c</mi> <mo>=</mo> <mn>0</mn>
                  </math>
                  and they are
                  <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                    <mi>x</mi> <mo>=</mo>
                    <mrow>
                      <mfrac>
                        <mrow>
                          <mo>&#x2212;</mo>
                          <mi>b</mi>
                          <mo>&#x00B1;</mo>
                          <msqrt>
                            <msup><mi>b</mi><mn>2</mn></msup>
                            <mo>&#x2212;</mo>
                            <mn>4</mn><mi>a</mi><mi>c</mi>
                          </msqrt>
                        </mrow>
                        <mrow>
                          <mn>2</mn><mi>a</mi>
                        </mrow>
                      </mfrac>
                    </mrow>
                    <mtext>.</mtext>
                  </math>`



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




  testXMLconvert = (filepath: string) => {
    console.log("read file");
    //console.log(dom);
    const temp_file = 'C:\\Users\\admin\\Downloads\\finalversion\\cellml-editor\\example\\SodiumChannelModel-Test.cellml';

    let test_file = "";
    (filepath == undefined || filepath == "") ? test_file = temp_file : test_file = filepath;

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
        highlight_stroke(context, shape, border_color);
        context.stroke();
      }
      // function to draw pentagon (for map variables) 
      function drawPentagon(context: any, shape: any, x:number, y:number, size:number, stroke:string, fill:string) {
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
          const unit_x_pos = 180;
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
        const comp_x_pos = 200;
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
          let math_id = 0;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "math") math_id ++;
          }
          cellml_elements.push( {x:comp_x_pos + 80, y:comp_y_pos + i*60, radius:35, color:'pink', element_type:'math', mathml_format: math_list[i], math_parent: elemNode.getAttribute('name'), math_id: math_id})
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
        const test_value_list = elemNode.querySelectorAll("test_value");
        const reset_value_list = elemNode.querySelectorAll("reset_value");
        const math_list_t =  test_value_list[0].querySelectorAll("math");
        const math_list_r =  reset_value_list[0].querySelectorAll("math");
        const value_x_pos = 180;
        const value_y_pos = 10 + cellml_elements.length*50;
        
        let reset_math = 0;
        let test_math = 0;
        for (let i = 0; i <cellml_elements.length; i++) {
          if (cellml_elements[i].element_type == "math" && cellml_elements[i].mathml_format.outerHTML == math_list_t[0].outerHTML) {
            test_math = cellml_elements[i].math_id;
          }
          if (cellml_elements[i].element_type == "math" && cellml_elements[i].mathml_format.outerHTML == math_list_r[0].outerHTML) {
            reset_math = cellml_elements[i].math_id;
          }
        }
        
        let total = 0;
        for (let i =0; i<test_value_list.length; i++) {
          let num_tv = 0; let num_rv = 0; const math_id = 0;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == 'test_value') num_tv ++;
            if (cellml_elements[j].element_type == 'reset_value') num_rv ++;
          }
          // since order is unique
          cellml_elements.push( {x:value_x_pos, y:value_y_pos + total*60, radius:30, color:'purple', element_type:'test_value', reset_parent: elemNode.getAttribute('order'), id: "test" + num_tv, math_id: test_math})
          total ++;
          num_tv++;
        }
        for (let j = 0; j < reset_value_list.length; j++) {
          let num_tv = 0; let num_rv = 0; const math_id = 0;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == 'test_value') num_tv ++;
            if (cellml_elements[j].element_type == 'reset_value') num_rv ++;
          }
          cellml_elements.push( {x:value_x_pos, y:value_y_pos + total*60, radius:30, color:'purple', element_type:'reset_value', reset_parent: elemNode.getAttribute('order'), id: "reset" + num_rv, math_id: reset_math})
          total++;
          num_rv++;
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

      function check_import_elements(elemNode: any, x_pos: number, y_pos: number, import_parent_id: number) {
        console.log(elemNode);
        const href = elemNode.getAttribute('xlink:href');
        const imp_unt_list = elemNode.querySelectorAll("variable");
        const imp_com_list = elemNode.querySelectorAll("component");
        const imp_x = 90;
        const imp_y = 10 + cellml_elements.length*50;

        for (let i = 0; i < imp_com_list.length; i++) {
          console.log(imp_com_list[i].getAttribute("component_ref"));
          console.log(imp_com_list[i].getAttribute("name"));
          cellml_elements.push( {x:imp_x, y:imp_y + i*50, radius:35, color:'green', element_type:'import_component', name: imp_com_list[i].getAttribute("name"), component_ref:imp_com_list[i].getAttribute("component_ref"), imp_id: import_parent_id});
          
        }
        for (let j = 0; j < imp_unt_list.length; j++) {
          let u_name, u_ref;
          (imp_unt_list[j].getAttribute('name')) ? u_name = imp_unt_list[j].getAttribute('name') : u_name = '';
          (imp_unt_list[j].getAttribute('units_ref')) ? u_ref = imp_unt_list[j].getAttribute('units_ref') : u_ref = '';
          cellml_elements.push({x:imp_x, y:imp_y + j*50, radius:35, color:'green', element_type:'import_units', name:u_name, units_ref: u_ref, imp_id: import_parent_id})
        }
      }

      function highlight_stroke(context: any, shape: any, alt_color: string) {
        if (cellml_elements[selectedShapeIndex] != undefined) {
          if (shape.x == cellml_elements[selectedShapeIndex].x && 
              shape.y == cellml_elements[selectedShapeIndex].y) {
            context.lineWidth = 5; 
            context.strokeStyle = "rgb(222, 190, 7)";
          } else { 
            context.strokeStyle = alt_color; 
            context.lineWidth = 3; 
          }
        } else { 
          context.strokeStyle = alt_color; 
          context.lineWidth = 3; 
        }
      }

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

      function calculate_width(shape_name:string) {
        // have a general size and if text too long increase the size to fit
        if (shape_name.length < 10) return 100; 
        else return 10*shape_name.length + 10; // add 10 for padding
      }

      function calculate_prefix(shape:any) {
        let prefix = "";
        if (shape.prefix == '') prefix = '';
        else if (shape.prefix.toLowerCase() == "yotta") prefix = "Y";
        else if (shape.prefix.toLowerCase() == "zetta") prefix = "Z";
        else if (shape.prefix.toLowerCase() == "exa")   prefix = "E";
        else if (shape.prefix.toLowerCase() == "peta")  prefix = "P";
        else if (shape.prefix.toLowerCase() == "tera")  prefix = "T";
        else if (shape.prefix.toLowerCase() == "giga")  prefix = "G";
        else if (shape.prefix.toLowerCase() == "mega")  prefix = "M";
        else if (shape.prefix.toLowerCase() == "kilo")  prefix = "k";
        else if (shape.prefix.toLowerCase() == "hecto") prefix = "h";
        else if (shape.prefix.toLowerCase() == "deca")  prefix = "da";
        else if (shape.prefix.toLowerCase() == "deci")  prefix = "d";
        else if (shape.prefix.toLowerCase() == "centi") prefix = "c";
        else if (shape.prefix.toLowerCase() == "milli") prefix = "m";
        else if (shape.prefix.toLowerCase() == "micro") prefix = "µ";
        else if (shape.prefix.toLowerCase() == "nano")  prefix = "n";
        else if (shape.prefix.toLowerCase() == "pico")  prefix = "p";
        else if (shape.prefix.toLowerCase() == "femto") prefix = "f";
        else if (shape.prefix.toLowerCase() == "atto")  prefix = "a";
        else if (shape.prefix.toLowerCase() == "zepto") prefix = "z";
        else if (shape.prefix.toLowerCase() == "yocto") prefix = "y";
        else prefix = "";
        return prefix;
      }

      function calculate_units_base(shape: any) {
        if (shape.units) {
          const unit = shape.units.toLowerCase();
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
        if (!elemNode.getAttribute('component_ref')) {
          cellml_elements.push({x:comp_x, y:comp_y, radius:35, color:'green', element_type:'component', name: elemNode.getAttribute('name')});
        }
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

        let import_id = 0;
        for (let i = 0; i < cellml_elements.length; i++) {
          if (cellml_elements[i].element_type == 'import') import_id++;
        }

        cellml_elements.push({x:imp_x, y:imp_y, radius:35, color:'green', element_type:'import', href: elemNode.getAttribute('xlink:href'), import_id: import_id});
        check_import_elements(elemNode, imp_x, imp_y, import_id);
      });


      

      // Update The Canvas Depending on the Elements list
      canvas.height = cellml_elements.length*50 + 100;
      // draw the lines
      for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        if (shape.element_type=="units") {
          context.beginPath(); 
          context.lineWidth = 5;
          context.strokeStyle = "rgb(193, 2, 12)";
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "unit" && cellml_elements[j].units_parent == shape.units_name) {
              drawArrow(context, shape.x + 50, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(255, 175, 175, 0.5)");
            }
            else if (cellml_elements[j].element_type == "variable" && cellml_elements[j].units == shape.units_name) {
              drawArrow(context, shape.x + 50, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(255, 175, 175, 0.5)");
            }
          }
          context.stroke();
        }
        else if (shape.element_type == "component") {
          context.beginPath();
          context.strokeStyle = "rgb(123,161,203)";
          context.fillStyle = "rgb(123,161,203)";
          context.lineWidth = 1;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].var_parent == shape.name && cellml_elements[j].element_type == "variable") {
              drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            else if (cellml_elements[j].res_parent == shape.c_id && cellml_elements[j].element_type == "reset") {
              drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            else if (cellml_elements[j].math_parent == shape.name && cellml_elements[j].element_type == "math") {
              let exists = 0;
              for (let k = 0; k < cellml_elements.length;k++) {
                if ((cellml_elements[k].element_type == "reset_value" || cellml_elements[k].element_type == "test_value") && 
                     cellml_elements[k].math_id == cellml_elements[j].math_id ) {
                       exists = 1;
                     }
              }
              if (exists == 0) {
                drawArrow(context, shape.x + calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
              }
            }
            else if (cellml_elements[j].component == shape.name && cellml_elements[j].element_type == "component_ref") {
              drawArrow(context, cellml_elements[j].x, cellml_elements[j].y, shape.x + calculate_width(shape.name)/2, shape.y + 21, "rgb(175, 245, 185, 0.5)");
            }
          }
          context.fill();
          context.stroke();
        }
        else if (shape.element_type == "reset") {
          // lines between children
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].reset_parent == shape.order && (cellml_elements[j].element_type == "test_value" || cellml_elements[j].element_type == "reset_value")) {
              drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable) {
              drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
          }
        }
        else if (shape.element_type == "reset_value" || shape.element_type == "test_value") {
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "math" && cellml_elements[j].math_id == shape.math_id) {
              drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
          }
        }
        else if (shape.element_type == "connection") {
          // draw the children lines between connection and map variables
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(115,50,115)";
          for (let i = 0; i < cellml_elements.length; i++) {
            if (cellml_elements[i].element_type == "map_variables" && cellml_elements[i].connection_ref == shape.connection_parent) {
              drawArrow(context, shape.x, shape.y, cellml_elements[i].x, cellml_elements[i].y, "rgb(245, 206, 177, 0.5)");
            }
          }
          context.stroke();
          // draw connection lines between the components
          context.beginPath();
          context.lineWidth = 3;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) {
                drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211, 0.5)");
            }
            else if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) {
                drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211, 0.5)");
              }
          }
          context.stroke();
        }
        else if (shape.element_type == "map_variables") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([10,10]);
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_1 ) {
                drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_2 ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
          }
          context.stroke();
          context.setLineDash([]);
        }
        else if (shape.element_type == "import") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([]);
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "import_units" && cellml_elements[j].imp_id == shape.import_id ) {
                drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
            if (cellml_elements[j].element_type == "import_component" && cellml_elements[j].imp_id == shape.import_id ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
          }
          context.stroke();
          
        }
      }
      // draw the elements
      for (const i in cellml_elements) {
        const shape = cellml_elements[i];

        if (shape.element_type=="units") {
          context.beginPath();
          context.lineWidth = 3;
          roundRect(context, shape.x, shape.y, calculate_width(shape.units_name) + 10, 48, 5, true, true);
          context.font =  "16px Arial";
          const grd = context.createRadialGradient(shape.x + calculate_width(shape.units_name)/2, shape.y + 25, 5, shape.x + calculate_width(shape.units_name)/3, shape.y + 30, 100);
          grd.addColorStop(0, "rgb(254, 148, 155)");
          grd.addColorStop(1, "rgb(252, 36, 42)");
          context.fillStyle = grd;
          context.fill();       
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();
          context.beginPath(); 
          context.fillStyle ='rgb(110, 1, 6)';
          context.font = "bold 18px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.fillText(shape.units_name, shape.x + 5, shape.y + 30);
          context.stroke();
        } 
        else if (shape.element_type == "unit") {
          const units_value = calculate_units_base(shape);
          const prefix     = calculate_prefix(shape);
          const exponent   = calculate_exponent(shape);

          context.beginPath();
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(1, "rgb(242, 87, 95)");
          grd.addColorStop(0, "rgb(245, 137, 142)");
          context.fillStyle = grd;
          context.arc(shape.x, shape.y, 35, 0, Math.PI*2);
          context.fill();
          highlight_stroke(context, shape, "rgb(193, 2, 12)");
          context.stroke();

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
        else if (shape.element_type == "component") {
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
        }
        else if (shape.element_type == "variable") {
           // Draw the container
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x, shape.y, 35, 0, Math.PI * 2);
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
          context.beginPath();
          context.strokeStyle= "rgb(187, 222, 232)";
          context.lineWidth = 3;
          context.fillStyle= "rgb(63, 81, 181)";
          context.font='bold 12px Arial'
          context.fillText("Import from:", shape.x + 5, shape.y + 15);
          context.font =  "bold 16px Arial";
          context.fillText("/" + shape.href, shape.x + 5, shape.y + 35);
          context.stroke();
        }
        else if (shape.element_type == "reset") {
          context.beginPath();
          context.lineWidth = 5;
          context.arc(shape.x, shape.y, 40, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(2, 48, 134)");
          context.stroke();

          // The variable reference
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(2, 48, 134)");
          roundRect(context, shape.x - 50, shape.y - 40, calculate_width(shape.variable) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Var: " + shape.variable, shape.x - 40, shape.y - 26);
          context.stroke();

          context.beginPath();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          roundRect(context, shape.x - 50, shape.y + 20, calculate_width(shape.test_variable) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Test_V: " + shape.test_variable, shape.x - 40, shape.y + 35);
          context.stroke();
        }
        else if (shape.element_type == "test_value" || shape.element_type == "reset_value") {
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
          if (shape.element_type == "test_value" ) context.fillText("Test: ", shape.x - 30, shape.y + 8);
          if (shape.element_type == "reset_value") context.fillText("Reset: ", shape.x - 30, shape.y + 8);

        }

        else if (shape.element_type == "connection") {
          let component1name = "";
          let component2name = "";
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) { component1name = cellml_elements[j].name; }
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) { component2name = cellml_elements[j].name; }
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
          context.fillText(shape.component_1, shape.x, shape.y + 7);
          context.fillText(shape.component_2, shape.x, shape.y + 47);
          context.font = "bold 24px Arial";  
          context.fillText("X", shape.x + diamond_width/4 - 10, shape.y + 30);
          context.stroke();
          context.font = "16px Arial";         
        }
        else if (shape.element_type == "map_variables") {

          // Draw the pentagon for the map variable element
          context.beginPath();
          context.lineWidth = 5;
          let shape_width;
          const var1length = calculate_width(shape.variable_1);
          const var2length = calculate_width(shape.variable_2);
          (var1length > var2length) ? shape_width = var1length : shape_width = var2length;
          drawPentagon(context, shape, shape.x + shape_width/4, shape.y + shape_width/4, shape_width/2 , "rgb(185,100,185)", "rgb(230,205,230)");
          // Draw the boxes for the pentagon
          context.beginPath();
          context.fillStyle = "rgb(223,187,232)";
          context.font = "bold 16px Arial";
          context.lineWidth = 2;
          highlight_stroke(context, shape, "rgb(115,50,115)");
          roundRect(context, shape.x - 25, shape.y - 10, calculate_width(shape.variable_1), 25, 5, true, true);
          roundRect(context, shape.x - 25, shape.y + shape_width/3, calculate_width(shape.variable_2), 25, 5, true, true);
          context.stroke();
          // Write the names onto the element container
          context.beginPath();
          context.fillStyle='rgb(101, 39, 116)';
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;
          context.fillText(shape.variable_1, shape.x - 15,  shape.y + 8);
          context.fillText("   X   ",  shape.x + shape_width/4 - 15,  shape.y + shape_width/4 + 5);
          context.fillText(shape.variable_2, shape.x - 15,  shape.y + shape_width/3 + 20);
          context.stroke();
        }
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
          roundRect(context, shape.x, shape.y, encapsulation_width, encapsulation_height, 10, true, true);
          roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, encapsulation_height - 5, 10, true, true);
          roundRect(context, shape.x + 2.5, shape.y + 2.5, encapsulation_width - 5, 30, 5, true, true);
          context.beginPath();
          context.fillStyle='rgb(65,65,65)';
          context.font =  "bold 24px Arial";
          context.strokeStyle="rgb(65,65,65)";
          context.fillText("Encapsulated", shape.x + 15, shape.y + 25);
          context.stroke();
        }
        else if (shape.element_type == "component_ref") {
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
        else if (shape.element_type == "import_component") {
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
          context.fillText("Imported: (" + shape.component_ref + ")", shape.x + 10, shape.y + 40);
          context.stroke();
        }
        else if (shape.element_type == "import_units") {
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
      }
      console.log(cellml_elements);
    });
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




  addimage(filepath: string) {
    //console.log(this.props.filepath);
    console.log('C:\\Users\\admin\\Downloads\\finalversion\\cellml-editor\\example\\SodiumChannelModel-Test.cellml');
    console.log(filepath);
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

  handleMouseDown(e: any, dom: IDOM) {
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

        if (dom != undefined) {
          //change to dom number
          const found_line = this.find_the_line_number(dom);
          this.props.onClickHandler(found_line);
          //console.log(dom);
        }
        return;
      }
    }
  }

  // Clicking an element will find the appropriate position
  find_the_line_number(dom: IDOM) {
    const children = dom.children;
    const element = cellml_elements[selectedShapeIndex];

    console.log("=====");
    console.log(children);
    console.log(element);

    if (element.element_type == "units") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "units" && children[i].attributes[0].value == element.units_name) {
          console.log('found at:' + children[i].lineNumber);
          return children[i].lineNumber;
        }
      }
    } 
    else if (element.element_type == "unit") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "units") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "unit") {
              let temp = 0;
              if (element.exponent != "" && element.exponent != "1") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "exponent") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              if (element.prefix != "" && element.prefix != "1") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "prefix") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              if (element.multiplier != "" && element.multiplier != "1") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "multiplier") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              if (element.units != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "units") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              for (let k = 0; k < children[i].children[j].attributes.length; k++) {
                if (children[i].children[j].attributes[k].key == "prefix" && children[i].children[j].attributes[k].value != element.prefix) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "units"  && children[i].children[j].attributes[k].value != element.units) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "exponent" && children[i].children[j].attributes[k].value != element.exponent) {temp = 1}
              }
              if (temp == 0) return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    else if (element.element_type == "component") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "component"  && children[i].attributes[0].value == element.name) {
          return children[i].lineNumber;
        }
      }
    }
    else if (element.element_type == "variable") {
      for (let i = 0; i < children.length; i++) { 
        if (children[i].name == "component") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "variable") {
              let temp = 0;

              if (element.name != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "name") exists = 1; }
                if (exists == 0) temp = 1; 
              }
              if (element.units != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "units") exists = 1; }
                if (exists == 0) temp = 1; 
              }
              if (element.initial_value != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "initial_value") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              if (element.interface != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "interface") exists = 1;}
                if (exists == 0) temp = 1; 
              }

              for (let k = 0; k < children[i].children[j].attributes.length; k++) {
                if (children[i].children[j].attributes[k].key == "name" && children[i].children[j].attributes[k].value != element.name) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "units"  && children[i].children[j].attributes[k].value != element.units) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "initial_value" && children[i].children[j].attributes[k].value != element.initial_value) {temp = 1}
                if (children[i].children[j].attributes[k].key == "interface" && children[i].children[j].attributes[k].value != element.interface) {temp = 1}
              }
              if (temp == 0) return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    else if (element.element_type == "math") {
      console.log('math:')
      console.log(element);

      let num_math_lines = 0;
      let line_num = 0;
      for (let i = 0; i < children.length; i++) { 
        if (children[i].name == "component") {
          
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "math") {
              if (num_math_lines == element.math_id) {line_num = children[i].children[j].lineNumber}
              num_math_lines ++;
            }
            if (children[i].children[j].name == "reset") {
              for (let k = 0; k < children[i].children[j].children.length; k++) {
                if (num_math_lines == element.math_id) {line_num = children[i].children[j].children[k].lineNumber}
                num_math_lines ++;
              }
            }
          }
        }
      }
      if (line_num == 0) {
        return 2;
      } else {
        return line_num;
      }
    }

    else if (element.element_type == "reset") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "component") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "reset") {
              let temp = 0;

              if (element.variable != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "variable") exists = 1; }
                if (exists == 0) temp = 1; 
              }
              if (element.test_variable != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "test_variable") exists = 1; }
                if (exists == 0) temp = 1; 
              }
              if (element.order != "") {
                let exists = 0;
                for (let a = 0; a < children[i].children[j].attributes.length; a++) {if (children[i].children[j].attributes[a].key == "order") exists = 1;}
                if (exists == 0) temp = 1; 
              }
              for (let k = 0; k < children[i].children[j].attributes.length; k++) {
                if (children[i].children[j].attributes[k].key == "variable" && children[i].children[j].attributes[k].value != element.variable) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "test_variable"  && children[i].children[j].attributes[k].value != element.test_variable) {temp = 1; }
                if (children[i].children[j].attributes[k].key == "order" && children[i].children[j].attributes[k].value != element.order) {temp = 1}
              }
              if (temp == 0) return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    else if (element.element_type == "connection") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "connection"  && children[i].attributes[0].value == element.component_1 && children[i].attributes[1].value == element.component_2) {
          return children[i].lineNumber;
        }
      }
    }
    else if (element.element_type == "map_variables") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "connection") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].attributes[0].value == element.variable_1 &&
                children[i].children[j].attributes[1].value == element.variable_2) return children[i].children[j].lineNumber;
          }
        }
      }
    }
    else if (element.element_type == "encapsulation") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "encapsulation") {
          return children[i].lineNumber;
        }
      }
    }
    else if (element.element_type == "component_ref") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "encapsulation") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "component_ref") {
              return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    else if (element.element_type == "import") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "import" && children[i].attributes[0].value == element.href) {
          return children[i].lineNumber;
        }
      }
    }
    else if (element.element_type == "import_component") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "import") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "component" && 
                children[i].children[j].attributes[0].value == element.component_ref &&
                children[i].children[j].attributes[1].value == element.name) {
              return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    else if (element.element_type == "import_units") {
      for (let i = 0; i < children.length; i++) {
        if (children[i].name == "import") {
          for (let j = 0; j < children[i].children.length; j++) {
            if (children[i].children[j].name == "units" && 
                children[i].children[j].attributes[0].value == element.units &&
                children[i].children[j].attributes[1].value == element.name) {
              return children[i].children[j].lineNumber;
            }
          }
        }
      }
    }
    return 2;
  }


  isMouseInShape(mx: number, my: number, shape: any) {
    const rLeft  = shape.x
    const rRight = shape.x;
    const rTop   = shape.y;
    const rBott  = shape.y;
    // math test to see if mouse is inside the shape

    if (shape == undefined) {
      selectedShapeIndex = -1;
    }

    if (shape != undefined) {
      //console.log(shape);
      const dx = mx - shape.x;
      const dy = my - shape.y;

      if (shape.element_type == "units" || shape.element_type == "component" || 
          shape.element_type == "component_ref" || shape.element_type == "import" || 
          shape.element_type == "import_units" || shape.element_type == "import_component") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 50) return(true);
      } 
      else if (shape.element_type == "unit") {
        if(mx > shape.x - 25 && mx < shape.x + 25 && my > shape.y - 25 && my < shape.y + 25) return(true);
      }
      else if (shape.element_type == "variable" || shape.element_type == "reset") {
        if(mx > shape.x - 30 && mx < shape.x + 30 && my > shape.y - 30 && my < shape.y + 30) return(true);
      }
      else if (shape.element_type == "test_value" || shape.element_type == "reset_value") {
        if(mx > shape.x - 40 && mx < shape.x + 40 && my > shape.y - 40 && my < shape.y + 40) return(true);
      }
      else if (shape.element_type == "math") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 50) return(true);
      }
      else if (shape.element_type == "encapsulation") {
        if (mx > shape.x && mx < shape.x + 150 && my > shape.y && my < shape.y + 100) return(true);
      }
      else if (shape.element_type == "connection" || shape.element_type == "map_variables") {
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
             selectedShape.element_type == "encapsulation" || selectedShape.element_type == "connection" || selectedShape.element_type == "map_variables" ||
             selectedShape.element_type == "import_units" || selectedShape.element_type == "import_component") {
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
      ctx.fillStyle = "rgb(164, 190, 219,0.5)";
      ctx.fill();
  }

  calculate_variable_center_x(var_name: string, x_pos: number) {
    if (var_name.length == 1) return x_pos - 7;
    else return x_pos - (5*var_name.length);
  }

  calculate_prefix_pos(prefix_name: string, x_pos: number) {
    return x_pos - prefix_name.length;
  }





  // =============================================================================
  // =============================================================================
  // =============================================================================
  // Draw the model
  drawModel(canvas: HTMLCanvasElement) {
    // Update The Canvas Depending on the Elements list
    canvas.height = cellml_elements.length*50 + 100;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.clearRect(0,0,canvas.width, canvas.height);
    // =============================================================================
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
      highlight_stroke(context, shape, border_color);
      context.stroke();
    }
    // =============================================================================
    // function to draw pentagon (for map variables) 
    function drawPentagon(context: any, shape: any, x:number, y:number, size:number, stroke:string, fill:string) {
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
    // =============================================================================
    // function to highlight the element when clicked
    function highlight_stroke(context: any, shape: any, alt_color: string) {
      if (cellml_elements[selectedShapeIndex] != undefined) {
        if (shape.x == cellml_elements[selectedShapeIndex].x && 
            shape.y == cellml_elements[selectedShapeIndex].y) {
          context.lineWidth = 5; 
          context.strokeStyle = "rgb(222, 190, 7)";
        } else { 
          context.strokeStyle = alt_color; 
          context.lineWidth = 3; 
        }
      } else { 
        context.strokeStyle = alt_color; 
        context.lineWidth = 3; 
      }
    }
    // =============================================================================
    // function so if an existing SI prefix base - abbreviate to SI standard
    function calculate_prefix(shape:any) {
      let prefix = "";
      if (shape.prefix == '') prefix = '';
      else if (shape.prefix.toLowerCase() == "yotta") prefix = "Y";
      else if (shape.prefix.toLowerCase() == "zetta") prefix = "Z";
      else if (shape.prefix.toLowerCase() == "exa")   prefix = "E";
      else if (shape.prefix.toLowerCase() == "peta")  prefix = "P";
      else if (shape.prefix.toLowerCase() == "tera")  prefix = "T";
      else if (shape.prefix.toLowerCase() == "giga")  prefix = "G";
      else if (shape.prefix.toLowerCase() == "mega")  prefix = "M";
      else if (shape.prefix.toLowerCase() == "kilo")  prefix = "k";
      else if (shape.prefix.toLowerCase() == "hecto") prefix = "h";
      else if (shape.prefix.toLowerCase() == "deca")  prefix = "da";
      else if (shape.prefix.toLowerCase() == "deci")  prefix = "d";
      else if (shape.prefix.toLowerCase() == "centi") prefix = "c";
      else if (shape.prefix.toLowerCase() == "milli") prefix = "m";
      else if (shape.prefix.toLowerCase() == "micro") prefix = "µ";
      else if (shape.prefix.toLowerCase() == "nano")  prefix = "n";
      else if (shape.prefix.toLowerCase() == "pico")  prefix = "p";
      else if (shape.prefix.toLowerCase() == "femto") prefix = "f";
      else if (shape.prefix.toLowerCase() == "atto")  prefix = "a";
      else if (shape.prefix.toLowerCase() == "zepto") prefix = "z";
      else if (shape.prefix.toLowerCase() == "yocto") prefix = "y";
      else prefix = "";
      return prefix;
    }
    // =============================================================================
    // function so if an existing SI unit base - abbreviate to SI standard
    function calculate_units_base(shape: any) {
      if (shape.units) {
        const unit = shape.units.toLowerCase();
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

    // =============================================================================
    // function to calculate the exponent of a unit
    function calculate_exponent(shape:any) {
      let exponent;
      if (shape.exponent == '') exponent = 1.0;
      else if (shape.exponent) exponent = shape.exponent;
      else exponent = 1.0;
      return exponent;
    }

    // =============================================================================
    // function to calculate the multiplier of a unit
    function calculate_multiplier(shape:any) {
      let multiplier;
      if (shape.multiplier == '') multiplier = 1.0;
      else if (shape.multiplier) multiplier = shape.multiplier;
      else multiplier = 1.0;
      return multiplier;
    }

    // =============================================================================
    // function to decide which interface type it is
    function select_interface_type(shape:any) {
      let v_interface;
      if(shape.interface == "none") {v_interface = "";}
      else if (shape.interface == "private") {v_interface = "-"}
      else if (shape.interface == "public") {v_interface = "+"}
      else if (shape.interface == "public_and_private") {v_interface = "x"}
      else {v_interface = "";}
      return v_interface;
    }

    // =============================================================================
    // =============================================================================
    // =============================================================================
    // Create the lines between the elements
    for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        if (shape.element_type=="units") {
          context.beginPath(); 
          context.lineWidth = 5;
          context.strokeStyle = "rgb(193, 2, 12)";
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "unit" && cellml_elements[j].units_parent == shape.units_name) {
              this.drawArrow(context, shape.x + 50, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(255, 175, 175, 0.5)");
            }
            else if (cellml_elements[j].element_type == "variable" && cellml_elements[j].units == shape.units_name) {
              this.drawArrow(context, shape.x + 50, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(255, 175, 175, 0.5)");
            }
          }
          context.stroke();
        }
        else if (shape.element_type == "component") {
          context.beginPath();
          context.strokeStyle = "rgb(123,161,203)";
          context.fillStyle = "rgb(123,161,203)";
          context.lineWidth = 1;
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].var_parent == shape.name && cellml_elements[j].element_type == "variable") {
              this.drawArrow(context, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            else if (cellml_elements[j].res_parent == shape.c_id && cellml_elements[j].element_type == "reset") {
              this.drawArrow(context, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            else if (cellml_elements[j].math_parent == shape.name && cellml_elements[j].element_type == "math") {
              let exists = 0;
              for (let k = 0; k < cellml_elements.length;k++) {
                if ((cellml_elements[k].element_type == "reset_value" || cellml_elements[k].element_type == "test_value") && 
                     cellml_elements[k].math_id == cellml_elements[j].math_id ) {
                       exists = 1;
                     }
              }
              if (exists == 0) {
                this.drawArrow(context, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
              }
            }
            else if (cellml_elements[j].component == shape.name && cellml_elements[j].element_type == "component_ref") {
              this.drawArrow(context, cellml_elements[j].x, cellml_elements[j].y, shape.x + this.calculate_width(shape.name)/2, shape.y + 21, "rgb(175, 245, 185, 0.5)");
            }
          }
          context.fill();
          context.stroke();
        }
        else if (shape.element_type == "reset") {
          // lines between children
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].reset_parent == shape.order && (cellml_elements[j].element_type == "test_value" || cellml_elements[j].element_type == "reset_value")) {
              this.drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable) {
              this.drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
          }
        }
        else if (shape.element_type == "reset_value" || shape.element_type == "test_value") {
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "math" && cellml_elements[j].math_id == shape.math_id) {
              this.drawArrow(context, shape.x, shape.y + 21, cellml_elements[j].x, cellml_elements[j].y, "rgb(175, 245, 185, 0.5)");
            }
          }
        }
        else if (shape.element_type == "connection") {
          // draw the children lines between connection and map variables
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(115,50,115)";
          for (let i = 0; i < cellml_elements.length; i++) {
            if (cellml_elements[i].element_type == "map_variables" && cellml_elements[i].connection_ref == shape.connection_parent) {
              this.drawArrow(context, shape.x, shape.y, cellml_elements[i].x, cellml_elements[i].y, "rgb(245, 206, 177, 0.5)");
            }
          }
          context.stroke();
          // draw connection lines between the components
          context.beginPath();
          context.lineWidth = 3;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) {
                this.drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211, 0.5)");
            }
            else if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) {
                this.drawArrow(context, shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(191, 242, 211, 0.5)");
              }
          }
          context.stroke();
        }
        else if (shape.element_type == "map_variables") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([10,10]);
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_1 ) {
                this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
            if (cellml_elements[j].element_type == "variable" && cellml_elements[j].name == shape.variable_2 ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
          }
          context.stroke();
          context.setLineDash([]);
        }
        else if (shape.element_type == "import") {
          // drawing connecting lines between variables
          context.beginPath();
          context.lineWidth = 5;
          context.strokeStyle = "rgb(115,50,115)";
          context.fillStyle   = "rgb(115,50,115)";
          context.setLineDash([]);
          for (let j = 0; j < cellml_elements.length; j++) {
            // Checking component 1 & 2
            if (cellml_elements[j].element_type == "import_units" && cellml_elements[j].imp_id == shape.import_id ) {
                this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
            if (cellml_elements[j].element_type == "import_component" && cellml_elements[j].imp_id == shape.import_id ) {
              //  context.lineTo(cellml_elements[j].x, cellml_elements[j].y);
              this.drawArrow(context,shape.x, shape.y, cellml_elements[j].x, cellml_elements[j].y, "rgb(235, 211, 250, 0.5)");
            }
          }
          context.stroke();
          
        }
      }

    // =========================================================================================================
    // =========================================================================================================
    // =========================================================================================================
    // =========================================================================================================
    // =========================================================================================================
    // Create the element boxes
    for (const i in cellml_elements) {
        const shape = cellml_elements[i];
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        if (shape.element_type == "connection") {
          // Get the component names
          let component1name = "";
          let component2name = "";
          for (let j = 0; j < cellml_elements.length; j++) {
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_1) { component1name = cellml_elements[j].name; }
            if (cellml_elements[j].element_type == "component" && cellml_elements[j].name == shape.component_2) { component2name = cellml_elements[j].name; }
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
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type=="units") {
           // draw the red units element container
          context.beginPath();
          context.lineWidth = 3;
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.units_name) + 10, 48, 5, true, true);
          context.font =  "16px Arial";
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.units_name)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.units_name)/3, shape.y + 30, 100);
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
        } 
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
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
          if (unit_string.length > 7) {this.roundRect(context, shape.x - unit_size - 15, shape.y - 15, unit_string.length*10, 30, 5, true, true);}
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
          highlight_stroke(context, shape, "rgb(4, 131, 6)");
          context.stroke();
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "variable") {
           // Draw the container
          context.beginPath();
          context.lineWidth = 3;
          context.arc(shape.x, shape.y, 35, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          context.fillStyle= 'rgb(2, 80, 4)';
          context.lineWidth = 3;
          context.font =  "bold 18px Arial";
          context.fillText(shape.name, this.calculate_variable_center_x(shape.name, shape.x), shape.y + 8);
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
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "reset") {
          context.beginPath();
          context.lineWidth = 5;
          context.arc(shape.x, shape.y, 40, 0, Math.PI * 2);
          const grd = context.createRadialGradient(shape.x - 5, shape.y - 5, 5, shape.x + 5, shape.y - 5, 30);
          grd.addColorStop(0, "rgb(181, 242, 204)");
          grd.addColorStop(1, "rgb(53, 181, 104)");
          context.fillStyle = grd;
          context.fill();
          highlight_stroke(context, shape, "rgb(2, 48, 134)");
          context.stroke();

          // The variable reference
          context.beginPath();
          context.lineWidth = 2;
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(2, 48, 134)");
          this.roundRect(context, shape.x - 50, shape.y - 40, this.calculate_width(shape.variable) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Var: " + shape.variable, shape.x - 40, shape.y - 26);
          context.stroke();

         context.beginPath();
          context.strokeStyle = "rgb(2, 48, 134)";
          context.fillStyle = "rgb(174, 239, 199)";
          context.fill();
          highlight_stroke(context, shape, "rgb(30, 70, 70)");
          this.roundRect(context, shape.x - 50, shape.y + 20, this.calculate_width(shape.test_variable) + 35, 20, 5, true, true);
          context.stroke();

          context.beginPath();
          context.font = "bold 14px Arial";
          context.fillStyle = "rgb(2, 80, 4)";
          context.fillText("Test_V: " + shape.test_variable, shape.x - 40, shape.y + 35);
          context.stroke();


        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "test_value" || shape.element_type == "reset_value") {
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
          if (shape.element_type == "test_value" ) context.fillText("Test: ", shape.x - 30, shape.y + 8);
          if (shape.element_type == "reset_value") context.fillText("Reset: ", shape.x - 30, shape.y + 8);

        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "import") {

          context.beginPath(); 
          context.lineWidth = 5;
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.href), 50, 5, true, true);
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.href)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.href)/3, shape.y + 30, 100);
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
        }
        
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "map_variables") {

          // Draw the pentagon for the map variable element
          context.beginPath();
          context.lineWidth = 5;
          let shape_width;
          const var1length = this.calculate_width(shape.variable_1);
          const var2length = this.calculate_width(shape.variable_2);
          (var1length > var2length) ? shape_width = var1length : shape_width = var2length;
          drawPentagon(context, shape, shape.x + shape_width/4, shape.y + shape_width/4, shape_width/2 , "rgb(185,100,185)", "rgb(230,205,230)");

          // Draw the boxes for the pentagon
          context.beginPath();
          context.fillStyle = "rgb(223,187,232)";
          context.font = "bold 16px Arial";
          context.lineWidth = 2;
          highlight_stroke(context, shape, "rgb(115,50,115)");
          this.roundRect(context, shape.x - 25, shape.y - 10, this.calculate_width(shape.variable_1), 25, 5, true, true);
          this.roundRect(context, shape.x - 25, shape.y + shape_width/3, this.calculate_width(shape.variable_2), 25, 5, true, true);
          context.stroke();

          // Write the names onto the element container
          context.beginPath();
          context.fillStyle='rgb(101, 39, 116)';
          context.font =  "bold 16px Arial";
          context.lineWidth = 5;
          context.fillText(shape.variable_1, shape.x - 15,  shape.y + 8);
          context.fillText("   X   ",  shape.x + shape_width/4 - 15,  shape.y + shape_width/4 + 5);
          context.fillText(shape.variable_2, shape.x - 15,  shape.y + shape_width/3 + 20);
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

        }

        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "import_component") {
          // The actual element container
          context.beginPath(); 
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          // The border is blue to help indicate it's imported
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.name), 50, 10, true, true);
          context.stroke();
          // The inner border is green to indicate it's a component
          context.beginPath();
          context.strokeStyle = "rgb(3, 83, 5)";
          context.lineWidth = 2;
          this.roundRect(context, shape.x + 3, shape.y + 3, this.calculate_width(shape.name) - 6, 44, 5, true, true);
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
          context.font =  "bold 10px Arial";
          context.fillText("Imported: (" + shape.component_ref + ")", shape.x + 10, shape.y + 40);
          context.stroke();
        }
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "import_units") {
          context.beginPath();
          highlight_stroke(context, shape, "rgb(63, 81, 181)");
          this.roundRect(context, shape.x, shape.y, this.calculate_width(shape.name), 50, 10, true, true);
          context.stroke();

          context.beginPath();
          context.lineWidth = 3;
          this.roundRect(context, shape.x + 3, shape.y + 3, this.calculate_width(shape.name) - 6, 44, 5, true, true);
          context.font =  "16px Arial";
          context.strokeStyle="rgb(193, 2, 12)";
          context.lineWidth = 3;
          const grd = context.createRadialGradient(shape.x + this.calculate_width(shape.name)/2, shape.y + 25, 5, shape.x + this.calculate_width(shape.name)/3, shape.y + 30, 100);
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
        // =========================================================================================================
        // =========================================================================================================
        // =========================================================================================================
        else if (shape.element_type == "math") {
          context.beginPath();
          this.roundRect(context, shape.x, shape.y, 125, 50, 10, true, true);
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


         /* console.log("____________")
          console.log('found math: ')
          console.log(shape.mathml_format);
          console.log(shape.mathml_format.outerHTML);
          console.log(typeof shape);
          console.log("____________")
          context.beginPath(); */
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
          context.drawImage(temp, shape.x + 5, shape.y + 25);

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
          console.log(svg_elem.outerHTML);*/

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
  



  // =============================================================================
  // =============================================================================
  // =============================================================================
  /*    Create a rectangle with rounded borders
  ctx:    context
  x:      x location
  y:      y location
  width:  width of rectangle
  height: height of rectangle
  radius: how rounded the corners are
  fill:   is filled
  stroke: is filled*/
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


   

  changeinnermath() {
    console.log('change math');
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.beginPath();
    //context.drawImage(img, 10, 10);
    const aaa = ` <math xmlns = "http://www.w3.org/1998/Math/MathML">
		
         <mrow>
            <mi>A</mi>
            <mo>=</mo>
			
            <mfenced open = "[" close="]">
			
               <mtable>
                  <mtr>
                     <mtd><mi>x</mi></mtd>
                     <mtd><mi>y</mi></mtd>
                  </mtr>
					
                  <mtr>
                     <mtd><mi>z</mi></mtd>
                     <mtd><mi>w</mi></mtd>
                  </mtr>
               </mtable>
               
            </mfenced>
         </mrow>
      </math>`;
    const svg_container = document.getElementById("mathjaxexample") as any;
    console.log(svg_container)
    svg_container.dangerouslySetInnerHTML = {__html: aaa};

    const a = "<div id=" + '"mathjaxexample"' + "dangerouslySetInnerHTML={{__html:" + defaul3 ;
    svg_container.innerHTML = a;


    /*
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

    context.drawImage(image, 0, 0);*/
    context.stroke();
  }
  

  // =============================================================================
  // =============================================================================
  // =============================================================================
  // Function so that we can save the canvas as an image
  saveModel() {
    console.log('save model');
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const image = canvas.toDataURL();
    // create temporary link  
    const tmpLink = document.createElement( 'a' );  
    tmpLink.download = 'image.png'; // set the name of the download file 
    tmpLink.href = image;  
    // temporarily add link to body and initiate the download  
    document.body.appendChild(tmpLink );  
    tmpLink.click();  
    document.body.removeChild(tmpLink );  
  }

  // =============================================================================
  // =============================================================================
  // =============================================================================
  // Resize the canvas to specific height/width
  resizeCanvas() {
    const width = document.getElementById("canvas_width") as HTMLInputElement;
    const height = document.getElementById("canvas_height") as HTMLInputElement;
    if (width.value != "" && height.value != "" && 
        width.value.match(`^[0-9]+$`) && height.value.match(`^[0-9]+$`) ) {
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      canvas.height = parseInt(height.value);
      canvas.width = parseInt(width.value);
    }
  }

  testtt() {
    for (let i = 0; i < cellml_elements.length; i++) {
      if (cellml_elements[i].element_type == "import" || 
          cellml_elements[i].element_type == "import_component" ||
          cellml_elements[i].element_type == "import_units") {
        console.log(cellml_elements[i])
      }
    }
  }

  //===================================================================================================================================
  //===================================================================================================================================
  //===================================================================================================================================
  render(): React.ReactNode {
    return (
      <html>
        <head>
          <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
          <script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js"></script>          
        </head>
        <body>

          <button className="model_view_btns" onClick={()=> this.testXMLconvert(this.props.filepath)}>Generate Model</button>
          <button className="model_view_btns" onClick={this.saveModel}>Save Model</button>
          
          <div className="tree-pane">
            <canvas id="myCanvas" width="1200" height="800" onDrop={this.dropElem} onDragOver={this.allowDrop} onMouseDown={(event)=>this.handleMouseDown(event, this.props.dom)}
                    onMouseOut={(event)=>this.handleMouseOut(event)} onMouseUp={(event)=>this.handleMouseUp(event)}
                    onMouseMove={(event) => this.handleMouseMove(event)}></canvas>
            <div>Render Image</div> 

          <div>
            <label htmlFor="canvas_width">X:</label>
            <input id="canvas_width" placeholder="width"></input>
            <label htmlFor="canvas_height">Y:</label>
            <input id="canvas_height" placeholder="height"></input>
            <button className="model_view_btns resize_btn" onClick={this.resizeCanvas}>Resize</button>
          </div>

        {/*<button onClick={this.testtt}>Testtt</button>*/}

        {/*<TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
	
          {this.props.dom && this.domToTreeItem(this.props.dom)}
        </TreeView>*/}
          </div>

        </body>  
      </html>
    );
  }
}
