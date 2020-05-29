import { execSync } from 'child_process'

const notSupportedPlatform = (): string => {
  throw new Error( `${process.platform} not supported` )
}

const commands: {
  [K in typeof process.platform]: () => string
} = {
  aix: notSupportedPlatform,
  android: notSupportedPlatform,
  cygwin: notSupportedPlatform,
  darwin: notSupportedPlatform,
  freebsd: notSupportedPlatform,
  linux: notSupportedPlatform,
  netbsd: notSupportedPlatform,
  openbsd: notSupportedPlatform,
  sunos: notSupportedPlatform,
  win32: () => execSync( 'netstat -ano' ).toString().trim()
}

export default commands
