import Module from '../models/Module'
import createStore from './createStore'

const initialState: store.State = {
  modules: [],
  loading: false,
  setupEnd: false,
}

const store = createStore( initialState, {
  ADD_MODULES: ( ...modules: Module[] ) =>
    state => ( {
      modules: state.modules.concat( modules )
    } )
} )

namespace store {
  export interface State {
    modules: Module[]
    loading: boolean
    setupEnd: boolean
  }
}

export = store
