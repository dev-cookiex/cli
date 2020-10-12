import cloneTool from './clone'
import createNameTool from './createName'
import gitTool from './git'
import isURLTool from './isURL'
import logTool from './log'
import mappedObjectTool from './mappedObject'
import searchTool from './search'
import yarnTool from './yarn'

namespace Tools {
  export const clone = cloneTool
  export const createName = createNameTool
  export const git = gitTool
  export const isURL = isURLTool
  export const log = logTool
  export const mappedObject = mappedObjectTool
  export const search = searchTool
  export const yarn = yarnTool
}

export = Tools
