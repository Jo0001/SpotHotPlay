export function onRequest(context) {
    return Response.redirect('https://open.spotify.com/playlist/' + context.env.SPT_PLAYLIST_ID, 302);
}