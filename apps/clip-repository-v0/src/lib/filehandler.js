import fs from 'fs/promises';
import path from 'path';
import { unlink } from 'fs';
const filehandler = {};
// save as file
filehandler.saveFile = async (file) => {
  const DESTINATION_PATH = 'public/uploads';
  const DESTINATION_RELATIVE_PATH = 'uploads';
  const destinationDirPath = path.join(process.cwd(), DESTINATION_PATH);
  const fileArrayBuffer = await file.arrayBuffer();
  await fs.mkdir(destinationDirPath, { recursive: true });
  const datestamp = Date.now()
  await fs.writeFile(
    path.join(destinationDirPath, datestamp + '_' + file.name),
    Buffer.from(fileArrayBuffer),
  );
  return DESTINATION_RELATIVE_PATH + '/' + datestamp + '_' + file.name;
};

// save as data
filehandler.saveFileAsBinary = async (file) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const base64Data =  Buffer.from(fileArrayBuffer);
  const filedata = await file
  const opobj = {
    name: filedata.name,
    data: `data:${filedata.type};base64,${base64Data.toString('base64')}`,
    encoding: 'base64',
    mimetype: filedata.type,
    size: filedata.size
  }
  // console.log("binary file : ", opobj)
  return opobj
};
// Delete a file
filehandler.deleteFile = function (filename) {
  const destinationDirPath = path.join(process.cwd(), filename);
  unlink(destinationDirPath, function (err) {
    if (err) {
      return 'file not found';
    }
  });
};
export default filehandler;
