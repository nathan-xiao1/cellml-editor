import { IDOM } from "Types";
import { getNodeFromXPath, getNodeFromXPathLibXML, getXPath } from "./xpath";
import libxmljs from "libxmljs2";

describe("XPath Parsing Test: To xpath", () => {
  test("Get xpath from XML string", () => {
    let xml =
      "<model><component><math></math><math></math></component></model>";
    expect(getXPath(xml, "math")).toBe("/model/component/math[2]");

    xml =
      "<model><component><math></math><math id='math2'></math></component></model>";
    expect(getXPath(xml, "math")).toBe("//*[@id='math2']");
  });
});

describe("XPath Parsing Test: From xpath", () => {
  test("Get IDOM from xpath", () => {
    const math2: IDOM = {
      id: 2,
      name: "math",
      lineNumber: 2,
      attributes: [
        {
          key: "id",
          value: "math2",
        },
      ],
      children: [],
    };
    const math1: IDOM = {
      id: 2,
      name: "math",
      lineNumber: 2,
      attributes: [],
      children: [],
    };
    const component: IDOM = {
      id: 1,
      name: "component",
      lineNumber: 1,
      attributes: [],
      children: [math1, math2],
    };
    const model: IDOM = {
      id: 0,
      name: "model",
      lineNumber: 0,
      attributes: [],
      children: [component],
    };

    expect(getNodeFromXPath(model, "/model")).toBe(model);
    expect(getNodeFromXPath(model, "/model/component")).toBe(component);
    expect(getNodeFromXPath(model, "/model/component/math")).toBe(math1);
    expect(getNodeFromXPath(model, "/model/component/math[2]")).toBe(math2);
  });

  test("Get libxmljs.Element from xpath", () => {
    const doc = libxmljs.parseXmlString(
      "<model><component><math></math><math id='math2'></math></component></model>"
    );
    expect(getNodeFromXPathLibXML(doc, "/model").name()).toBe("model");
    expect(getNodeFromXPathLibXML(doc, "/model/component").name()).toBe(
      "component"
    );
    expect(getNodeFromXPathLibXML(doc, "/model/component/math").name()).toBe(
      "math"
    );
    expect(
      getNodeFromXPathLibXML(doc, "/model/component/math[2]").attr("id").value()
    ).toBe("math2");
  });
});
