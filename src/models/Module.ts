import { Command } from 'commander'

class Module {
  constructor( private config: Module.Configuration, private packageJson: any ) {}
  public get version(): string { return this.packageJson.version }
  public get name(): string { return this.packageJson.name }
  public get commands() {
    if ( this.config.cmd ) return [ this.config.cmd ]
    if ( this.config.command ) return [ this.config.command ]
    if ( this.config.commands ) return this.config.commands
    return []
  }
  public getConfig = () => this.config
  public getPackageJson = () => this.packageJson
}

namespace Module {
  export interface Configuration {
    cmd?: Command
    command?: Command
    commands?: Command[]
  }
}

export = Module
