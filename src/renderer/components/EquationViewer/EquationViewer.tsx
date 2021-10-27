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

const mathre = /.*\/math/;
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

// Props:
// str: renders mathml given as a string
interface EVProp {
    // dom: IDOM;
    str?: string;
    xpath: string;
    // node?: IDOM;
    model?: monaco.editor.ITextModel;
    start: number;
    end: number;
    replaceHandler: (string: string, startOffset: number, endOffset: number) => void;
    timerInterval?: number;
}

interface EVState {
    mathstr: string;
    xpath: string;
    mathxpath: string;
    // node?: IDOM;
    port: number;
    omstr: string;
    hasChanged: boolean;
    hasMounted: boolean;
    poller: ReturnType<typeof setInterval>;
}


const getMathXPath = (xpath : string) : string => {
    const result = mathre.exec(xpath);
    const r = result ? result[0] : '';
    // console.log(r !== '', result);
    return r;
}

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
            poller: undefined,
        };
        this.handleReplaceButton = this.handleReplaceButton.bind(this);
    }
    
    loadScript() : void {
        // postscribe('#loadScript', `<script type='text/javascript' src='http://mathdox.org/formulaeditor/main.js'></script>`);
        const script = `<script type='text/javascript'>
            var org = { mathdox: { formulaeditor: { options: {
                onloadFocus: true,
                useBar: false,
                paletteShow: 'id',
                paletteShowId: 'palette1',
                floatNeedsLeadingZero: false,
                paletteURL : "http://localhost:${this.state.port}/org/mathdox/formulaeditor/palette_test.xml",
                indentXML : true
            }}}};
        </script>
        `;
        // var div = document.getElementById('loadScript');
        //     var script = document.createElement('script');
        //     script.type = 'text/javascript';
        //     script.src = 'http://localhost:${this.state.port}/org/mathdox/formulaeditor/main.js';
        //     div.appendChild(script);
        
        //
        postscribe('#loadScript', script);
        postscribe('#loadScript', `<script type='text/javascript' src='http://localhost:${this.state.port}/org/mathdox/formulaeditor/main.js'></script>`);

    }
    
    async componentDidMount() : Promise<void> {
        this.setState({mathxpath: getMathXPath(this.props.xpath)});
        const port = await getPort();
        this.setState({ port: port});
        // getPort().then(port => {
        //     this.setState({port: port});
        // });
        
        this.loadFormulaTextArea();
        // if (!this.state.hasMounted) {
        this.loadScript();
        // this.setState({hasMounted: true});
        // }// this.printNode(this.props.dom, getMathXPath(this.props.xpath));
        // hack to make background white lmao
        // postscribe('#loadScript2', `<script>document.getElementById('formula1').background = 'white';</script>`);
        (document.getElementById('formula1') as HTMLElement).style.backgroundColor = 'white';
        
        this.setState({
            poller: getPoller(this.handleTimerTick, (this.props.timerInterval) ? this.props.timerInterval : 1000)
        })
    }
    
    loadFormulaTextArea = (): void => {
        const mainNode = (document.getElementById('equationMain') as HTMLDivElement);
        const node = document.createElement('textarea');
        node.className = 'mathdoxformula';
        node.id = 'formula1';
        node.style.backgroundColor='white';
        let textstr = '';
        try {
            textstr = mathml2openmath(this.props.str);
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
    
    handleTimerTick = () : void => {
        const node = (document.getElementById("formula1") as HTMLTextAreaElement);
        if (!node) return;
        const value = node.value;
        if ( !encodingre.test(value) && !inputre.test(value) && value != this.state.omstr) {
            // console.log(value != this.state.omstr, value, this.state.omstr);
            this.setState({ omstr: value, hasChanged: true });
            console.log(value)
            const math = openmath2mathml(value);
            // console.log(!encodingre.test(value) && !inputre.test(value));
            console.log(math);
           
        } else {
            if (this.state.hasChanged) {
                // console.log('not changed');
                this.setState({ hasChanged: false});
            }
        }
    }
    
    // TODO cleanup formula editor
    componentWillUnmount = () : void => {
        destroyPoller();
    }

    componentDidUpdate(prevProps : EVProp) : void {
        if (prevProps.xpath !== this.props.xpath) {
            const mathxpath = getMathXPath(this.props.xpath);
            if (mathxpath !== this.state.mathxpath) {
                this.setState({mathxpath: mathxpath});
                // this.printNode(this.props.dom, mathxpath);
            }
        }
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
            
            // postscribe('#loadScript', `<script type='text/javascript' src='http://mathdox.org/formulaeditor/main.js'></script>`);
            this.loadScript();
            
            // postscribe('#loadScript', `
            // <script type='text/javascript'>
            //         org.mathdox.formulaeditor.FormulaEditor.getEditorByTextArea(
            //         "formula1").redraw();
            // </script>`);
        }
        
        destroyPoller();
        getPoller(this.handleTimerTick, (this.props.timerInterval) ? this.props.timerInterval : 1000);
        // clearInterval(this.timer);
        // this.timer = setInterval(this.handleTimerTick,(this.props.timerInterval) ? this.props.timerInterval : 1000);
        
    }
    
    printNode(dom: IDOM, xpath: string) : void {
        // console.log(window.location.pathname);
    }
    
    handleDeleteButton(event : MouseEvent<HTMLButtonElement | HTMLAnchorElement>) : void {
        event.preventDefault();
        console.log("Delete Button Clicked");
        this.props.replaceHandler('', this.props.start, this.props.end);
    }
    
    handleReplaceButton(event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) : void {
        event.preventDefault();
        const om = this.getOpenMath();
        if (om) {
            console.log(om);
            try {
                const mm = openmath2mathml(om);
                console.log(mm);
                this.props.replaceHandler(mm, this.props.start, this.props.end);
            } catch {
                console.log('Invalid equation');
            }
        }
    }
    
    getOpenMath = () : string => { 
        const node = (document.getElementById("formula1") as HTMLTextAreaElement);
        if (!node) return null;
        return node.value;
    }
    
    handleOpenMathPoll = () : void => {
        const omstr = this.getOpenMath();
        if (omstr != this.state.omstr) {
            this.setState({omstr : omstr});
            console.log(omstr != this.state.omstr);
            console.log(omstr);
            console.log(this.state.omstr);
        }
    }

    render() : React.ReactNode {
        // if (!this.state.mathstr) return null;
        // const str = this.props.str.replace('</math>', '</math><br>');
        // const mathpath = getMathXPath(this.props.xpath);
        // console.log(mathpath);
        
        // const openmathstr = mathml2openmath(this.props.str);
        
        return (
            // <MathJaxContext version={2} config={config}> 
            //     <MathJax inline={true}>
            //         <div dangerouslySetInnerHTML={{__html: str}}/>
            //     </MathJax>
            // </MathJaxContext>
            <>
                {/* <p>{this.props.xpath}</p>
                <br/>
                <p>{this.state.mathxpath !== '' ? this.state.mathxpath : 'Mathpath not found'}</p>
                <br/>
                {/* <p>{this.props.str}</p> */}
                {/* <textarea value={this.state.mathstr} 
                    onChange={(e) => this.setState({ mathstr: e.target.value})}rows={20}/>
                <br/>
                <p>Start: {this.props.start} End: {this.props.end}</p>
                <button onClick={() => this.props.replaceHandler(this.state.mathstr, this.props.start, this.props.end)}>Replace</button> */}
                {/* <button onClick={() => this.props.replaceHandler('', this.props.start, this.props.end)}>Delete</button> */} 
                {/* {this.state.port ? <IFrame port={this.state.port}/> : <></>} */}
                <div id='equationMain'>
                    {/* <textarea className='mathdoxformula' id='formula1' defaultValue={openmathstr}/> */}
                </div>
                <button onClick={this.handleReplaceButton}>Confirm Changes</button>
                {/* <p>{this.state.port ? this.state.port : 'NO PORT YET'}</p> */}
                <div id='loadScript'></div>
                
                {/* <ScriptLoader/> */}
            </>
        );
    }
}

export default EquationViewer;