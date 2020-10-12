const mappedObject = ( object: any ): { [key: string]: string | number | boolean } => {
  if ( Array.isArray( object ) )
    return object.reduce( ( properties, value, index ) => {
      if ( typeof value === 'object' )

        if ( Array.isArray( value ) )
          Object.entries( mappedObject( value ) )
            .forEach( ( [ key, value ] ) => properties[`[${index}]${key}`] = value )

        else Object.entries( mappedObject( value ) )
          .forEach( ( [ key, value ] ) => properties[`[${index}].${key}`] = value )

      else properties[`[${index}]`] = value

      return properties
    }, {} )

  return Object.entries( object ).reduce( ( properties, [ current, value ] ) => {

    if ( typeof value === 'object' )

      if ( Array.isArray( value ) )
        Object.entries( mappedObject( value ) )
          .forEach( ( [ key, value ] ) => properties[`${current}${key}`] = value )

      else Object.entries( mappedObject( value ) )
        .forEach( ( [ key, value ] ) => properties[`${current}.${key}`] = value )

    else properties[current] = value

    return properties
  }, {} as any )
}

export = mappedObject
