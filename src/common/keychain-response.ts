import { sendMessageToContentScript } from "@background/index";
import { setAccessToken, setRefreshToken } from "src/common/auth";
import { attemptAutoStake } from "src/common/claim";
import { login } from "src/common/splinter-plus";
import { KeyChainResponse } from "src/interfaces/keychain-response.interface";

/**
 * Handles the response received from KeyChain.
 * @param {KeyChainResponse} message - The KeyChain response message.
 */

export const handleKeyChainResponse = async (message: any) => {
    const { response } = message;
    const { data, result } = response;
    const { id, type, username } = data;
    const { tx_id } = result;

    const handleCustomRequest = (id: string) => {
        switch (id) {
            case "sm_stake_tokens":
                return attemptAutoStake(username, tx_id);
            case "sm_market_purchase":
                return sendMessageToContentScript({ command: "combine-purchase", data: { tx_id } });
            case "sm_combine_cards":
                return sendMessageToContentScript({ command: "combine-combining", data: { tx_id } });
            default:
                console.log("unhandled response", response);
                break;
        }
    };

    const handleSignBuffer = async () => {
        const { message } = data;
        const { publicKey, result, success } = response;

        if (success) {
            const token = await login(message, result, publicKey);
            const { access_token, refresh_token } = token;

            setAccessToken(access_token);
            setRefreshToken(refresh_token);
        }
    };

    if (type === "custom") {
        handleCustomRequest(id);
    } else if (type === "signBuffer") {
        handleSignBuffer();
    } else {
        console.log("unhandled response", response);
    }
};
