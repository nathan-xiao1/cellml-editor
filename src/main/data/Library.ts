import { IComponent, ILibrary } from "Types";
import Datastore from "nedb";

export default class Library implements ILibrary {
  private db: Datastore;

  constructor(dbFilename = ".cellmleditor/components.nedb") {
    this.db = new Datastore({
      filename: dbFilename,
      autoload: true,
    });
  }

  getComponents(): Promise<IComponent[]> {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err: Error, docs: IComponent[]) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  getComponent(componentId: string): Promise<IComponent> {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: componentId }, (err: Error, doc: IComponent) => {
        if (err) reject(err);
        resolve(doc);
      });
    });
  }

  addComponent(component: IComponent): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.insert(component, (err: Error) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  removeComponent(componentId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: componentId }, (err: Error) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  reset(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.remove({}, { multi: true }, (err: Error) => {
        if (err) reject(false);
        this.db.persistence.compactDatafile();
        resolve(true);
      });
    });
  }
}
