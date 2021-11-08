import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { IDOM } from "Types";
import "./TreePane.scss";

import "./VisualPane.scss";

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


  domToTreeItem(dom: IDOM): React.ReactNode {
    if (!dom) return null;

    return (
      <TreeItem
        key={dom.id}
        nodeId={dom.id.toString()}
        label={dom.name}
        onLabelClick={(event) => {
          event.preventDefault();
          this.props.onClickHandler(dom.lineNumber);
        }}
      > 
        {dom.children.length > 0
          ? dom.children.map((element) => this.domToTreeItem(element))
          : null}
      </TreeItem>
    );
  }

  addimage() {
    console.log('sss');
    const model = document.createElement("img");
    model.src = "https://picsum.photos/200/301";

      const img = document.getElementById("testimg") as HTMLImageElement;
      const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
      const context: CanvasRenderingContext2D = canvas.getContext("2d"); 
      context.clearRect(0,0,canvas.width, canvas.height);
      context.drawImage(model, 50, 50, 50, 50);

  }

  renderModel = () => {
    console.log('render');
    
   // const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
   // const context: CanvasRenderingContext2D = canvas.getContext("2d"); 

    console.log(this.props.filepath);
    console.log(this.props.dom);

    

  }

  // recursively call each children element list and then draw a
  // circle in an appropriate position
  recursiveImages = () => {
    console.log("-------------");
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");

    for (let i =0; i<this.props.dom.children.length; i++) {
      console.log(this.props.dom.children[i].name);
      
      this.num_children++;
      console.log(this.num_children);

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
    let new_element_src;
    if (children.name === "model") {
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
        this.drawelement(element_src, how_deep);
        this.recurse(children.children[i], element_src, how_deep);
      }
    }
  }


  // function to draw the element onto the canvas
  drawelement = (imagesrc: string, how_deep: number) => {
    // get the canvas
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    // create the element and then add it to the canvas
    const element = document.createElement("img");
    element.src = imagesrc;


    const ppppp = document.getElementById("ppppp") as HTMLImageElement;
    const x_size = (canvas.width+1)/this.props.dom.children.length;
    const y_size = (canvas.height+1)/this.props.dom.children.length;

    const x_location = 3 + how_deep*x_size;
    const y_location = this.num_children*y_size - 5;

    context.drawImage(element, x_location, y_location, x_size, y_size);
    
    context.beginPath();
    context.moveTo(x_location + 3*x_size/4,y_location + 3*y_size/4);
    context.lineTo(x_location+x_size*5/4, y_location + 3*y_size/4);
    context.stroke();
  }


  
  drawBaseElement = (imagesrc: string) => {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

    console.log("bAAAAAAA: " + this.num_children);
    const element = document.createElement("img");
    element.src = imagesrc;
    console.log(element);
    context.imageSmoothingEnabled = false;

    const ppppp = document.getElementById("ppppp") as HTMLImageElement;

    // size of the circle
    const x_size = (canvas.width+1)/this.props.dom.children.length;
    const y_size = (canvas.height+1)/this.props.dom.children.length;

    const x_location = 10;
    const y_location = this.num_children*y_size - 5;


    context.drawImage(element, x_location, y_location, x_size, y_size);
  }
  






  render(): React.ReactNode {
    return (
      <div className="tree-pane">
	<h3>Full Model</h3>
	<canvas id="myCanvas" onLoad={()=>this.addimage}></canvas>

      <img id="ppppp" src="https://th.bing.com/th/id/OIP.moljRSPO3Y7hP11mxzkHWwAAAA?pid=ImgDet&rs=1" width="50" height="50"></img>
	<div>Render Image</div> 
	<button onClick={this.addimage}>Temp</button>

	<button onClick={this.renderModel}>Render Model</button>
  <button onClick={this.recursiveImages}>AAA</button>

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
