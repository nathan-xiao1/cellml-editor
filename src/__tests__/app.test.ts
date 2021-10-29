import { Application } from "spectron";
import path from "path";

let app: Application;

jest.setTimeout(15000)

beforeAll(() => {
  app = new Application({
    path: path.join("out/CellML Editor-win32-x64/CellML Editor.exe"),
    requireName: "nodeRequire",
  });

  return app.start();
}, 15000);

afterAll(function () {
  if (app && app.isRunning()) {
    return app.stop();
  }
});

test("Displays App window", async function () {
  const isVisible = await app.browserWindow.isVisible();
  expect(isVisible).toBe(true);
});

// test("New File", async function () {
//   const fileMenuBtn = await app.client.$("div*=File");
//   await fileMenuBtn.click();

// //   const newFileBtn = (
// //     await app.client.$("div*=New File")
// //   ) //.parentElement();
// //  //.parentElement();
// //   await newFileBtn.click()

// //   app.client.saveScreenshot("./screen.png");
// //   // expect(isVisible).toBe(true);
// });
