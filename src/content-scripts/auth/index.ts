import { clearAccessToken, getAccessToken, getRefreshToken, login, setAccessToken } from "src/common/auth";
import { refreshToken } from "src/common/splinter-plus";

async function runContentScript() {
    const accessToken = await getAccessToken();

    if (accessToken) {
        try {
            const tokenParts = accessToken.split('.');
            const tokenPayload = JSON.parse(atob(tokenParts[1]));
            const expirationTime = tokenPayload.exp * 1000;
            const currentTime = Date.now();

            // Check if the access token is expired
            if (currentTime >= expirationTime) {
                console.log('Access token expired, refreshing...');
                try {
                    const refresh_token = await getRefreshToken();
                    try {
                        const response = await refreshToken(refresh_token);
                        const { access_token } = response;
                        await setAccessToken(access_token);
                        console.log('Token successfully refreshed');
                    } catch (error) {
                        console.error('Failed to refresh token:', error);
                        console.log('Refreshing token failed. Please log in again.');
                        await clearAccessToken();
                        await login();
                        return;
                    }
                } catch (error) {
                    console.error('Failed to get refresh token:', error);
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
