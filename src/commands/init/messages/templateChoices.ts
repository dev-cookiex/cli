import { Config } from '@cookiex/cli-types'
import inquirer from 'inquirer'

const choiceTemplate = async ( ctx: Config ) => (
  await inquirer.prompt<{ template: string }>( {
    type: 'list',
    choices: [ {
      name: 'react-native',
      value: '@cookiex-react/native-template'
    }, {
      name: 'react-dom',
      value: '@cookiex-react/dom-template'
    }, {
      name: 'cookiex-command-extension',
      value: '@cookiex/cli'
    }, ... ctx.extraGlobal?.templates || []
    ],
    name: 'template'
  } ) ).template

export default choiceTemplate
