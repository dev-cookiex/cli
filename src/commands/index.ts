import { Command } from '@cookiex/cli-types'

import cache from './cache'
import init from './init'
import link from './link'
import util from './util'

export const commands: Command<false>[] = [ init, util, link, cache ]
