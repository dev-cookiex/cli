import { Command } from '@cookiex/cli-types'

namespace Init {
  export interface Options {
    case: 'snake' | 'original' | 'pascal' | 'hyphen' | 'camel'
    template?: string
    saveDefault?: boolean
    install?: boolean
  }
}

interface Init extends Command.Function<Init.Options> {}

export = Init
