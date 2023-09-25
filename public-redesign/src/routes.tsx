import { Route, Routes } from 'react-router-dom';
import AppPage from './App';
import AboutPage from './pages/About';
import AddStallPage from './pages/AddStall';
import FoobarPage from './pages/Foobar';
import ReactSpring from './pages/ReactSpring';
// import SwipePage from './pages/Swipe';

const routes = () => {
	return (
		<Routes>
			<Route path="/" element={<AppPage />}></Route>
			<Route path="/foobar" element={<FoobarPage />}></Route>
			{/* <Route path="/swipe" element={<SwipePage />}></Route> */}
			<Route path="/about" element={<AboutPage />}></Route>
			<Route path="/add-stall" element={<AddStallPage />}></Route>
			<Route path="/react-spring" element={<ReactSpring />}></Route>
		</Routes>
	);
};

export default routes;
