import { Writable } from 'stream'
import { driveClient } from './tdrive.js'
import { sendFile } from './tsend.js'
import { recvFile } from './trecv.js'
import { createPermisson } from './tshare.js'

type Opts = {
  stdout: Writable
  stderr: Writable
}
type OptsSend = Opts & {
  fileId: string
  parentId: string
  destFileName: string
  srcFileName: string
  destMimeType: string
  srcMimeType: string
  printId: boolean
}
type OptsRecv = Opts & {
  fileId: string
  parentId: string
  srcFileName: string
  destFileName: string
  destMimeType: string
  printId: boolean
}
type OptsShare = Opts & {
  fileId: string
  parentId: string
  destFileName: string
  type: string
  role: string
  emailAddress: string
  domain: string
  allowFileDiscovery?: boolean
  view: string
  moveToNewOwnersRoot?: boolean
  transferOwnership?: boolean
  sendNotificationEmail?: boolean
  emailMessage: string
  printId: boolean
}

export const cliSend = async ({
  fileId,
  parentId,
  destFileName,
  srcFileName,
  destMimeType,
  srcMimeType,
  printId,
  stdout,
  stderr
}: OptsSend): Promise<number> => {
  try {
    const id = await sendFile(driveClient(), {
      fileId,
      parentId,
      destFileName,
      srcFileName,
      destMimeType,
      srcMimeType
    })
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

export const cliRecv = async ({
  fileId,
  parentId,
  srcFileName,
  destFileName,
  destMimeType,
  printId,
  stdout,
  stderr
}: OptsRecv): Promise<number> => {
  try {
    const id = await recvFile(driveClient(), {
      fileId,
      parentId,
      srcFileName,
      destFileName,
      destMimeType
    })
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

export const cliShare = async ({
  fileId,
  parentId,
  destFileName,
  type,
  role,
  emailAddress,
  domain,
  allowFileDiscovery,
  view,
  moveToNewOwnersRoot,
  transferOwnership,
  sendNotificationEmail,
  emailMessage,
  printId,
  stdout,
  stderr
}: OptsShare): Promise<number> => {
  try {
    const id = await createPermisson(driveClient(), {
      fileId,
      parentId,
      destFileName,
      type,
      role,
      emailAddress,
      domain,
      allowFileDiscovery,
      view,
      moveToNewOwnersRoot,
      transferOwnership,
      sendNotificationEmail,
      emailMessage
    })
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
