import { IComponent, ILibrary } from "Types";
import Library from "./Library";
import fs from "fs";

describe("Library Test", () => {
  let library: ILibrary;

  const model1: IComponent = {
    name: "my_model1",
    rootTag: "model",
    content: "hello",
  };

  const model2: IComponent = {
    name: "my_model2",
    rootTag: "model",
    content: "world",
  };

  beforeEach(() => {
    library = new Library(null);
  });

  afterEach(() => {
    library.reset();
  });

  test("Add component", () => {
    expect(library.addComponent(model1)).resolves.toBe(true);
    expect(library.addComponent(model2)).resolves.toBe(true);
  });

  test("Remove component", () => {
    expect(library.removeComponent("my_model2")).resolves.toBe(true);
  });

  test("Get all components", async () => {
    await library.addComponent(model1);
    await library.addComponent(model2);

    const components = await library.getComponents();
    components.sort((a, b) => (a.name > b.name ? 1 : -1));

    expect(components.length).toBe(2);

    expect(components[0].name).toBe("my_model1");
    expect(components[0].rootTag).toBe("model");
    expect(components[0].content).toBe("hello");

    expect(components[1].name).toBe("my_model2");
    expect(components[1].rootTag).toBe("model");
    expect(components[1].content).toBe("world");
  });

  test("Get a component", async () => {
    await library.addComponent(model1);
    await library.addComponent(model2);

    const components = await library.getComponents();
    components.sort((a, b) => (a.name > b.name ? 1 : -1));

    const component = await library.getComponent(components[1]._id);

    expect(component).toBeTruthy();
    expect(component.name).toBe("my_model2");
    expect(component.rootTag).toBe("model");
    expect(component.content).toBe("world");
  });
});
