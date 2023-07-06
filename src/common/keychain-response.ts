import { sendMessageToContentScript } from "@background/index";
import { attemptAutoStake } from "src/common/claim";
import { KeyChainResponse } from "src/interfaces/keychain-response.interface";

/**
 * Handles the response received from KeyChain.
 * @param {KeyChainResponse} message - The KeyChain response message.
 */

export const handleKeyChainResponse = async (message: KeyChainResponse) => {
    // Extract relevant information from the response
    const { response } = message;
    const { data, result } = response;
    const { id, type, username } = data;
    const { tx_id } = result;

    // Handle different types of custom requests
    if (type === 'custom') {
        switch (id) {
            case 'sm_stake_tokens':
                // Attempt auto stake based on the username and transaction ID
                await attemptAutoStake(username, tx_id);
                break;
            case 'sm_market_purchase':
                sendMessageToContentScript({ command: 'combine-purchase' })
                break;
            default:
                break;
        }
    }
};


