import { Command } from '@cookiex/cli-types'

const isDetachedCommand = ( cmd: Command<boolean> ): cmd is Command<true> => cmd.detached === true

export default isDetachedCommand
