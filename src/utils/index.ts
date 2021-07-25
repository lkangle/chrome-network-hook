export function openFileChoose() {
  // @ts-ignore
  window
    .showOpenFilePicker()
    .then(fileHandle => {
      console.log('---', fileHandle);
      return fileHandle.getFile();
    })
    .then(file => {
      console.log('file:', file);
    });
}
