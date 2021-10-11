import CellMLParser from "../parser/Parser";

describe("CellML Parser Test", () => {
  const cellmlParser = new CellMLParser();

  beforeAll(async () => {
    await cellmlParser.init();
  });

  test("Parsing to ParsedDOM", async () => {
    const xml =
      "<model><component><math></math><math id='math2'></math></component></model>";

    const parsedDOM = cellmlParser.parse(xml);

    const model = parsedDOM.IDOM;
    expect(model).toBeDefined();
    expect(model.children.length).toBe(1);

    const component = model.children[0];
    expect(component.name).toEqual("component");
    expect(component.children.length).toEqual(2);

    const math1 = component.children[0];
    expect(math1.name).toEqual("math");
    expect(math1.children.length).toBe(0);

    const math2 = component.children[1];
    expect(math2.name).toEqual("math");
    expect(math2.children.length).toBe(0);
    expect(math2.attributes.length).toBe(1);
    expect(math2.attributes[0].key).toBe("id");
    expect(math2.attributes[0].value).toBe("math2");
  });
});
