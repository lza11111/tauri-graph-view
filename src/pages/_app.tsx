import type { AppProps } from "next/app";

import "../global.css";
import "../style.css";
import "../App.css";
import React from "react";

if (!process.browser) React.useLayoutEffect = React.useEffect;

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
