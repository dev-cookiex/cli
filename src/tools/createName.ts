import { camelize, pascalize, decamelize } from 'humps'

const createName = ( original: string ) => {
  const camel = camelize( original )
  const pascal = pascalize( original )
  const snake = decamelize( camel, { separator: '_' } )
  const hyphen = decamelize( camel, { separator: '-' } )

  return { camel, pascal, snake, hyphen, original }
}

export = createName
