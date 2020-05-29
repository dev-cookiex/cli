import inquirer from 'inquirer'

const alreadyExistProjectDirectory = async ( directory: string ): Promise<boolean> =>
  ( await inquirer.prompt< { replace: boolean } >( {
    type: 'confirm',
    name: 'replace',
    message: `Directory "${directory}" already exists, do you want to replace it?`,
    default: false }
  ) ).replace

export default alreadyExistProjectDirectory
