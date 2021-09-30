export function filePathToName(filepath: string): string {
  return filepath.split("\\").pop().split("/").pop();
}
