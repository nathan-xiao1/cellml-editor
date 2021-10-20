$package("org.mathdox.formulaeditor.semantics");

$identify("org/mathdox/formulaeditor/semantics/MultaryOperation.js");

$require("org/mathdox/formulaeditor/Options.js");
$require("org/mathdox/formulaeditor/presentation/Row.js");
$require("org/mathdox/formulaeditor/presentation/Symbol.js");
$require("org/mathdox/formulaeditor/semantics/Node.js");

$main(function(){

  /**
   * Representation of an n-ary infix operation.
   */
  org.mathdox.formulaeditor.semantics.MultaryOperation =
    $extend(org.mathdox.formulaeditor.semantics.Node, {

      /**
       * The operands of the operation.
       */
      operands: null,

      /**
       * Information about the symbol that is used to represent this operation.
       */
      symbol : {

        /**
         * The symbol that is used for rendering the operation to the screen.
         */
        onscreen         : null,

        /**
         * The OpenMath symbol that is associated with this operation.
         */
        openmath         : null,

        /**
         * The MathML representation of this operation.
         */
        mathml           : null,

        /**
         * The MathML invisible representation of this operation (if any)
         */
        mathml_invisible : null

      },

      mathml_class: null,

      /**
       * add an mrow 
       */
      addMrow: true,

      getSymbolMathML : function(context) {
        return this.symbol.mathml;
      },

      getSymbolOnscreen : function(context) {
        return this.symbol.onscreen;
      },

      getSymbolOpenMath : function(context) {
        return this.symbol.openmath;
      },

      /**
       * The precedence level of the operator.
       */
      precedence : 0,

      getPrecedence : function(context) {
        return this.precedence;
      },
      getInnerPrecedence : function(context) {
        return this.getPrecedence(context);
      },
 
      /**
       * Is the operator associative
       *
       * if false: put brackets around the second argument also if it has an
       * operator with the same precedence. Example: a-(b-c)
       */
      associative : true,
      
      /**
       * whether to add brackets for a single operand with the same preference
       */
      unary_brackets_for_same_preference : true,

      /**
       * style if any (like "invisible")
       */ 
      style:null,

      /**
       * Initializes the operation using the specified arguments as operands.
       */
      initialize : function() {
        this.operands = arguments;
      },

      /**
       * See org.mathdox.formulaeditor.semantics.Node.getPresentation(context)
       */
      getPresentation : function(context) {

        var presentation = org.mathdox.formulaeditor.presentation;

        // construct an array of the presentation of operand nodes interleaved
        // with operator symbols
        var array = [];
        var i;
        var symbolOnscreen = this.getSymbolOnscreen(context);
        if (this.style != "invisible" && symbolOnscreen instanceof Array) {
          if (symbolOnscreen[0]!=="") {
            array.push(new presentation.Row(symbolOnscreen[0]));
          }
        }

        if (this.style == "sub" && this.operands.length == 1) {
          var operand = this.operands[0];
          var subarray = [];
          if (operand.hasExplicitBrackets()) {
            subarray.push(new presentation.Symbol("("));
            subarray.push(operand.getPresentation(context));
            subarray.push(new presentation.Symbol(")"));
          } else {
            subarray.push(operand.getPresentation(context));
          }
          var row = new presentation.Row();
          row.initialize.apply(row, subarray);

          array.push(new presentation.Subscript(row));
        } else {
          for (i=0; i<this.operands.length; i++) {
            var operand = this.operands[i];
            if (i>0 && this.style != "invisible" ) {
              if (symbolOnscreen instanceof Array) {
                if (symbolOnscreen[1]!=="") {
                  array.push(new presentation.Row(symbolOnscreen[1]));
                }
              }
              else {
                array.push(new presentation.Row(symbolOnscreen));
              }
            }
            //if (operand.precedence && ((operand.precedence < this.precedence) || ((this.associative==false) && i>0 && operand.precedence <= this.precedence))) {
            if ( //based on precedence
              ( operand.getPrecedence && operand.getPrecedence(context) != 0 && 
                ( // inner precedence is larger than operator precedence
                  (operand.getPrecedence(context) < this.getInnerPrecedence(context)) || 
                  // inner precedence is the same; possibly brackets
                  (operand.getPrecedence(context) == this.getInnerPrecedence(context) && 
                    // if only single operand; not if style is invisible, do if past first operand and associative and matching symbols
                    ( ((i>0 || this.operands.length>1 && (this.associative==true && this.symbol.openmath == operand.symbol.openmath)) && operand.style != "invisible") ||
                      (this.operands.length == 1 && this.unary_brackets_for_same_preference)
                    )
                  ) 
                )
              ) ||  // explicitbrackets then always show
              operand.hasExplicitBrackets() 
            ) {
              array.push(new presentation.Symbol("("));
              array.push(operand.getPresentation(context));
              array.push(new presentation.Symbol(")"));
            }
            else {
              array.push(operand.getPresentation(context));
            }
          }
        }

        if (this.style != "invisible" && symbolOnscreen instanceof Array) {
          if (symbolOnscreen[2]!=="") {
            array.push(new presentation.Row(symbolOnscreen[2]));
          }
        }

        // create and return new presentation row using the constructed array
        var result = new presentation.Row();
        result.initialize.apply(result, array);
        return result;

      },

      /**
       * See org.mathdox.formulaeditor.semantics.Node.getOpenMath()
       */
      getOpenMath : function() {
        var result;

        var argtest = this.checkArguments(this.operands);

        if (typeof argtest === "string") {
          result = "<OME><OMS cd='moreerrors' name='encodingError'/>";
          result += "<OMSTR>invalid expression entered: "+ argtest+"</OMSTR>";
          result += "</OME>";
          return result;
        }

        var result = "<OMA";

        // add style (like invisible) if present
        if (this.style) {
          result = result + " style='" + this.style + "'";
        }

        result = result + this.getOpenMathCommonAttributes();

        result = result + ">" + this.getSymbolOpenMath();
        for (var i=0; i<this.operands.length; i++) {
          result = result + this.operands[i].getOpenMath();
        }
        result = result + "</OMA>";

        return result;
      },

      /**
       * See org.mathdox.formulaeditor.semantics.Node.getMathML()
       */
      getMathML : function(context) {
        var result = "";

        // add mrow and possibly mathml_class
        if (this.addMrow === true) {
          result = result + "<mrow";

          if (this.mathml_class !== undefined && this.mathml_class !== null) {
            result = result + " class='" + this.mathml_class + "'";
          }

          result = result + ">";
        }

        var symbol_mathml = this.getSymbolMathML();

        if (this.style == "sub" && this.operands.length == 1 && symbol_mathml instanceof Array) {
          var operand = this.operands[0];
          result = result + "<msub>";
          result = result + symbol_mathml[0]; // symbol_mathml is an array
          if (operand.hasExplicitBrackets()) {
            result = result + "<mfenced>";
            result = result + operand.getMathML(context);
            result = result + "</mfenced>";
          } else {
            result = result + operand.getMathML(context);
          }
          result = result + "</msub>";
        } else {
          if (this.style == "invisible" && (this.symbol.mathml_invisible !== undefined && this.symbol.mathml_invisible !== null)) {
            symbol_mathml = this.symbol.mathml_invisible;
          }
  
          if (symbol_mathml instanceof Array) {
            result = result + symbol_mathml[0];
          }
  
          for (var i=0; i<this.operands.length; i++) {
            var operand = this.operands[i];
            if (i>0) {
              if (symbol_mathml instanceof Array) {
                result = result + symbol_mathml[1];
              } else {
                result = result + symbol_mathml;
              }
            }
            if ((operand.precedence && 
                ((operand.precedence < this.precedence) || ((this.associative==false) && i>0 && operand.precedence <= this.precedence))) ||
                operand.hasExplicitBrackets()
               ) {
              result = result + "<mfenced>";
              result = result + this.operands[i].getMathML(context);
              result = result + "</mfenced>";
            }
            else {
              result = result + this.operands[i].getMathML(context);
            }
          }
  
          if (symbol_mathml instanceof Array) {
            result = result + symbol_mathml[2];
          }
        }

        if (this.addMrow === true) {
          result = result + "</mrow>";
        }

        return result;
      }

    });

});
