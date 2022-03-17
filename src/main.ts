#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { cli } from './cli.js'

const envVarsPrefix = process.env['TSEND_ENV_VARS_PREFIX'] || 'TSEND'
const argv = await yargs(hideBin(process.argv))
  .scriptName('tsend')
  .env(envVarsPrefix)
  .command(
    '$0 send [OPTIONS]',
    'send file to folder in Google Drive',
    (yargs) => {
      return yargs.options({
        'parent-id': {
          type: 'string',
          description: 'id of folder in Google Deive'
        },
        'dest-file-name': {
          type: 'string',
          description: 'file name in Google Drive'
        },
        'src-file-name': {
          type: 'string',
          description: 'file name in local filesystem'
        },
        'print-id': {
          type: 'boolean',
          required: false,
          default: false,
          description: 'print id of file that is sended into Google Drive'
        }
      })
    }
  )
  .demand(0)
  .help().argv

process.exit(
  await cli({
    parentId: argv['parent-id'] || '',
    destFileName: argv['dest-file-name'] || '',
    srcFileName: argv['src-file-name'] || '',
    printId: argv['print-id'] || false,
    stdout: process.stdout,
    stderr: process.stderr
  })
)
