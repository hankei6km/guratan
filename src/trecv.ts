import * as fs from 'fs'
import { Writable, pipeline } from 'stream'
import { promisify } from 'util'
import { drive_v3 } from '@googleapis/drive'
import { getFileId, GetFileIdError } from './tdrive.js'

const promisePipeline = promisify(pipeline)

export class DownloadFileError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, DownloadFileError.prototype)
  }
}

/**
 * Options for recvFile().
 */
export type RecvFileOpts = {
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
  srcFileName: string
  /**
   @type The name(path) of the file in local filesystem
   */
  destFileName: string
  /**
   * @type Media mime-type.
   */
  destMimeType: string
  /**
   * @type The dest content from stream. It passed by pipe option.
   */
  destStream?: Writable
}

/**
 * Download the file from Google Drive to the locale file
 * @param drive - drive instance.
 * @param opts - options.
 * @returns
 */
export async function downloadFile(
  drive: drive_v3.Drive,
  opts: Pick<
    RecvFileOpts,
    'fileId' | 'destFileName' | 'destMimeType' | 'destStream'
  >
): Promise<void> {
  let ret: Promise<void> = undefined as any
  try {
    const { fileId, destFileName, destMimeType, destStream } = opts
    const dest = destStream ? destStream : fs.createWriteStream(destFileName)
    try {
      if (destMimeType) {
        const params: drive_v3.Params$Resource$Files$Export = {
          fileId,
          mimeType: destMimeType
        }
        const res = await drive.files.export(params, { responseType: 'stream' })
        //for await (const c of res.data) {
        //  dest.write(c)
        //}
        await promisePipeline(res.data, dest)
      } else {
        const params: drive_v3.Params$Resource$Files$Get = {
          fileId,
          alt: 'media'
        }
        const res = await drive.files.get(params, { responseType: 'stream' })
        // for await (const c of res.data) {
        //   dest.write(c)
        // }
        await promisePipeline(res.data, dest)
      }
    } catch (err: any) {
      if (err.errors) {
        throw new DownloadFileError(JSON.stringify(err.errors))
      }
      if (err.response?.status) {
        throw new DownloadFileError(
          `status:${err.response.status}\nstatusText:${err.response.statusText}`
        )
      }
      throw new DownloadFileError(err)
    } finally {
      // return promisify(dest.close.bind(dest))()  ここで return すると常に undfeind になる
      if ((dest as any).close) {
        ret = promisify((dest as any).close.bind(dest))()
      }
    }
  } catch (err: any) {
    throw err
  }
  return ret
}

/**
 * Receive the file from Google Drive to the locale file
 * @param drive - drive instance.
 * @param opts - options.
 * @returns id of file in Google Drive
 */
export async function recvFile(
  drive: drive_v3.Drive,
  opts: RecvFileOpts
): Promise<string> {
  const {
    fileId: inFileId,
    parentId,
    srcFileName,
    destFileName,
    destMimeType,
    destStream
  } = opts
  if (destFileName === '' && destStream === undefined) {
    throw new Error('The destination is not specified')
  }
  let fileId =
    inFileId !== '' ? inFileId : await getFileId(drive, parentId, srcFileName)
  if (fileId === '') {
    throw new GetFileIdError(
      // `The srouce file not found in paretnt id : ${srcFileName}, ${parentId}`
      `The srouce file not found`
    )
  }
  await downloadFile(drive, { fileId, destFileName, destMimeType, destStream })
  return fileId
}
