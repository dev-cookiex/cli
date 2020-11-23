/* eslint-disable @typescript-eslint/no-unused-vars */
import cliStore from './store'
import CliTools from './tools'
namespace Cli {
  export const log = CliTools.log
  export const store = cliStore
  export import Tools = CliTools
}

export = Cli
