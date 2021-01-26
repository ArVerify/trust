import { GeistProvider, CssBaseline } from "@geist-ui/react";
import { useState, useEffect } from "react";
import Head from "next/head";

function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("");
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  return (
    <GeistProvider
      theme={{
        type: theme,
      }}
    >
      <CssBaseline />
      <Head><title>ArVerify - Trust</title></Head>
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default App;
