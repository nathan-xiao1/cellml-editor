$identify("org/mathdox/formulaeditor/modules/calculus1/diff.js");

$require("org/mathdox/formulaeditor/semantics/MultaryOperation.js");
$require("org/mathdox/formulaeditor/parsing/mathml/MathMLParser.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/presentation/Row.js");
$require("org/mathdox/formulaeditor/presentation/Superscript.js");
$require("org/mathdox/formulaeditor/presentation/Symbol.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$main(function(){
 
  var presentation = org.mathdox.formulaeditor.presentation;
  var semantics = org.mathdox.formulaeditor.semantics;

  // U+2032 [superscript] prime
  var mathmlSymbol= [ "", "", "<mo>′</mo>"];
  
  var symbol =  {
    // U+2032 [superscript] prime
    onscreen : ["","","′"],
    openmath : "<OMS cd='calculus1' name='diff'/>",
    mathml   : mathmlSymbol
  };

  /**
   * Defines a semantic tree node that represents a unary minus.
   */
  org.mathdox.formulaeditor.semantics.Calculus1Diff =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      

      symbol : {
        onscreen : symbol.onscreen,
        openmath : symbol.openmath,
        mathml   : mathmlSymbol
      },

      precedence : 150

    });

  /**
   * Defines a semantic tree node that represents a unary minus.
   */
  org.mathdox.formulaeditor.semantics.Calculus1Nthdiff =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {

      symbol : {
        onscreen : symbol.onscreen,
        openmath : "<OMS cd='calculus1' name='nthdiff'/>",
        mathml   : mathmlSymbol
      },

      precedence : 150,

      getSymbolMathML: function(context) {
        var symbol = ["",""];
        var primes=[];
        var i=0;
        var count = this.operands[0].value;

        /* special cases */
        if (count==2) {
          // U+2033 double prime
          primes.push("″");
        } else if (count==3) {
          // U+2034 triple prime
          primes.push("‴");
        } else if (count==4) {
          // U+2057 quadruple prime
          primes.push("‴");
        } else {
          for (i=0;i<count;i++) {
            // U+2032 [superscript] prime
            primes.push("′");
          }
        }

        symbol.push("<mo>"+primes.join("")+"</mo>");

        return symbol;
      },

      getSymbolOnscreen: function(context) {
        var symbol = ["", ""];
        var primes=[];
        var i=0;

        for (i=0;i<this.operands[0].value;i++) {
          // U+2032 [superscript] prime
          primes.push("′");
        }
        symbol.push(primes.join(""));

        return symbol;
      },

      getMathML: function(context) {
        var array = [];
        var operand = this.operands[1];
        
        array.push("<msup>");

        if ((operand.getPrecedence && operand.getPrecedence(context) != 0 && operand.getPrecedence(context)< this.getPrecedence(context))|| operand.hasExplicitBrackets()) {
          array.push("<mfenced>");
          array.push(operand.getMathML(context));
          array.push("</mfenced>");
        } else {
          array.push(operand.getMathML(context));
        }

        var symbol_mathml = this.getSymbolMathML();
        array.push(symbol_mathml[2]);

        array.push("</msup>");
        
        // join row to result string
        var result = array.join("");

        return result;
      },

      getPresentation: function(context) {
        var array=[];
        var operand = this.operands[1];

        if ((operand.getPrecedence && operand.getPrecedence(context) != 0 && operand.getPrecedence(context)< this.getPrecedence(context))||operand.hasExplicitBrackets()) {
          array.push(new presentation.Symbol("("));
          array.push(operand.getPresentation(context));
          array.push(new presentation.Symbol(")"));
        } else {
          array.push(operand.getPresentation(context));
        }

        // symbolOnscreen is an array (defined above), removed check
        var symbol = this.getSymbolOnscreen(context);
        var row = new presentation.Row(symbol[2]);

        array.push(row);
        
        // create and return new presentation row using the constructed array
        var result = new presentation.Row();
        result.initialize.apply(result, array);

        return result;
      }

    });

  /**
   * Extend the MathML object with parsing code for msup prime
   */
  org.mathdox.formulaeditor.parsing.mathml.MathMLParser =
    $extend(org.mathdox.formulaeditor.parsing.mathml.MathMLParser, {
      handlemsup: function(node, context) {
        var children = node.childNodes;
        var sup = children.item(1);

        var inner = sup.innerHTML.trim();
        // U+2032 prime
        // U+2033 double prime
        // U+2034 triple prime
        // U+2057 quadruple prime
        if (sup.tagName == "mo" || sup.tagName == 'mi') { 
          // all quotes
          var i;
          var onlySingleQuotes = true;
          for (i=0; i<inner.length; i++) {
            onlySingleQuotes = onlySingleQuotes && (inner[i] == "'" || inner[i] == "′");
          }

          if (onlySingleQuotes || inner == "″" || inner == "‴" || inner == "⁗") { 
            var oper = this.handle(children.item(0));
            var primes = this.handleTextNode(sup, context);

            return new presentation.Row(oper, primes);
          }
        }

        /* default: call parent */
        var parent = arguments.callee.parent;
        return parent.handlemsup.call(this, node, context);
      }
    });


  /**
   * Extend the OpenMathParser object with parsing code for arith1.unary_minus.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
      * Returns a unary object based on the OpenMath node.
      */
      handleCalculus1Diff : function(node) {

        var operand = this.handle(node.childNodes.item(1));
        return new org.mathdox.formulaeditor.semantics.Calculus1Diff(operand);

      },

      handleCalculus1Nthdiff : function(node) {
        var n = this.handle(node.childNodes.item(1));
        var func = this.handle(node.childNodes.item(2));
        var retval = new org.mathdox.formulaeditor.semantics.Calculus1Nthdiff(n, func);
        return retval;
      }
    });

  org.mathdox.formulaeditor.parsing.openmath.KeywordList["calculus1__diff"] = new org.mathdox.formulaeditor.semantics.Keyword("calculus", "diff", symbol, "unary");
  org.mathdox.formulaeditor.parsing.openmath.KeywordList["calculus1__nthdiff"] = new org.mathdox.formulaeditor.semantics.Keyword("calculus", "nthdiff", symbol, "binary");

  /**
   * Add the parsing code for unary symbol.
   */
  var pG = new org.mathdox.parsing.ParserGenerator();

  // only one expression, same on screen
  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
    function(context) { return {

      // expression150 = calculus1diff | super.expression150
      expression150 : function() {
        var parent = arguments.callee.parent;
        pG.alternation(
          pG.rule("calculus1diff"),
          parent.expression150).apply(this, arguments);
      },

      func_symbol : function() {
        var parent = arguments.callee.parent;
        pG.alternation(
          pG.rule("calculus1diff"),
          parent.func_symbol).apply(this, arguments);
      },

      // calculus1diff = expression160 "′*"
      calculus1diff :
        pG.transform(
          pG.concatenation(
            pG.rule("expression160"),
            pG.repetitionplus(
              pG.literal("′")
            )
          ),
          function(result) {
            var retval;
            var n = result.length - 1;

            if (n == 1) {
              retval = new semantics.Calculus1Diff(result[0]);
            } else {
              retval = new semantics.Calculus1Nthdiff(new semantics.Integer(n), result[0]);
            }
            return retval;
          }
        )
    };
  });

});
