$identify("org/mathdox/formulaeditor/presentation/RowInputSpace.js");

//$require("org/mathdox/formulaeditor/modules/arithmetic/power.js");
$require("org/mathdox/formulaeditor/presentation/Row.js");
$require("org/mathdox/formulaeditor/presentation/Symbol.js");
$require("org/mathdox/formulaeditor/semantics/Keyword.js");

$main(function() {
  /** 
   * override presentation.Row.onkeypress
   */
  org.mathdox.formulaeditor.presentation.Row = 
    $extend(org.mathdox.formulaeditor.presentation.Row, {
      /**
       * Override the onkeypress method to handle the ' ' key.
       */
      onkeypress : function(event, editor) {
        // only handle keypresses where alt and ctrl are not held
        if (!event.altKey && !event.ctrlKey) {

          // check whether the ' ' key has been pressed
          if (String.fromCharCode(event.charCode) == " ") {
            // parse to the left for variable
            // note for " and " / " or ", create custom context which preserves spaces
	    var index = editor.cursor.position.index;
            var left = this.getSemantics(editor.getExpressionParsingContext(), 0, index, "variable", true);

	    var semantics = org.mathdox.formulaeditor.semantics;
	    var presentation = org.mathdox.formulaeditor.presentation;

            // keyword and function
            if (left.value instanceof semantics.Keyword && left.value.type == "function") {
              // add brackets
              this.insert(index, new presentation.Symbol("("));

	      editor.cursor.moveRight();

	      index = editor.cursor.position.index;
              this.insert(index, new presentation.Symbol(")"));

              // update editor state
              editor.redraw();
	      editor.save();

              return false;
            }
          }
        }

        // call the overridden method
        return arguments.callee.parent.onkeypress.call(this, event, editor);
      }
    });
});
