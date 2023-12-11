# SpotHotPlay
Have you ever wanted to add a song to the current playlist at a party,
only to have to ask the host to give you the smartphone so you can add it?

**Not anymore! All the host has to do is share a link and you can add the songs straight away - no account required!**

> [!NOTE]
> Still in beta and not yet party battle tested

## Setup

### First time setup
 
#### Requirements: 
- GitHub Account (free is fine)
- Spotify Account (free is fine)
- Cloudflare Account (free is fine)

1. [Fork](https://github.com/Jo0001/SpotHotPlay/fork) this repo on GitHub
2. [Link GitHub and Pages](https://dash.cloudflare.com/?to=/:account/pages/new/provider/github) by following the instructions and the select the forked SpotHotPlay repo
3. On the next site keep everything as it is and hit 'Save and Deploy'
4. Wait for the success message on the top and copy the url (it should be something like *https://SpotHotPlay-xx.pages.dev/*)
5. Now [create a new Spotify App](https://developer.spotify.com/dashboard/create) and set the url from 4. as redirect url and append *api/v1/authorize* (e.g. *https://SpotHotPlay-xx.pages.dev/api/v1/authorize*)
6. Go to the settings of the fresh created app (keep the tab open)
7. [Create a new KV Namespace](https://dash.cloudflare.com/?to=/:account/workers/kv/namespaces) 'SPT_TOKEN'
8. [Bind the KV](https://dash.cloudflare.com/?to=/:account/pages/view/SpotHotPlay/settings/functions) with Variable name 'SPT_KV' and KV Namespace 'SPT_TOKEN'
9. Now let's [create the Environment variables:]( https://dash.cloudflare.com/?to=/:account/pages/view/SpotHotPlay/settings/environment-variables)

`SPT_CLIENT_ID`  → Spotify App client id (copy from step 6.)

`SPT_CLIENT_SECRET` → Spotify App client secret (copy from step 6.)

`SPT_PLAYLIST_ID` → ID of Spotify playlist to which songs are added

`PARTY_ID` → The name of the party - choose whatever you like. Will be visible to users


### How to use as user/party guest

Open <your url>/?partyID=<PARTY_ID from step 9> e.g. https://SpotHotPlay-xx.pages.dev/?partyID=MySuperParty 


  


*Not affiliated with Spotify*