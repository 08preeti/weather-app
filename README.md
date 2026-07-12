# Skyline — Weather Instrument

A small weather lookup app. Search a city (or use your location) and it
shows current conditions, plus a background sky that shifts color with the
real weather condition and time of day, and an arc tracking the sun's (or
moon's) position between sunrise and sunset.

## Running it

Just open `index.html` in a browser — no build step. Works locally as a
file or served from any static host.

## API key

This uses the OpenWeatherMap API from `script.js`. A demo key is included
so it runs out of the box, but **any key placed in client-side JavaScript
is visible to anyone who opens dev tools** — there's no way around that in
a pure front-end app. That's fine for personal or demo use. Before sharing
this publicly or putting real traffic through it:

- Get your own key at https://openweathermap.org/api and swap the
  `API_KEY` constant in `script.js`.
- Set a low rate limit / usage cap on that key if the dashboard allows it.
- For anything production-facing, proxy the request through a small
  backend that holds the key server-side instead of calling the API
  directly from the browser.

## What changed from the original

- Fixed background images that were referenced but never included in the
  repo (`hot.jpg`, `cold.jpg`, `default.jpg`) — the sky is now drawn with
  CSS gradients keyed to weather condition + day/night, so nothing is
  ever missing.
- Enter key now submits the search (was click-only before).
- Added loading and error states, geolocation lookup, humidity/wind/
  pressure/visibility, and a sunrise–sunset arc.
- Accessible labels, visible focus states, `aria-live` regions for
  results and errors.
- Responsive down to small phone widths.
