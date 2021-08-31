import React from 'react';
import { MathJaxContext, MathJax, MathJax2Config } from 'better-react-mathjax';
import { MathMLInputProcessor } from 'better-react-mathjax/MathJax2';

interface MathMLInputProcessorE extends MathMLInputProcessor {
    useMathMLspacing?: boolean;
    extensions?: string[];
}

const extensions : MathMLInputProcessorE = { extensions: ["content-mathml.js"]};

const config : MathJax2Config = {
    MathML: extensions
}

// Props:
// str: renders mathml given as a string
interface EVProp {
    str: string
}

class EquationViewer extends React.Component<EVProp> {
    render() : React.ReactNode {
        if (!this.props.str) return null;
        const str = this.props.str.replace('</math>', '</math><br>');
        return (
            <MathJaxContext version={2} config={config}> 
                <MathJax inline={true}>
                    <div dangerouslySetInnerHTML={{__html: str}}/>
                </MathJax>
            </MathJaxContext>
        );
    }
}

export default EquationViewer;