import React from 'react';
import { MathJaxContext, MathJax, MathJax2Config } from 'better-react-mathjax';
// Import interface which normally isn't public to extend it
import { MathMLInputProcessor } from 'better-react-mathjax/MathJax2';

// Little hack to get over undefined extensions in original interface declaration
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

export default class ViewOnly extends React.Component<EFProps> {

    render() : React.ReactNode {
        const mathstr = this.props.mathmlstr.replace(/cellml:.\S+\s*=\s*("|')\S*("|')/gm,'');
        return (
            <MathJaxContext version={2} config={config}> 
                <MathJax inline={true} dynamic={true}>
                    <div dangerouslySetInnerHTML={{__html: mathstr}}/>
                </MathJax>
            </MathJaxContext>
        );
    }
}