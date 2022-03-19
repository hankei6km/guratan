#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { cliSend, cliShare } from './cli.js'

const envVarsPrefix = process.env['GURATAN_ENV_VARS_PREFIX'] || 'GURATAN'
const argv = await yargs(hideBin(process.argv))
  .scriptName('guratan')
  .env(envVarsPrefix)
  .command('send [OPTIONS]', 'send file to folder in Google Drive', (yargs) => {
    return yargs.options({
      'parent-id': {
        type: 'string',
        required: true,
        description: 'id of folder in Google Deive'
      },
      'dest-file-name': {
        type: 'string',
        required: true,
        description: 'file name in Google Drive'
      },
      'src-file-name': {
        type: 'string',
        required: true,
        description: 'file name in local filesystem'
      },
      'print-id': {
        type: 'boolean',
        required: false,
        default: false,
        description: 'print id of file that is sended into Google Drive'
      }
    })
  })
  .command('share [OPTIONS]', 'share file in Google Drive', (yargs) => {
    return yargs.options({
      'file-id': {
        type: 'string',
        default: 'reader',
        required: false,
        description: 'The ID of the file or shared drive.'
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
      'allow-file-discovery': {
        type: 'boolean',
        default: false,
        description:
          'Whether the permission allows the file to be discovered through search.'
      },
      view: {
        type: 'string',
        default: '',
        description:
          'Whether the permission allows the file to be discovered through search. This is only applicable for permissions of type domain or anyone.'
      },
      'send-notification-email': {
        type: 'boolean',
        default: true,
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
  })
  .demandCommand()
  .demand(0)
  .help().argv

switch (`${argv._[0]}`) {
  case 'send':
    process.exit(
      await cliSend({
        parentId: argv['parent-id'] || '',
        destFileName: argv['dest-file-name'] || '',
        srcFileName: argv['src-file-name'] || '',
        printId: argv['print-id'] || false,
        stdout: process.stdout,
        stderr: process.stderr
      })
    )
    break
  case 'share':
    process.exit(
      await cliShare({
        fileId: argv['file-id'],
        type: argv['type'],
        role: argv['role'],
        emailAddress: argv['email-address'],
        domain: argv['domain'],
        view: argv['view'],
        allowFileDiscovery: argv['allow-file-discovery'],
        sendNotificationEmail: argv['send-notification-email'],
        printId: argv['print-id'] || false,
        emailMessage: argv['email-message'],
        stdout: process.stdout,
        stderr: process.stderr
      })
    )
    break
  default:
    console.log(argv)
    process.stderr.write(`unknown command: ${argv._[0]}\n`)
    process.exit(1)
}
