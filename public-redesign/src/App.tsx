import * as React from "react";

import { grey } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
// import BottomBar from "./swipe/bottom_bar";
import BottomDrawer from "./pages/swipe/bottom_drawer";
import Map from "./pages/swipe/map";

import AddLocationIcon from "@mui/icons-material/AddLocation";
import { IMapFilterOptions } from "./icons/noms";
import LayersSelector from "./pages/swipe/layers_selector";
import SideMenuDrawer from "./pages/swipe/side_menu_drawer";

// const bottomNav = 56;
// const drawerBleeding = 175 + bottomNav;
export const drawerBleeding = 245;
// const fixedBarHeightWithTopPadding = 56;
// const magicNumber = 30;

interface Props {}

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? grey[100]
      : theme.palette.background.default,
}));

const AddStallFab = styled(Fab)(({ theme }) => ({
  position: "absolute",
  //   bottom: `${drawerBleeding + bottomNav + 16}px`,
  bottom: `${drawerBleeding + 16}px`,
  right: "16px",
  backgroundColor: theme.palette.secondary.main,
}));

export default function SwipeableEdgeDrawerSimple(props: Props) {
  const [sideDrawerOpen, setSideDrawerOpen] = React.useState(false);
  const toggleSideDrawerOpen = (e: any) => {
    setSideDrawerOpen(!sideDrawerOpen);
  };

  const [mapSearchResults, setMapSearchResults] = React.useState<number | null>(
    null
  );
  const toggleMapSearchResults = (resultSet: number) => {
    setMapSearchResults(resultSet);
  };

  const [mapFilterOptions, setMapFilterOptions] =
    React.useState<IMapFilterOptions>({});

  return (
    <Root>
      <CssBaseline />

      <SideMenuDrawer open={sideDrawerOpen} onToggle={toggleSideDrawerOpen} />

      <Map
        mapSearchResults={mapSearchResults}
        mapFilterOptions={mapFilterOptions}
      />

      <LayersSelector />

      <AddStallFab
        color="primary"
        aria-label="add"
        onClick={() => (document.location.href = "/add-stall")}
      >
        <AddLocationIcon />
      </AddStallFab>

      <BottomDrawer
        toggleSideDrawerOpen={toggleSideDrawerOpen}
        toggleMapSearchResults={toggleMapSearchResults}
        onChangeFilter={setMapFilterOptions}
      />

      {/* <BottomBar /> */}
    </Root>
  );
}
