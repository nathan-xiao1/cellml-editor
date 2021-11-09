import React, {MouseEvent} from 'react';
import { getPort } from './WebServer';
import postscribe from 'postscribe';
import openmath2mathml from './openmath2mathml';
import { getPoller, destroyPoller } from './SingletonPoller';
import mathml2openmath from './mathml2openmath';
import mergeCn from './mergeUnits';
import ViewOnly from './ViewOnly-ts';
import { Button } from '@mui/material';
import './styles.css';
import './equationView.scss';
// import redent from 'redent';
// import stripIndent from 'stip-indent';

// Regex for checking math element for errors
const mathre = /.*\/math/;
// const startre = /<\s*math.*>/gm;
const encodingre = /encodingError/m;
const inputre = /input_box/m;

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
    viewOnly: boolean;
    viewStr: string;
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
            viewOnly: true,
            viewStr: this.props.mathTagIncluded ? this.props.str : 
            '<math xmlns="http://www.w3.org/1998/Math/MathML">' + this.props.str + '</math>',
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
        
        // if (!this.state.viewOnly) {
            this.loadScript();
            // Sets background of formula text canvas to white
            (document.getElementById('formula1') as HTMLElement).style.backgroundColor = 'white';
            getPoller(this.handleTimerTick, (this.props.timerInterval) ? this.props.timerInterval : 100);
        // }
    }
    
    // Loads formula text area with direct DOM manipulation (needed so it works with js scripts)
    loadFormulaTextArea = (): void => {
        const mainNode = (document.getElementById('equationMain') as HTMLDivElement);
        const node = document.createElement('textarea');
        node.className = 'mathdoxformula';
        node.id = 'formula1';
        node.style.backgroundColor='white';
        let textstr = '';

        let mmlstr = '';
        try {
            mmlstr = this.props.mathTagIncluded ? this.props.str : 
                '<math xmlns="http://www.w3.org/1998/Math/MathML">' + this.props.str + '</math>';
            textstr = mathml2openmath(mmlstr);
            this.setState({ 'viewOnly' : false });
        } catch (e) {
            console.log('Failed to load into formula editor, unsupported object');
            console.log(e);
            console.log(mmlstr);
            textstr = '';
            mmlstr = this.props.mathTagIncluded ? this.props.str : 
                '<math xmlns="http://www.w3.org/1998/Math/MathML">' + this.props.str + '</math>';
            this.setState({ 'viewOnly' : true, 'viewStr' : mmlstr });
            // return;
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
            try {
                const mm = openmath2mathml(value);
                let newmathstr = mergeCn(mm, this.state.mathstr);
                if (!this.props.mathTagIncluded) {
                    // Remove first and last lines (math elements)
                    newmathstr = newmathstr.split('\n').slice(1, -1).join('\n').trim() + '\n';
                    // Hacky way to remove extraneous indents caused by remove math elements
                    newmathstr = newmathstr.replaceAll('\n    ', '\n');
                }
                this.setState({ mathstr: newmathstr});
            } catch {
                //
            }
        } else {
            if (this.state.hasChanged) {
                this.setState({ hasChanged: false});
            }
        }
        // console.log('mathstr ', this.state.mathstr);
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
        // console.log(om);
        if (om) {
            // console.log(om);
            // console.log('mathTagIncluded ', this.props.mathTagIncluded);
            try {
                let mm = openmath2mathml(om);
                // If given without math element, return without math element
                if (!this.props.mathTagIncluded) {
                    mm = mm.split('\n').slice(1, -1).join('\n').trim() + '\n';
                    mm = mm.replaceAll('\n    ', '\n'); // Hacky way to remove extraneous indents caused by remove math elements
                }
                
                let newmathstr = mergeCn(mm, this.state.mathstr);
                console.log('Old mathml: \n', this.state.mathstr);
                console.log('Mathml from OM: \n', mm);
                this.setState({ mathstr: newmathstr});
                
                console.log('MathML to replace: \n', newmathstr);
                this.props.replaceHandler(newmathstr, this.props.start, this.props.end);
            } catch (e) {
                // TODO change this so that alert is given to user
                console.log('Invalid equation ', e);
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
            // if (this.state.viewOnly) destroyPoller();
            
            return (
                <>
                    <div className={this.state.viewOnly ? 'hide' : 'show'}>
                    {/* <div> */}
                        {/* Used to load textarea for formula editor */}
                        <div id='equationMain'/>
                        
                        {/* Buttons TODO: change to more suitable css*/}
                        <div className='buttonContainer'>
                            <Button className="equation_editor_confirm_btn" variant="contained" onClick={this.handleReplaceButton}>Confirm Changes</Button>
                            {/* Delete button only appears when selecting an existing math element */}
                            {this.props.str ? <Button className="equation_editor_confirm_btn" variant="outlined" onClick={this.handleDeleteButton}>Delete Math Element</Button> : null}
                        </div>
                        {/* Used to load scripts for formula editor */}
                        <div id='loadScript'></div>
                    </div>
                    <div className={this.state.viewOnly ? 'show' : 'hide'}>
                    {/* <div> */}
                        {/* TODO: add notice that math element is not editable */}
                        <ViewOnly mathmlstr={this.state.viewStr ? this.state.viewStr : ''}/>
                        {/* Delete button only appears when selecting an existing math element */}
                        
                        <div className='buttonContainer'> 
                            {this.props.str ? <Button variant="outlined" onClick={this.handleDeleteButton}>Delete Math Element</Button> : null}
                        </div>
                    </div>
                </>
            );

    }
}

export default EquationViewer;