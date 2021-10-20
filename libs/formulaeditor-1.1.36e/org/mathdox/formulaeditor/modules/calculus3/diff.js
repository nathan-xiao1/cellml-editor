$identify("org/mathdox/formulaeditor/modules/calculus3/diff.js");

$require("org/mathdox/formulaeditor/Options.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/parsing/mathml/MathMLParser.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/presentation/Boxed.js");
$require("org/mathdox/formulaeditor/presentation/Fraction.js");
$require("org/mathdox/formulaeditor/presentation/Row.js");
$require("org/mathdox/formulaeditor/presentation/Symbol.js");
$require("org/mathdox/formulaeditor/semantics/MultaryOperation.js");

$main(function(){

  /**
   * Defines a presentation node that represents an interval.
   */
  org.mathdox.formulaeditor.presentation.Calculus3Diff =
    $extend(org.mathdox.formulaeditor.presentation.Boxed, {

      rule : "box_calculus3_diff",

      /**
       * Initialize with presentation children.
       * Should each be a row with equations
       */
      initialize: function(operand, expr) {
        var parent = arguments.callee.parent;

        var children = [];

        var presentation = org.mathdox.formulaeditor.presentation;
        var semantics = org.mathdox.formulaeditor.semantics;
        
        if (operand === null || operand === undefined) {
          return;
        }

	// enumerator
	// U+2146 differential D
	var enumerator = new presentation.Row("ⅆ");

	var denominator = new presentation.Row(new presentation.Symbol("ⅆ"), operand);
	var fraction = new presentation.Fraction(enumerator, denominator);

        children.push(operand);
        children.push(expr);

        return parent.initialize.call(this, semantics.Calculus3Diff, children, new presentation.Row(fraction, expr));
      }
  });

  /**
   * Defines a semantic tree node that represents an interval.
   */
  org.mathdox.formulaeditor.semantics.Calculus3Diff =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      getMathML: function(context) {
	// d/dx expr (with fraction and differential d)
	var result="<mrow class='calculus3diff'>";

	// fraction
	result = result + "<mfrac>";
	// U+2146 differential D
	result = result + "<mo>ⅆ</mo>";

	// denominator
	result = result + "<mrow>";
	result = result + "<mo>ⅆ</mo>";
	// variable
	result = result + this.operands[0].getMathML();
	result = result + "</mrow>";
	result = result + "</mfrac>";

	// U+2061 function application
	result = result + "<mo>⁡⁡</mo>";

	// expr
        result = result + this.operands[1].getMathML();

	result = result + "</mrow>";

	return result;
      },

      getOpenMath: function() {
	// case 1: expand  d/dx expr becomes apply(calculus1.diff(lambda(x, expr)), x)
	// todo: add style to load again

        var semantics = org.mathdox.formulaeditor.semantics;
	var operVar = this.operands[0].getOpenMath();
	var operExpr = this.operands[1].getOpenMath();

	var result;

	// not a variable, give an error
        if (!(this.operands[0] instanceof semantics.Variable)) {
          result = "<OME>";
          result = result + "<OMS cd='moreerrors' name='encodingError'/>";
          result = result + "<OMSTR>calculus diff-box: expecting variable, found: ";
	 
	  // escape for use as string in XML, quotes don't need to be escaped here
          result = result + operVar.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;');

          result = result + ".";
          result = result + "</OMSTR>";
          result = result + "</OME>";

          return result;
        }


	result = "<OMA";

        result = result + this.getOpenMathCommonAttributes();

	result = result + " style='ombind'>";
	// lambda: expression converted to lambda function
	var lambda = "<OMBIND><OMS cd='fns1' name='lambda'/><OMBVAR>";
	lambda = lambda + operVar;
	lambda = lambda +"</OMBVAR>";
	lambda = lambda + operExpr;
	lambda = lambda + "</OMBIND>";

	// diff: derivative of lambda function
	var diff = "<OMA><OMS cd='calculus1' name='diff'/>";
	diff = diff + lambda;
	diff = diff + "</OMA>";

	result = result + diff; // function
	result = result + operVar; //var
	result = result + "</OMA>";

	return result;
      },

      getPresentation: function(context) {
	// row: box(d/dx), expr
        var presentation = org.mathdox.formulaeditor.presentation;

	return new presentation.Calculus3Diff(this.operands[0].getPresentation(context),this.operands[1].getPresentation(context));
      }

    });

  /**
   * Extend the MathML object with parsing code for mfenced intervals
  */
  org.mathdox.formulaeditor.parsing.mathml.MathMLParser =
    $extend(org.mathdox.formulaeditor.parsing.mathml.MathMLParser, {
      checkCalculus3Diff: function(node, context) {
	var style = node.getAttribute("class");

	if (style != "calculus3diff") {
	  return false;
	}
	// 3 arguments: frac, function application, expression
	//
	var children = node.childNodes;
	if (children.length<3) {
	  return false;
	}

	// TODO consider adding more checks, so parsing always works

	return true;
      },
      handleCalculus3Diff: function(node, context) {
	// 3 arguments: frac, function application, expression
	var children = node.childNodes;
	var presentation = org.mathdox.formulaeditor.presentation;

	// 0: frac (d), row(d, x) , so get 2 2 for operVar
	var frac = children.item(0);
	var operVar = this.handle(frac.childNodes.item(1).childNodes.item(1), context);
	var operExpr = this.handle(children.item(2), context);

	return new presentation.Calculus3Diff(operVar, operExpr);
      },
      handlemrow: function(node, context) {
	var parent = arguments.callee.parent;
	var mrow = node;
	
	// if single argument which is an mrow, then use that (and check that)
	if (node.childNodes.length == 1 && node.childNodes.item(0).localName=='mrow') {
          mrow = node.childNodes.item(0);
	}

	if (this.checkCalculus3Diff(mrow, context)) {
	  return this.handleCalculus3Diff(mrow, context);
	}

	return parent.handlemrow.call(this, node, context);
      }
    });

  /**
   * Extend the OpenMathParser object with parsing code for arith1.unary_minus.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {
      /**
       * Check if OMA has style calculus3diff and is in correct format
       */
      checkOMACalculus3Diff : function(node) {
	var style=node.getAttribute("style");
	if (style != "ombind") {
	  return false;
	}
	var diff = node.childNodes.item(0);
	if (diff.childNodes.length < 2) {
	  return false;
	}
	var oms=diff.childNodes.item(0);
	if (oms.localName != "OMS") {
	  return false;
	}
	if (oms.getAttribute("cd")!="calculus1" || oms.getAttribute("name")!= "diff") {
	  return false;
	}
	var ombind = diff.childNodes.item(1);
	if (ombind.childNodes.length <3) {
	  return false;
	}
	var ombvar = ombind.childNodes.item(1);
	if (ombind.childNodes.length <1) {
	  return false;
	}
	var operVar = this.handle(ombvar.childNodes.item(0));
	var operExpr = this.handle(ombind.childNodes.item(2));

	return new org.mathdox.formulaeditor.semantics.Calculus3Diff(operVar, operExpr);
      },

      handleOMA : function(node) {
	var check = this.checkOMACalculus3Diff(node);

	if (check === false) {
	  var parent = arguments.callee.parent;
	  // call parent
	  return parent.handleOMA.call(this,node);
	} else {
	  // parsed in check function
	  return check;
	}
      },
      /**
       * Returns a unary object based on the OpenMath node.
       */
      handleCalculus3Diff : function(node) {
        var operVar = this.handle(node.childNodes.item(1));
        var operExpr = this.handle(node.childNodes.item(2));

        return new org.mathdox.formulaeditor.semantics.Calculus3Diff(operVar, operExpr);
      }
    });

});
