import * as path from 'path'
import * as fs from 'fs'
import { drive_v3 } from '@googleapis/drive'
import { validateQueryValue } from './tdrive.js'

export class GetFileIdError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, GetFileIdError.prototype)
  }
}

export class UploadFileError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, UploadFileError.prototype)
  }
}

export class UpdateFileError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, UpdateFileError.prototype)
  }
}

/**
 * Get file id in spesiced parent.
 * @param drive - drive instance.
 * @param parentId  - id of folder in Google Deive.
 * @param fileName  - file name.
 * @returns id of file or blank(when file is not found)
 */
export async function getFileId(
  drive: drive_v3.Drive,
  parentId: string,
  fileName: string
): Promise<string> {
  try {
    if (validateQueryValue(parentId) === false) {
      throw new GetFileIdError(`Invalid paretnt id : ${parentId}`)
    }
    if (validateQueryValue(fileName) === false) {
      throw new GetFileIdError(`Invalid file name : ${fileName}`)
    }
    const list = await drive.files.list({
      pageSize: 10,
      q: `'${parentId}' in parents and name = '${fileName}'`,
      fields: 'files(id, name)'
    })
    if (list.data.files && list.data.files.length > 0) {
      return list.data.files[0].id || ''
    }
    return ''
  } catch (err: any) {
    if (err.errors) {
      throw new GetFileIdError(JSON.stringify(err.errors))
    }
    throw err
  }
}

/**
 * Create file using by source file into Google Drive.
 * @param drive - drive instance.
 * @param parentId  - id of folder in Google Deive.
 * @param destFileName - file name in Google Drive.
 * @param srcFileName - file name in local filesystem.
 * @returns id of file in Google Drive
 */
export async function uploadFile(
  drive: drive_v3.Drive,
  parentId: string,
  destFileName: string,
  srcFileName: string
): Promise<string> {
  try {
    const res = await drive.files.create({
      requestBody: {
        name: path.basename(destFileName),
        parents: [parentId]
      },
      media: {
        // mimeType: 'image/jpeg',
        body: fs.createReadStream(srcFileName)
      },
      fields: 'id'
    })
    return res.data.id || ''
  } catch (err: any) {
    throw new UploadFileError(JSON.stringify(err.errors))
  }
}

/**
 * Update file using by source file into Google Drive.
 * @param drive - drive instance.
 * @param fileId  - id of file in Google Deive.
 * @param srcFileName - file name in local filesystem.
 * @returns id of file in Google Drive
 */
export async function updateFile(
  drive: drive_v3.Drive,
  fileId: string,
  srcFileName: string
): Promise<string> {
  try {
    const res = await drive.files.update({
      fileId,
      requestBody: {},
      media: {
        // mimeType: 'image/jpeg',
        body: fs.createReadStream(srcFileName)
      },
      fields: 'id'
    })
    return res.data.id || ''
  } catch (err: any) {
    throw new UpdateFileError(JSON.stringify(err.errors))
  }
}

export async function sendFile(
  drive: drive_v3.Drive,
  parentId: string,
  destFileName: string,
  srcFileName: string
): Promise<string> {
  const fileId = await getFileId(drive, parentId, destFileName)
  if (fileId === '') {
    return uploadFile(drive, parentId, destFileName, srcFileName)
  }
  return updateFile(drive, fileId, srcFileName)
}

// try {
//   const parentId = process.env['PARENT_ID'] || ''
//   const destFileName = process.env['DEST_FILE_NAME'] || ''
//   const srcFileName = process.env['SRC_FILE_NAME'] || ''
//   const drive = driveClient()
//   const id = await getFileId(drive, parentId, destFileName)
//   console.log(id)
//   console.log(await updateFile(drive, id, srcFileName))
// } catch (err) {
//   console.error('--err--')
//   console.error(err)
// }
