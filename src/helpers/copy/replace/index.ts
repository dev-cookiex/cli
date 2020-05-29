import Recursive from '../recursive'

namespace CopyReplace {

  const replaceInString = (
    content: string,
    replaces: { [key: string]: string } = {},
    poly: { [key: string]: string } = {},
    flags: string = 'g'
  ) => // eslint-disable-line

    Object.entries( replaces ).reduce( ( content, [ find, replace ] ) => {

      const poler = poly[replace]

      if ( typeof poler === 'string' )

        return content.replace( RegExp( find, flags ), poly[replace] as string )

      return content.replace( RegExp( find, flags ), replace )

    }, content )

  export const dir = (
    { dirname: originlaDirName, entries }: Recursive.DirInfo,
    replaces: { [key: string]: string },
    poly: { [key: string]: string } = {}
  ): Recursive.DirInfo => {
    const dirname = replaceInString( originlaDirName, replaces, poly, '' )
    return { dirname, entries }
  }
  export const file = (
    { content: fileContent, ...file }: Recursive.FileInfo,
    replaces: { [key: string]: string },
    poly: { [key: string]: string } = {}
  ): Recursive.FileInfo => {
    const content = replaceInString( fileContent, replaces, poly, 'g' )
    return { ...file, content }
  }
}

export default CopyReplace
