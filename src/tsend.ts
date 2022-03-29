import * as path from 'path'
import * as fs from 'fs'
import { Readable } from 'stream'
import { drive_v3 } from '@googleapis/drive'
import { getFileId } from './tdrive.js'

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
   * @type The ID of the file or shared drive.
   */
  fileId: string
  /**
  /**
   * @type The IDs of the parent folders which contain the file.
   */
  parentId: string
  /**
   * @type The name of the file in remote
   */
  destFileName: string
  /**
   @type The name(path) of the file in local filesystem
   */
  srcFileName: string
  /**
   * @type The MIME type of the file.
   */
  destMimeType: string
  /**
   * @type Media mime-type.
   */
  srcMimeType: string
  /**
   * @type The srouce content from stream. It passed by pipe option.
   */
  srcStream?: Readable
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
    | 'parentId'
    | 'destFileName'
    | 'srcFileName'
    | 'destMimeType'
    | 'srcMimeType'
    | 'srcStream'
  >
): Promise<string> {
  try {
    const {
      parentId,
      destFileName,
      srcFileName,
      destMimeType,
      srcMimeType,
      srcStream
    } = opts
    const params: drive_v3.Params$Resource$Files$Create = {
      requestBody: {
        name: path.basename(destFileName),
        parents: [parentId]
      },
      media: {
        body: srcStream ? srcStream : fs.createReadStream(srcFileName)
      },
      fields: 'id'
    }
    if (destMimeType) {
      params.requestBody!.mimeType = destMimeType
    }
    if (srcMimeType) {
      params.media!.mimeType = srcMimeType
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
  opts: { fileId: string } & Pick<
    SendFileOpts,
    'srcFileName' | 'destMimeType' | 'srcMimeType' | 'srcStream'
  >
): Promise<string> {
  try {
    const { fileId, srcFileName, destMimeType, srcMimeType, srcStream } = opts
    const params: drive_v3.Params$Resource$Files$Update = {
      fileId,
      requestBody: {},
      media: {
        body: srcStream ? srcStream : fs.createReadStream(srcFileName)
      },
      fields: 'id'
    }
    if (destMimeType) {
      params.requestBody!.mimeType = destMimeType
    }
    if (srcMimeType) {
      params.media!.mimeType = srcMimeType
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
  const {
    fileId: inFileId,
    parentId,
    destFileName,
    srcFileName,
    destMimeType,
    srcMimeType,
    srcStream
  } = opts
  if (srcFileName === '' && srcStream === undefined) {
    throw new Error('The source content is not specified')
  }
  let fileId =
    inFileId !== '' ? inFileId : await getFileId(drive, parentId, destFileName)
  if (fileId === '') {
    return uploadFile(drive, {
      parentId,
      destFileName,
      srcFileName,
      destMimeType,
      srcMimeType,
      srcStream
    })
  }
  return updateFile(drive, {
    fileId,
    srcFileName,
    destMimeType,
    srcMimeType,
    srcStream
  })
}
