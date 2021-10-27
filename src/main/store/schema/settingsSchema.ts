import { Schema } from "electron-store";

const SettingsSchema: Schema<ISettingsSchema> = {
  persistentStateEnabled: {
    type: "boolean",
    default: true,
  },
};

export interface ISettingsSchema {
  persistentStateEnabled: boolean;
}

export default SettingsSchema;
