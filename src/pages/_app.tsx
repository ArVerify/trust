import { GeistProvider, CssBaseline } from "@geist-ui/react";
import { useState, useEffect } from "react";

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
      <Component {...pageProps} />
    </GeistProvider>
  );
}

export default App;
