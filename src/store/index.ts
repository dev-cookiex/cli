import Module from '../models/Module'
import createStore from './createStore'

interface State {
  modules: Module[]
  loading: boolean
}

const store = createStore( { modules: [], loading: false } as State, {
  ADD_MODULES: ( ...modules: Module[] ) =>
    state => ( {
      modules: state.modules.concat( modules )
    } )
} )

export = store
