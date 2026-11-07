import {
	Avatar,
	AvatarGroup,
	Badge,
	Box,
	Fab,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Popover,
	Tooltip,
	Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ElectionPendingStallsGamifiedUserStats } from '../../../app/services/stalls';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';

interface Props {
	stats: ElectionPendingStallsGamifiedUserStats[];
}

// Leave enough room between markers for the widest stack of avatars.
const markerSpacing = 64;

/**
 * Show each person's share of the contributions as a position along a line.
 * People whose pictures would overlap are shown together; select a picture or
 * stack to see the names and individual totals. The line ends at the leader.
 */
export default function PendingStallsGamifiedUserStatsBar(props: Props) {
	const { stats } = props;
	const trackRef = useRef<HTMLDivElement>(null);
	const [trackWidth, setTrackWidth] = useState(0);
	const [selectedGroup, setSelectedGroup] = useState<{
		anchor: HTMLElement;
		users: ElectionPendingStallsGamifiedUserStats[];
	} | null>(null);
	const hasStats = stats.length > 0;

	useEffect(() => {
		const track = trackRef.current;
		if (!hasStats || !track) return;

		const updateWidth = () => {
			// A resize can change the groups, so an open stack may no longer exist.
			setSelectedGroup(null);
			setTrackWidth(track.getBoundingClientRect().width);
		};
		updateWidth();

		if (typeof ResizeObserver === 'undefined') {
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}

		const observer = new ResizeObserver(updateWidth);
		observer.observe(track);
		return () => observer.disconnect();
	}, [hasStats]);

	if (!hasStats) return null;

	const total = stats.reduce((sum, item) => sum + item.total, 0);
	const getPercentage = (value: number) => (total > 0 ? (value / total) * 100 : 0);
	const groups: ElectionPendingStallsGamifiedUserStats[][] = [];

	// Group neighbours according to their distance on the current screen, not
	// just their scores. A chain of close neighbours stays in the same stack.
	for (const item of [...stats].sort((first, second) => first.total - second.total || first.id - second.id)) {
		const previousGroup = groups[groups.length - 1];
		const previousUser = previousGroup?.[previousGroup.length - 1];
		const distance = previousUser
			? ((getPercentage(item.total) - getPercentage(previousUser.total)) * trackWidth) / 100
			: Number.POSITIVE_INFINITY;
		if (previousGroup && distance < markerSpacing) {
			previousGroup.push(item);
		} else {
			groups.push([item]);
		}
	}

	const leadingTotal = Math.max(...stats.map((item) => item.total));
	// Scores can update while details are open. Only keep showing them if the
	// same group and its on-screen button still exist.
	const selectedUsers = selectedGroup
		? groups.find(
				(group) =>
					group.length === selectedGroup.users.length &&
					group.every((user, index) => user.id === selectedGroup.users[index].id),
			)
		: undefined;
	const selectedAnchor = selectedUsers && selectedGroup?.anchor.isConnected ? selectedGroup.anchor : null;

	// The left inset fits half a compact stack; the right also leaves room for score badges.
	return (
		<Box ref={trackRef} sx={{ position: 'relative', height: 40, mt: 1, ml: '24px', mr: '32px' }}>
			<Box
				data-testid="stats-bar-line"
				sx={{
					position: 'absolute',
					left: 0,
					top: '50%',
					transform: 'translateY(-50%)',
					width: `${getPercentage(leadingTotal)}%`,
					height: 10,
					backgroundColor: mapaThemePrimaryPurple,
				}}
			/>

			{groups.map((group) => {
				// Place a stack at its highest-scoring member, so a grouped leader
				// still sits at the end of the line.
				const leader = group[group.length - 1];
				const groupedAvatarSize = group.length > 2 ? 20 : 24;
				const label =
					group.length === 1 ? `View contributions for ${leader.name}` : `View ${group.length} contributors`;
				return (
					<Tooltip
						key={group.map((item) => item.id).join('-')}
						title={group.length === 1 ? `${leader.name}: ${leader.total}` : `${group.length} contributors`}
					>
						<Fab
							color="primary"
							aria-label={label}
							aria-haspopup="dialog"
							onClick={(event) => setSelectedGroup({ anchor: event.currentTarget, users: group })}
							sx={{
								position: 'absolute',
								width: group.length === 1 ? 36 : 'auto',
								minWidth: 36,
								height: 36,
								px: group.length === 1 ? 0 : 0.5,
								left: `${getPercentage(leader.total)}%`,
								top: '50%',
								transform: 'translate(-50%, -50%)',
							}}
						>
							{group.length === 1 ? (
								<Badge badgeContent={leader.total} max={999} color="primary">
									<Avatar src={leader.image_url} alt={leader.initials} sx={{ width: 24, height: 24 }} />
								</Badge>
							) : (
								<AvatarGroup
									max={3}
									spacing="small"
									slotProps={{ surplus: { sx: { width: groupedAvatarSize, height: groupedAvatarSize, fontSize: 12 } } }}
								>
									{group.map((item) => (
										<Avatar
											key={item.id}
											src={item.image_url}
											alt={item.initials}
											sx={{ width: groupedAvatarSize, height: groupedAvatarSize }}
										/>
									))}
								</AvatarGroup>
							)}
						</Fab>
					</Tooltip>
				);
			})}

			<Popover
				open={selectedAnchor !== null}
				anchorEl={selectedAnchor}
				onClose={() => setSelectedGroup(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				transformOrigin={{ vertical: 'top', horizontal: 'center' }}
				slotProps={{ paper: { role: 'dialog', 'aria-label': 'Contribution details' } }}
			>
				<List dense>
					{selectedUsers?.map((item) => (
						<ListItem key={item.id}>
							<ListItemAvatar>
								<Avatar src={item.image_url} alt={item.initials} />
							</ListItemAvatar>
							<ListItemText primary={item.name} />
							<Typography sx={{ ml: 2 }}>{item.total}</Typography>
						</ListItem>
					))}
				</List>
			</Popover>
		</Box>
	);
}
