import { attemptAutoStake } from "@background/claim";
import { KeyChainResponse } from "src/interfaces/keychain-response.interface";

export const handleKeyChainResponse = async (message: KeyChainResponse) => {

    const { response } = message;
    const { data, result } = response;
    const { id, type, username } = data;
    const { tx_id } = result;

    if (type === 'custom') {
        switch (id) {
            case 'sm_stake_tokens':
                await attemptAutoStake(username, tx_id);
                break;
            case 'sm_market_purchase':
                console.log(message)
                break;
            default:
                break;
        }
    }
};
