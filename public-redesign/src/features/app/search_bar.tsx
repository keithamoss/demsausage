import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';

import { Divider, IconButton, InputBase, Paper } from '@mui/material';
import React, { useEffect } from 'react';

interface Props {
	onSearch: any;
	onSearchTextChange?: any;
	filterOpen: boolean;
	onToggleFilter: any;
	onClick: any;
	isMapFiltered: boolean;
	showFilter: boolean;
	styleProps: any;
	forceFocussed?: boolean;
	id?: string;
	valueToShow?: string;
}

export default function SearchBar(props: Props) {
	const {
		onSearch,
		onSearchTextChange,
		filterOpen,
		onToggleFilter,
		onClick,
		isMapFiltered,
		showFilter,
		styleProps,
		forceFocussed,
		id,
		valueToShow,
	} = props;

	useEffect(() => {
		if (id === 'search-bar' && valueToShow !== undefined) {
			setSearchText(valueToShow);
		}
	}, [id, valueToShow]);

	const [searchText, setSearchText] = React.useState(valueToShow || '');
	const whenSearchTextChanges = (e: any) => {
		setSearchText(e.target.value);

		if (onSearchTextChange !== undefined) {
			onSearchTextChange(e.target.value);
		}
	};

	const onClickInput = (e: any) => {
		if (onClick !== undefined) {
			onClick(true); // setOpen(true)
		}

		if (id === 'search-bar') {
			e.target.blur();
		}

		// console.log("onClickInput", id);
		if (id !== undefined && id !== 'search-bar-bottom-drawer-temporary') {
			window.setTimeout(() => {
				// console.log("onClickInput.focus");
				// console.log(document.getElementById(`${id}-bottom-drawer-temporary`));
				document.getElementById(`${id}-bottom-drawer-temporary`)?.focus();
			}, 300);
		}
	};

	return (
		<Paper
			component="form"
			sx={{
				...{
					p: '2px 4px',
					display: 'flex',
					alignItems: 'center',
					// width: 400,
				},
				/* ...or use this if we're using the current layout */
				...styleProps,
			}}
		>
			{/* <IconButton sx={{ p: "10px" }} aria-label="menu">
                <MenuIcon />
              </IconButton> */}
			<InputBase
				sx={{ ml: 1, flex: 1 }}
				placeholder="Search here or use GPS →"
				inputProps={{ 'aria-label': 'search google maps', id }}
				onClick={onClickInput}
				// focused={forceFocussed}
				// autoFocus={forceFocussed}
				// defaultValue={valueToShow}
				onKeyPress={(e: any) => {
					if (e.key === 'Enter') {
						onSearch(true);
						e.target.blur();
						e.preventDefault();
					}
				}}
				value={searchText}
				onChange={whenSearchTextChanges}
			/>
			{searchText !== '' && id !== 'search-bar' && (
				<IconButton
					type="button"
					sx={{ p: '10px' }}
					aria-label="close"
					onClick={() => {
						setSearchText('');
						onSearch(false);
					}}
				>
					<CloseIcon />
				</IconButton>
			)}
			<IconButton type="button" sx={{ p: '10px' }} aria-label="gps-search">
				<GpsNotFixedIcon />
			</IconButton>
			{showFilter === true && (
				<React.Fragment>
					{' '}
					<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
					<IconButton
						// color={filterOpen === true ? "secondary" : "default"}
						color={isMapFiltered === true ? 'secondary' : 'default'}
						sx={{ p: '10px' }}
						aria-label="directions"
						onClick={onToggleFilter}
					>
						{isMapFiltered === true ? <FilterAltOutlinedIcon /> : <FilterAltOffOutlinedIcon />}
					</IconButton>
				</React.Fragment>
			)}
		</Paper>
	);
}
