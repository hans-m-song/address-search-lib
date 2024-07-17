# Maps API

This library provides some simplified fuzzy address search functions for consumption by other backend services.
Under the hood, it integrates with the TomTom Search API.

## Configuration

There are a number of options to configure this library and are required specifically for the E2E tests:

-   `TOMTOM_API_KEY` - (**required**) API key required to communicate with the TomTom Search API
-   `TOMTOM_API_URI` - the uri to communicate with the TomTom Search API (defaults to `https://api.tomtom.com`)

## Getting started

Prerequisites:

-   Node.js >=20 (consider [nvm](https://nvm.sh))
-   Yarn v1
-   (Optionally) a TomTom API key

Install dependencies

```bash
yarn install
```

Run unit tests

```bash
yarn test
```

## Documentation

-   [TomTom Search API Documentation](https://developer.tomtom.com/search-api/documentation/product-information/introduction)
