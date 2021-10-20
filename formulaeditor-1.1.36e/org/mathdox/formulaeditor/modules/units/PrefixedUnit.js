$package("org.mathdox.formulaeditor.modules.units");

$identify("org/mathdox/formulaeditor/modules/units/PrefixedUnit.js");

$require("org/mathdox/formulaeditor/parsing/openmath/OpenMathParser.js");

$require("org/mathdox/formulaeditor/presentation/Row.js");

$require("org/mathdox/formulaeditor/semantics/Keyword.js");


$main(function(){
  var semantics = org.mathdox.formulaeditor.semantics;
  var pG = new org.mathdox.parsing.ParserGenerator();

  semantics.PrefixedUnit = $extend(org.mathdox.formulaeditor.semantics.Keyword, {
    prefixKeyword : null,
    unitKeyword : null,

    initialize : function( prefixKeyword, unitKeyword) {
      this.prefixKeyword = prefixKeyword;
      this.unitKeyword = unitKeyword;
    },

    getMathML : function(context) {
      return this.unitKeyword.getMathMLPrefixed(context, this.prefixKeyword);
    }, 

    getOpenMath : function(context) {
      return "<OMA><OMS cd='units_ops1' name='prefix'/>"+
        this.prefixKeyword.getOpenMath(context) + 
        this.unitKeyword.getOpenMath(context) +
        "</OMA>";
    },

    getPresentation : function(context) {
      var prefixPres = this.prefixKeyword.getPresentation(context);
      var unitPres = this.unitKeyword.getPresentation(context);
      var presentation = org.mathdox.formulaeditor.presentation;

      return new presentation.Row(prefixPres, unitPres);
    }
  });

  org.mathdox.formulaeditor.parsing.openmath.OpenMathParser =
    $extend(org.mathdox.formulaeditor.parsing.openmath.OpenMathParser, {
      handleUnits_ops1Prefix : function(node) {
        var semantics = org.mathdox.formulaeditor.semantics;
        var children = node.childNodes;
        
        var prefix = this.handle(children.item(1));
        var unit = this.handle(children.item(2));

        return new semantics.PrefixedUnit(prefix, unit);
      }
  });


});
