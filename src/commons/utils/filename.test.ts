import { filePathToName } from "./filename";

describe("Filepath Parsing Test", () => {
  test("Windows filepath", () => {
    let filepath = "C:\\Documents\\MyProgram\\myFile.exe";
    expect(filePathToName(filepath)).toBe("myFile.exe");

    filepath = "E:\\ass1.pdf";
    expect(filePathToName(filepath)).toBe("ass1.pdf");

    filepath = "thesis.docx";
    expect(filePathToName(filepath)).toBe("thesis.docx");
  });

  test("Linux filepath", () => {
    let filepath = "/home/user1/file.txt";
    expect(filePathToName(filepath)).toBe("file.txt");

    filepath = "/model.cellml";
    expect(filePathToName(filepath)).toBe("model.cellml");


    filepath = "~/model.cellml";
    expect(filePathToName(filepath)).toBe("model.cellml");
  });

  test("MacOS filepath", () => {
    const filepath = "/Users/user1/Desktop/pic.png";
    expect(filePathToName(filepath)).toBe("pic.png");
  });
});
