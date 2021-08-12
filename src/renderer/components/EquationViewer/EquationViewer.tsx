import React from 'react';
import { MathJaxContext, MathJax, MathJax2Config } from 'better-react-mathjax';
import JsxParser from 'react-jsx-parser'

// interface conf {
    
// }

const config : MathJax2Config = {
    MathML: { extensions: ["content-mathml.js"]}
    // ,
    // 'content-mathml': {}
}

interface EVProp {
    str: string
}

// Props:
// jsx: renders mathml given as jsx
// str: renders mathml given as a string
// Prioritises jsx over str if both are given
class EquationViewer extends React.Component<EVProp> {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    render() {
        if (!this.props.str) return null;
        return (
        //
        <MathJaxContext version={2} config={config}> 
            <MathJax>
                {/* <JsxParser autoCloseVoidElements showWarnings jsx={this.props.str}/>  */}
                <JsxParser autoCloseVoidElements jsx={this.props.str} blacklistedAttrs={[/.*/]}/> 
            </MathJax>
        </MathJaxContext>
        // <>
        //     {this.props.str}
        // </>
        )
    }
}

export default EquationViewer;