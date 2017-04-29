# Respectrable_web
*Web Browser Front End for Respectrable*

### Overview
This is a front end for [respectrable](https://github.com/computersarecool/respectrable) that uses a web browser

### Setup
`respectrable_web_client.js` (in `/public`) contains a now deprecated script which assembled the state of the Live Set from individual messaegs.  Now the `getState` helper function can be called and the state is assembled as a JSON object and returned in Max. 

This is easier because you don't have to create the object-building logic for each front end

### Instructions
- Run `npm start`
- Go to the `nodeHTTPPort` (listed in `settings.json) in a browser
- This will serve `index.html` which contains `respectrable_web.js`

#### Required Software
- Node.js
- A Modern Browser

### License
(c) 2017 Willy Nolan [MIT License](https://en.wikipedia.org/wiki/MIT_License)
