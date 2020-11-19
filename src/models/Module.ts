import { Command } from 'commander'

class Module {
  constructor( private config: Module.Configuration, private packageJson: any ) {}
  public get commands() {
    if ( this.config.cmd ) return [ this.config.cmd ]
    if ( this.config.command ) return [ this.config.command ]
    if ( this.config.commands ) return this.config.commands
    return []
  }
}

namespace Module {
  export interface Configuration {
    cmd?: Command
    command?: Command
    commands?: Command[]
  }
}

export = Module
