import commander from 'commander'
import fs from 'fs'
import ora from 'ora'
import os from 'os'
import path from 'path'
import simpleGit from 'simple-git/promise'

import hasGitFlow from '../helpers/hasGitGlow'
import Template from '../models/Template'
import command from '../tools/command'
import commandExists from '../tools/commandExists'
import createName from '../tools/createName'
import exists from '../tools/exists'
import git from '../tools/git'
import isURL from '../tools/isURL'
import log from '../tools/log'
import mappedObject from '../tools/mappedObject'

const init = new commander.Command( 'init' )

init.arguments( '<name>' )

init.requiredOption( '-t, --template <template>', 'set template' )

init.option( '-o, --output <output>', 'set output directory' )

init.option( '--boilerplate', 'use boilerplate template system', false )

init.option( '--no-update', 'dont update packages template', false )

init.option( '--no-install', 'dont install packages', false )
init.option( '--no-git', 'dont start git', false )
init.option( '--no-commit', 'dont commit message on template done', false )
init.option( '--no-push', 'on template done send push to repository', false )

init.option( '--init-commit <message>', 'initial commit message' )

init.option( '--flow', 'start git flow', false )

init.option( '--flow-release <branch>', 'release branches prefix', 'release/' )
init.option( '--flow-bugfix <branch>', 'bugfix branches prefix', 'bugfix/' )
init.option( '--flow-feature <branch>', 'feature branches prefix', 'feature/' )
init.option( '--flow-hotfix <branch>', 'hotfix branches prefix', 'hotfix/' )
init.option( '--flow-support <branch>', 'support branches prefix', 'support/' )
init.option( '--flow-tag <branch>', 'tag version prefix', 'v' )

init.option( '-v, --project-version <version>', 'project version', '1.0.0' )
init.option( '-d, --project-description <description>', 'project description', '' )

init.option( '-r, --repository <repo>', 'set repository url' )
init.option( '--repository-access <public|internal|private>', 'make the new repository type', 'private' )
init.option( '--repository-description <description>', 'description of repository' )
init.option( '--repository-team <team>', 'the name of the organization team to be granted access' )
init.option( '--repository-homepage <homepage>', 'repository home page URL' )
init.option( '--repository-enable-issues', 'enable issues in the new repository', true )
init.option( '--repository-enable-wiki', 'enable wiki in the new repository', true )

init.action( async ( original: string ) => {
  const opts = init.opts()
  const name = createName( original )
  const version = opts.projectVersion
  const description = opts.projectDescription
  const output = path.resolve( opts.output ?? name.hyphen )

  if ( await exists( output ) )
    await fs.promises.rmdir( output, { recursive: true } )

  let temp = await fs.promises.mkdtemp( path.join( os.tmpdir(), 'cookiex-template-' ) )

  log.debug( `temporary directory: ${temp}` )

  const progress = ora( 'download template' )

  try {
    progress.start()

    if ( isURL( opts.template ) ) {
      log.debug( `template is url, try cloning with git ${opts.template}` )
      await git.clone( opts.template, temp, {} )
    }

    else if ( await exists( opts.template ) ) {
      log.debug( `template is folder, cloning direct from folder ${opts.template}` )
      temp = path.resolve( opts.template )
    }

    else {
      log.debug( `fall to template module, try install with yarn add ${opts.template}` )
      await command( [ 'yarn', 'add', opts.template ], temp )
      temp = path.join( temp, 'node_modules', opts.template )
    }

    progress.text = 'raise template'

    const template = new Template( temp )

    Object.entries( mappedObject( { name, version, description } ) )
      .forEach( ( [ key, value ] ) => template.replacer( key, value.toString() ) )

    await template.raise( output )

    if ( opts.update )
      await template.updatePackageJson()

    const templateGit = simpleGit( output )

    if ( opts.git ) {

      progress.text = 'init git'

      await templateGit.init()

      if ( await hasGitFlow() && opts.flow ) {
        progress.text = 'init git flow'
        const flowOptions = Object.fromEntries(
          Object.entries( opts )
            .filter( ( [ key ] ) => key.startsWith( 'flow' ) && key !== 'flow' )
            .map( ( [ key, value ] ) => [ key.replace( 'flow', '' ), value ] )
        )
        flowOptions.d = true
        await command( 'git flow init', output, flowOptions )
      }

      if ( opts.repository )

        if ( isURL( opts.repository ) ) {
          progress.text = 'add origin to git'
          log.debug( `repository is url, set origin in git local configuration ${opts.repository}` )
          await templateGit.remote( [ 'add', 'origin', opts.repository ] )
        }

        else if ( await commandExists( 'gh' ) ) {
          progress.text = 'create repo with github cli'
          const ghOptions = Object.fromEntries(
            Object.entries( opts )
              .filter( ( [ key, value ] ) =>
                key.startsWith( 'repository' ) &&
                key !== 'repository' &&
                key !== 'repositoryAccess' &&
                typeof value !== 'undefined' )
              .map( ( [ key, value ] ) => [ key.replace( 'repository', '' ), value ] )
          )
          ghOptions[opts.repositoryAccess] = true
          ghOptions.y = true
          log.debug( `repository is gh path, try create repository with github cli ${opts.repository}` )
          await command( `gh repo create ${opts.repository}`, output, ghOptions )
        }

      if ( opts.push && opts.repository ) {
        progress.text = 'git push content'
        await templateGit.push( 'origin', 'master' )
      }

      await command( [ 'yarn init' ], output, { y: true } )
    }

    if ( opts.install ) {
      progress.text = 'install dependencies'
      await command( [ 'yarn', 'install' ], output )
    }

    if ( opts.git && opts.commit ) {
      progress.text = 'git commit message'

      const gitignorePath = path.join( output, '.gitignore' )

      if ( !await exists( gitignorePath ) ) {
        log.warning( 'template dont have .gitignore, generate automatic for ignore node_modules in commit.' )
        await fs.promises.writeFile( gitignorePath, 'node_modules' )
      }

      await templateGit.add( '.' )
        .then( () => templateGit.commit( opts.initCommit ?? template.getCommitMessage() ) )
    }

    progress.succeed( 'template already to use' )
  } catch ( e ) {
    progress.stop()
    log.error( e.message )
    log.stack( e )
  }
} )

export = init
