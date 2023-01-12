import CloseIcon from "@mui/icons-material/Close";
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from "@mui/icons-material/GpsNotFixed";

import { Divider, IconButton, InputBase, Paper } from "@mui/material";
import React from "react";

interface Props {
  onSearch: any;
  filterOpen: boolean;
  onToggleFilter: any;
  onClick: any;
  showFilter: boolean;
}

export default function SearchBar(props: Props) {
  const { onSearch, filterOpen, onToggleFilter, onClick, showFilter } = props;

  const [searchText, setSearchText] = React.useState("");

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        // width: 400,
      }}
    >
      {/* <IconButton sx={{ p: "10px" }} aria-label="menu">
                <MenuIcon />
              </IconButton> */}
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search here or use GPS →"
        inputProps={{ "aria-label": "search google maps", id: "foobar-id" }}
        onClick={(e) => {
          onClick(true); // setOpen(true)
          window.setTimeout(() => {
            document.getElementById("foobar-id")?.focus();
          }, 400);
        }}
        onKeyPress={(e: any) => {
          if (e.key === "Enter") {
            onSearch(true);
            e.preventDefault();
          }
        }}
        value={searchText}
        onChange={(e: any) => setSearchText(e.target.value)}
      />
      {searchText !== "" && (
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label="close"
          onClick={() => {
            setSearchText("");
            onSearch(false);
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <IconButton type="button" sx={{ p: "10px" }} aria-label="gps-search">
        <GpsNotFixedIcon />
      </IconButton>
      {showFilter === true && (
        <React.Fragment>
          {" "}
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color={filterOpen === true ? "primary" : "default"}
            sx={{ p: "10px" }}
            aria-label="directions"
            onClick={onToggleFilter}
          >
            <FilterAltOutlinedIcon />
          </IconButton>
        </React.Fragment>
      )}
    </Paper>
  );
}
