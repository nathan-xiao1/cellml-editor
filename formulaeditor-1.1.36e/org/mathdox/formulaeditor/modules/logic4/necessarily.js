
$identify("org/mathdox/formulaeditor/modules/logic4/necessarily.js");

$require("org/mathdox/formulaeditor/semantics/FunctionApplication.js");
$require("org/mathdox/formulaeditor/presentation/Superscript.js");
$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");
$require("org/mathdox/formulaeditor/parsing/expression/ExpressionContextParser.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$main(function(){

  var symbol =  {
    onscreen : ["◻","",""],
    openmath : "<OMS cd='logic4' name='necessarily'/>",
    mathml   : ["<mo>◻</mo>","",""]
  };
      
  var symbol_sub =  {
    onscreen : symbol.onscreen,
    openmath : "<OMS cd='logic4' name='modal_unary_operator_dual'/>",
    mathml   : symbol.mathml
  };
   
  var ubfsp = "false";
  var unary_brackets_for_same_preference;
  if (ubfsp == "false") {
    unary_brackets_for_same_preference = false
  } else {
    unary_brackets_for_same_preference = true
  }

  /**
   * Defines a semantic tree node that represents the unary symbol.
   */
  org.mathdox.formulaeditor.semantics.Logic4Necessarily =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {

      symbol : symbol,

      applicationStyle: "nobrackets",

      precedence : 140,

      unary_brackets_for_same_preference : unary_brackets_for_same_preference,

      /**
       * Initializes the operation using the specified arguments as operands.
       */
      initialize : function() {
        this.operands = arguments;
      }
    });

  /**
   * Defines a semantic tree node that represents the unary symbol with subscript.
   */
  org.mathdox.formulaeditor.semantics.Logic4Modal_unary_operator_dual =
    $extend(org.mathdox.formulaeditor.semantics.MultaryOperation, {
      
      symbol: symbol_sub,

      style : "sub", 

      applicationStyle: "nobrackets",

      precedence : 140,

      unary_brackets_for_same_preference : unary_brackets_for_same_preference,

      /**
       * Initializes the operation using the specified arguments as operands.
       */
      initialize : function() {
        this.operands = arguments;
      }
    });

  /**
   * Extend the OpenMathParser object with parsing code for the unary symbol.
   */
  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {

      /**
      * Returns a unary object based on the OpenMath node.
      */
      handleLogic4Necessarily : function(node) {

        var operand = this.handle(node.childNodes.item(1));
        return new org.mathdox.formulaeditor.semantics.Logic4Necessarily(operand);

      },

      /**
      * Returns a unary object based on the OpenMath node.
      */
      handleLogic4Modal_unary_operator_dual : function(node) {

        var operand = this.handle(node.childNodes.item(1));
        var result = new org.mathdox.formulaeditor.semantics.Logic4Modal_unary_operator_dual(operand);
              
        return result;

      }

    });

  /**
   * Add the parsing code for unary symbol.
   */
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

  //  rulesScreen.push(pG.literal("◻"));
  
  org.mathdox.formulaeditor.parsing.expression.ExpressionContextParser.addFunction( 
    function(context) { return {

      // expression140 = logic4necessarily | logic4modal_unary_operator_dual | super.expression140
      expression140 : function() {
        var parent = arguments.callee.parent;
        pG.alternation(
          pG.rule("logic4necessarily"),
          pG.rule("logic4modal_unary_operator_dual"),
          parent.expression140).apply(this, arguments);
      },

      // logic4necessarily = "◻" expression140 
      logic4necessarily :
        pG.transform(
          pG.concatenation(
            pG.literal('◻'),
            pG.rule("expression140")
          ),
          function(result) {
            return new semantics.Logic4Necessarily(result[1]);
          }
        ),

      // logic4necessarilyalt = "◻" (subscript | func_sub_indexexpr) expression140 
      logic4modal_unary_operator_dual :
        pG.transform(
          pG.concatenation(
            pG.literal('◻'),
            pG.alternation(
              pG.rule("func_sub_indexexpr"),
              pG.rule("subscript")
            ),
            pG.rule("expression140")
          ),
          function(result) {
            var oper=new semantics.Logic4Modal_unary_operator_dual(result[1]);
            return new semantics.FunctionApplication(oper, [result[2]]); 
          }
        )
       };
   });
});
