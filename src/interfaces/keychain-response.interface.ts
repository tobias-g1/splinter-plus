export interface KeyChainResponse {
    command: string;
    response: Response;
}

export interface Response {
    success: boolean;
    result: Result;
    data: Data;
    message: string;
    request_id: number;
}

export interface Data {
    type: string;
    id: string;
    method: string;
    json: string;
    username: string;
    key: string;
}

export interface Result {
    id: string;
    tx_id: string;
    confirmed: boolean;
}
