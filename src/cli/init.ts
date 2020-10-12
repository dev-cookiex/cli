import commander from 'commander'
import fs from 'fs'
import ora from 'ora'
import os from 'os'
import path from 'path'

import Template from '../models/Template'
import createName from '../tools/createName'
import exists from '../tools/exists'
import git from '../tools/git'
import isURL from '../tools/isURL'
import mappedObject from '../tools/mappedObject'
import yarn from '../tools/yarn'

const init = new commander.Command( 'init' )

init.arguments( '<name>' )

init.requiredOption( '-t, --template <template>', 'set template' )

init.option( '-o, --output <output>', 'set output directory' )

init.option( '--boilerplate', 'use boilerplate template system', false )

init.option( '--no-install', 'install packages', false )

init.option( '--version <version>', 'set version', '1.0.0' )

init.action( async ( originalName: string ) => {
  const opts = init.opts()
  const name = createName( originalName )
  const version = opts.version
  const output = path.resolve( opts.output ?? name.hyphen )

  if ( await exists( output ) )
    await fs.promises.rmdir( output, { recursive: true } )

  let directory = await fs.promises.mkdtemp( path.join( os.tmpdir(), 'cookiex-template-' ) )

  const progress = ora( 'download template' )

  if ( !commander.debug ) progress.start()

  if ( isURL( opts.template ) )
    await git.clone( opts.template, directory, {} )

  else if ( await exists( opts.template ) )
    directory = path.resolve( opts.template )

  else {
    await yarn( `add ${opts.template}`, directory )
    directory = path.join( directory, 'node_modules', opts.template )
  }

  progress.text = 'raise template'

  const template = new Template( directory )

  Object.entries( mappedObject( { name, version } ) )
    .forEach( ( [ key, value ] ) => template.replacer( key, value.toString() ) )

  await template.raise( output )

  if ( opts.install ) {
    progress.text = 'install dependencies'
    await yarn( 'install', output )
  }

  progress.succeed( 'template already to use' )
} )

export = init
