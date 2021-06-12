export default class CellMLModel {
  private _dom: null; // Placeholder for DOM representation of model
  private _file: string;

  constructor(file: string) {
    this._file = file;
  }

  get file() {
    return this._file;
  }

  get filename() {
    return this._file.split("\\").pop();
  }
}
