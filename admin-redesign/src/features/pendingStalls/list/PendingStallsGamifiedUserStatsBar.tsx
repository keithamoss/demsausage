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
	Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ElectionPendingStallsGamifiedUserStats } from '../../../app/services/stalls';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';

interface Props {
	/** People and their contribution counts for this election. */
	stats: ElectionPendingStallsGamifiedUserStats[];
}

/**
 * An arrangement of people on the track.
 * @property groups - People sharing each marker, in score order.
 * @property displacement - The total distance from each person's score to their marker, in score units.
 */
type Grouping = { groups: ElectionPendingStallsGamifiedUserStats[][]; displacement: number };

// Keep the spacing calculation and rendered marker dimensions in sync.
const markerSize = 36;
const avatarSize = 24;
const compactAvatarSize = 20;
const singleMarkerRight = 32;
const groupMarkerHalfWidth = 24;
const markerGap = 4;

/**
 * Turn a contribution count into its position as a share of all contributions.
 * @param value - One person's contribution count.
 * @param total - The total contribution count for everyone.
 * @returns The position as a percentage, or zero when there are no contributions.
 * @example getPercentage(5, 20) returns 25.
 */
function getPercentage(value: number, total: number) {
	return total > 0 ? (value / total) * 100 : 0;
}

/**
 * Arrange people into markers that fit without overlapping.
 *
 * A stack sits at its highest score. For example, people with scores of 5
 * and 12 may share a marker at 12 when there is not enough room for both.
 * The chosen arrangement keeps the total distance from scores to markers as
 * small as possible; equally accurate arrangements use more markers.
 *
 * @param stats - A non-empty list of people and their contribution counts.
 * @param trackWidth - The available track width in pixels.
 * @param total - The total contribution count for everyone.
 * @returns Groups in score order, with each group's highest score last.
 * @throws If no arrangement can be found.
 */
function groupContributors(stats: ElectionPendingStallsGamifiedUserStats[], trackWidth: number, total: number) {
	const sorted = [...stats].sort((first, second) => first.total - second.total || first.id - second.id);
	const memo = new Map<string, Grouping | null>();

	/**
	 * Find the best arrangement for the people still to be placed.
	 * @param start - The index of the first remaining person in score order, or the list length when finished.
	 * @param previousGrouped - Whether the previous marker is a stack rather than an individual.
	 * @returns The best arrangement, an empty arrangement when finished, or null if nothing fits.
	 */
	const findBestArrangement = (start: number, previousGrouped: boolean): Grouping | null => {
		if (start === sorted.length) return { groups: [], displacement: 0 };

		// The preceding marker is at the score immediately before start.
		// Remember each result so different arrangements can reuse it.
		const key = `${start}-${previousGrouped}`;
		const cached = memo.get(key);
		if (cached !== undefined) return cached;

		let best: Grouping | null = null;
		for (let end = start; end < sorted.length; end++) {
			// Try ending the next marker at each remaining person's score.
			const grouped = end > start;
			if (start > 0) {
				const distance =
					((getPercentage(sorted[end].total, total) - getPercentage(sorted[start - 1].total, total)) * trackWidth) /
					100;
				const required =
					(previousGrouped ? groupMarkerHalfWidth : singleMarkerRight) +
					(grouped ? groupMarkerHalfWidth : markerSize / 2) +
					markerGap;
				if (distance < required) continue;
			}

			const remainder = findBestArrangement(end + 1, grouped);
			if (!remainder) continue;

			// Score differences are proportional to distances on the track.
			const group = sorted.slice(start, end + 1);
			const candidate = {
				groups: [group, ...remainder.groups],
				displacement: group.reduce((sum, user) => sum + sorted[end].total - user.total, remainder.displacement),
			};
			if (
				!best ||
				candidate.displacement < best.displacement ||
				(candidate.displacement === best.displacement && candidate.groups.length > best.groups.length)
			) {
				best = candidate;
			}
		}
		memo.set(key, best);
		return best;
	};

	const grouping = findBestArrangement(0, false);
	if (!grouping) throw new Error('Could not group contribution markers.');
	return grouping.groups;
}

/**
 * Show each person's share of the contributions as a position along a line.
 *
 * When there isn't room to show everyone separately, some people share a
 * marker. Select a picture or stack to see the names and individual totals;
 * the line ends at the leader.
 *
 * @param props - The information to display.
 * @param props.stats - Each person's details and contribution count.
 * @returns The contribution track, or null if there are no people to display.
 */
export default function PendingStallsGamifiedUserStatsBar({ stats }: Props) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [trackWidth, setTrackWidth] = useState(0);
	const [selectedGroup, setSelectedGroup] = useState<{
		anchor: HTMLElement;
		users: ElectionPendingStallsGamifiedUserStats[];
	} | null>(null);
	const hasStats = stats.length > 0;

	// Regroup when the track changes width, including changes to its container.
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
	const groups = groupContributors(stats, trackWidth, total);
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
		<Box
			ref={trackRef}
			sx={{ position: 'relative', height: 40, mt: 1, ml: `${groupMarkerHalfWidth}px`, mr: `${singleMarkerRight}px` }}
		>
			<Box
				data-testid="stats-bar-line"
				sx={{
					position: 'absolute',
					left: 0,
					top: '50%',
					transform: 'translateY(-50%)',
					width: `${getPercentage(leadingTotal, total)}%`,
					height: 10,
					backgroundColor: mapaThemePrimaryPurple,
				}}
			/>

			{groups.map((group) => {
				// Place a stack at its highest-scoring member, so a grouped leader
				// still sits at the end of the line.
				const leader = group[group.length - 1];
				const isGrouped = group.length > 1;
				const groupedAvatarSize = group.length > 2 ? compactAvatarSize : avatarSize;
				const label = isGrouped ? `View ${group.length} contributors` : `View contributions for ${leader.name}`;
				return (
					<Fab
						key={group.map((item) => item.id).join('-')}
						color="primary"
						aria-label={label}
						aria-haspopup="dialog"
						onClick={(event) => setSelectedGroup({ anchor: event.currentTarget, users: group })}
						sx={{
							position: 'absolute',
							width: isGrouped ? 'auto' : markerSize,
							minWidth: markerSize,
							height: markerSize,
							px: isGrouped ? 0.5 : 0,
							left: `${getPercentage(leader.total, total)}%`,
							top: '50%',
							transform: 'translate(-50%, -50%)',
						}}
					>
						{!isGrouped ? (
							<Badge badgeContent={leader.total} max={999} color="primary">
								<Avatar src={leader.image_url} alt={leader.initials} sx={{ width: avatarSize, height: avatarSize }} />
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
