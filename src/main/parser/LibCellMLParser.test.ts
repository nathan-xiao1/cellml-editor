import LibCellMLParser from "./LibCellMLParser";
import { Issue } from "Types";

const printIssues = (issues: Issue[]): void => {
  for (let i = 0; i < issues.length; i++) {
    console.log("Issue: " + issues[i].description());
  }
};

describe("CellML parser testing", () => {
  const parser = new LibCellMLParser();

  test("parsing valid CellML 2.0", async () => {
    const valid = `<?xml version="1.0" encoding="UTF-8"?>
            <model xmlns="http://www.cellml.org/cellml/2.0#" 
              xmlns:cellml="http://www.cellml.org/cellml/2.0#" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              name="complex_encapsulation_example" 
              id="complex_encpsulation_example_id">
              <component name="root"/>
              <component name="L1_c1"/>
              <component name="L1_c2"/>
              <component name="L1_c3"/>
              <component name="L1_L2_c1"/>
              <encapsulation>
                <component_ref component="root">
                  <component_ref component="L1_c1">
                    <component_ref component="L1_L2_c1"/>
                  </component_ref>
                  <component_ref component="L1_c2"/>
                  <component_ref component="L1_c3"/>
                </component_ref>
              </encapsulation>
            </model>`;
    await parser.init();
    expect(parser.print() === "");
    const res = parser.parse(valid);
    expect(res.model).toBeTruthy();
    expect(res.errors.length === 0).toEqual(true);
    expect(res.warnings.length === 0).toEqual(true);
    expect(res.hints.length == 0).toEqual(true);
    // console.log(res);
    // const output = parser.print();
    // console.log(output);
  });

  test("parsing invalid CellML", async () => {
    const invalid = `<?xml version="1.0" encoding="UTF-8"?>
            <model xmlns="http://www.cellml.org/cellml/2.0#" 
              xmlns:cellml="http://www.cellml.org/cellml/2.0#" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              name="complex_encapsulation_example" 
              id="complex_encpsulation_example_id">
              <component name="root"/>
              <component name="L1_c1"/>
              <component name="L1_c2"/>
              <component name="L1_c3"/>
              <component name="L1_L2_c1"/>
              <encapsulation>
                <component_ref component="root">
                  <component_ref component="L1_c1">
                    <component_ref component="L1_L2_c1"/>
                  </component_ref>
                  <component_ref component="L1_c2"/>
                  <component_ref component="L1_c3"/>
                </component_ref>
              
            </model>`;
    // await parser.init();
    // expect(parser.print() === "");
    const res = parser.parse(invalid);
    expect(res.model).toBeTruthy();
    // printIssues(res.errors);
    // printIssues(res.warnings);
    // printIssues(res.hints);
    expect(res.errors.length !== 0).toEqual(true);
    // expect(res.warnings.length !== 0).toEqual(true);
    // expect(res.hints.length == 0);
    // console.log(res);
    // const output = parser.print();
    // console.log(output);
  });
});
