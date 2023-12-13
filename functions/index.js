import html from './page.html'
import landing from './landing.html'

export function onRequest(context) {
    const url = new URL(context.request.url);
    let site = url.searchParams.has('partyID') ? html : landing;
    return new Response(site, {
        headers: {"Content-Type": "text/html"}
    });
}