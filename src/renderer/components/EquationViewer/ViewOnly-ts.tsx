import React from 'react';
import { MathJaxContext, MathJax, MathJax2Config } from 'better-react-mathjax';
// Import interface which normally isn't public to extend it
import { MathMLInputProcessor } from 'better-react-mathjax/MathJax2';

const defaultStr = `
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
   
        return (
            <MathJaxContext version={2} config={config}> 
                <MathJax inline={true} dynamic={true}>
                    <div dangerouslySetInnerHTML={{__html: this.props.mathmlstr}}/>
                </MathJax>
            </MathJaxContext>
        );
    }
}