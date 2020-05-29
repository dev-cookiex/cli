import { Command } from '@cookiex/cli-types'
import chalk from 'chalk'

import utilFunc from './util'

const util: Command<false> = {
  name: 'util [command]',
  func: utilFunc,
  description: 'Utilities for project implementation',
  examples: [ {
    desc: 'Create default scripts for project',
    cmd: 'cookie util scripts'
  } ],
  customize: ( cmd, ctx ) => {
    const keys = Object.keys( ctx.extraGlobal?.fallCommandUtil || {} )
    cmd.helpInformation = () => {
      const output = [
        chalk.bold( 'cookiex util <command>' ),
        cmd._description,
        '',
        chalk.bold( 'Native utilities tools:' ),
        `  ${chalk.bold( 'script' )}: include scripts recommended by the embedded modules and cookiex`,
        '',
        ... keys.length ? [
          chalk.bold( 'Utilities included' ), ...keys
        ] : []
      ]
      const outputString = output.join( '\n' ).concat( '\n' )
      return outputString
    }
  }
}

export default util
