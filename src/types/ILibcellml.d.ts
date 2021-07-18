// LibcellML typescript interface courtesy of Andrew Nguyen (Moop204)
interface Version {
  version(): number;
  versionString(): string;
}

interface NamedEntity extends Entity {
  name(): string;
  setName(name: string): void;
}

interface ImportedEntity {
  isImport(): boolean;
  importReference(): string;
  importSource(): ImportSource;
  setImportSource(importSource: ImportSource): void;
  setImportReference(reference: string): void;
}

interface Entity {
  id(): string;
  setId(id: string): void;
  parent(): Entity;
  setParent(parent: Entity): void;
  removeParent(): void;
  hasParent(): boolean;
  hasAncestor(entity: Entity): boolean;
}

interface Logger {
  addIssue(issue: Issue): void;
  removeAllIssues(): void;
  error(index: number): Issue;
  warning(index: number): Issue;
  hint(index: number): Issue;
  issueCount(): number;
  errorCount(): number;
  warningCount(): number;
  hintCount(): number;
}

interface ComponentEntity extends NamedEntity {
  addComponent(component: Component): boolean;
  componentCount(): number;
  containsComponentByName(name: string, searchEncapsulated: boolean): boolean;
  containsComponentByComponent(
    component: Component,
    searchEncapsulated: boolean
  ): boolean;
  componentByIndex(index: number): Component;
  componentByName(name: string, searchEncapsulated: boolean): Component;
  encapsulationId(): string;
  removeAllComponents(): void;
  removeComponentByIndex(index: number): boolean;
  removeComponentByName(name: string, searchEncapsulated: boolean): boolean;
  removeComponentByComponent(
    component: Component,
    searchEncapsulated: boolean
  ): boolean;
  replaceComponentByIndex(index: number, component: Component): boolean;
  replaceComponentByName(
    name: string,
    component: Component,
    searchEncapsulated: boolean
  ): boolean;
  replaceComponentByComponent(
    oldComponent: Component,
    newComponent: Component,
    searchEncapsulated: boolean
  ): boolean;
  setEncapsulationId(id: string): void;
  takeComponentByIndex(index: number): Component;
  takeComponentByName(name: string, searchEncapsulated: boolean): Component;
}

interface Parser extends Logger {
  parseModel(content: string): Model;
}

interface Model extends ComponentEntity {
  addUnits(units: Units): void;
  removeUnitsByIndex(index: number): boolean;
  removeUnitsByName(name: string): boolean;
  removeUnitsByUnits(units: Units): boolean;
  removeAllUnits(): void;
  hasUnitsByName(name: string): boolean;
  hasUnitsByUnits(units: Units): boolean;
  unitsByIndex(index: number): Units;
  unitsByName(name: string): Units;
  takeUnitsByIndex(index: number): Units;
  takeUnitsByName(name: string): Units;
  replaceUnitsByIndex(index: number, units: Units): boolean;
  replaceUnitsByName(name: string, units: Units): boolean;
  replaceUnitsByUnits(oldUnits: Units, newUnits: Units): boolean;
  unitsCount(): number;
  resolveImports(baseFile: string): void;
  hasUnresolvedImports(): boolean;
  clone(): Model;
}

enum Prefix {
  YOTTA,
  ZETTA,
  EXA,
  PETA,
  TERA,
  GIGA,
  MEGA,
  KILO,
  HECTO,
  DECA,
  DECI,
  CENTI,
  MILLI,
  MICRO,
  NANO,
  PICO,
  FEMTO,
  ATTO,
  ZEPTO,
  YOCTO,
}

enum StandardUnit {
  AMPERE /**< Base SI unit ampere. */,
  BECQUEREL /**< Derived SI unit becquerel. */,
  CANDELA /**< Base SI unit candela. */,
  COULOMB /**< Derived SI unit coulomb. */,
  DIMENSIONLESS /**< Convenience unit dimensionless. */,
  FARAD /**< Derived SI unit farad. */,
  GRAM /**< Convenience unit gram. */,
  GRAY /**< Derived SI unit gray. */,
  HENRY /**< Derived SI unit henry. */,
  HERTZ /**< Derived SI unit hertz. */,
  JOULE /**< Derived SI unit joule. */,
  KATAL /**< Derived SI unit katal. */,
  KELVIN /**< Base SI unit kelvin. */,
  KILOGRAM /**< Base SI unit kilogram. */,
  LITRE /**< Convenience unit litre. */,
  LUMEN /**< Derived SI unit lumen. */,
  LUX /**< Derived SI unit lux. */,
  METRE /**< Base SI unit metre. */,
  MOLE /**< Base SI unit mole. */,
  NEWTON /**< Derived SI unit newton. */,
  OHM /**< Derived SI unit ohm. */,
  PASCAL /**< Derived SI unit pascal. */,
  RADIAN /**< Derived SI unit radian. */,
  SECOND /**< Base SI unit second. */,
  SIEMENS /**< Derived SI unit siemens. */,
  SIEVERT /**< Derived SI unit sievert. */,
  STERADIAN /**< Derived SI unit steradian. */,
  TESLA /**< Derived SI unit tesla. */,
  VOLT /**< Derived SI unit volt. */,
  WATT /**< Derived SI unit watt. */,
  WEBER /**< Derived SI unit weber. */,
}

interface Units extends ImportedEntity, NamedEntity {
  isBaseUnit(): boolean;
  addUnitByReferenceStringPrefix(
    reference: string,
    prefix: string,
    exponent: number,
    multiplier: number,
    id: string
  ): void;
  addUnitByReferenceEnumPrefix(
    reference: string,
    prefix: Prefix,
    exponent: number,
    multiplier: number,
    id: string
  ): void;
  addUnitByReferenceIntPrefix(
    reference: string,
    prefix: number,
    exponent: number,
    multiplier: number,
    id: string
  ): void;
  addUnitByReferenceExponent(
    reference: string,
    exponent: number,
    id: string
  ): void;
  addUnitByReference(reference: string): void;

  addUnitByStandardUnitStringPrefix(
    standardRef: StandardUnit,
    prefix: string,
    exponent: number,
    multiplier: number,
    id: string
  ): void;
  addUnitByStandardUnitEnumPrefix(
    standardRef: StandardUnit,
    prefix: Prefix,
    exponent: number,
    multiplier: number,
    id: string
  ): void;
  addUnitByStandardUnitAndExponent(
    standardRef: StandardUnit,
    exponent: number,
    id: string
  ): void;
  addUnitByStandardUnit(standardRef: StandardUnit): void;
  unitAttributeReference(index: number): string;
  unitAttributePrefix(index: number): string;
  unitAttributeExponent(index: number): number;
  unitAttributeMultiplier(index: number): number;
  removeUnitByIndex(index: number): boolean;
  removeUnitByName(reference: string): boolean;
  removeUnitByStandardUnit(standardRef: StandardUnit): boolean;
  setSourceUnits(importSource: ImportSource, name: string): void;
  removeAllUnits(): void;
  unitCount(): number;
  clone(): Units;
  isImport(): boolean;
  importReference(): string;
  importSource(): ImportSource;
  setImportSource(importSource: ImportSource): void;
  setImportReference(reference: string): void;
}

interface ImportSource extends Entity {
  model(): Model;
  url(): string;
  hasModel(): boolean;
  setModel(model: Model): boolean;
  setUrl(url: string): void;
}

interface Validator extends Logger {
  validateModel(model: Model): void;
}

enum Cause {
  COMPONENT,
  CONNECTION,
  ENCAPSULATION,
  IMPORT,
  MATHML,
  MODEL,
  RESET,
  UNDEFINED,
  UNITS,
  VARIABLE,
  XML,
  GENERATOR,
}

enum Level {
  ERROR,
  WARNING,
  HINT,
}

enum ReferenceRule {
  UNDEFINED,
  // Specification errors.
  DATA_REPR_IDENTIFIER_UNICODE,
  DATA_REPR_IDENTIFIER_LATIN_ALPHANUM,
  DATA_REPR_IDENTIFIER_AT_LEAST_ONE_ALPHANUM,
  DATA_REPR_IDENTIFIER_BEGIN_EURO_NUM,
  DATA_REPR_IDENTIFIER_IDENTICAL,
  DATA_REPR_NNEG_INT_BASE10,
  DATA_REPR_NNEG_INT_EURO_NUM,
  MODEL_ELEMENT,
  MODEL_NAME,
  MODEL_CHILD,
  MODEL_MORE_THAN_ONE_ENCAPSULATION,
  IMPORT_HREF,
  IMPORT_CHILD,
  IMPORT_CIRCULAR,
  IMPORT_UNITS_NAME,
  IMPORT_UNITS_REF,
  IMPORT_COMPONENT_NAME,
  IMPORT_COMPONENT_REF,
  UNITS_NAME,
  UNITS_NAME_UNIQUE,
  UNITS_STANDARD,
  UNITS_CHILD,
  UNIT_UNITS_REF,
  UNIT_DIGRAPH,
  UNIT_CIRCULAR_REF,
  UNIT_OPTIONAL_ATTRIBUTE,
  UNIT_PREFIX,
  UNIT_MULTIPLIER,
  UNIT_EXPONENT,
  COMPONENT_NAME,
  COMPONENT_CHILD,
  VARIABLE_NAME,
  VARIABLE_UNITS,
  VARIABLE_INTERFACE,
  VARIABLE_INITIAL_VALUE,
  RESET_CHILD,
  RESET_ORDER,
  RESET_VARIABLE_REFERENCE,
  RESET_TEST_VARIABLE_REFERENCE,
  RESET_TEST_VALUE,
  RESET_RESET_VALUE,
  MATH_MATHML,
  MATH_CHILD,
  MATH_CI_VARIABLE_REFERENCE,
  MATH_CN_UNITS_ATTRIBUTE,
  ENCAPSULATION_COMPONENT_REF,
  COMPONENT_REF_COMPONENT_ATTRIBUTE,
  COMPONENT_REF_CHILD,
  COMPONENT_REF_ENCAPSULATION,
  CONNECTION_COMPONENT1,
  CONNECTION_COMPONENT2,
  CONNECTION_UNIQUE_TRANSITIVE,
  CONNECTION_MAP_VARIABLES,
  MAP_VARIABLES_VARIABLE1,
  MAP_VARIABLES_VARIABLE2,
  MAP_VARIABLES_UNIQUE,
  MAP_VARIABLES_IDENTICAL_UNIT_REDUCTION,
}

interface Issue {
  description(): string;
  cause(): Cause;
  setDescription(description: string): void;
  setCause(cause: Cause): void;
  level(): Level;
  setLevel(level: Level): void;
  referenceRule(): ReferenceRule;
  setReferenceRule(referenceRule: ReferenceRule): void;
  referenceHeading(): string;
  component(): Component;
  setComponent(component: Component): void;
  importSource(): ImportSource;
  setImportSource(immportSource: ImportSource): void;
  model(): Model;
  setModel(model: Model): void;
  units(): Units;
  setUnits(units: Units): void;
  variable(): Variable;
  setVariable(variable: Variable): void;
  reset(): Reset;
  setReset(reset: Reset): void;
}

interface Component extends ComponentEntity, ImportedEntity {
  // Component
  addReset(reset: Reset): void;
  addVariable(variable: Variable): void;
  appendMath(math: string): void;
  math(): string;
  reset(index: number): Reset;
  variableByIndex(index: number): Variable;
  variableByName(name: string): Variable;
  hasReset(reset: Reset): boolean;
  hasVariableByName(name: string): boolean;
  hasVariableByVariable(variable: Variable): boolean;
  removeAllResets(): void;
  removeAllVariables(): void;
  removeResetByIndex(): void;
  removeResetByReset(reset: Reset): boolean;
  removeVariableByIndex(index: number): boolean;
  removeVariableByName(name: string): boolean;
  removeVariableByVariable(variable: Variable): boolean;
  resetCount(): number;
  setMath(math: string): void;
  setSourceComponent(importSource: ImportSource, name: string): void;
  takeVariableByIndex(index: number): Variable;
  takeVariableByName(name: string): Variable;
  takeResetByIndex(index: number): Reset;
  variableCount(): number;
  clone(): Component;
}

enum InterfaceType {
  NONE,
  PRIVATE,
  PUBLIC,
  PUBLIC_AND_PRIVATE,
}

const InterfaceTypeString = {
  NONE: 'none',
  PRIVATE: 'private',
  PUBLIC: 'public',
  PUBLIC_AND_PRIVATE: 'public_and_private',
};

interface Variable extends NamedEntity {
  removeAllEquivalences(): void;
  equivalentVariable(index: number): Variable;
  equivalentVariableCount(): number;
  hasEquivalentVariable(
    equivalentVariable: Variable,
    considerIndirectEquivalences: boolean
  ): boolean;
  setUnitsByName(name: string): void;
  setUnitsByUnits(units: Units): void;
  units(): Units;
  setInitialValueByString(initialValue: string): void;
  setInitialValueByDouble(initialValue: number): void;
  initialValue(): string;
  removeInitialValue(): void;
  setInterfaceTypeByString(interfaceType: string): void;
  setInterfaceTypeByInterfaceType(interfaceType: InterfaceType): void;
  interfaceType(): string;
  removeInterfaceType(): void;
  clone(): Variable;
  equivalenceConnectionId(variable1: Variable, variable2: Variable): string;
  equivalenceMappingId(variable1: Variable, variable2: Variable): string;
  addEquivalence(variable1: Variable, variable2: Variable): boolean;
  addEquivalenceWithIds(
    variable1: Variable,
    variable2: Variable,
    mappingId: string,
    connectionId: string
  ): boolean;
  removeEquivalence(variable1: Variable, variable2: Variable): boolean;
  setEquivalenceConnectionId(
    variable1: Variable,
    variable2: Variable,
    connectionId: string
  ): void;
  setEquivalenceMappingId(
    variable1: Variable,
    variable2: Variable,
    mappingId: string
  ): void;
}

interface Reset extends Entity {
  setOrder(order: number): void;
  order(): number;
  unsetOrder(): void;
  isOrderSet(): boolean;
  setVariable(variable: Variable): void;
  variable(): Variable;
  setTestVariable(variable: Variable): void;
  testVariable(): Variable;
  appendTestValue(math: string): void;
  testValue(): string;
  setTestValue(math: string): void;
  removeTestValue(): void;
  appendResetValue(math: string): void;
  resetValue(): string;
  setResetValue(math: string): void;
  removeResetValue(): void;
  clone(): Reset;
}

interface Printer extends Logger {
  printModel(model: Model, autoIds: boolean): string;
}

export {
  Cause,
  Component,
  ComponentEntity,
  Entity,
  ImportedEntity,
  ImportSource,
  InterfaceType,
  Issue,
  Level,
  Logger,
  Model,
  NamedEntity,
  Parser,
  Prefix,
  Printer,
  ReferenceRule,
  Reset,
  StandardUnit,
  Units,
  Validator,
  Variable,
  Version,
  InterfaceTypeString,
};
