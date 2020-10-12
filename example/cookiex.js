const commander = require( 'commander' )

const test = new commander.Command( 'test' )

test.option( '-o, --only', 'set only test', false )

test.option( '-t, --test', 'set test', false )

test.action( () => {
  console.log( 'module export success' )
} )

module.exports = {
  command: test
}
