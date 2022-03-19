import { GoogleAuth } from 'google-auth-library'
import { drive as gdrive } from '@googleapis/drive'

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
