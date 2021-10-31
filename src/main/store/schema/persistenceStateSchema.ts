import { Schema } from "electron-store";

const PersistenceStateSchema: Schema<IPersistenceStateSchema> = {
  files: {
    type: "array",
    default: [],
    items: {
      type: "object",
      properties: {
        originalFilepath: {
          type: "string",
        },
        persistentFilepath: {
          type: ["string", "null"],
        },
        isNew: {
          type: "boolean",
        },
        isSaved: {
          type: "boolean",
        },
        fileType: {
          type: "string",
        },
      },
    },
  },
};

export interface IPersistentFile {
  originalFilepath?: string;
  persistentFilepath?: string;
  isNew: boolean;
  isSaved: boolean;
  fileType: string;
}

export interface IPersistenceStateSchema {
  files: IPersistentFile[];
}

export default PersistenceStateSchema;
