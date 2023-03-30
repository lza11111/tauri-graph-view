declare global {
  interface Window {
    showOpenFilePicker: (options: any) => Promise<FileSystemFileHandle[]>;
  }
}
export {};
