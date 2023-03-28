import Router from "next/router";
import { useEffect } from "react";
import { Layout } from "../components/Layout";

function App() {
  useEffect(() => {
    Router.push("/data-assets");
  }, []);

  return (
    <Layout>
      <div>Home</div>
    </Layout>
  );
}

export default App;
