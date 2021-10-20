
$identify("org/mathdox/formulaeditor/modules/logic4/common_knowledge.js");

$require("org/mathdox/formulaeditor/semantics/MultaryOperation.js");
$require("org/mathdox/formulaeditor/presentation/Superscript.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$main(function(){

  var mathmlSymbol= [ "", "", ""];
  
  if ("⧆" !== "") {
    mathmlSymbol[0] = "<mo>⧆</mo>";
  }
  if ("" !== "") {
    mathmlSymbol[2] = "<mo></mo>";
  }

  var symbol =  {
    onscreen : ["⧆","",""],
    openmath : "<OMS cd='logic4' name='common_knowledge'/>",
    mathml   : mathmlSymbol
  };

  var ubfsp = "false";
  var unary_brackets_for_same_preference;
  if (ubfsp == "false") {
    unary_brackets_for_same_preference = false
  } else {
    unary_brackets_for_same_preference = true
  }

  /**
   * Defines a semantic tree node that represents a unary minus.
   */
  org.mathdox.formulaeditor.semantics.Logic4Common_knowledge =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      

      symbol : {
        onscreen : symbol.onscreen,
        openmath : symbol.openmath,
        mathml   : mathmlSymbol
      },

      unary_brackets_for_same_preference : unary_brackets_for_same_preference,

      precedence : 140

    });

  /**
   * Extend the OpenMathParser object with parsing code for arith1.unary_minus.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
      * Returns a unary minus object based on the OpenMath node.
      */
      handleLogic4Common_knowledge : function(node) {

        var operand = this.handle(node.childNodes.item(1));
        return new org.mathdox.formulaeditor.semantics.Logic4Common_knowledge(operand);

      }

    });

  org.mathdox.formulaeditor.parsing.openmath.KeywordList["logic4__common_knowledge"] = new org.mathdox.formulaeditor.semantics.Keyword("logic4", "common_knowledge", symbol, "unary");

  /**
   * Add the parsing code for unary symbol.
   */
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

  var rulesEnter = [];
  var positionEnter = 0;
  if ("⧆" !== "") {
    rulesEnter.push(pG.literal("⧆"));
    positionEnter++;
  }
  rulesEnter.push(pG.rule("expression140"));
  if ("" !== "") {
    rulesEnter.push(pG.literal(""));
  }

  if (( "⧆"  === "⧆"  ) &&
      ( "" === "" )) {
    // only one expression, same on screen
    org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
      function(context) { return {

        // expression140 = logic4common_knowledge | super.expression140
        expression140 : function() {
          var parent = arguments.callee.parent;
          pG.alternation(
            pG.rule("logic4common_knowledge"),
            parent.expression140).apply(this, arguments);
        },

        // logic4common_knowledge = "⧆" expression140 ""
        logic4common_knowledge :
          pG.transform(
            pG.concatenation.apply(pG, rulesEnter),
            function(result) {
              return new semantics.Logic4Common_knowledge(result[positionEnter]);
            }
          )
      };
    });
  } else { // allow alternative as displayed on the screen
    var rulesScreen = [];
    var positionScreen = 0;
    if ("⧆" !== "") {
      rulesScreen.push(pG.literal("⧆"));
      positionScreen++;
    }
    rulesScreen.push(pG.rule("expression140"));
    if ("" !== "") {
      rulesScreen.push(pG.literal(""));
    }
  
    org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
      function(context) { return {

        // expression140 = logic4common_knowledge | super.expression140
        expression140 : function() {
          var parent = arguments.callee.parent;
          pG.alternation(
            pG.rule("logic4common_knowledge"),
            pG.rule("logic4common_knowledgealt"),
            parent.expression140).apply(this, arguments);
        },

        // logic4common_knowledge = "⧆" expression140 ""
        logic4common_knowledge :
          pG.transform(
            pG.concatenation.apply(pG, rulesEnter),
            function(result) {
              return new semantics.Logic4Common_knowledge(result[positionEnter]);
            }
          ),

        // logic4common_knowledgealt = "⧆" expression140 ""
        logic4common_knowledgealt :
          pG.transform(
            pG.concatenation.apply(pG, rulesScreen),
            function(result) {
              return new semantics.Logic4Common_knowledge(result[positionScreen]);
            }
          )
       };
     });
   }

});
