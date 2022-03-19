import { Writable } from 'stream'
import { driveClient } from './tdrive.js'
import { sendFile } from './tsend.js'

type Opts = {
  parentId: string
  destFileName: string
  srcFileName: string
  printId: boolean
  stdout: Writable
  stderr: Writable
}

export const cli = async ({
  parentId,
  destFileName,
  srcFileName,
  printId,
  stdout,
  stderr
}: Opts): Promise<number> => {
  try {
    const id = await sendFile(
      driveClient(),
      parentId,
      destFileName,
      srcFileName
    )
    if (printId) {
      stdout.write(id)
    }
  } catch (err: any) {
    stderr.write(err.toString())
    stderr.write('\n')
    return 1
  }
  return 0
}
