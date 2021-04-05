import { FlatButton } from "material-ui";
import Avatar from "material-ui/Avatar";
import {
  Card,
  CardActions,
  CardHeader,
  CardText,
  CardTitle,
} from "material-ui/Card";
import { ListItem } from "material-ui/List";
import Paper from "material-ui/Paper";
import { grey500, yellow600 } from "material-ui/styles/colors";
import {
  ActionAccessible,
  ActionHelpOutline,
  AlertWarning,
  ContentContentCopy,
  DeviceAccessTime,
  EditorFormatListBulleted,
} from "material-ui/svg-icons";
import * as React from "react";
import styled from "styled-components";
import BaconandEggsIcon from "../../icons/bacon-and-eggs";
import CakeIcon from "../../icons/cake";
import CoffeeIcon from "../../icons/coffee";
import HalalIcon from "../../icons/halal";
import RedCrossofShameIcon from "../../icons/red-cross-of-shame";
import SausageIcon from "../../icons/sausage";
import VegoIcon from "../../icons/vego";
import { IElection, isElectionLive } from "../../redux/modules/elections";
import {
  getFoodDescription,
  getSausageChanceDescription,
  getWheelchairAccessDescription,
  IPollingPlace,
  IPollingPlaceSearchResult,
  pollingPlaceHasReports,
  pollingPlaceHasReportsOfNoms,
} from "../../redux/modules/polling_places";

const FlexboxContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;

const FlexboxIcons = styled.div`
  flex-grow: 1;
  svg {
    padding-left: 5px;
    padding-right: 5px;
  }
`;

// const FlexboxDistance = styled(FlatButton)`
//     color: ${grey500} !important;
// `

const HasFreeTextDeliciousness = styled.div`
  color: ${grey500};
  font-size: 12px;
`;

const RunOutWarning = styled(ListItem)`
  margin-bottom: 10px !important;
`;

const MoreInfoRow = styled.div`
  color: ${grey500};
  padding-top: 10px;

  & > svg {
    vertical-align: middle;
  }

  & > span {
    vertical-align: middle;
  }
`;

const ChanceOfSausage = styled(ListItem)`
  color: ${grey500};
  padding-top: 0px !important;

  .sausageChance {
    color: red;
  }
`;

interface IProps {
  pollingPlace: IPollingPlace | IPollingPlaceSearchResult;
  election: IElection;
  copyLinkEnabled: boolean;
  onClickCopyLink: any;
}

class PollingPlaceCardMini extends React.PureComponent<IProps, {}> {
  render() {
    const {
      pollingPlace,
      election,
      copyLinkEnabled,
      onClickCopyLink,
    } = this.props;

    const isExpandable: boolean =
      pollingPlaceHasReportsOfNoms(pollingPlace) === true ? true : false;

    let title = `${pollingPlace.name}`;
    if (pollingPlace.premises !== null) {
      title = `${pollingPlace.name}, ${pollingPlace.premises}`;
    }

    return (
      <Paper>
        <Card>
          <CardHeader
            title={title}
            subtitle={pollingPlace.address}
            actAsExpander={isExpandable}
            showExpandableButton={isExpandable}
          />
          {pollingPlace.stall !== null && (
            <CardTitle
              title={pollingPlace.stall.name}
              subtitle={pollingPlace.stall.description}
              subtitleStyle={{ whiteSpace: "pre-wrap" }}
            />
          )}
          <CardText>
            <FlexboxContainer>
              {pollingPlace.stall !== null && (
                <FlexboxIcons>
                  {pollingPlace.stall.noms.bbq && <SausageIcon />}
                  {pollingPlace.stall.noms.cake && <CakeIcon />}
                  {pollingPlace.stall.noms.vego && <VegoIcon />}
                  {pollingPlace.stall.noms.nothing && <RedCrossofShameIcon />}
                  {pollingPlace.stall.noms.halal && <HalalIcon />}
                  {pollingPlace.stall.noms.coffee && <CoffeeIcon />}
                  {pollingPlace.stall.noms.bacon_and_eggs && (
                    <BaconandEggsIcon />
                  )}
                </FlexboxIcons>
              )}
              {/* {"distance_km" in pollingPlace && (
                                <FlexboxDistance label={`${pollingPlace.distance_km}km`} icon={<MapsNavigation color={grey500} />} />
                            )} */}
            </FlexboxContainer>
            {/* {pollingPlace.stall !== null && pollingPlace.stall.noms.halal === true && (
                            <MoreInfoRow style={{ marginBottom: "10px", fontSize: "12px" }}>
                                <ActionInfo />{" "}
                                <span>
                                    Team Democracy Sausage acknowledges that the Federal election falls during Ramadan. Halal options are
                                    included here for consistency with other elections.
                                </span>
                            </MoreInfoRow>
                        )} */}
            {pollingPlace.stall !== null &&
              "free_text" in pollingPlace.stall.noms &&
              pollingPlace.stall.noms.free_text !== null && (
                <HasFreeTextDeliciousness>
                  Also available: {pollingPlace.stall.noms.free_text}
                </HasFreeTextDeliciousness>
              )}
            {pollingPlace.stall !== null && pollingPlace.stall.noms.run_out && (
              <RunOutWarning
                secondaryText={
                  "We've had reports that the stalls at this polling booth have run out of food."
                }
                secondaryTextLines={2}
                leftAvatar={
                  <Avatar icon={<AlertWarning />} backgroundColor={yellow600} />
                }
                disabled={true}
              />
            )}
            {isElectionLive(election) &&
              pollingPlaceHasReports(pollingPlace) === false && (
                <ChanceOfSausage
                  primaryText={"We don't have any reports for this booth yet."}
                  secondaryText={
                    <span>{getSausageChanceDescription(pollingPlace)}</span>
                  }
                  secondaryTextLines={2}
                  leftAvatar={<Avatar icon={<ActionHelpOutline />} />}
                  disabled={true}
                />
              )}
            {pollingPlace.stall !== null &&
              pollingPlace.stall.opening_hours !== "" && (
                <MoreInfoRow>
                  <DeviceAccessTime />{" "}
                  <span>
                    Stall Opening Hours: {pollingPlace.stall.opening_hours}
                  </span>
                </MoreInfoRow>
              )}
            <MoreInfoRow>
              <ActionAccessible />{" "}
              <span>
                Wheelchair Access:{" "}
                {getWheelchairAccessDescription(pollingPlace)}
              </span>
            </MoreInfoRow>
            {pollingPlace.divisions.length > 0 && (
              <MoreInfoRow>
                <EditorFormatListBulleted />{" "}
                <span>
                  Division{pollingPlace.divisions.length > 1 ? "s" : ""}:{" "}
                  {pollingPlace.divisions.join(", ")}
                </span>
              </MoreInfoRow>
            )}
            {pollingPlace.stall !== null &&
              pollingPlace.stall.extra_info !== null &&
              pollingPlace.stall.extra_info.length > 0 && (
                <MoreInfoRow>
                  Extra Info: {pollingPlace.stall.extra_info}
                </MoreInfoRow>
              )}
            {pollingPlace.booth_info.length > 0 && (
              <MoreInfoRow>Booth Info: {pollingPlace.booth_info}</MoreInfoRow>
            )}
          </CardText>
          {isExpandable && (
            <CardText expandable={isExpandable}>
              {pollingPlaceHasReportsOfNoms(pollingPlace) === true &&
                `This polling place has ${getFoodDescription(pollingPlace)}.`}
            </CardText>
          )}
          {copyLinkEnabled === true && (
            <CardActions>
              <FlatButton
                label="Copy Link"
                icon={<ContentContentCopy />}
                secondary={true}
                onClick={onClickCopyLink}
              />
            </CardActions>
          )}
        </Card>
      </Paper>
    );
  }
}

export default PollingPlaceCardMini;
