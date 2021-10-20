$identify("org/mathdox/formulaeditor/modules/relation1/IntervalNotation.js");

$require("org/mathdox/formulaeditor/modules/logic1/and.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/parsing/mathml/MathMLParser.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/parsing/ParserGenerator.js");

/* TODO:
 * 1) export openmath style (done)
 * 2) import openmath with style (done)
 * 3) create a seperate semantics object with new getMathML to generate mathml for 1<x<2 (TODO)
 * 4) import mathml (done;no change needed)
 */

$main(function(){
  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
    function(context) { 
      return {
	infix_Update: function(expr) {
	  var parent = arguments.callee.parent;
          var semantics = org.mathdox.formulaeditor.semantics;
          var result;
          var arg1, arg2;

          if ((expr instanceof semantics.Relation1Lt || expr instanceof semantics.Relation1Leq) &&
              (expr.operands[0] instanceof semantics.Relation1Lt || expr.operands[0] instanceof semantics.Relation1Leq)) {
            arg1 = expr.operands[0];

            if (expr instanceof semantics.Relation1Lt) {
              arg2 = new semantics.Relation1Lt(arg1.operands[1], expr.operands[1]);
            } else { //Leq
              arg2 = new semantics.Relation1Leq(arg1.operands[1], expr.operands[1]);
            }

            result = new semantics.Logic1And(arg1, arg2);
            result.style = "interval";
          } else if ((expr instanceof semantics.Relation1Gt || expr instanceof semantics.Relation1Geq) &&
              (expr.operands[0] instanceof semantics.Relation1Gt || expr.operands[0] instanceof semantics.Relation1Geq)) {
            arg1 = expr.operands[0];

            if (expr instanceof semantics.Relation1Gt) {
              arg2 = new semantics.Relation1Gt(arg1.operands[1], expr.operands[1]);
            } else { //Geq
              arg2 = new semantics.Relation1Geq(arg1.operands[1], expr.operands[1]);
            }

            result = new semantics.Logic1And(arg1, arg2);
            result.style = "interval";
          } else { // change nothing
            result = expr;
          }

          return parent.infix_Update(result);
	}
      };
    }
  );

  /**
   * Extend the OpenMathParser object with parsing code for logic1.and with style system
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
       * Returns a Logic1And object based on the style 
       */
      handleLogic1And : function(node, style) {
        // construct an And object
	if (style == "interval") {
	  // parse the children of the OMA
          // leave first child as is and assume first argument of all other childs is a repetition
          // 1<x /\ x<2 becomes (1<x)<2 semantically (which becomes rewritten). 
          // This means every child gets rewritten to have the current expression as it's first child instead of the duplicate
          // The expressions will be displayed without brackets because they are left-associative
           
          var children = node.childNodes;

          var result = this.handle(children.item(1));
       
          for (var i=2; i<children.length; i++) {
            child = this.handle(children.item(i));
           
            // if result and child have the same operator, then add the second operand of child to the list of operands of result.
            // if result and child have a different operator, then change result into the first operator child and use that as the new result.
            
            var operands;

            if (result.getSymbolOpenMath() == child.getSymbolOpenMath()) {
              operands = result.operands.slice(0);
              operands.push(child.operands[1]);  // add new operand to local copy

              result.initialize.apply(result, operands); // set operands to current expression
            } else {
              operands = [];
              operands.push(result);
              operands.push(child.operands[1]);

              child.initialize.apply(child, operands) ;

              result = child;
            }
          }

          return result;
        } else {
	  /* use parent method */
	  return arguments.callee.parent.handleLogic1And.call(this, node, style);
	}
      }
    });

});
