import { Command } from '@cookiex/cli-types'

import funcInit from './init'

const init: Command<false> = {
  name: 'init <projectName> [projectDir]',
  func: funcInit,
  description: 'Cookie Project Init',
  options: [ {
    name: '-y, --yes',
    default: false,
    description: 'Skip any question'
  }, {
    name: '--case <format>',
    description: 'Case for output folder',
    default: 'hyphen'
  }, {
    name: '-t, --template <templateName>',
    description: 'Load template',
    default: ''
  }, {
    name: '-s, --save-default',
    description: 'save to default template',
    default: false
  }, {
    name: '--no-install',
    description: 'No install template dependencies',
    default: false
  } ]
}

export default init
