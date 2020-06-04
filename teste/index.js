import { AppRegistry, Platform } from 'react-native'

import { name as appName } from './app.json'
import App from './src/app'

if ( typeof appName === 'string' ) AppRegistry.registerComponent( appName, () => App )

else if ( appName[Platform.OS] ) AppRegistry.registerComponent( appName[Platform.OS], () => App )

else if ( appName ) AppRegistry.registerComponent( appName['default'] || appName.common, () => App )
