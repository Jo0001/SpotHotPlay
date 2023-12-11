import html from './page.html'

export function onRequest(context) {
    return new Response(html, {
        headers: {"Content-Type": "text/html"}
    });
}