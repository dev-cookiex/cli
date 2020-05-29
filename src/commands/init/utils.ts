import humps from 'humps'

const createCaseNames = ( name: string ) => {
  const camelize = humps.camelize( name )
  const nameCase = {
    camel: camelize,
    pascal: humps.pascalize( camelize ),
    snake: humps.decamelize( camelize ),
    hyphen: humps.decamelize( camelize, { separator: '-' } ),
    original: name
  }
  return nameCase
}

const util = { createCaseNames }

export default util
