import { IconButton } from 'material-ui'
import { grey200, grey500 } from 'material-ui/styles/colors'
import {
  ActionAccessible,
  DeviceAccessTime,
  EditorFormatListBulleted,
  NavigationUnfoldMore,
} from 'material-ui/svg-icons'
import * as React from 'react'
import styled from 'styled-components'
import BaconandEggsIcon from '../../icons/bacon-and-eggs'
import CakeIcon from '../../icons/cake'
import CoffeeIcon from '../../icons/coffee'
import HalalIcon from '../../icons/halal'
import RedCrossofShameIcon from '../../icons/red-cross-of-shame'
import SausageIcon from '../../icons/sausage'
import VegoIcon from '../../icons/vego'
import { IElection } from '../../redux/modules/elections'
import {
  getWheelchairAccessDescription,
  hasAnyWheelchairAccess,
  IPollingPlace,
  IPollingPlaceSearchResult,
} from '../../redux/modules/polling_places'

// const FlexboxContainer = styled.div`
//   display: flex;
//   align-items: center;
//   width: 100%;
//   margin-bottom: 10px;
// `

// const FlexboxIcons = styled.div`
//   flex-grow: 1;
//   svg {
//     padding-left: 5px;
//     padding-right: 5px;
//   }
// `

// // const FlexboxDistance = styled(FlatButton)`
// //     color: ${grey500} !important;
// // `

// const HasFreeTextDeliciousness = styled.div`
//   color: ${grey500};
//   font-size: 12px;
// `

// const RunOutWarning = styled(ListItem)`
//   margin-bottom: 10px !important;
// `

// const MoreInfoRow = styled.div`
//   color: ${grey500};
//   padding-top: 10px;

//   & > svg {
//     vertical-align: middle;
//   }

//   & > span {
//     vertical-align: middle;
//   }
// `

// const ChanceOfSausage = styled(ListItem)`
//   color: ${grey500};
//   padding-top: 0px !important;

//   .sausageChance {
//     color: red;
//   }
// `

const FlexboxContainer = styled.div`
  display: -ms-flex;
  display: -webkit-flex;
  display: flex;
  padding: 10px;
  box-shadow: rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px;
  border-radius: 2px;
  /* background-color: grey; */
`

const FlexboxMainColumn = styled.div`
  width: 75%;
  /* background-color: green; */
`

const FlexboxSecondaryColumn = styled.div`
  width: 25%;
  /* background-color: red; */
`

const PollingPlaceNameAndPremises = styled.div`
  font-weight: 550;
  /* font-size: 16px; */
  text-transform: uppercase;
  margin-bottom: 5px;
`

const PollingPlaceAddress = styled.div`
  font-weight: 400;
  font-size: 14px;
  color: ${grey500};
  text-transform: uppercase;
  margin-bottom: 10px;
`

const StallName = styled.div`
  font-weight: 550;
  /* font-size: 16px; */
  margin-bottom: 10px;
`

const StallDescription = styled.div`
  /* font-weight: 550; */
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 10px;
`

// const StallOpeningHours = styled.div`
//   /* font-weight: 550; */
//   font-size: 14px;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   margin-bottom: 10px;
// `

const StallOpeningHours = styled.div`
  /* color: ${grey500}; */
  /* padding-top: 10px; */
  font-size: 14px;
  margin-bottom: 5px;

  & > svg {
    vertical-align: middle;
  }

  & > span {
    vertical-align: middle;
  }
`

const StallDivisions = styled.div`
  /* font-weight: 550; */
  font-size: 14px;

  & > svg {
    vertical-align: middle;
  }

  & > span {
    vertical-align: middle;
  }
`

const FlexboxIcons = styled.div`
  flex-grow: 1;
  svg {
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 5px;
  }
`

const ExpandMoreIconPanel = styled.div`
  bottom: 0px;
  background-color: ${grey200};
`

interface IProps {
  pollingPlace: IPollingPlace | IPollingPlaceSearchResult
  election: IElection
  copyLinkEnabled: boolean
  onClickCopyLink: any
}

class PollingPlaceCardMini2 extends React.PureComponent<IProps, {}> {
  render() {
    // const { pollingPlace, election, copyLinkEnabled, onClickCopyLink } = this.props
    const { pollingPlace } = this.props

    // const isExpandable: boolean = pollingPlaceHasReportsOfNoms(pollingPlace) === true

    // let title = `${pollingPlace.name}`
    // if (pollingPlace.premises !== null) {
    //   title = `${pollingPlace.name}, ${pollingPlace.premises}`
    // }

    return (
      <FlexboxContainer>
        <FlexboxMainColumn>
          <PollingPlaceNameAndPremises>
            {pollingPlace.name}, {pollingPlace.premises}
          </PollingPlaceNameAndPremises>
          <PollingPlaceAddress>{pollingPlace.address}</PollingPlaceAddress>
          <StallName>{pollingPlace.stall?.name}</StallName>
          <StallDescription>{pollingPlace.stall?.description}</StallDescription>
          {pollingPlace.stall !== null && pollingPlace.stall.opening_hours !== '' && (
            <StallOpeningHours>
              <DeviceAccessTime /> <span>{pollingPlace.stall.opening_hours}</span>
            </StallOpeningHours>
          )}
          {pollingPlace.divisions.length > 0 && (
            <StallDivisions>
              <EditorFormatListBulleted />{' '}
              <span>
                Division{pollingPlace.divisions.length > 1 ? 's' : ''}: {pollingPlace.divisions.join(', ')}
              </span>
            </StallDivisions>
          )}
        </FlexboxMainColumn>
        <FlexboxSecondaryColumn>
          {pollingPlace.stall !== null && (
            <FlexboxIcons>
              {pollingPlace.stall.noms.bbq && <SausageIcon />}
              {pollingPlace.stall.noms.cake && <CakeIcon />}
              {pollingPlace.stall.noms.vego && <VegoIcon />}
              {pollingPlace.stall.noms.nothing && <RedCrossofShameIcon />}
              {pollingPlace.stall.noms.halal && <HalalIcon />}
              {pollingPlace.stall.noms.coffee && <CoffeeIcon />}
              {pollingPlace.stall.noms.bacon_and_eggs && <BaconandEggsIcon />}
            </FlexboxIcons>
          )}
          {hasAnyWheelchairAccess(pollingPlace) === true && (
            <IconButton tooltip={getWheelchairAccessDescription(pollingPlace)}>
              <ActionAccessible />
            </IconButton>
          )}
          <ExpandMoreIconPanel>
            <IconButton>
              <NavigationUnfoldMore />
            </IconButton>
          </ExpandMoreIconPanel>
        </FlexboxSecondaryColumn>
      </FlexboxContainer>
    )

    // return (
    //   <Paper>
    //     <Card>
    //       <CardHeader
    //         title={title}
    //         subtitle={pollingPlace.address}
    //         actAsExpander={isExpandable}
    //         showExpandableButton={isExpandable}
    //       />
    //       {pollingPlace.stall !== null && (
    //         <CardTitle
    //           title={pollingPlace.stall.name}
    //           subtitle={pollingPlace.stall.description}
    //           subtitleStyle={{ whiteSpace: 'pre-wrap' }}
    //         />
    //       )}
    //       <CardText>
    //         <FlexboxContainer>
    //           {pollingPlace.stall !== null && (
    //             <FlexboxIcons>
    //               {pollingPlace.stall.noms.bbq && <SausageIcon />}
    //               {pollingPlace.stall.noms.cake && <CakeIcon />}
    //               {pollingPlace.stall.noms.vego && <VegoIcon />}
    //               {pollingPlace.stall.noms.nothing && <RedCrossofShameIcon />}
    //               {pollingPlace.stall.noms.halal && <HalalIcon />}
    //               {pollingPlace.stall.noms.coffee && <CoffeeIcon />}
    //               {pollingPlace.stall.noms.bacon_and_eggs && <BaconandEggsIcon />}
    //             </FlexboxIcons>
    //           )}
    //           {/* {"distance_km" in pollingPlace && (
    //                             <FlexboxDistance label={`${pollingPlace.distance_km}km`} icon={<MapsNavigation color={grey500} />} />
    //                         )} */}
    //         </FlexboxContainer>
    //         {/* {pollingPlace.stall !== null && pollingPlace.stall.noms.halal === true && (
    //                         <MoreInfoRow style={{ marginBottom: "10px", fontSize: "12px" }}>
    //                             <ActionInfo />{" "}
    //                             <span>
    //                                 Team Democracy Sausage acknowledges that the Federal election falls during Ramadan. Halal options are
    //                                 included here for consistency with other elections.
    //                             </span>
    //                         </MoreInfoRow>
    //                     )} */}
    //         {pollingPlace.stall !== null &&
    //           'free_text' in pollingPlace.stall.noms &&
    //           pollingPlace.stall.noms.free_text !== null && (
    //             <HasFreeTextDeliciousness>Also available: {pollingPlace.stall.noms.free_text}</HasFreeTextDeliciousness>
    //           )}
    //         {pollingPlace.stall !== null && pollingPlace.stall.noms.run_out && (
    //           <RunOutWarning
    //             secondaryText={"We've had reports that the stalls at this polling booth have run out of food."}
    //             secondaryTextLines={2}
    //             leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={yellow600} />}
    //             disabled={true}
    //           />
    //         )}
    //         {isElectionLive(election) && pollingPlaceHasReports(pollingPlace) === false && (
    //           <ChanceOfSausage
    //             primaryText={"We don't have any reports for this booth yet."}
    //             secondaryText={<span>{getSausageChanceDescription(pollingPlace)}</span>}
    //             secondaryTextLines={2}
    //             leftAvatar={<Avatar icon={<ActionHelpOutline />} />}
    //             disabled={true}
    //           />
    //         )}
    //         {pollingPlace.stall !== null && pollingPlace.stall.opening_hours !== '' && (
    //           <MoreInfoRow>
    //             <DeviceAccessTime /> <span>Stall Opening Hours: {pollingPlace.stall.opening_hours}</span>
    //           </MoreInfoRow>
    //         )}
    //         <MoreInfoRow>
    //           <ActionAccessible /> <span>Wheelchair Access: {getWheelchairAccessDescription(pollingPlace)}</span>
    //         </MoreInfoRow>
    //         {pollingPlace.divisions.length > 0 && (
    //           <MoreInfoRow>
    //             <EditorFormatListBulleted />{' '}
    //             <span>
    //               Division{pollingPlace.divisions.length > 1 ? 's' : ''}: {pollingPlace.divisions.join(', ')}
    //             </span>
    //           </MoreInfoRow>
    //         )}
    //         {pollingPlace.stall !== null &&
    //           pollingPlace.stall.extra_info !== null &&
    //           pollingPlace.stall.extra_info.length > 0 && (
    //             <MoreInfoRow>Extra Info: {pollingPlace.stall.extra_info}</MoreInfoRow>
    //           )}
    //         {pollingPlace.booth_info.length > 0 && <MoreInfoRow>Booth Info: {pollingPlace.booth_info}</MoreInfoRow>}
    //       </CardText>
    //       {isExpandable && (
    //         <CardText expandable={isExpandable}>
    //           {pollingPlaceHasReportsOfNoms(pollingPlace) === true &&
    //             `This polling place has ${getFoodDescription(pollingPlace)}.`}
    //         </CardText>
    //       )}
    //       {copyLinkEnabled === true && (
    //         <CardActions>
    //           <FlatButton label="Copy Link" icon={<ContentContentCopy />} secondary={true} onClick={onClickCopyLink} />
    //         </CardActions>
    //       )}
    //     </Card>
    //   </Paper>
    // )
  }
}

export default PollingPlaceCardMini2
