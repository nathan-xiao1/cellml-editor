import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { IDOM, Prefix } from "Types";
import "./TreePane.scss";

import "./VisualPane.scss";
import { DoubleArrow } from "@material-ui/icons";

interface TPProps {
  dom?: IDOM;
  filepath? : string;
  onClickHandler: (lineNum: number) => void;
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

      // List of all the cellml elements
      const cellml_elements = [] as any;
      // data.toString is the text read
      console.log("Asynchronous read: " + data.toString());
      // get the canvas to draw on
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      const context = canvas.getContext("2d") as CanvasRenderingContext2D;


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

          cellml_elements.push({x:unit_x_pos, y:unit_y_pos, radius:25, color:'green', element_type:'unit', units:un, prefix:pref, multiplier:mult, exponent:exp, units_parent:elemNode.getAttribute('name')})
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
          console.log(i);
          cellml_elements.push( {x:comp_x_pos, y:comp_y_pos, radius:35, color:'pink', element_type:'math'})
        }
        for (let i = 0; i < reset_list.length; i++) {
          console.log(i);
          let r_varbl, r_testv, r_order;
          (reset_list[i].getAttribute('variable')) ? r_varbl = reset_list[i].getAttribute('variable'): r_varbl = '';
          (reset_list[i].getAttribute('test_variable')) ? r_testv = reset_list[i].getAttribute('test_variable'): r_testv = '';
          (reset_list[i].getAttribute('order')) ? r_order = reset_list[i].getAttribute('order'): r_order = '';
          cellml_elements.push( {x:comp_x_pos, y:comp_y_pos, radius:35, color:'rgb(76,175,80)', element_type:'reset', variable:r_varbl, test_variable:r_testv, order:r_order})
          check_reset_and_test_elements(reset_list[i], x_pos, y_pos);
        }
      }

      // every reset element requires 2 children elements: [Test Value, Reset Value]
      function check_reset_and_test_elements(elemNode: any, x_pos: number, y_pos: number) {
        const test_value_list = elemNode.querySelectorAll("test_value");
        const reset_value_list = elemNode.querySelectorAll("reset_value");
        const value_x_pos = 160;
        const value_y_pos = 10 + cellml_elements.length*50;

        for (let i =0; i<test_value_list.length; i++) {
          cellml_elements.push( {x:value_x_pos, y:value_y_pos, radius:35, color:'purple', element_type:'test_value'})
          // need to add math element
        }
        for (let j = 0; j < reset_value_list.length; j++) {
          cellml_elements.push( {x:value_x_pos, y:value_y_pos, radius:35, color:'purple', element_type:'reset_value'})
          // need to add math element
        }
      }

      function check_connection_elements(elemNode: any, x_pos: number, y_pos: number) {
        const map_variables_list = elemNode.querySelectorAll("map_variables");
        const conn_x = 240;
        const conn_y = 10 + cellml_elements.length*50;

        for (let i = 0; i<map_variables_list.length; i++) {
          let var1, var2;
          (map_variables_list[i].getAttribute('variable_1')) ? var1 = map_variables_list[i].getAttribute('variable_1') : var1 = '';
          (map_variables_list[i].getAttribute('variable_2')) ? var2 = map_variables_list[i].getAttribute('variable_2') : var2 = '';
          cellml_elements.push({x:conn_x, y:conn_y + i*50, radius:35, color:'purple', element_type:'map_variables', variable_1: var1, variable_2: var2})
        }
      }

      function check_encapsulation_elements(elemNode: any, x_pos: number, y_pos: number) {
        const comp_ref_list = elemNode.querySelectorAll("component_ref");
        const cref_x = 250;
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
        const imp_unt_list = elemNode.querySelectorAll("variable");
        const imp_com_list = elemNode.querySelectorAll("component");
        const imp_x = 90;
        const imp_y = 10 + cellml_elements.length*50;

        for (let i = 0; i < imp_com_list.length; i++) {
          console.log(imp_com_list[i].getAttribute("name"));
          cellml_elements.push( {x:imp_x, y:imp_y + i*50, radius:35, color:'green', element_type:'component', name: imp_com_list[i].getAttribute("name"), component_ref:imp_com_list[i].getAttribute("component_ref")});
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
      cellml_connections.forEach(elemNode => {
        const conn_x = 10;
        const conn_y = 10 + cellml_elements.length*50;
        cellml_elements.push({x:conn_x, y:conn_y, radius:35, color:'green', element_type:'connection', component_1: elemNode.getAttribute('component_1'), component_2: elemNode.getAttribute('component_2')});
        check_connection_elements(elemNode, conn_x, conn_y);
      });

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

    const canvas = document.getElementById("graphCanvas") as HTMLCanvasElement;
    const BB = canvas.getBoundingClientRect();
    const offsetX_ = BB.left;
    const offsetY_ = BB.top;
    const startX_ = e.clientX - offsetX_;
    const startY_ = e.clientY - offsetY_;

    console.log(startX_ + " | " + startY_);
    /*for (let i = 0; shapes_.length; i++) {
      if (isMouseInShape(startX_, startY_, shapes_[i])) {
        selectedShapeIndex = i;
        isDragging_ = true;
        display_element_info(shapes_[selectedShapeIndex]);
        return;
      }
    }*/
  }


  /*<canvas id="graphCanvas" onDrop={dropElem} onDragOver={allowDrop} height="500" width="1000" onMouseDown={(event)=>handleMouseDown(event)}
                  onMouseOut={(event)=>handleMouseOut(event)} onMouseUp={(event)=>handleMouseUp(event)}  onMouseMove={(event)=>handleMouseMove(event)}></canvas>*/

  render(): React.ReactNode {
    return (
      <div className="tree-pane">
        <h3>Full Model</h3>
        <canvas id="myCanvas" width="1200" height="800" onDrop={this.dropElem} onDragOver={this.allowDrop}></canvas>
        <div>Render Image</div> 
        <button onClick={this.addimage}>Temp</button>

        <button onClick={this.renderModel}>Render Model</button>
        <button onClick={this.recursiveImages}>AAA</button>


        <button onClick={()=>this.testXMLconvert(this.props.dom)}>Test Convert</button>

        <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
              >
	
          {this.props.dom && this.domToTreeItem(this.props.dom)}
        </TreeView>
      </div>
    );
  }
}
