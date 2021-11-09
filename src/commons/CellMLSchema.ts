type CellMLElement =
  | "model"
  | "import"
  | "import units"
  | "import component"
  | "units"
  | "unit"
  | "component"
  | "variable"
  | "reset"
  | "test_value"
  | "reset_value"
  | "math"
  | "encapsulation"
  | "component_ref"
  | "connection"
  | "map_variables";

type MathMLElement =
  | "ci"
  | "cn"
  | "sep"
  | "apply"
  | "piecewise"
  | "piece"
  | "otherwise"
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "geq"
  | "leq"
  | "and"
  | "or"
  | "xor"
  | "not"
  | "plus"
  | "minus"
  | "times"
  | "divide"
  | "power"
  | "root"
  | "abs"
  | "exp"
  | "ln"
  | "log"
  | "floor"
  | "ceiling"
  | "min"
  | "max"
  | "rem"
  | "diff"
  | "bvar"
  | "logbase"
  | "degree"
  | "sin"
  | "cos"
  | "tan"
  | "sec"
  | "csc"
  | "cot"
  | "sinh"
  | "cosh"
  | "tanh"
  | "sech"
  | "csch"
  | "coth"
  | "arcsin"
  | "arccos"
  | "arctan"
  | "arcsec"
  | "arccsc"
  | "arccot"
  | "arcsinh"
  | "arccosh"
  | "arctanh"
  | "arcsech"
  | "arccsch"
  | "arccoth"
  | "pi"
  | "exponentiale"
  | "notanumber"
  | "infinity"
  | "true"
  | "false";

type UnitsElement =
  | "ampere"
  | "becquerel"
  | "candela"
  | "coulomb"
  | "dimensionless"
  | "farad"
  | "gram"
  | "gray"
  | "henry"
  | "hertz"
  | "joule"
  | "katal"
  | "kelvi"
  | "kilogram"
  | "litre"
  | "lumen"
  | "lux"
  | "metre"
  | "mole"
  | "newton"
  | "ohm"
  | "pascal"
  | "radian"
  | "second"
  | "siemens"
  | "sievert"
  | "steradian"
  | "tesla"
  | "volt"
  | "watt"
  | "weber";

type PrefixElement =
  | "yotta"
  | "zetta"
  | "exa"
  | "peta"
  | "tera"
  | "giga"
  | "mega"
  | "kilo"
  | "hecto"
  | "deca"
  | "deci"
  | "centi"
  | "milli"
  | "micro"
  | "nano"
  | "pico"
  | "femto"
  | "atto"
  | "zepto"
  | "yocto";

type Element = CellMLElement | MathMLElement | UnitsElement | PrefixElement;

export interface IElement {
  label: Element;
  insertText: string;
  insertSnippet?: string;
  attributes: IAttribute[];
  children: Element[];
  documentation?: string;
}

export interface IAttribute {
  name: string;
  required: boolean;
}

// prettier-ignore
export const mathElements: IElement[] = [
  { label: "ci", insertText: "ci", attributes: [], children: [] },
  { label: "cn", insertText: "cn", attributes: [], children: [] },
  { label: "sep", insertText: "sep", attributes: [], children: [] },
  { label: "apply", insertText: "apply", attributes: [], children: [] },
  { label: "piecewise", insertText: "piecewise", attributes: [], children: [] },
  { label: "piece", insertText: "piece", attributes: [], children: [] },
  { label: "otherwise", insertText: "otherwise", attributes: [], children: [] },
  { label: "eq", insertText: "eq", attributes: [], children: [] },
  { label: "neq", insertText: "neq", attributes: [], children: [] },
  { label: "gt", insertText: "gt", attributes: [], children: [] },
  { label: "lt", insertText: "lt", attributes: [], children: [] },
  { label: "geq", insertText: "geq", attributes: [], children: [] },
  { label: "leq", insertText: "leq", attributes: [], children: [] },
  { label: "and", insertText: "and", attributes: [], children: [] },
  { label: "or", insertText: "or", attributes: [], children: [] },
  { label: "xor", insertText: "xor", attributes: [], children: [] },
  { label: "not", insertText: "not", attributes: [], children: [] },
  { label: "plus", insertText: "plus", attributes: [], children: [] },
  { label: "minus", insertText: "minus", attributes: [], children: [] },
  { label: "times", insertText: "times", attributes: [], children: [] },
  { label: "divide", insertText: "divide", attributes: [], children: [] },
  { label: "power", insertText: "power", attributes: [], children: [] },
  { label: "root", insertText: "root", attributes: [], children: [] },
  { label: "abs", insertText: "abs", attributes: [], children: [] },
  { label: "exp", insertText: "exp", attributes: [], children: [] },
  { label: "ln", insertText: "ln", attributes: [], children: [] },
  { label: "log", insertText: "log", attributes: [], children: [] },
  { label: "floor", insertText: "floor", attributes: [], children: [] },
  { label: "ceiling", insertText: "ceiling", attributes: [], children: [] },
  { label: "min", insertText: "min", attributes: [], children: [] },
  { label: "max", insertText: "max", attributes: [], children: [] },
  { label: "rem", insertText: "rem", attributes: [], children: [] },
  { label: "diff", insertText: "diff", attributes: [], children: [] },
  { label: "bvar", insertText: "bvar", attributes: [], children: [] },
  { label: "logbase", insertText: "logbase", attributes: [], children: [] },
  { label: "degree", insertText: "degree", attributes: [], children: [] },
  { label: "sin", insertText: "sin", attributes: [], children: [] },
  { label: "cos", insertText: "cos", attributes: [], children: [] },
  { label: "tan", insertText: "tan", attributes: [], children: [] },
  { label: "sec", insertText: "sec", attributes: [], children: [] },
  { label: "csc", insertText: "csc", attributes: [], children: [] },
  { label: "cot", insertText: "cot", attributes: [], children: [] },
  { label: "sinh", insertText: "sinh", attributes: [], children: [] },
  { label: "cosh", insertText: "cosh", attributes: [], children: [] },
  { label: "tanh", insertText: "tanh", attributes: [], children: [] },
  { label: "sech", insertText: "sech", attributes: [], children: [] },
  { label: "csch", insertText: "csch", attributes: [], children: [] },
  { label: "coth", insertText: "coth", attributes: [], children: [] },
  { label: "arcsin", insertText: "arcsin", attributes: [], children: [] },
  { label: "arccos", insertText: "arccos", attributes: [], children: [] },
  { label: "arctan", insertText: "arctan", attributes: [], children: [] },
  { label: "arcsec", insertText: "arcsec", attributes: [], children: [] },
  { label: "arccsc", insertText: "arccsc", attributes: [], children: [] },
  { label: "arccot", insertText: "arccot", attributes: [], children: [] },
  { label: "arcsinh", insertText: "arcsinh", attributes: [], children: [] },
  { label: "arccosh", insertText: "arccosh", attributes: [], children: [] },
  { label: "arctanh", insertText: "arctanh", attributes: [], children: [] },
  { label: "arcsech", insertText: "arcsech", attributes: [], children: [] },
  { label: "arccsch", insertText: "arccsch", attributes: [], children: [] },
  { label: "arccoth", insertText: "arccoth", attributes: [], children: [] },
  { label: "pi", insertText: "pi", attributes: [], children: [] },
  { label: "exponentiale", insertText: "exponentiale", attributes: [], children: [] },
  { label: "notanumber",insertText: "notanumber", attributes: [], children: [] },
  { label: "infinity", insertText: "infinity", attributes: [], children: [] },
  { label: "true", insertText: "true", attributes: [], children: [] },
  { label: "false", insertText: "false", attributes: [], children: [] },
];

// prettier-ignore
export const units: IElement[] = [
  { label: "ampere", insertText: "ampere", attributes: [], children: [] },
  { label: "becquerel", insertText: "becquerel", attributes: [], children: [] },
  { label: "candela", insertText: "candela", attributes: [], children: [] },
  { label: "coulomb", insertText: "coulomb", attributes: [], children: [] },
  { label: "dimensionless", insertText: "dimensionless", attributes: [], children: [] },
  { label: "farad", insertText: "farad", attributes: [], children: [] },
  { label: "gram", insertText: "gram", attributes: [], children: [] },
  { label: "gray", insertText: "gray", attributes: [], children: [] },
  { label: "henry", insertText: "henry", attributes: [], children: [] },
  { label: "hertz", insertText: "hertz", attributes: [], children: [] },
  { label: "joule", insertText: "joule", attributes: [], children: [] },
  { label: "katal", insertText: "katal", attributes: [], children: [] },
  { label: "kelvi", insertText: "kelvi", attributes: [], children: [] },
  { label: "kilogram", insertText: "kilogram", attributes: [], children: [] },
  { label: "litre", insertText: "litre", attributes: [], children: [] },
  { label: "lumen", insertText: "lumen", attributes: [], children: [] },
  { label: "lux", insertText: "lux", attributes: [], children: [] },
  { label: "metre", insertText: "metre", attributes: [], children: [] },
  { label: "mole", insertText: "mole", attributes: [], children: [] },
  { label: "newton", insertText: "newton", attributes: [], children: [] },
  { label: "ohm", insertText: "ohm", attributes: [], children: [] },
  { label: "pascal", insertText: "pascal", attributes: [], children: [] },
  { label: "radian", insertText: "radian", attributes: [], children: [] },
  { label: "second", insertText: "second", attributes: [], children: [] },
  { label: "siemens", insertText: "siemens", attributes: [], children: [] },
  { label: "sievert", insertText: "sievert", attributes: [], children: [] },
  { label: "steradian", insertText: "steradian", attributes: [], children: [] },
  { label: "tesla", insertText: "tesla", attributes: [], children: [] },
  { label: "volt", insertText: "volt", attributes: [], children: [] },
  { label: "watt", insertText: "watt", attributes: [], children: [] },
  { label: "weber", insertText: "weber", attributes: [], children: [] },
];

// prettier-ignore
export const prefix: IElement[] = [
  { label: "yotta", insertText: "yotta", attributes: [], children: [] },
  { label: "zetta", insertText: "zetta", attributes: [], children: [] },
  { label: "exa", insertText: "exa", attributes: [], children: [] },
  { label: "peta", insertText: "peta", attributes: [], children: [] },
  { label: "tera", insertText: "tera", attributes: [], children: [] },
  { label: "giga", insertText: "giga", attributes: [], children: [] },
  { label: "mega", insertText: "mega", attributes: [], children: [] },
  { label: "kilo", insertText: "kilo", attributes: [], children: [] },
  { label: "hecto", insertText: "hecto", attributes: [], children: [] },
  { label: "deca", insertText: "deca", attributes: [], children: [] },
  { label: "deci", insertText: "deci", attributes: [], children: [] },
  { label: "centi", insertText: "centi", attributes: [], children: [] },
  { label: "milli", insertText: "milli", attributes: [], children: [] },
  { label: "micro", insertText: "micro", attributes: [], children: [] },
  { label: "nano", insertText: "nano", attributes: [], children: [] },
  { label: "pico", insertText: "pico", attributes: [], children: [] },
  { label: "femto", insertText: "femto", attributes: [], children: [] },
  { label: "atto", insertText: "atto", attributes: [], children: [] },
  { label: "zepto", insertText: "zepto", attributes: [], children: [] },
  { label: "yocto", insertText: "yocto", attributes: [], children: [] },
];

export const elements: IElement[] = [
  { label: "root", insertText: null, attributes: [], children: ["model"] },
  {
    label: "model",
    insertText: "model",
    insertSnippet:
      '<model xmlns="http://www.cellml.org/cellml/2.0#" name="$1">\n\t$0\n</model>',
    attributes: [
      { name: "name", required: true },
      { name: "xmlns", required: false },
    ],
    children: ["component", "connection", "encapsulation", "import", "units"],
    documentation:
      "The top-level element information item in a CellML infoset MUST be an element in the CellML namespace with a local name equal to model.\n" +
      "1. Every `model` element MUST contain a `name` attribute.\n" +
      "   * The value of the name attribute MUST be a CellML identifier.\n" +
      "2. A `model` element MAY contain one or more additional specific element children, each of which MUST be of one of the following types:\n" +
      "   * A `component` element;\n" +
      "   * A `connection` component;\n" +
      "   * An `encapsulation` element;\n" +
      "   * An `import` element; or\n" +
      "   * A `units` element.\n" +
      "3. A `model` element MUST NOT contain more than one `encapsulation` elements.",
  },
  {
    label: "import",
    insertText: "import",
    insertSnippet:
      '<import xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="$1>\n\t$0</import>',
    attributes: [{ name: "href", required: true }],
    children: ["import component", "import units"],
    documentation:
      "An import element information item (referred to in this specification as an import element) is an element in the CellML namespace with a local name equal to `import`, which appears as a child of a `model` element.\n" +
      "1. Every `import` element MUST contain an attribute in the namespace `http://www.w3.org/1999/xlink`, with a local name equal to `href`.\n" +
      "   * The `value` of this attribute SHALL be a valid locator href, as defined in Section 5.4 of the XLink specification.\n" +
      "   * The `href` attribute SHALL be treated according to the XLink specification, by applying the rules for simple-type elements.\n" +
      "   * When describing an `import` element or one of its children, the phrase “imported CellML infoset” SHALL refer to the CellML infoset obtained by parsing the document referenced by the `href` attribute.\n" +
      "2. Every import element MAY contain one or more specific element children, each of which MUST be of one of the following types:\n" +
      "   * An `import component` element; or\n" +
      "   * An `import units` element.\n" +
      "3. Any CellML infoset imported, directly or indirectly, by the imported CellML infoset MUST NOT be semantically equivalent to the importing CellML infoset.\n",
  },
  {
    label: "import units",
    insertText: "units",
    attributes: [
      { name: "name", required: true },
      { name: "units_ref", required: true },
    ],
    children: [],
    documentation:
      "An `import units` element information item (referred to in this specification as an import units element) is an element in the CellML namespace with a local name equal to `units`, which appears as a child of an `import` element.\n" +
      "1. Every `import units `element MUST contain a `name` attribute.\n" +
      "   * The value of the `name` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `name` attribute MUST NOT be identical to the value of the name attribute of any other `units` or `import units` element in the CellML infoset." +
      "2. Every `import units` element MUST contain a `units_ref` attribute.\n" +
      "   * The value of the `units_ref` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `units_ref` attribute MUST be identical to the value of the name attribute on a `units` or `import units` element in the imported CellML infoset.\n",
  },
  {
    label: "import component",
    insertText: "component",
    attributes: [
      { name: "name", required: true },
      { name: "component_ref", required: true },
    ],
    children: [],
    documentation:
      "An `import component` element information item (referred to in this specification as an `import component` element) is an element in the CellML namespace with a local name equal to `component`, which appears as a child of an `import` element.\n" +
      "1. Every `import component` element MUST contain a `name` attribute.\n" +
      "   * The value of the `name` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `name` attribute MUST NOT be identical to the value of the `name` attribute of any other `component` or `import component` element in the CellML infoset.\n" +
      "2. Every `import component` element MUST contain a `component_ref` attribute.\n" +
      "   * The value of the `component_ref` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `component_ref` attribute MUST be identical to the value of the `name` attribute on a `component` or `import component` element in the imported CellML infoset.\n",
  },
  {
    label: "units",
    insertText: "units",
    attributes: [{ name: "name", required: true }],
    children: ["unit"],
    documentation:
      "A `units` element information item (referred to in this specification as a `units` element) is an element in the CellML namespace with a local name equal to `units`, which appears as a child of a `model` element.\n" +
      "1. Every units element MUST contain a `name` attribute.\n" +
      "   * The value of the `name` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `name` attribute MUST NOT be identical to the value of the `name` attribute of any other `units` element or `import units` element in the CellML infoset.\n" +
      "2. The value of the `name` attribute MUST NOT be identical to the `name` of any of the units listed in Table 3.1: Built-in units (see 3.2 Units references).\n" +
      "3. A `units` element MAY contain one or more `unit` element children.\n",
  },
  {
    label: "unit",
    insertText: "unit",
    attributes: [
      { name: "units", required: true },
      { name: "prefix", required: false },
      { name: "multiplier", required: false },
      { name: "exponent", required: false },
    ],
    children: [],
    documentation:
      "A `unit` element information item (referred to in this specification as a `unit` element) is an element in the CellML namespace with a local name equal to `unit`, which appears as a child of a `units` element.\n" +
      "1. Every `unit` element MUST contain a `units` attribute.\n" +
      "   * The value of the `units` attribute MUST be a valid units reference, as defined in 3.2 Units references.\n" +
      "      * For the purpose of the constraint in the next paragraph, the `units` element inclusion digraph SHALL be defined as a conceptual digraph which SHALL contain one node for every `units` element in the CellML model.\n" +
      "      *  The `units` element inclusion digraph SHALL contain an arc from `units` element A to `units` element B if and only if `units` element A contains a `unit` element with a `units` attribute value that is identical to the `name` attribute value of `units` element B.\n" +
      "   * The element inclusion digraph MUST NOT contain any cycles.\n" +
      "2. A `unit` element MAY contain any of the following attributes:\n" +
      "   * The `prefix` attribute. If present, the value of the attribute MUST meet the constraints specified in 3.3 Interpretation of units elements.\n" +
      "   * The `multiplier` attribute. If present, the value of the attribute MUST be a real number string.\n" +
      "   * The `exponent` attribute. If present, the value of the attribute MUST be a real number string.\n",
  },
  {
    label: "component",
    insertText: "component",
    attributes: [
      { name: "name", required: true },
      { name: "component_ref", required: false },
    ],
    children: ["math", "reset", "variable"],
    documentation:
      "A `component` element information item (referred to in this specification as a `component` element) is an element in the CellML namespace with a local name equal to component, which appears as a child of a `model` element.\n" +
      "1. Every `component` element MUST contain a name attribute.\n" +
      "   * The value of the `name` attribute MUST be a CellML identifier.\n" +
      "   * The value of the `name` attribute MUST NOT be identical to the value of the name attribute on any other `component` element or `import component` element in the CellML infoset.\n" +
      "2. A `component` element MAY contain one or more specific element children, each of which MUST be of one of the following types:\n" +
      "   * A `math` element;\n" +
      "   * A `reset` element; or\n" +
      "   * A `variable` element.\n",
  },
  {
    label: "variable",
    insertText: "variable",
    attributes: [
      { name: "name", required: true },
      { name: "units", required: true },
      { name: "interface", required: false },
      { name: "initial_value", required: false },
    ],
    children: [],
    documentation:
      "A `variable` element information item (referred to in this specification as a `variable` element) is an element in the CellML namespace with a local name equal to `variable`, which appears as a child of a `component` element.\n" +
      "1. Every variable element MUST have exactly one of each of the following attributes:\n" +
      "   * The `name` attribute. The value of the `name` attribute MUST be a CellML identifier.\n" +
      "      * The value of the `name` attribute MUST NOT be identical to the value of the `name` attribute on any sibling variable element.\n" +
      "   * The `units` attribute. The value of the `units` attribute MUST be a valid units reference, as defined in 3.2 Units references.\n" +
      "2. Every `variable` element MAY contain one or more of the following attributes:\n" +
      "   * The `interface` attribute. If the attribute is present, it MUST have value of `public`, `private`, `public_and_private`, or none.\n" +
      "   * The `initial_value` attribute. If the attribute is present, it MUST meet the requirements described by 3.6 Interpretation of `initial_value` attributes.\n",
  },
  {
    label: "reset",
    insertText: "reset",
    attributes: [
      { name: "variable", required: true },
      { name: "test_variable", required: true },
      { name: "order", required: true },
    ],
    children: ["reset_value", "test_value"],
    documentation:
      "A `reset` element information item (referred to in this specification as a `reset` element) is an element in the CellML namespace with a local name equal to `reset`, which appears as a child of a `component` element.\n" +
      "1. Every `reset` element MUST have exactly one of each of the following attributes:\n" +
      "   * The `variable` attribute. The value of the `variable` attribute MUST be a valid variable reference, as defined in 3.5 Variable references.\n" +
      "   * The `test_variable` attribute. The value of the `test_variable` attribute MUST be a valid variable reference, as defined in 3.5 Variable references.\n" +
      "   * The `order` attribute. The value of the `order` attribute MUST be an integer string.\n" +
      "      * The value of the `order` attribute MUST be unique for all `reset` elements with `variable` attributes that reference variables in the same equivalent variable set (see 3.10 Interpretation of `map_variables` elements).\n" +
      "2. A `reset` element MUST contain exactly two element children, which MUST be one of each of the following types:\n" +
      "   * A `reset_value` element; and\n" +
      "   * A `test_value` element.\n",
  },
  {
    label: "test_value",
    insertText: "test_value",
    attributes: [],
    children: ["math"],
    documentation:
      "A `test_value` element information item (referred to in this specification as a `test_value` element) is an element in the CellML namespace with a local name equal to `test_value`, which appears as a child of a `reset` element.\n" +
      "1. A `test_value` element MUST contain exactly one `math` element child.\n",
  },
  {
    label: "reset_value",
    insertText: "reset_value",
    attributes: [],
    children: ["math"],
    documentation:
      "A `reset_value` element information item (referred to in this specification as a `reset_value` element) is an element in the CellML namespace with a local name equal to `reset_value`, which appears as a child of a `reset` element.\n" +
      "1. A `reset_value` element MUST contain exactly one `math` element child.\n",
  },
  {
    label: "math",
    insertText: "math",
    insertSnippet:
      '<math xmlns="http://www.w3.org/1998/Math/MathML" xmlns:cellml="http://www.cellml.org/cellml/2.0#">$0</math>',
    attributes: [{ name: "xmlns", required: true }],
    children: mathElements.map((e) => e.label),
    documentation:
      "A `math` element information item (referred to in this specification as a `math` element) is an element in the MathML namespace, which appears as a child of a `component` element, a `test_value` element, or a `reset_value` element.\n" +
      "1. A `math` element MUST be the top-level element of a Content MathML tree, as described in MathML 2.0.\n" +
      "2. Each element child of a `math` element MUST have an element-type name that is listed in Table 2.1: Supported MathML elements.\n" +
      "3. The contents of a MathML `ci` element MUST be a valid variable reference, as defined in 3.5 Variable references.\n" +
      "4. A MathML `cn` element MUST have an attribute in the CellML namespace, with a local name equal to `units`.\n" +
      "   * The value of the `units` attribute MUST be a valid units reference, as defined in 3.2 Units references.\n" +
      "5. A `cn` element MUST be base 10, and MUST be of the following types: real or e-notation.\n",
  },
  {
    label: "encapsulation",
    insertText: "encapsulation",
    attributes: [],
    children: ["component_ref"],
    documentation:
      "An `encapsulation` element information item (referred to in this specification as an `encapsulation` element) is an element in the CellML namespace with a local name equal to `encapsulation`, which appears as a child of a `model` element.\n" +
      "1. An `encapsulation` element MAY contain one or more `component_ref` element children.\n",
  },
  {
    label: "component_ref",
    insertText: "component_ref",
    attributes: [],
    children: ["component_ref"],
    documentation:
      "A `component_ref` element information item (referred to in this specification as a `component_ref` element) is an element in the CellML namespace with a local name equal to `component_ref`, which appears as a child of an `encapsulation` element.\n" +
      "1. Every `component_ref` element MUST contain a `component` attribute.\n" +
      "   * The value of the `component` attribute MUST be a valid `component` reference, as defined in 3.4 Component references.\n" +
      "   * The value of the `component` attribute MUST NOT be identical to the value of the `component` attribute on any other `component_ref` element in the CellML infoset.\n" +
      "2. Every `component_ref` element MAY in turn contain one or more `component_ref` element children.\n",
  },
  {
    label: "connection",
    insertText: "connection",
    attributes: [
      { name: "component_1", required: true },
      { name: "component_2", required: true },
    ],
    children: ["map_variables"],
    documentation:
      "A `connection` element information item (referred to in this specification as a `connection` element) is an element in the CellML namespace with a local name equal to `connection`, which appears as a child of a `model` element.\n" +
      "1. Each `connection` element MUST contain a `component_1` attribute.\n" +
      "   * The value of the `component_1` attribute MUST be a valid `component` reference, as defined in 3.4 Component references.\n" +
      "2. Each `connection` element MUST contain a `component_2` attribute.\n" +
      "   * The value of the `component_2` attribute MUST be a valid component reference, as defined in 3.4 Component references.\n" +
      "3. The value of the `component_1` attribute MUST NOT be identical to the value of the `component_2` attribute.\n" +
      "4. A CellML infoset MUST NOT contain more than one `connection` element with a given pair of components referenced by the `component_1` and `component_2` attribute values, in any order.\n" +
      "5. A `connection` element MAY contain one or more `map_variables` element children.\n",
  },
  {
    label: "map_variables",
    insertText: "map_variables",
    attributes: [
      { name: "variable_1", required: true },
      { name: "variable_2", required: true },
    ],
    children: [],
    documentation:
      "A `map_variables` element information item (referred to in this specification as a `map_variables` element) is an element in the CellML namespace with a local name equal to `map_variables`, which appears as a child of a `connection` element.\n" +
      "1. Each `map_variables` element MUST contain a `variable_1` attribute.\n" +
      "   * The value of the `variable_1` attribute MUST be a valid `variable` reference, as defined in 3.5 Variable references.\n" +
      "2. Each `map_variables` element MUST contain a `variable_2` attribute.\n" +
      "   * The value of the `variable_2` attribute MUST be a valid `variable` reference, as defined in 3.5 Variable references.\n" +
      "3. A `connection` element MUST NOT contain more than one `map_variables` element with a given `variable_1` attribute value and `variable_2` attribute value pair.\n",
  },
];

/*
  Create an element schema map
*/
const elementMap = new Map<string, IElement>();
for (const element of elements) {
  elementMap.set(element.label, element);
}

export const elementSet = new Set<string>();
[elements, mathElements, units, prefix].forEach((elements) =>
  elements.forEach((element) => elementSet.add(element.label))
);

export default elementMap;
