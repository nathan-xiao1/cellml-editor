// import libcellModule from 'libcellml.js/libcellml.common';
import { Model, Parser, Validator, Printer, Issue}  from './ILibcellml';

// Otherwise ts can't find declaration file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const libcellModule = require('libcellml.js/libcellml.common');

class LibCellMLParser {
    parser : Parser;
    printer : Printer;
    validator : Validator;
    public model : Model = undefined;
    
    // Initialise parse, call this and ensure it resolves before calling any other functions
    public async init () : Promise<void> {
        const libcellml = await libcellModule();
        this.parser = new libcellml.Parser();
        this.validator = new libcellml.Validator();
        this.printer = new libcellml.Printer();
    }
    
    // Validate a given model and return issues
    public validateModel (m: Model) : 
    {
        'errors' : Issue[],
        'warnings' : Issue[],
        'hints' : Issue[]
    }{
        this.validator.removeAllIssues();
        this.validator.validateModel(m);
        const errors : Issue[] = [];
        const warnings : Issue[] = [];
        const hints : Issue[] = [];
        for (let i = 0; i < this.validator.errorCount(); i++) {
            errors.push(this.validator.error(i));
        }
        for (let i = 0; i < this.validator.warningCount(); i++) {
            warnings.push(this.validator.warning(i));
        }
        for (let i = 0; i < this.validator.hintCount(); i++) {
            hints.push(this.validator.hint(i));
        }
        return {
            "errors"    : errors,
            "warnings"  : warnings,
            "hints"     : hints
        }
    }
    
    // Validate the current model and return any issues
    public validate () : {
        'model' : Model, 
        'errors' : Issue[],
        'warnings' : Issue[],
        'hints' : Issue[]
    } {
        this.validator.removeAllIssues();
        this.validator.validateModel(this.model);
        const errors : Issue[] = [];
        const warnings : Issue[] = [];
        const hints : Issue[] = [];
        for (let i = 0; i < this.validator.errorCount(); i++) {
            errors.push(this.validator.error(i));
        }
        for (let i = 0; i < this.validator.warningCount(); i++) {
            warnings.push(this.validator.warning(i));
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
    
    // Return string representation of given model
    public printModel (m : Model) : string {
        if (!this.printer) {
            return "";
        }
        return this.printer.printModel(m, false);
    }
    
    // Return string representation of current model
    public print () : string {
        if (!this.model || !this.printer) {
            return "";
        } else {
            return this.printer.printModel(this.model, false);
        }
        
    } 
    
    // Returns model and list of errors
    // Note => doesn't allow any new lines before it which is why this is all on one line
    public parse (str : string) : 
        {
            'model' : Model, 
            'errors' : Issue[],
            'warnings' : Issue[],
            'hints' : Issue[]
        } {
        this.parser.removeAllIssues();
        this.validator.removeAllIssues();
        this.model = this.parser.parseModel(str);
        
        const errors : Issue[] = [];
        const warnings : Issue[] = [];
        const hints : Issue[] = [];
        for (let i = 0; i < this.parser.errorCount(); i++) {
            errors.push(this.parser.error(i));
        }
        for (let i = 0; i < this.parser.warningCount(); i++) {
            warnings.push(this.parser.warning(i));
        }
        
        for (let i = 0; i < this.parser.hintCount(); i++) {
            hints.push(this.parser.hint(i));
        }
        // If no parsing issues, validate
        if (this.parser.issueCount() === 0) {
            this.validator.validateModel(this.model);
            for (let i = 0; i < this.validator.warningCount(); i++) {
                warnings.push(this.validator.warning(i));
            }
            for (let i = 0; i < this.validator.errorCount(); i++) {
                errors.push(this.validator.error(i));
            }
            for (let i = 0; i < this.validator.hintCount(); i++) {
                hints.push(this.validator.hint(i));
            }
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





