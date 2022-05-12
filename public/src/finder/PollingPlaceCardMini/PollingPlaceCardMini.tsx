import { Avatar, FlatButton } from 'material-ui'
import { grey500, yellow600 } from 'material-ui/styles/colors'
import {
  ActionAccessible,
  ActionHelp,
  ActionInfoOutline,
  AlertWarning,
  DeviceAccessTime,
  EditorFormatListBulleted,
  MapsRestaurant,
  PlacesCasino,
  SocialPublic,
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
import { IElection, isElectionLive } from '../../redux/modules/elections'
import {
  getFoodDescription,
  getSausageChancColourIndicator,
  getSausageChanceDescription,
  getWheelchairAccessDescription,
  hasAnyWheelchairAccess,
  IPollingPlace,
  IPollingPlaceSearchResult,
  pollingPlaceHasReports,
  pollingPlaceHasReportsOfNoms,
} from '../../redux/modules/polling_places'

const FlexboxContainer = styled.div`
  display: -ms-flex;
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px;
  box-shadow: rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px;
  border-radius: 2px;
`

const CardRow = styled.div`
  width: 100%;
`

const FlexboxColumnContainer = styled.div`
  display: -ms-flex;
  display: -webkit-flex;
  display: flex;
  align-items: center;
`

const AvatarIconContainer = styled.div`
  width: 13%;
  min-width: 30px;
  max-width: 40px;
  margin-bottom: 7px;
`

const NoReportsAvatar = styled(Avatar)`
  background-color: ${grey500} !important;
`

const NoReportsText = styled.div`
  width: 87%;
  margin-bottom: 7px;
  font-size: 14px;
  color: ${grey500};
  display: inline-block;

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

const PollingPlaceNameAndPremises = styled.div`
  font-weight: 550;
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
  margin-bottom: 10px;
`

const StallDescriptionTruncated = styled.div`
  font-size: 14px;
  margin-bottom: 5px;

  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  white-space: normal;
`

const StallDescriptionFull = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
`

const ChanceOfSausageText = styled.div`
  width: 87%;
  margin-bottom: 7px;
  font-size: 14px;
`

const StallIconAndTextRow = styled.div`
  font-size: 14px;
  margin-bottom: 7px;

  & > svg {
    vertical-align: middle;
    margin-right: 5px;
  }

  & > span {
    vertical-align: middle;
  }
`

const StallWheelchairAccessIcon = styled.div`
  width: 25%;
  max-width: 55px;
`

const StallOpeningHours = styled.div`
  width: 75%;
  font-size: 14px;
  margin-bottom: 0px;
  display: inline-block;

  & > svg {
    vertical-align: middle;
  }

  & > span {
    vertical-align: middle;
  }
`

const ButtonContainerCentred = styled.div`
  margin: auto 0 auto auto;
`

const ButtonAndIconContainerLeftAligned = styled.div`
  margin: auto 0 5px auto;

  & svg {
    margin-left: 0px !important;
  }
`

interface IProps {
  pollingPlace: IPollingPlace | IPollingPlaceSearchResult
  election: IElection
  showFullCardDefault: boolean
  showMoreLessButton: boolean
  onClickCopyLink: any
}

export default function PollingPlaceCardMini(props: IProps) {
  const { pollingPlace, election, showFullCardDefault, showMoreLessButton, onClickCopyLink } = props

  const [showFullCard, setShowFullCard] = React.useState<boolean>(showFullCardDefault)

  const onClickCardButton = () => setShowFullCard(!showFullCard)

  const nomsList = []
  const nomsDescription = getFoodDescription(pollingPlace)
  if (nomsDescription !== '') {
    nomsList.push(nomsDescription)
  }
  if (
    pollingPlace.stall !== null &&
    'free_text' in pollingPlace.stall.noms &&
    pollingPlace.stall.noms.free_text !== null
  ) {
    nomsList.push(pollingPlace.stall?.noms.free_text)
  }

  return (
    <FlexboxContainer>
      <CardRow>
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
        {isElectionLive(election) && pollingPlaceHasReports(pollingPlace) === false && (
          <FlexboxColumnContainer>
            <AvatarIconContainer>
              <NoReportsAvatar icon={<ActionHelp />} size={30} />
            </AvatarIconContainer>
            <NoReportsText>There are no reports for this booth yet</NoReportsText>
          </FlexboxColumnContainer>
        )}
      </CardRow>

      <CardRow>
        <PollingPlaceNameAndPremises>
          {pollingPlace.premises !== null ? `${pollingPlace.name}, ${pollingPlace.premises}` : pollingPlace.name}
        </PollingPlaceNameAndPremises>

        <PollingPlaceAddress>{pollingPlace.address}</PollingPlaceAddress>

        {pollingPlace.stall !== null && pollingPlace.stall.noms.run_out === true && (
          <FlexboxColumnContainer>
            <AvatarIconContainer>
              <Avatar icon={<AlertWarning />} size={30} backgroundColor={yellow600} />
            </AvatarIconContainer>
            <ChanceOfSausageText>
              We&apos;ve had reports that the stalls at this polling booth have run out of food!
            </ChanceOfSausageText>
          </FlexboxColumnContainer>
        )}

        {pollingPlace.stall !== null && showFullCard === false && (
          <React.Fragment>
            <StallName>{pollingPlace.stall?.name}</StallName>
            <StallDescriptionTruncated>{pollingPlace.stall?.description}</StallDescriptionTruncated>
          </React.Fragment>
        )}

        {pollingPlace.stall !== null && showFullCard === true && (
          <React.Fragment>
            <StallName>{pollingPlace.stall?.name}</StallName>
            <StallDescriptionFull>{pollingPlace.stall?.description}</StallDescriptionFull>
          </React.Fragment>
        )}

        {pollingPlace.stall !== null && pollingPlace.stall.website !== '' && (
          <ButtonAndIconContainerLeftAligned>
            <FlatButton
              href={pollingPlace.stall.website}
              target="_blank"
              // rel="noreferrer"
              label="Go to this stall's website"
              secondary={true}
              icon={<SocialPublic />}
            />
          </ButtonAndIconContainerLeftAligned>
        )}

        {isElectionLive(election) && pollingPlaceHasReports(pollingPlace) === false && (
          <FlexboxColumnContainer>
            <AvatarIconContainer>
              <Avatar
                icon={<PlacesCasino />}
                size={30}
                backgroundColor={getSausageChancColourIndicator(pollingPlace)}
              />
            </AvatarIconContainer>
            <ChanceOfSausageText>{getSausageChanceDescription(pollingPlace)}</ChanceOfSausageText>
          </FlexboxColumnContainer>
        )}

        {pollingPlaceHasReportsOfNoms(pollingPlace) === true && showFullCard === true && (
          <StallIconAndTextRow>
            <MapsRestaurant /> <span>{nomsList.join(', ')}</span>
          </StallIconAndTextRow>
        )}

        {showFullCard === true &&
          pollingPlace.stall !== null &&
          pollingPlace.stall.extra_info !== null &&
          pollingPlace.stall.extra_info.length > 0 && (
            <StallIconAndTextRow>
              <ActionInfoOutline /> <span>{pollingPlace.stall.extra_info}</span>
            </StallIconAndTextRow>
          )}

        {hasAnyWheelchairAccess(pollingPlace) === true && showFullCard === true && (
          <StallIconAndTextRow>
            <ActionAccessible /> <span>Wheelchair Access: {getWheelchairAccessDescription(pollingPlace)}</span>
          </StallIconAndTextRow>
        )}

        {pollingPlace.divisions.length > 0 && showFullCard === true && (
          <StallIconAndTextRow>
            <EditorFormatListBulleted />{' '}
            <span>
              Division{pollingPlace.divisions.length > 1 ? 's' : ''}: {pollingPlace.divisions.join(', ')}
            </span>
          </StallIconAndTextRow>
        )}

        {pollingPlace.stall !== null && pollingPlace.stall.opening_hours !== '' && showFullCard === true && (
          <StallIconAndTextRow>
            <DeviceAccessTime /> <span>{pollingPlace.stall.opening_hours}</span>
          </StallIconAndTextRow>
        )}

        {showFullCard === true && pollingPlace.booth_info.length > 0 && (
          <StallIconAndTextRow>
            <ActionInfoOutline /> <span>{pollingPlace.booth_info}</span>
          </StallIconAndTextRow>
        )}

        {showFullCard === false && (
          <FlexboxColumnContainer>
            {hasAnyWheelchairAccess(pollingPlace) === true && (
              <StallWheelchairAccessIcon>
                <ActionAccessible />
              </StallWheelchairAccessIcon>
            )}

            {pollingPlace.stall !== null && pollingPlace.stall.opening_hours !== '' && (
              <StallOpeningHours>
                <DeviceAccessTime /> <span>{pollingPlace.stall.opening_hours}</span>
              </StallOpeningHours>
            )}

            {showMoreLessButton === true && (
              <ButtonContainerCentred>
                <FlatButton label="More" primary={true} onClick={onClickCardButton} />
              </ButtonContainerCentred>
            )}
          </FlexboxColumnContainer>
        )}

        {showFullCard === true && (
          <FlexboxColumnContainer>
            <ButtonContainerCentred>
              <FlatButton label="Copy Link" primary={true} onClick={onClickCopyLink} />

              {showMoreLessButton === true && <FlatButton label="Hide" primary={true} onClick={onClickCardButton} />}
            </ButtonContainerCentred>
          </FlexboxColumnContainer>
        )}
      </CardRow>
    </FlexboxContainer>
  )
}
