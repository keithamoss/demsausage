import { Route, Routes } from "react-router-dom";
import DemoPage from "./pages/Demo";
import FoobarPage from "./pages/Foobar";
import ReactSpring from "./pages/ReactSpring";
import SwipePage from "./pages/Swipe";

const routes = () => {
  return (
    <Routes>
      <Route path="/" element={<DemoPage />}></Route>
      <Route path="/foobar" element={<FoobarPage />}></Route>
      <Route path="/swipe" element={<SwipePage />}></Route>
      <Route path="/react-spring" element={<ReactSpring />}></Route>
    </Routes>
  );
};

export default routes;
