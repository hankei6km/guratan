import { drive_v3 } from '@googleapis/drive'
import { getFileId } from './tdrive.js'

export class CreatePermissonError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, CreatePermissonError.prototype)
  }
}

export class UpdatePermissonError extends Error {
  constructor(message: string) {
    //https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    super(message)
    Object.setPrototypeOf(this, UpdatePermissonError.prototype)
  }
}

/**
 * Options for createPermisson().
 */
export type CreatePermissonOpts = {
  /**
   * @type The ID of the file or shared drive.
   */
  fileId: string
  /**
   * @type The IDs of the parent folders which contain the file.
   */
  parentId: string
  /**
   * @type The name of the file in remote
   */
  destFileName: string
  /**
   * @type The type of the grantee.
   */
  type: string
  /**
   * The role granted by this permission
   */
  role: string
  /**
   * @type The email address of the user or group to which this permission refers.
   */
  emailAddress: string
  /**
   * @type The domain to which this permission refers.
   */
  domain: string
  /**
   * @type Whether the permission allows the file to be discovered through search.
   */
  allowFileDiscovery?: boolean
  /**
   * @type Indicates the view for this permission. Only populated for permissions that belong to a view. published is the only supported value.
   */
  view: string
  /**
   * @type This parameter will only take effect if the item is not in a shared drive and the request is attempting to transfer the ownership of the item.
   */
  moveToNewOwnersRoot?: boolean
  /**
   * @type Whether to transfer ownership to the specified user and downgrade the current owner to a writer.
   */
  transferOwnership?: boolean
  /**
   * @type Whether the permission allows the file to be discovered through search. This is only applicable for permissions of type domain or anyone.
   */
  sendNotificationEmail?: boolean
  /**
   * @type A plain text custom message to include in the notification email.
   */
  emailMessage: string
  /**
   * Supports both My Drives and shared drives
   */
  supportsAllDrives: boolean
}

/**
 * Create permission
 * @param drive - drive instance.
 * @param opts
 * @returns id of file in Google Drive
 */
export async function createPermisson(
  drive: drive_v3.Drive,
  opts: CreatePermissonOpts
): Promise<string> {
  let created = false
  try {
    const {
      fileId: inFileId,
      parentId,
      destFileName,
      type,
      role,
      emailAddress,
      domain,
      view,
      allowFileDiscovery,
      moveToNewOwnersRoot,
      transferOwnership,
      sendNotificationEmail,
      emailMessage,
      supportsAllDrives
    } = opts

    const fileId =
      inFileId ||
      (await getFileId(drive, parentId, destFileName, supportsAllDrives))
    const createParams: drive_v3.Params$Resource$Permissions$Create = {
      requestBody: {
        type,
        role
      },
      fileId,
      fields: 'id',
      supportsAllDrives
    }
    if (emailAddress) {
      createParams.requestBody!.emailAddress = emailAddress
    }
    if (domain) {
      createParams.requestBody!.domain = domain
    }
    if (view) {
      createParams.requestBody!.view = view
    }
    if (allowFileDiscovery !== undefined) {
      createParams.requestBody!.allowFileDiscovery = allowFileDiscovery
    }
    if (moveToNewOwnersRoot !== undefined) {
      createParams.moveToNewOwnersRoot = moveToNewOwnersRoot
    }
    if (transferOwnership !== undefined) {
      createParams.transferOwnership = transferOwnership
    }
    if (sendNotificationEmail !== undefined) {
      createParams.sendNotificationEmail = sendNotificationEmail
    }
    if (sendNotificationEmail && emailMessage) {
      createParams.emailMessage = emailMessage
    }
    const resCreate = await drive.permissions.create(createParams)
    created = true
    const id = resCreate.data.id || ''
    if (id === '') {
      throw new CreatePermissonError(
        'drive.permissions.create() return blank id '
      )
    }
    if (!transferOwnership) {
      const resUpdate = await drive.permissions.update({
        permissionId: id,
        requestBody: {
          role
        },
        fileId,
        fields: 'id',
        supportsAllDrives
      })
    }
    return id
  } catch (err: any) {
    if (err.errors) {
      if (!created) {
        throw new CreatePermissonError(JSON.stringify(err.errors))
      }
      throw new UpdatePermissonError(JSON.stringify(err.errors))
    }
    throw err
  }
}
