# SplinterPlus Readme

SplinterPlus is a plugin for Hive Keychain that provides several features to enhance the Splinterlands gaming experience. With SplinterPlus, users can automate the process of staking SPS tokens, upgrade their Splinterlands collection, and get recommendations for the best decks to use in battles.

## Features

### SPS Autostake
After a successful SPS claim, the plugin will automatically stake the claimed amount every 24 hours. Users can toggle this feature on or off using the settings configured in the Keychain plugin definition.

### Combine to Next
This feature allows users to upgrade their Splinterlands Collection to the next level. The plugin will calculate the cost based on current market prices and purchase and combine the necessary cards to reach the next level. If some of the cards are purchased before the upgrade process, the plugin will notify the user to update their purchase with updated prices.

### Current League Recommendation
The plugin provides recommendations for the best decks based on the user's current league, username, and battle format. For each recommended card, the user will have the option to purchase, combine, or rent it. The cost of each option will be displayed, and the user can take action via Keychain.

### Current Battle Recommendation
The plugin provides recommendations for the current battle based on the ruleset, the user's username, and battle ID. For each recommended card, the user will have the option to purchase, upgrade, or rent it. The cost of each option will be displayed, and the user can take action via Keychain. The plugin also adds a button to play the recommended deck and update the UI.

## Environment Variables

The following environment variables are used in SplinterPlus:

- `KEYCHAIN_EXTENSION_ID`: The extension ID for Hive Keychain.
- `SETTINGS_REFRESH_INTERVAL_MINUTES`: The number of minutes to wait before refreshing the settings.
- `CHECK_AUTO_CLAIM_SETTING_INTERVAL_MINUTES`: The number of minutes to wait before checking the auto-claim setting.
- `APP`: The name and version of the SplinterPlus app.
- `SPLINTERLANDS_BASE`: The base URL for the Splinterlands API.
- `MARKET`: The name of the SplinterPlus market.
- `PRICE_FORCE_REFRESH_IN_MINUTES`: The number of minutes to wait before forcing a refresh of the price.
- `BASE_URL`: The base URL for the SplinterPlus pricing API.

## Local Development

To run SplinterPlus locally, follow these steps:

1. Copy the `.env.example` file to a new file called `.env`.
2. Run `npm run dev` on both the SplinterPlus project and Hive Keychain project.
3. Use a branch that supports plugin development (e.g., `feature/plugin-flow-2az7x6n`) on the Keychain side.
4. Install Hive Keychain and SplinterPlus locally with Chromium Load unpacked, from the Extension page of your browser. Select the `dist-dev` folder.
5. Update `KEYCHAIN_EXTENSION_ID` in `.env` using the locally installed Hive Keychain ID (you can find it in the extension page of your browser).
6. Similarly, on your local Keychain extension, update `.env` to use this plugin extension ID.
7. Restart `npm run dev` on both sides.

## Conclusion

SplinterPlus is a plugin for Hive Keychain that provides several features to automate and enhance the Splinterlands gaming experience. By staking SPS tokens automatically, upgrading collections with market prices, and getting recommendations for the best decks, SplinterPlus saves time and improves gameplay.

Author: [tobias-g](https://peakd.com/@tobias-g)
