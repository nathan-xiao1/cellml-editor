$identify("org/mathdox/formulaeditor/modules/arithmetic/sum.js");

$require("org/mathdox/formulaeditor/semantics/MultaryOperation.js");
$require("org/mathdox/formulaeditor/presentation/Row.js");
$require("org/mathdox/formulaeditor/presentation/Column.js");
$require("org/mathdox/formulaeditor/presentation/Symbol.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/modules/relation1/eq.js");
$require("org/mathdox/formulaeditor/modules/interval1/integer_interval.js");
$require("org/mathdox/formulaeditor/semantics/Lambda.js");

$main(function(){

  /**
   * Defines a semantic tree node that represents a sum.
   */
  org.mathdox.formulaeditor.semantics.Sum =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {

      // operand 0 : integer_interval
      // operand 1 : lambda expression
    
      getPresentation : function(context) {
      
        var presentation = org.mathdox.formulaeditor.presentation;
        
        return new presentation.Row(
          new presentation.Sum(
            new presentation.Row(
              this.operands[0].operands[1].getPresentationWithExplicitBrackets(context)),
            new presentation.Row(
              this.operands[1].variables[0].getPresentationWithExplicitBrackets(context),
              new presentation.Symbol("="),
              this.operands[0].operands[0].getPresentationWithExplicitBrackets(context)
            )
          ),
          new presentation.Symbol("("),
          this.operands[1].expression.getPresentation(context),
          new presentation.Symbol(")")
        );
      
      },
      
      getOpenMath : function() {
      
        return "<OMA" + this.getOpenMathCommonAttributes() + ">" +
          "<OMS cd='arith1' name='sum'/>" +
          this.operands[0].getOpenMath() +
          this.operands[1].getOpenMath() +
        "</OMA>";
      
      },

      getMathML : function(context) {
        return "<mrow>"+
	  "<munderover>" +
          // U+2211 n-ary summation
	  "<mo>∑</mo>"+
	  "<mrow>"+
          this.operands[1].variables[0].getMathMLWithExplicitBrackets(context) +
          "<mo>=</mo>"+
          this.operands[0].operands[0].getMathMLWithExplicitBrackets(context) +
	  "</mrow>"+
          this.operands[0].operands[1].getMathMLWithExplicitBrackets(context) +
          "</munderover>" + "<mfenced>" +
          this.operands[1].expression.getMathML(context) +
	  "</mfenced>" + "</mrow>";
      }
    
    });

  /**
   * Defines an on-screen sum.
   */
  org.mathdox.formulaeditor.presentation.Sum =
    $extend(org.mathdox.formulaeditor.presentation.Column, {

    /**
     * top and bottom rows are smaller
     */
    fontSizeModifierArray : [-1,0,-1],

    initialize : function(above, below) {

      var parent = arguments.callee.parent;
      // U+2211 n-ary summation
      var sigma  = new org.mathdox.formulaeditor.presentation.Symbol("∑");
      return parent.initialize.call(this, above, sigma, below);

    },

    copy : function() {
      return this.clone(this.children[0].copy(), this.children[2].copy());
    },

    getSemantics : function(context) {

      var semantics = org.mathdox.formulaeditor.semantics;

        var above = this.children[0].getSemantics(context).value;
        var below = this.children[2].getSemantics(context).value;

        if (below instanceof semantics.Relation1Eq) {

          return {
            value : [below.operands[1], above, below.operands[0]],
            rule  : "sum"
          };

        }
        else {

          return null;

        }

      }

  });

  /**
   * Extend the OpenMathParser object with parsing code for arith1.sum.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
       * Returns a Sum object based on the OpenMath node.
       */
      handleArith1Sum : function(node) {

        var children = node.childNodes;
        var integer_interval = this.handle(children.item(1));
        var lambda   = this.handle(children.item(2));

	if (lambda.variables.length === 0) {
	  alert("arith1.sum needs a nonempty OMBVAR");
	  return null;
	}

        return new org.mathdox.formulaeditor.semantics.Sum(integer_interval, lambda);

      }

    });


  /**
   * Add the parsing code for sums.
   */
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
    function(context) { return {

        // expression150 = sum expression150 | super.expression150
        expression150 : function() {
          var parent = arguments.callee.parent;
          pG.alternation(
            pG.transform(
              pG.concatenation(
                pG.rule("sum"),
                pG.rule("expression150")
              ),
              function(result) {

                return new semantics.Sum(
                  new semantics.Integer_interval(result[0][0], result[0][1]),
                  new semantics.Lambda([result[0][2]], result[1])
                );

              }
            ),
            parent.expression150).apply(this, arguments);
        },

        // sum = never
        sum : pG.never
      };
    });

});
