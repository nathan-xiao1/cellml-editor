$identify("org/mathdox/formulaeditor/modules/arithmetic/unary_minus.js");

$require("org/mathdox/formulaeditor/presentation/Superscript.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/semantics/MultaryOperation.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$main(function(){

  /**
   * Defines a semantic tree node that represents a unary minus.
   */
  org.mathdox.formulaeditor.semantics.Arith1Unary_minus =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      

      symbol : {

        onscreen : ["-","",""],
        openmath : "<OMS cd='arith1' name='unary_minus'/>",
        mathml   : [ "<mo>-</mo>", "", ""]

      },

      precedence : 140,

      getPrecedence: function(context) {
	var precedence;

        if (context.optionArith1UnaryMinusBrackets === 'true') {
          precedence = 120;
        } else {
          precedence = 140;
        }

	return precedence;
      },
      getInnerPrecedence: function(context) {
	var precedence;

        if (context.optionArith1UnaryMinusBrackets === 'true') {
          precedence = 130;
        } else {
          precedence = 130;
        }

	return precedence;
      }

    });

  /**
   * Extend the OpenMathParser object with parsing code for arith1.unary_minus.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
      * Returns a unary minus object based on the OpenMath node.
      */
      handleArith1Unary_minus : function(node) {

        var operand = this.handle(node.childNodes.item(1));
	var result = new org.mathdox.formulaeditor.semantics.Arith1Unary_minus(operand);

        return result;

      }

    });

  /**
   * Add the parsing code for unary symbol.
   */
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

    // only one expression, same on screen
    org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
      function(context) { 
        var func_check = function(oper) {
          if (oper.operands.length != 1) {
            return false;
          }

          // if -(INT * I) rewrite to (-INT) * I
          if (!(oper.operands[0] instanceof semantics.Times)) {
            return false;
          }

          var oper_times = oper.operands[0];

          if (oper_times.operands.length != 2) {
            return false;
          }

          if (!(oper_times.operands[1] instanceof semantics.Keyword)) {
            return false;
          }
          if (!(oper_times.operands[1].cd == "nums1" && oper_times.operands[1].name == "i")) {
            return false;
          }
          if (oper_times.operands[0] instanceof semantics.Integer) {
            return true;
          }

          return false;
        };

        var func_update = function(oper) {
          return oper;
        }

        if (context.optionArith1UnaryMinusComplexRewrite === 'true') {
          func_update = function(oper, context) {
            // form is -(INT * I), rewrite to (-INT) * I
            if (func_check(oper)) {
              var oper_times = oper.operands[0];
              var sem_int = oper_times.operands[0].clone();
              var sem_minus_int = new semantics.Arith1Unary_minus(sem_int);
              var sem_i = org.mathdox.formulaeditor.parsing.openmath.KeywordList["nums1__i"].clone();
              var sem_times = new semantics.Times(sem_minus_int, sem_i);
  
              return sem_times;
            } else {
              return oper;
            }
          };
        }

	var precedence;

        if (context.optionArith1UnaryMinusBrackets === 'true') {
          precedence = 120;
        } else {
          precedence = 140;
        }

        var rulesEnter = [];
        var positionEnter = 0;
    
        rulesEnter.push(pG.literal("-"));
        positionEnter++;
        rulesEnter.push(pG.rule("expression140"));
        var result = { arith1unary_minus :
          pG.transform(
            pG.concatenation.apply(pG, rulesEnter),
            function(result) {
              return func_update(new semantics.Arith1Unary_minus(result[positionEnter]));
            }
          )
        };

        if (precedence == 120) {
          result.expression120 = function() {
            var parent = arguments.callee.parent;
            pG.alternation(
              pG.rule("arith1unary_minus"),
              parent.expression120).apply(this, arguments);
          };
        } else {
          result.expression140 = function() {
            var parent = arguments.callee.parent;
            pG.alternation(
              pG.rule("arith1unary_minus"),
              parent.expression140).apply(this, arguments);
          };
        }
      
      return result;
  });

});
