#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { cliRecv, cliSend, cliShare } from './cli.js'

const envVarsPrefix = process.env['GURATAN_ENV_VARS_PREFIX'] || 'GURATAN'
const argv = await yargs(hideBin(process.argv))
  .scriptName('guratan')
  .env(envVarsPrefix)
  .command(
    'send [OPTIONS]',
    'send file to folder in Google Drive',
    (yargs) => {
      return yargs.options({
        'file-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The ID of the file or shared drive.'
        },
        'parent-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The IDs of the parent folders which contain the file.'
        },
        'dest-file-name': {
          type: 'string',
          default: '',
          required: false,
          description: 'The name of the file in remote'
        },
        'src-file-name': {
          type: 'string',
          default: '',
          required: false,
          description: 'The name(path) of the file in local filesystem'
        },
        'dest-mime-type': {
          type: 'string',
          required: false,
          default: '',
          description: 'The MIME type of the file.'
        },
        'src-mime-type': {
          type: 'string',
          required: false,
          default: '',
          description: 'Media mime-type'
        },
        'supports-all-drives': {
          type: 'boolean',
          required: false,
          default: false,
          description:
            'Supports both My Drives and shared drives(`includeItemsFromAllDrives` is also enabled)'
        },
        pipe: {
          type: 'boolean',
          required: false,
          default: false,
          description: 'Use stdin instead of the source file'
        },
        'print-id': {
          type: 'boolean',
          required: false,
          default: false,
          description: 'Print the id of the file that is sended into remote'
        }
      })
    },
    async (argv) => {
      process.exit(
        await cliSend({
          fileId: argv['file-id'],
          parentId: argv['parent-id'] || '',
          destFileName: argv['dest-file-name'] || '',
          srcFileName: argv['src-file-name'] || '',
          destMimeType: argv['dest-mime-type'] || '',
          srcMimeType: argv['src-mime-type'] || '',
          pipe: argv['pipe'] || false,
          supportsAllDrives: argv['supports-all-drives'] || false,
          printId: argv['print-id'] || false,
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr
        })
      )
    }
  )
  .command(
    'recv [OPTIONS]',
    'receive file from Google Drive to local file',
    (yargs) => {
      return yargs.options({
        'file-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The ID of the file or shared drive.'
        },
        'parent-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The IDs of the parent folders which contain the file.'
        },
        'src-file-name': {
          type: 'string',
          required: false,
          description: 'The name of the file in remote'
        },
        'dest-file-name': {
          type: 'string',
          default: '',
          required: true,
          description: 'The name(path) of the file in local filesystem'
        },
        'dest-mime-type': {
          type: 'string',
          required: false,
          default: '',
          description: 'Media mime-type'
        },
        pipe: {
          type: 'boolean',
          required: false,
          default: false,
          description: 'Use stdout instead of the dest file'
        },
        'remove-bom': {
          type: 'boolean',
          required: false,
          default: false,
          description: 'Remove BOM chars in receiving content'
        },
        'print-id': {
          type: 'boolean',
          required: false,
          default: false,
          description: 'Print the id of the file that is received from remote'
        }
      })
    },
    async (argv) => {
      process.exit(
        await cliRecv({
          fileId: argv['file-id'],
          parentId: argv['parent-id'] || '',
          srcFileName: argv['src-file-name'] || '',
          destFileName: argv['dest-file-name'] || '',
          destMimeType: argv['dest-mime-type'] || '',
          pipe: argv['pipe'] || false,
          removeBom: argv['remove-bom'] || false,
          printId: argv['print-id'] || false,
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr
        })
      )
    }
  )
  .command(
    'share [OPTIONS]',
    'share file in Google Drive',
    (yargs) => {
      return yargs.options({
        'file-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The ID of the file or shared drive.'
        },
        'parent-id': {
          type: 'string',
          default: '',
          required: false,
          description: 'The IDs of the parent folders which contain the file.'
        },
        'dest-file-name': {
          type: 'string',
          default: '',
          required: false,
          description: 'The name of the file in remote'
        },
        type: {
          choices: ['user', 'group', 'domain', 'anyone'],
          required: false,
          default: 'user',
          description: 'The type of the grantee.'
        },
        role: {
          choices: [
            'owner',
            'organizer',
            'fileOrganizer',
            'writer',
            'commenter',
            'reader'
          ],
          required: false,
          default: 'reader',
          description: 'The role granted by this permission'
        },
        'email-address': {
          type: 'string',
          default: '',
          description:
            'The email address of the user or group to which this permission refers.'
        },
        domain: {
          type: 'string',
          default: '',
          description: 'The domain to which this permission refers.	'
        },
        'move-to-new-owners-root': {
          type: 'boolean',
          description:
            'This parameter will only take effect if the item is not in a shared drive and the request is attempting to transfer the ownership of the item.'
        },
        'allow-file-discovery': {
          type: 'boolean',
          description:
            'Whether the permission allows the file to be discovered through search.'
        },
        view: {
          type: 'string',
          default: '',
          description:
            'Whether the permission allows the file to be discovered through search. This is only applicable for permissions of type domain or anyone.'
        },
        'transfer-ownership': {
          type: 'boolean',
          description:
            'Whether to transfer ownership to the specified user and downgrade the current owner to a writer.'
        },
        'send-notification-email': {
          type: 'boolean',
          description:
            'Whether to send a notification email when sharing to users or groups.'
        },
        'email-message': {
          type: 'string',
          default: '',
          description:
            'A plain text custom message to include in the notification email.'
        },
        'print-id': {
          type: 'boolean',
          required: false,
          default: false,
          description: 'print id of file that is sended into Google Drive'
        }
      })
    },
    async (argv) => {
      process.exit(
        await cliShare({
          fileId: argv['file-id'],
          parentId: argv['parent-id'] || '',
          destFileName: argv['dest-file-name'] || '',
          type: argv['type'],
          role: argv['role'],
          emailAddress: argv['email-address'],
          domain: argv['domain'],
          view: argv['view'],
          allowFileDiscovery: argv['allow-file-discovery'],
          moveToNewOwnersRoot: argv['move-to-new-owners-root'],
          transferOwnership: argv['transfer-ownership'],
          sendNotificationEmail: argv['send-notification-email'],
          printId: argv['print-id'] || false,
          emailMessage: argv['email-message'],
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr
        })
      )
    }
  )
  .demandCommand()
  .demand(1)
  .strictOptions(true)
  .help().argv
