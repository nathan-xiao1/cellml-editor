// import libcellModule from 'libcellml.js/libcellml.common';
import { Model, Parser, Validator, Printer, Issue}  from './ILibcellml';

// Otherwise ts can't find declaration file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const libcellModule = require('libcellml.js/libcellml.common');

class LibCellMLParser {
    parser : Parser;
    printer : Printer;
    validator : Validator;
    model : Model = undefined;
    
    // TODO integrate web workers
    
    public async init () : Promise<void> {
        const libcellml = await libcellModule();
        this.parser = new libcellml.Parser();
        this.validator = new libcellml.Validator();
        this.printer = new libcellml.Printer();
        // return undefined;
    }
    
    // get model () : Model {
    //     return this.model;
    // }
    
    public print () : string {
        if (!this.model || !this.printer) {
            return "";
        } else {
            return this.printer.printModel(this.model, false);
        }
    } 
    
    // Returns model and list of errors
    // Note => doesn't allow any new lines before it which is why this is all on one line
    public async parse (str : string) : 
        Promise<{
            'model' : Model, 
            'errors' : Issue[],
            'warnings' : Issue[],
            'hints' : Issue[]
        }> {
        this.parser.removeAllIssues();
        this.validator.removeAllIssues();
        this.model = this.parser.parseModel(str);
        this.validator.validateModel(this.model);
        const errors : Issue[] = [];
        const warnings : Issue[] = [];
        const hints : Issue[] = [];
        for (let i = 0; i < this.parser.errorCount(); i++) {
            errors.push(this.parser.error(i));
        }
        for (let i = 0; i < this.validator.errorCount(); i++) {
            errors.push(this.validator.error(i));
        }
        for (let i = 0; i < this.parser.warningCount(); i++) {
            warnings.push(this.parser.warning(i));
        }
        for (let i = 0; i < this.validator.warningCount(); i++) {
            warnings.push(this.validator.warning(i));
        }
        for (let i = 0; i < this.parser.hintCount(); i++) {
            hints.push(this.parser.hint(i));
        }
        for (let i = 0; i < this.validator.hintCount(); i++) {
            hints.push(this.validator.hint(i));
        }
        return {
            "model"     : this.model,
            "errors"    : errors,
            "warnings"  : warnings,
            "hints"     : hints
        }
    }
}

export default LibCellMLParser;





