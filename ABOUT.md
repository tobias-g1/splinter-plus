![](http://u.cubeupload.com/arcange/yOdI5g.png)

This repository is an example of how to use the plugin feature of [Hive Keychain](https://hive-keychain.com/).
This will allows external extensions to communicate with Hive Keychain through messages to be able to configure your extension and execute some other actions such as login, transfers etc...

### I want to create a new extension from scratch

You can use this repository as a base to develop your extension.

### I already have an existing extension and want to link it to Hive Keychain

Several step are mandatory.

1.  You first need to add the following information in `manifest.json`:
    `"externally_connectable": { "ids": [HIVE_KEYCHAIN_EXTENSION_ID], "matches": ["https://localhost:3000/*", "http://localhost:3000/*"], "accepts_tls_channel_id": false }`

2.  Then configure your plugin following the structure defined in [plugin.interface.ts](https://github.com/hive-keychain/keychain-plugin-example/blob/master/src/plugins.interface.ts#L1).
    `export interface PluginDefinition { title: string; description: string; generalSettings: PluginSetting[]; userSettings: PluginSetting[]; }`
