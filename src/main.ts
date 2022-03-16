#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import cli from './cli.js'

const argv = await yargs(hideBin(process.argv))
  .scriptName('count')
  .usage('$0 [FILE]...')
  .example('$0 foo.ts bar.ts', 'count chars in files')
  .demand(1)
  .help().argv

process.exit(
  await cli({
    filenames: argv._ as string[],
    stdout: process.stdout,
    stderr: process.stderr
  })
)
