$package("org.mathdox.formulaeditor.modules.units");

$identify("org/mathdox/formulaeditor/modules/units/units.js");

$require("org/mathdox/formulaeditor/Options.js");

$require("org/mathdox/formulaeditor/modules/arithmetic/divide.js");
$require("org/mathdox/formulaeditor/modules/arithmetic/power.js");
$require("org/mathdox/formulaeditor/modules/arithmetic/unary_minus.js");
$require("org/mathdox/formulaeditor/modules/units/PrefixedUnit.js");

$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/parsing/openmath/KeywordList.js");

$require("org/mathdox/formulaeditor/presentation/Row.js"); 

$require("org/mathdox/formulaeditor/semantics/Integer.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$require("org/mathdox/parsing/ParserGenerator.js");

$main(function(){
  /**
   * Define a generic semantic unit
   */

  var semantics = org.mathdox.formulaeditor.semantics;
  var presentation = org.mathdox.formulaeditor.presentation;
  var pG = new org.mathdox.parsing.ParserGenerator();

  org.mathdox.formulaeditor.modules.units.UnitHelper = 
    $extend(Object, {
      units_metric1 : [
        /* units_metric1 */
        { cd: 'units_metric1', name: 'Coulomb', symbol: 'C' },
        { cd: 'units_metric1', name: 'Joule', symbol: 'J' },
        { cd: 'units_metric1', name: 'Newton', symbol: 'N' },
        /* Newton_per_sqr_metre */
        { cd: 'units_metric1', name: 'Pascal', symbol: 'Pa' },
        { cd: 'units_metric1', name: 'Watt', symbol: 'W' },
        { cd: 'units_metric1', name: 'amp', symbol: 'A' },
        // U+00B0 degree sign
        { cd: 'units_metric1', name: 'degree_Celsius', symbol: { enter: 'degC', onscreen: '°C', mathmlmi: '°C' }},
        { cd: 'units_metric1', name: 'degree_Kelvin', symbol: 'K' },
        { cd: 'units_metric1', name: 'gramme', symbol: 'g' },
        { cd: 'units_metric1', name: 'litre', symbol: { enter: 'L', onscreen: 'l', mathmlmi: 'l' }},
        /* litre_pre1964 */
        { cd: 'units_metric1', name: 'metre', symbol: 'm' },
        /* metre_sqrd */
        /* metres_per_second */
        /* metres_per_second_sqrd */
        { cd: 'units_metric1', name: 'second', symbol: 's' },
        { cd: 'units_metric1', name: 'volt', symbol: 'V' },
        /* use not existing metric2 for mole */
        { cd: 'units_metric2', name: 'mole', symbol: 'mol' }
      ],
      units_imperial1 : [
        /* units_imperial1 */
        { cd: 'units_imperial1', name: 'acre', symbol: 'acre' },
        { cd: 'units_imperial1', name: 'bar', symbol: 'bar' },
        { cd: 'units_imperial1', name: 'degree_Fahrenheit', symbol: { enter: 'degF', onscreen: '°F', mathmlmi: '°F' }},
        { cd: 'units_imperial1', name: 'foot', symbol: 'ft' },
        { cd: 'units_imperial1', name: 'mile', symbol: 'mile' },
        { cd: 'units_imperial1', name: 'miles_per_hr', symbol: 'mph' },
        /* units_imperial1.miles_per_hr_squared */
        { cd: 'units_imperial1', name: 'pint', symbol: 'pt' },
        /* units_imperial1.pound_force */
        { cd: 'units_imperial1', name: 'pound_mass', symbol: 'lb' },
        { cd: 'units_imperial1', name: 'yard', symbol: 'yd' }
      ],
      units_siprefix1 : [
        { cd: 'units_siprefix1', name: 'atto', symbol: 'a' },
        { cd: 'units_siprefix1', name: 'centi', symbol: 'c' },
        { cd: 'units_siprefix1', name: 'deci', symbol: 'd' },
        { cd: 'units_siprefix1', name: 'deka', symbol: 'da' },
        { cd: 'units_siprefix1', name: 'exa', symbol: 'E' },
        { cd: 'units_siprefix1', name: 'femto', symbol: 'f' },
        { cd: 'units_siprefix1', name: 'giga', symbol: 'G' },
        { cd: 'units_siprefix1', name: 'hecto', symbol: 'h' },
        { cd: 'units_siprefix1', name: 'kilo', symbol: 'k' },
        { cd: 'units_siprefix1', name: 'mega', symbol: 'M' },
        // mathml U+00B5 MICRO SIGN , screen U+03BC Greek small letter mu (so people can use the other mu)
        { cd: 'units_siprefix1', name: 'micro', symbol: { enter: 'u', onscreen :'μ', mathmlmi: 'µ'} },
        { cd: 'units_siprefix1', name: 'milli', symbol: 'm' },
        { cd: 'units_siprefix1', name: 'nano', symbol: 'n' },
        { cd: 'units_siprefix1', name: 'peta', symbol: 'P' },
        { cd: 'units_siprefix1', name: 'pico', symbol: 'p' },
        { cd: 'units_siprefix1', name: 'tera', symbol: 'T' },
        { cd: 'units_siprefix1', name: 'yocto', symbol: 'y' },
        { cd: 'units_siprefix1', name: 'yotta', symbol: 'Y' },
        { cd: 'units_siprefix1', name: 'zepto', symbol: 'z' },
        { cd: 'units_siprefix1', name: 'zetta', symbol: 'Z' }
      ],
      units_time1 : [
        { cd: 'units_time1', name: 'calendar_month', symbol: 'mos' }, 
        { cd: 'units_time1', name: 'calendar_year', symbol: 'yrs' }, 
        { cd: 'units_time1', name: 'day', symbol: 'd' },
        { cd: 'units_time1', name: 'hour', symbol: 'h' },
        { cd: 'units_time1', name: 'minute', symbol: 'min' },
        /* use units_metric1 for second */
        { cd: 'units_time1', name: 'week', symbol: 'wks' }
      ],
  
      add_keyword : function(cd, name, symbol) {
        org.mathdox.formulaeditor.parsing.openmath.KeywordList[ cd + "__" + name ] = 
          new semantics.Keyword(cd, name, symbol, "unit");
      },
  
      parsing_rule : function(cd, name, symbol) {
        if (typeof(symbol) == "string") {
          return pG.transform( 
            pG.literal(symbol.enter),
            function(result) {
              return new semantics.Keyword(cd, name, symbol, "unit");
            }
          );
        } else {
          return pG.transform( 
            pG.alternation(
              pG.literal(symbol.enter),
              pG.literal(symbol.onscreen)
            ),
            function(result) {
              return new semantics.Keyword(cd, name, symbol, "unit");
            }
          );
        }
      },
    
      add_rules : function(rulename, information_array) {
        var i;
        var symbol;
        var symbol_enter, symbol_onscreen, symbol_mathmlmi;
        var unit_parsing_rules = {};
    
        for (i=0; i<information_array.length; i++) {
      
          if (typeof(information_array[i].symbol) == "string") {
            symbol_enter = information_array[i].symbol;
            symbol_mathmlmi = symbol_enter;
            symbol_onscreen = symbol_enter;
          } else {
            symbol_enter = information_array[i].symbol.enter;
            symbol_mathmlmi = information_array[i].symbol.mathmlmi;
            symbol_onscreen = information_array[i].symbol.onscreen;
          }
    
          symbol = { 
            enter: symbol_enter,
            //mathml: "<mi mathvariant=\"normal\" class=\"MathML-Unit\">" + symbol_mathml + "</mi>",
            mathmlmi: symbol_mathmlmi,
            onscreen: symbol_onscreen
          };
    
          /* add parsing rule */
          unit_parsing_rules [ information_array[i].cd + information_array[i].name ] = 
            this.parsing_rule(information_array[i].cd, information_array[i].name, symbol);
    
          /* add keyword to list for OM parsing */
          this.add_keyword(information_array[i].cd, information_array[i].name, symbol);
        }
      
        var unit_parsing_rulenames = Object.keys(unit_parsing_rules);
        var unit_parsing_alternation_attrs = [];
        for (i=0; i<unit_parsing_rulenames.length; i++) {
          unit_parsing_alternation_attrs.push(pG.rule(unit_parsing_rulenames[i]));
        }
      
        unit_parsing_rules[rulename] = pG.alternation.apply(pG, unit_parsing_alternation_attrs);
    
        /* extend expression parser with unit rules */
        org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( function(context) {
          return unit_parsing_rules;
        });
      },

      // check for positive integer (not 0)
      checkIntPositive: function(context, expr) { 
        return (expr instanceof org.mathdox.formulaeditor.semantics.Integer) && (expr.value != 0);
      },

      checkInt: function(context, expr) { 
        // negative integers are represented using unary_minus
        var isPositiveInteger = this.checkIntPositive(context, expr);
        var isNegativeInteger = (expr instanceof org.mathdox.formulaeditor.semantics.Arith1Unary_minus) && this.checkIntPositive(context, expr.operands[0]);

        return isPositiveInteger || isNegativeInteger;
      },

      convertUnitExpression: function(context, expr) {

        if (expr instanceof semantics.PrefixedUnit || 
            expr instanceof semantics.Keyword && expr.type == "unit") {
          // already unit expression
          return expr;
        }

        var options = new org.mathdox.formulaeditor.Options();
        var presentation_context = options.getPresentationContext();

        var row = new presentation.Row(expr.getPresentation(presentation_context));
        row.flatten();

        try {
          var unit = row.getSemantics(context, null, null, "unit_expression", null).value;

          return unit;
        } catch (exception) {
          return null;
        }
      }
  });

  var UnitHelper = new org.mathdox.formulaeditor.modules.units.UnitHelper();

  UnitHelper.add_rules("units_imperial1", UnitHelper.units_imperial1);
  UnitHelper.add_rules("units_metric1", UnitHelper.units_metric1);
  UnitHelper.add_rules("units_siprefix1", UnitHelper.units_siprefix1);
  UnitHelper.add_rules("units_time1", UnitHelper.units_time1);

  // also add units_time1.second as units_metric1.second
  org.mathdox.formulaeditor.parsing.openmath.KeywordList[ "units_time1__second" ] = 
    org.mathdox.formulaeditor.parsing.openmath.KeywordList[ "units_metric1__second" ];

  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( function(context) {
    var UnitHelper = new org.mathdox.formulaeditor.modules.units.UnitHelper();

    return {
      // units_siprefixed = units_siprefix1 units_metric1
      "units_siprefixed": pG.transform(
        pG.concatenation(
          pG.rule("units_siprefix1"),
          pG.rule("units_metric1")
        ),
        function(result) {
          return new semantics.PrefixedUnit(result[0],result[1]);
        }
      ),
      // unit = units_imperial1 | units_metric1 | units_siprefix1 | units_time1 | units_siprefixed
      "unit" : pG.alternation(
        pG.rule("units_imperial1"),
        pG.rule("units_metric1"),
        pG.rule("units_time1"),
        pG.rule("units_siprefixed")
      ),
      "unit_expression" : pG.alternation(
        pG.rule("unit"),
        pG.rule("unit_divide"),
        pG.rule("unit_power"),
        pG.rule("unit_times")
      ),
      "unit_divide" : pG.transform( 
        pG.rule("divide"),
        function(result) {
          // check if result is correct, i.e. both arguments are unit_expressions
          // Note: result[0] is a semantics.Divide
          
          var enumerator = UnitHelper.convertUnitExpression(context, result[0].operands[0]);
          var denominator = UnitHelper.convertUnitExpression(context, result[0].operands[1]);

          // check if both are valid unit expressions (= not null)
          if (enumerator !== null && denominator !== null) {
            return new semantics.Divide(enumerator, denominator)
          }

          // either enumerator or denominator is not a unit expression, return failure (null)
          return null;
        }
      ),
      "unit_power" : pG.transform( 
        pG.concatenation(
          pG.rule("unit"),
          pG.rule("superscript")
        ),
        function(result) {
          // check if result is correct, i.e. superscript is pos integer, or negative integer (not 0)
          var base = UnitHelper.convertUnitExpression(context, result[0]);
          if (base === null || base === undefined) {
            return null;
          }

          if (! UnitHelper.checkInt(context, result[1]) ) {
            return null;
          }

          return new semantics.Power(base, result[1]);
        }
      ),
      "unit_times" : pG.transform(
        pG.rule("times"),
        function(result) {
          var operands = [];
          var i;
          var unit_expr;

          // convert arguments to unit expressions, if it fails return null (failure)
          for (i=0; i<result[0].operands.length; i++) {
            unit_expr = UnitHelper.convertUnitExpression(context, result[0].operands[i]);
            if (unit_expr === null) {
              return null;
            }

            operands.push(unit_expr);
          }
          // if no null arguments, create new semantic times with converted arguments
          var result = new semantics.Times()
          result.initialize.apply(result, operands);

          return result;
        }
      )
    }
  });

  /* TODO: move this to tests */
  /*
  var presentation = org.mathdox.formulaeditor.presentation;

  var test_row = new presentation.Row("s");
  console.log(test_row);
  var test_sem = test_row.getSemantics({}, null, null, "units_metric1");
  console.log(test_sem);
  var test_om = test_sem.value.getOpenMath();
  console.log(test_om);
  */

  
});
