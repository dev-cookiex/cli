import { logger } from '@cookiex/cli-tools'
import execa from 'execa'

import { getYarnVersionIfAvailable, isProjectUsingYarn } from './yarn'

type Options = {
  preferYarn?: boolean;
  silent?: boolean;
  root: string;
};

const packageManagers = {
  yarn: {
    install: [ 'add' ],
    installDev: [ 'add', '-D' ],
    uninstall: [ 'remove' ],
    installAll: [ 'install' ],
  },
  npm: {
    install: [ 'install', '--save', '--save-exact' ],
    installDev: [ 'install', '--save-dev', '--save-exact' ],
    uninstall: [ 'uninstall', '--save' ],
    installAll: [ 'install' ],
  },
}

const configurePackageManager = (
  packageNames: Array<string>,
  action: 'install' | 'installDev' | 'installAll' | 'uninstall',
  options: Options,
) => {
  const pm = shouldUseYarn( options ) ? 'yarn' : 'npm'
  const [ executable, ...flags ] = packageManagers[pm][action]
  const args = [ executable, ...flags, ...packageNames ]
  return executeCommand( pm, args, options )
}

const executeCommand = (
  command: string,
  args: Array<string>,
  options: Options,
) => {
  const stdio = options.silent && !logger.config.isVerbose() ? 'pipe' : 'inherit'
  return execa( command, args, { stdio, cwd: options.root } )
}

const shouldUseYarn = ( options: Options ) => {
  if ( options && options.preferYarn !== undefined ) return options.preferYarn && getYarnVersionIfAvailable()

  return isProjectUsingYarn( options.root ) && getYarnVersionIfAvailable()
}

export const install = ( packageNames: Array<string>, options: Options ) =>
  configurePackageManager( packageNames, 'install', options )

export const installDev = ( packageNames: Array<string>, options: Options ) =>
  configurePackageManager( packageNames, 'installDev', options )

export const uninstall = ( packageNames: Array<string>, options: Options ) =>
  configurePackageManager( packageNames, 'uninstall', options )

export const installAll = ( options: Options ) =>
  configurePackageManager( [], 'installAll', options )

const packageManager = { install, installDev, installAll, uninstall }

export default packageManager
