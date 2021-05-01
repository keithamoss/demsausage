import { Avatar } from 'material-ui'
// import "./StallInfoCard.css"
import { Card, CardHeader, CardText } from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import { List, ListItem } from 'material-ui/List'
import { grey500, lightBlue100 } from 'material-ui/styles/colors'
import {
  ActionDescription,
  ActionHome,
  ActionLabel,
  AvWeb,
  CommunicationEmail,
  DeviceAccessTime,
  MapsLocalDining,
  MapsPlace,
} from 'material-ui/svg-icons'
import * as React from 'react'
import styled from 'styled-components'
import BaconandEggsIcon from '../../icons/bacon-and-eggs'
import CakeIcon from '../../icons/cake'
import CoffeeIcon from '../../icons/coffee'
import HalalIcon from '../../icons/halal'
import SausageIcon from '../../icons/sausage'
import VegoIcon from '../../icons/vego'
import { getStallLocationAddress, getStallLocationName, IPendingStall, IStallDiff } from '../../redux/modules/stalls'

interface IProps {
  stall: IPendingStall
  cardActions?: any
}

const ListItemWithBigSecondaryText = styled(ListItem)`
  & div:last-child {
    height: auto !important;
    white-space: normal !important;
  }
`

const HasFreeTextDeliciousness = styled.div`
  color: ${grey500};
  font-size: 12px;
`

class StallInfoCard extends React.PureComponent<IProps, {}> {
  render() {
    const { stall, cardActions } = this.props

    let changedFields: string[] = []
    if (stall.diff !== null) {
      changedFields = stall.diff.map((d: IStallDiff) => d.field)
    }

    const getFieldStyle = (fieldName: string) =>
      changedFields.includes(fieldName) ? { backgroundColor: lightBlue100 } : undefined

    return (
      <Card>
        <CardHeader title={stall.name} subtitle={stall.description} avatar={<Avatar icon={<ActionHome />} />} />
        <CardText style={{ paddingTop: 0, paddingBottom: 0 }}>
          <List style={{ paddingTop: 0, paddingBottom: 0 }}>
            <ListItem
              primaryText="Polling Place"
              secondaryText={getStallLocationName(stall)}
              leftIcon={<MapsPlace />}
              disabled={true}
            />
            <ListItem
              primaryText="Address"
              secondaryText={getStallLocationAddress(stall)}
              leftIcon={<MapsPlace />}
              disabled={true}
            />
            <ListItem
              primaryText="Name"
              secondaryText={stall.name}
              leftIcon={<ActionLabel />}
              disabled={true}
              style={getFieldStyle('name')}
            />
            <ListItemWithBigSecondaryText
              primaryText="Description"
              secondaryText={stall.description}
              leftIcon={<ActionDescription />}
              disabled={true}
              style={getFieldStyle('description')}
            />
            <ListItem
              primaryText="Opening hours"
              secondaryText={stall.opening_hours}
              leftIcon={<DeviceAccessTime />}
              disabled={true}
              style={getFieldStyle('opening_hours')}
            />
            <ListItem
              primaryText="Website"
              secondaryText={stall.website}
              leftIcon={<AvWeb />}
              disabled={true}
              style={getFieldStyle('website')}
            />
            <ListItem
              primaryText="Email"
              secondaryText={stall.email}
              leftIcon={<CommunicationEmail />}
              disabled={true}
              style={getFieldStyle('email')}
            />
            <ListItem leftIcon={<MapsLocalDining />} disabled={true} style={getFieldStyle('noms')}>
              <div>Deliciousness</div>
              {stall.noms.bbq && (
                <IconButton tooltip="Sausage Sizzle" touch={true}>
                  <SausageIcon />
                </IconButton>
              )}

              {stall.noms.cake && (
                <IconButton tooltip="Cake Stall" touch={true}>
                  <CakeIcon />
                </IconButton>
              )}

              {stall.noms.vego && (
                <IconButton tooltip="Savoury Vegetarian Options" touch={true}>
                  <VegoIcon />
                </IconButton>
              )}

              {stall.noms.halal && (
                <IconButton tooltip="Halal Options" touch={true}>
                  <HalalIcon />
                </IconButton>
              )}

              {stall.noms.coffee && (
                <IconButton tooltip="Coffee" touch={true}>
                  <CoffeeIcon />
                </IconButton>
              )}

              {stall.noms.bacon_and_eggs && (
                <IconButton tooltip="Bacon and Eggs" touch={true}>
                  <BaconandEggsIcon />
                </IconButton>
              )}
              {'free_text' in stall.noms && (
                <HasFreeTextDeliciousness>Also has: {stall.noms.free_text}</HasFreeTextDeliciousness>
              )}
            </ListItem>
          </List>
        </CardText>
        {cardActions}
      </Card>
    )
  }
}

export default StallInfoCard
