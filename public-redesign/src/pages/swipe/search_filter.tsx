import Avatar from "@mui/material/Avatar";
import Checkbox from "@mui/material/Checkbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import React from "react";

import BaconandEggsIcon from "../../icons/bacon-and-eggs";
import CakeIcon from "../../icons/cake";
import CoffeeIcon from "../../icons/coffee";
import HalalIcon from "../../icons/halal";
import SausageIcon from "../../icons/sausage";
import VegoIcon from "../../icons/vego";

interface Props {
  onChangeFilter: any;
}

export default function SearchFilter(props: Props) {
  const { onChangeFilter } = props;

  const [checked, setChecked] = React.useState<number[]>([]);

  const handleToggle = (value: number, label: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    const filterOptions: any = {};
    filterData.forEach((value: any, idx: any) => {
      filterOptions[filterData[idx].name] = newChecked.indexOf(idx) !== -1;
    });
    onChangeFilter(filterOptions);
  };

  const filterData = [
    { icon: <SausageIcon />, label: "Sausage Sizzle", name: "bbq" },
    { icon: <CakeIcon />, label: "Cake Stall", name: "cake" },
    { icon: <VegoIcon />, label: "Savoury Vegetarian", name: "vego" },
    { icon: <HalalIcon />, label: "Halal", name: "halal" },
    {
      icon: <BaconandEggsIcon />,
      label: "Bacon and Eggs",
      name: "bacon_and_eggs",
    },
    { icon: <CoffeeIcon />, label: "Coffee", name: "coffee" },
  ];

  return (
    <List
      dense
      sx={{
        width: "100%",
        marginTop: 1,
        // marginBottom: 1,
        /*maxWidth: 360, */ bgcolor: "background.paper",
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((value) => {
        const labelId = `checkbox-list-secondary-label-${value}`;
        const filterDataItem = filterData[value];
        return (
          <ListItem
            key={value}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleToggle(value, filterDataItem.label)}
                checked={checked.indexOf(value) !== -1}
                inputProps={{ "aria-labelledby": labelId }}
              />
            }
            disablePadding
          >
            <ListItemButton>
              <ListItemAvatar>
                <Avatar
                  alt={`Avatar n°${value + 1}`}
                  sx={{ backgroundColor: "transparent" }}
                  // src={`/static/images/avatar/${value + 1}.jpg`}
                >
                  {filterDataItem.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText id={labelId} primary={filterDataItem.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
