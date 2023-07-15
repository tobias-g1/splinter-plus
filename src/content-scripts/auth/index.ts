import { clearAccessToken, getAccessToken, getRefreshToken, login, setAccessToken } from "src/common/auth";
import { refreshToken } from "src/common/splinter-plus";

async function runContentScript() {
    const accessToken = await getAccessToken();

    if (accessToken) {
        try {
            // Decode the access token to get the username and expiration time
            const tokenParts = accessToken.split('.');
            const tokenPayload = JSON.parse(atob(tokenParts[1]));
            const username = tokenPayload.aud;
            const expirationTime = tokenPayload.exp * 1000; // Convert expiration time to milliseconds
            const currentTime = Date.now();

            // Check if the access token is expired
            if (currentTime >= expirationTime) {
                console.log('Access token expired, refreshing...');
                try {
                    const refresh_token = await getRefreshToken();
                    const response = await refreshToken(refresh_token);
                    const { access_token } = response;
                    await setAccessToken(access_token);
                    console.log('Token successfully refreshed');
                } catch (error) {
                    console.error('Failed to refresh token:', error);
                    await clearAccessToken();
                    await login();
                }
            } else {
                console.log('Access token valid, no action needed');
            }
        } catch (error) {
            console.error('Failed to decode access token:', error);
            await login();
        }
    } else {
        console.log('No access token found, requesting login');
        try {
            await login();
        } catch (error) {
            console.error('Login failed', error);
        }
    }
}

runContentScript();
