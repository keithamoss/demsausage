import { Route, Routes } from "react-router-dom";
import DemoPage from "./pages/Demo";
import FoobarPage from "./pages/Foobar";

const routes = () => {
  return (
    <Routes>
      <Route path="/" element={<DemoPage />}></Route>
      <Route path="/foobar" element={<FoobarPage />}></Route>
    </Routes>
  );
};

export default routes;
