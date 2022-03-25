import { GoogleAuth } from 'google-auth-library'
import { drive as gdrive, drive_v3 } from '@googleapis/drive'

export class GetFileIdError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, GetFileIdError.prototype)
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
 * Validate value that is used in query parameter.
 * return false if value has included "'">
 * @param s - value string.
 * @returns result of validation.
 */
export function validateQueryValue(s: string): boolean {
  if (s.indexOf("'") >= 0) {
    return false
  }
  return true
}

/**
 * Make instacen of drive that is authenticated.
 * @returns instance of drive.
 */
export function driveClient() {
  const SCOPES = ['https://www.googleapis.com/auth/drive.file']
  const auth = new GoogleAuth({
    scopes: SCOPES
  })
  return gdrive({ version: 'v3', auth })
}
