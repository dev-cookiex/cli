import deep from '@cookiex/deep'

const deeper = deep.create( {
  ignoreConflictType: true,
  typeResolveArray: 'overwrite'
} )

const createStore = <S, D = {}>(
  initialState: S,
  definitions: createStore.DefinitionActions<D, S> = {} as createStore.DefinitionActions<D, S>
): createStore.Store<S, D> => {
  let state = initialState
  const dispatch: createStore.Dispatch<S, D> = (
    update: createStore.DeepPartial<S> | ( ( state: S ) => createStore.DeepPartial<S> ) | keyof D,
    ...args: any[]
  ) => {
    if ( typeof update === 'string' || typeof update === 'symbol' ) {
      const result = definitions[update]( ...args )
      if ( typeof result === 'function' )
        return dispatch( result( getState() ) )
      return dispatch( result )
    }

    if ( typeof update === 'function' )
      return dispatch( update( getState() ) )

    setState( deeper( getState(), update ) )
    observers.forEach( observer => observer() )
  }

  const getState = () => state
  const setState = ( newer: S ) => state = newer
  const observers: ( () => void )[] = []

  const observer = ( callback: () => void ) => {
    observers.push( callback )
    return () => {
      observers.splice( observers.indexOf( callback ), 1 )
    }
  }

  return {
    dispatch,
    observer,
    getState
  }
}

namespace createStore {
  export interface Store<S, D = {}> {
    dispatch: Dispatch<S, D>
    observer( callback: () => void ): () => void
    getState(): S
  }

  type NormalizeDefinition<D> = {
    [K in keyof D]: D[K] extends Array<any> ? D[K] : []
  }

  export type DefinitionActions<D, S> = {
    [K in keyof NormalizeDefinition<D>]:
      ( ...args: NormalizeDefinition<D>[K] ) => DeepPartial<S> | ( ( state: S ) => DeepPartial<S> )
  }

  export type Dispatch<T, D> = {
    ( update: DeepPartial<T> ): void
    ( updater: ( state: T ) => DeepPartial<T> ): void

    <K extends keyof NormalizeDefinition<D>>( definition: K, ...args: NormalizeDefinition<D>[K] ): void
  }

  export type DeepPartial<T> = {
    [K in keyof T]+?:
      T[K] extends object
        ? T[K] extends Array<any>
          ? T[K]
          : DeepPartial<T[K]>
        : T[K]
  }
}

export = createStore
