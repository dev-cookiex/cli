import commander from 'commander'

import store from '../store'

const info = new commander.Command( 'info' )

info.action( () => {
  const state = store.getState()
  console.group( 'Modules:' )
  state.modules.forEach( module => {
    console.log( module.name )
  } )
  console.groupEnd()
} )

export = info
