$package("org.mathdox.formulaeditor.modules.units");

$identify("org/mathdox/formulaeditor/modules/units/ExpressionWithUnit.js");

$require("org/mathdox/formulaeditor/modules/arithmetic/times.js");

$require("org/mathdox/formulaeditor/modules/units/units.js");

$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");

$require("org/mathdox/formulaeditor/presentation/Boxed.js");

$main(function() {
  org.mathdox.formulaeditor.presentation.ExpressionWithUnit = 
    $extend(org.mathdox.formulaeditor.presentation.Boxed, {
      /**
       * First is an "expression", second is a "unit" 
       */
      initialize: function (expr, unit) {
        var parent = arguments.callee.parent;

        var children = [];
        var focusChildren = [];
        var child;

        var presentation = org.mathdox.formulaeditor.presentation;
        var semantics = org.mathdox.formulaeditor.semantics;

        child = new presentation.Row(expr);
        children.push(child);
        focusChildren.push(child);

        // use three spaces as separator
        var i;
        for (i=0; i<3; i++) {
          child = new presentation.Symbol(" ");
          children.push(child);
        }

        child = new presentation.Row(unit);
        child.setDrawContext( { symbolTypeface : "normal" } );
        children.push(child);
        focusChildren.push(child);

        var prow = new presentation.PseudoRow();
        prow.initialize.apply(prow, children);

        return parent.initialize.call(this, semantics.ExpressionWithUnit, focusChildren, prow);
      },

      getSemantics : function(context) {
        var values = [];
        var unit_value;

        values.push(this.focusChildren[0].getSemantics(context).value);
        // use start rule : unit (rest set to null)
        
        unit_value = this.focusChildren[1].getSemantics(context, null, null, "unit_expression", null).value;

        if (unit_value === null) {
          var err = new Error("could not parse unit expression '"+this.focusChildren[1] + "'.");
          err.origin = "ExpressionWithUnit";
          throw(err);
        }

        values.push(unit_value);

        var value = null;
  
        if (this.semanticClass !== null) {
          value = new this.semanticClass();
          value.initialize.apply(value, values);
        }
  
        return {
          value : value,
          rule : "braces"
        }
  
      }
  });


  org.mathdox.formulaeditor.semantics.ExpressionWithUnit = 
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      /* use times symbol with style unit */
      style: "unit",

      symbol: {
        // U+2062 invisible times
        mathml: "<mo rspace='thickmathspace'>⁢⁢</mo>",
        openmath: "<OMS cd='arith1' name='times'/>"
      },

      mathml_class : "ExpressionWithUnit",
     
      initialize: function(expr, unit) {
        var operands = [];
        operands.push(expr);
        operands.push(unit);

        this.operands = operands;
      },

      getPresentation: function(context) {
        var presentation = org.mathdox.formulaeditor.presentation;

        return new presentation.ExpressionWithUnit(this.operands[0].getPresentation(context), this.operands[1].getPresentation(context));
      }
  });

  /**
   * Extend the MathML object with parsing code for mfenced intervals
  */
  org.mathdox.formulaeditor.parsing.mathml.MathMLParser =
    $extend(org.mathdox.formulaeditor.parsing.mathml.MathMLParser, {
      checkExpressionWithUnit: function(node, context) {
        var style = node.getAttribute("class");

        if (style != "ExpressionWithUnit") {
          return false;
        }
        // 3 arguments: (inferred) mrow with expression, mo:invisible times, (inferred) mrow with expression
        var children = node.childNodes;
        if (children === null || children === undefined || children.length!=3) {
          return false;
        }

        // consider adding more checks, so parsing always works

        return true;
      },
      handleExpressionWithUnit: function(node, context) {
        var children = node.childNodes;
        var presentation = org.mathdox.formulaeditor.presentation;

        var expr = this.handle(children.item(0), context);
        // TODO handle as keyword
	
	var unit = this.handle(children.item(2), context);

        return new presentation.ExpressionWithUnit(expr, unit);
      },
      handlemi: function(node, context) {
        var parent = arguments.callee.parent;
        var presentation = org.mathdox.formulaeditor.presentation;

	if (node.getAttribute("class")=="MathML-Unit") {
          var unitstr = node.innerHTML;
          var unitSymbols = [];
          var i;

          for (i=0; i<unitstr.length; i++ ) {
            var c = unitstr.substring(i,i+1)
            if ( i===0 && c === 'µ') {
              // U+00B5 micro sign -> U+03BC Greek small letter mu 
              c = 'μ';
            }
            unitSymbols.push(new presentation.Symbol(c));
          }
          unit = new presentation.Row();
          unit.initialize.apply(unit, unitSymbols);

	  return unit;
	} 
          
        return parent.handlemi.call(this, node, context);
      },
      handlemrow: function(node, context) {
        var parent = arguments.callee.parent;

        if (this.checkExpressionWithUnit(node, context)) {
          return this.handleExpressionWithUnit(node, context);
        }

        return parent.handlemrow.call(this, node, context);
      }
  });

  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {
      checkExpressionWithUnit: function(node, style) {
        var children = node.childNodes;

        if (style != "unit") {
          return false;
        }
        
        // syntax should be 0) OMS: arith1.times 1) expression 2) unit-expression
        if (children.length!=3) {
          return false;
        }
        
        // consider adding more checks
       
        return true;
      },
      handleArith1Times : function(node, style) {
        var parent = arguments.callee.parent;
        if (this.checkExpressionWithUnit(node, style)) {
          return this.handleExpressionWithUnit(node, style);
        }

        return parent.handleArith1Times.call(this, node, style);
      },
      handleExpressionWithUnit : function (node, context) {
        var children = node.childNodes;
        var expr = this.handle(children.item(1));
        var unit = this.handle(children.item(2));

        var semantics = org.mathdox.formulaeditor.semantics;

        return new semantics.ExpressionWithUnit(expr, unit);
      }
  }); 

});
