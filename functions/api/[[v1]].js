export function onRequest(context) {
    return handleRequest(context.env, context.request);
}

async function handleRequest(env, request) {
    try {
        const clientId = env.SPT_CLIENT_ID;
        const clientSecret = env.SPT_CLIENT_SECRET;
        let arr = env.CF_PAGES_URL.split('.');
        arr.shift();
        const redirectUri = 'https://' + arr.join('.') + '/api/v1/authorize';
        const playlistId = env.SPT_PLAYLIST_ID;
        const partyID = env.PARTY_ID;

        const url = new URL(request.url);

        if (url.pathname.startsWith('/api/v1/connect')) {
            // Redirect user to Spotify authorization page
            return Response.redirect('https://accounts.spotify.com/authorize?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=playlist-modify-public', 302);
        }

        if (url.pathname === '/api/v1/authorize') {
            const kv_token = await env.SPT_KV.get('refresh_token');
            if (kv_token) {
                return new Response('Already authorized. To reauth delete the \'refresh_token\' in KV ', {status: 423});
            }
            // Handle OAuth 2.0 Authorization Code flow
            const authorizationCode = url.searchParams.get('code');

            if (authorizationCode) {
                const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    body: new URLSearchParams({
                        grant_type: 'authorization_code',
                        code: authorizationCode,
                        redirect_uri: redirectUri,
                        client_id: clientId,
                        client_secret: clientSecret,
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const tokenData = await tokenResponse.json();
                const refreshToken = tokenData.refresh_token;

                await env.SPT_KV.put('refresh_token', refreshToken);

                return Response.redirect(url.origin + '?partyID=' + env.PARTY_ID, 302);
            }
        }

        if (url.pathname.startsWith('/api/v1/add')) {
            if (request.method !== "POST") {
                return new Response('Bad request', {status: 400});
            }
            const data = await request.json();
            if (data.partyID !== partyID) {
                return new Response('Wrong party ID', {status: 401});
            }
            const song = data.song;
            const token = await refresh();

            const addTrackResponse = await fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks', {
                method: 'POST',
                body: JSON.stringify({
                    uris: [song],
                }),
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
            });

            const addTrackData = await addTrackResponse.json();
            return new Response(JSON.stringify(addTrackData), {
                status: addTrackResponse.status,
                headers: {'content-type': 'application/json'}
            });
        }

        if (url.pathname.startsWith('/api/v1/search')) {
            if (url.searchParams.get('partyID') !== partyID) {
                return new Response('Wrong party ID', {status: 401});
            }
            const query = url.searchParams.get('item')
            if (query.trim() === "") {
                return new Response('Empty query', {status: 400});
            }
            const token = await refresh();
            const queryResponse = await fetch('https://api.spotify.com/v1/search?q=' + query + '&type=track', {
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
            });
            return new Response(await queryResponse.text(), {headers: {'content-type': 'application/json'}});
        }

        async function refresh() {
            // Handle refresh token request
            const refreshToken = await env.SPT_KV.get('refresh_token');
            if (refreshToken) {
                const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: clientId,
                        client_secret: clientSecret,
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                const tokenData = await tokenResponse.json();
                return tokenData.access_token;
            }
        }
    } catch (error) {
        console.error(error);
        return new Response('An internal server error occurred. Check your Worker logs ', {status: 500});
    }


}
