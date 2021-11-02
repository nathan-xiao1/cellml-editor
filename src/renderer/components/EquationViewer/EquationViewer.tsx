import React, {MouseEvent} from 'react';
import { MathJaxContext, MathJax, MathJax2Config } from 'better-react-mathjax';
import { MathMLInputProcessor } from 'better-react-mathjax/MathJax2';
import { IDOM } from "Types";
import { getNodeFromXPath, getNodeFromXPathLibXML } from "src/commons/utils/xpath";
import monaco from 'monaco-editor';
import { getPort } from './WebServer';
import postscribe from 'postscribe';
import openmath2mathml from './openmath2mathml';
import { getPoller, destroyPoller } from './SingletonPoller';
import mathml2openmath from './mathml2openmath';
// import redent from 'redent';
// import stripIndent from 'stip-indent';

// Regex for checking math element for errors
const mathre = /.*\/math/;
const startre = /<\s*math.*>/gm;
const encodingre = /encodingError/m;
const inputre = /input_box/m;

// interface MathMLInputProcessorE extends MathMLInputProcessor {
//     useMathMLspacing?: boolean;
//     extensions?: string[];
// }

// const extensions : MathMLInputProcessorE = { extensions: ["content-mathml.js"]};

// const config : MathJax2Config = {
//     MathML: extensions
// }

interface EVProp {
    // dom: IDOM;
    str?: string;   // given mathml as string
    xpath: string;  // xpath of given element
    // node?: IDOM;
    // model?: monaco.editor.ITextModel;   
    start: number;  // start of offset of text model to replace when committing changes
    end: number;    // end of offset of text model 
    // Function to call to commit changes
    replaceHandler: (string: string, startOffset: number, endOffset: number) => void;
    timerInterval?: number; // Interval in ms poller is called
    mathTagIncluded: boolean;
}

interface EVState {
    mathstr: string;    // last valid mathml string
    xpath: string;      // xpath of current element being edited/highlighted
    mathxpath: string;  // xpath of active math element being edited
    // node?: IDOM;
    port: number;       // port of local webserver used to load scripts
    omstr: string;      // openmath representation of string
    hasChanged: boolean;    // Checks if formula editor has changed from last poll
    hasMounted: boolean;    // Checks if Equation viewer has been mounted before
    // poller: ReturnType<typeof setInterval>; // Poller id
}

// Gets math parent path given xpath of an element inside one
const getMathXPath = (xpath : string) : string => {
    const result = mathre.exec(xpath);
    const r = result ? result[0] : '';
    // console.log(r !== '', result);
    return r;
}

// Removes children of a html element
const removeChildren = (parent : HTMLElement) : void => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


class EquationViewer extends React.Component<EVProp, EVState> {

    constructor (props: EVProp) {
        super(props);
        this.state = {
            mathstr: this.props.str,
            xpath: this.props.xpath,
            // node: this.props.node,
            mathxpath: undefined,
            port: undefined,
            omstr: '',
            hasChanged: false,
            hasMounted: false,
            // poller: undefined,
        };
        // Button binds
        this.handleReplaceButton = this.handleReplaceButton.bind(this);
        this.handleDeleteButton = this.handleDeleteButton.bind(this);
    }
    
    // Loads formulaeditor scripts into component 
    loadScript() : void {
        postscribe('#loadScript', '<script type="text/javascript"> window.onerror = function(e){} </script>')
        const script = `
        <script type='text/javascript'>
            var org = { mathdox: { formulaeditor: { options: {
                // onloadFocus: true,
                useBar: false,
                paletteShow: 'id',
                paletteShowId: 'palette1',
                floatNeedsLeadingZero: false,
                paletteURL : "http://localhost:${this.state.port}/org/mathdox/formulaeditor/palette_test.xml",
                indentXML : true
            }}}};
        </script>
        `;
        postscribe('#loadScript', script);
        postscribe('#loadScript', `<script type='text/javascript' src='http://localhost:${this.state.port}/org/mathdox/formulaeditor/main.js'></script>`);

    }
    
    async componentDidMount() : Promise<void> {
        this.setState({mathxpath: getMathXPath(this.props.xpath)});
        const port = await getPort();
        this.setState({ port: port});
        
        this.loadFormulaTextArea();
        
        this.loadScript();
        // Sets background of formula text canvas to white
        (document.getElementById('formula1') as HTMLElement).style.backgroundColor = 'white';
        getPoller(this.handleTimerTick, (this.props.timerInterval) ? this.props.timerInterval : 1000);
    }
    
    // Loads formula text area with direct DOM manipulation (needed so it works with js scripts)
    loadFormulaTextArea = (): void => {
        const mainNode = (document.getElementById('equationMain') as HTMLDivElement);
        const node = document.createElement('textarea');
        node.className = 'mathdoxformula';
        node.id = 'formula1';
        node.style.backgroundColor='white';
        let textstr = '';

        try {
            const mmlstr = this.props.mathTagIncluded ? this.props.str : 
                '<math xmlns="http://www.w3.org/1998/Math/MathML">' + this.props.str + '</math>';
            textstr = mathml2openmath(mmlstr);
        } catch {
            textstr = '';
        }
        const textnode = document.createTextNode(textstr);
        node.appendChild(textnode);
        mainNode.appendChild(node);
        
        const paletteNode = document.createElement('div');
        paletteNode.id = 'palette1';
        mainNode.appendChild(paletteNode);
    }
    
    // Gets called by poller, checks value of formula editor
    handleTimerTick = () : void => {
        const value = this.getOpenMath();
        if (!value) return;
        // Only handle changes if not in intermediate state
        if ( !encodingre.test(value) && !inputre.test(value) && value != this.state.omstr) {
            this.setState({ omstr: value, hasChanged: true });
            // console.log(value)
            // const math = openmath2mathml(value);
            // console.log(math);
           
        } else {
            if (this.state.hasChanged) {
                this.setState({ hasChanged: false});
            }
        }
    }
    
    componentWillUnmount = () : void => {
        destroyPoller();
    }

    componentDidUpdate(prevProps : EVProp) : void {
        // If xpaths has changed, update them
        if (prevProps.xpath !== this.props.xpath) {
            const mathxpath = getMathXPath(this.props.xpath);
            if (mathxpath !== this.state.mathxpath) {
                this.setState({mathxpath: mathxpath});
            }
        }
        // If math string has changed, update
        if (prevProps.str !== this.props.str) {
            this.setState({ mathstr: this.props.str });
            // Reload script
            const loadScriptNode = (document.getElementById('loadScript') as HTMLDivElement)
            removeChildren(loadScriptNode);
            const mainNode = (document.getElementById('equationMain') as HTMLDivElement);
            removeChildren(mainNode);
            const elements  = mainNode.getElementsByTagName('canvas');
            while(elements[0]) {
                elements[0].parentNode.removeChild(elements[0]);
            }
            this.loadFormulaTextArea();
            this.loadScript();
        }
        
        // Remake poller
        destroyPoller();
        getPoller(this.handleTimerTick, (this.props.timerInterval) ? this.props.timerInterval : 1000);
    }
    
    // Handles button to delete math element
    handleDeleteButton(event : MouseEvent<HTMLButtonElement | HTMLAnchorElement>) : void {
        event.preventDefault();
        console.log("Delete Button Clicked");
        this.props.replaceHandler('', this.props.start, this.props.end);
    }
    
    // Handles button to commit changes (replace text in model), ensures only valid equation is committed
    handleReplaceButton(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) : void {
        event.preventDefault();
        // console.log('mathTagIncluded: ', this.props.mathTagIncluded);
        const om = this.getOpenMath();
        if (om) {
            // console.log(om);
            try {
                let mm = openmath2mathml(om);
                // If given without math element, return without math element
                if (!this.props.mathTagIncluded) {
                    // Remove first and last lines (math elements)
                    mm = mm.split('\n').slice(1, -1).join('\n').trim() + '\n';
                    // Hacky way to remove extraneous indents caused by remove math elements
                    mm = mm.replaceAll('\n    ', '\n');
                }
                console.log('MathML to replace: \n', mm);
                this.props.replaceHandler(mm, this.props.start, this.props.end);
            } catch {
                // TODO change this so that alert is given to user
                console.log('Invalid equation');
            }
        }
    }
    
    // Fetches open math from formula editor
    getOpenMath = () : string => { 
        const node = (document.getElementById("formula1") as HTMLTextAreaElement);
        if (!node) return null;
        return node.value;
    }

    render() : React.ReactNode {
        return (
            <>
                {/* Used to load textarea for formula editor */}
                <div id='equationMain'/>
                
                {/* Buttons */}
                <button onClick={this.handleReplaceButton}>Confirm Changes</button>
                {/* Delete button only appears when selecting an existing math element */}
                {this.props.str ? <button onClick={this.handleDeleteButton}>Delete Math Element</button> : null}
                
                {/* Used to load scripts for formula editor */}
                <div id='loadScript'></div>
            </>
        );
    }
}

export default EquationViewer;