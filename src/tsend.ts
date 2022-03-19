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
 * Options for sendFile().
 */
export type SendFileOpts = {
  /**
   * @param parentId  - The IDs of the parent folders which contain the file.
   */
  parentId: string
  /**
   * @param destFileName - The name of the file in remote
   */
  destFileName: string
  /**
   * @param srcFileName - The name(path) of the file in local filesystem
   */
  srcFileName: string
  /**
   * @param destMimeType - The MIME type of the file.
   */
  destMimeType: string
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
 * @param opts - options.
 * @returns Print the id of the file that is sended into remote
 */
export async function uploadFile(
  drive: drive_v3.Drive,
  opts: Pick<
    SendFileOpts,
    'parentId' | 'destFileName' | 'srcFileName' | 'destMimeType'
  >
): Promise<string> {
  try {
    const { parentId, destFileName, srcFileName, destMimeType } = opts
    const params: drive_v3.Params$Resource$Files$Create = {
      requestBody: {
        name: path.basename(destFileName),
        parents: [parentId]
      },
      media: {
        body: fs.createReadStream(srcFileName)
      },
      fields: 'id'
    }
    if (destMimeType) {
      params.requestBody!.mimeType = destMimeType
    }
    const res = await drive.files.create(params)
    return res.data.id || ''
  } catch (err: any) {
    throw new UploadFileError(JSON.stringify(err.errors))
  }
}

/**
 * Update file using by source file into Google Drive.
 * @param drive - drive instance.
 * @param opts - options.
 * @returns id of file in Google Drive
 */
export async function updateFile(
  drive: drive_v3.Drive,
  opts: { fileId: string } & Pick<SendFileOpts, 'srcFileName' | 'destMimeType'>
): Promise<string> {
  try {
    const { fileId, srcFileName, destMimeType } = opts
    const params: drive_v3.Params$Resource$Files$Update = {
      fileId,
      requestBody: {},
      media: {
        body: fs.createReadStream(srcFileName)
      },
      fields: 'id'
    }
    if (destMimeType) {
      params.requestBody!.mimeType = destMimeType
    }
    const res = await drive.files.update(params)
    return res.data.id || ''
  } catch (err: any) {
    throw new UpdateFileError(JSON.stringify(err.errors))
  }
}

/**
 * Send file using by source file into Google Drive.
 * @param drive - drive instance.
 * @param opts - options.
 * @returns id of file in Google Drive
 */
export async function sendFile(
  drive: drive_v3.Drive,
  opts: SendFileOpts
): Promise<string> {
  const { parentId, destFileName, srcFileName, destMimeType } = opts
  const fileId = await getFileId(drive, parentId, destFileName)
  if (fileId === '') {
    return uploadFile(drive, {
      parentId,
      destFileName,
      srcFileName,
      destMimeType
    })
  }
  return updateFile(drive, { fileId, srcFileName, destMimeType })
}
