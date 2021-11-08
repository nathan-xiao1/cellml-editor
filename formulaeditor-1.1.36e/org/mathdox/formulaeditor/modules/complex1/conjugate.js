$identify("org/mathdox/formulaeditor/modules/complex1/conjugate.js");

$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/parsing/mathml/MathMLParser.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/presentation/Overline.js");
$require("org/mathdox/formulaeditor/semantics/Node.js");
$require("org/mathdox/parsing/ParserGenerator.js");

$main(function(){
 
  var presentation = org.mathdox.formulaeditor.presentation;
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

  org.mathdox.formulaeditor.semantics.Complex1Conjugate =
    $extend(org.mathdox.formulaeditor.semantics.Node, {
      // child : expression
      child: null,

      getPresentation: function(context) {
        var result = new presentation.Overline(this.child.getPresentation(context));

        return result;
      }, 

      getOpenMath : function() {
        return "<OMA" + this.getOpenMathCommonAttributes() + ">" +
          "<OMS cd='complex1' name='conjugate'/>" +
          this.child.getOpenMath() +
          "</OMA>";
      },

      getMathML : function(context) {
        result = "<mover>";
        result += this.child.getMathML(context);
        result += "<mo>¯</mo>"; // U+00AF MACRON, also MathML OverBar
        result += "</mover>";

        return result;
      },

      initialize : function() {
        this.child = arguments[0];
      }
  });

  /**
   * Extend the OpenMathParser object with parsing code for arith1.times.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
       * Returns a Overline object based on the OpenMath node.
       */
      handleComplex1Conjugate : function(node, style) {

        // parse the children of the OMA
        var children = node.childNodes;

        var child = this.handle(children.item(1));

        // construct a conjugate object
	// return new semantics.Complex1Conjugate(child);
	var result = new semantics.Complex1Conjugate(child);

	return result;
      }

    });
  
  /**
   * Extend the MathML object with parsing code for mover 
   */
  org.mathdox.formulaeditor.parsing.mathml.MathMLParser =
    $extend(org.mathdox.formulaeditor.parsing.mathml.MathMLParser, {
      handlemover: function(node, context) {
        var children = node.childNodes;
        var over = children.item(1);

        // U+00AF MACRON, also MathML OverBar
        if ((over.tagName == "mo") && (over.innerHTML.trim() == "¯")) { 
          var child = this.handle(children.item(0));
          return new presentation.Overline(child);
        }
        /* default: call parent */
        var parent = arguments.callee.parent;
        return parent.handlemover.call(this, node, context);
      }
    });

  /**
   * Add the parsing code for Complex1Conjugate.
   */
  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
    function(context) { return {
      expression160 : function() {
        var parent = arguments.callee.parent;
        pG.alternation(
          pG.rule("overline"), 
          parent.expression160).apply(this, arguments);
      },

      overline: pG.never
    }; 
  });

});
