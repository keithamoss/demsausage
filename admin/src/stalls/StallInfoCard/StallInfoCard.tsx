import { diff } from 'deep-object-diff'
import { pick } from 'lodash-es'
import { Avatar } from 'material-ui'
// import "./StallInfoCard.css"
import { Card, CardHeader, CardText } from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import { List, ListItem } from 'material-ui/List'
import { blue100, grey500, lightGreen100 } from 'material-ui/styles/colors'
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
import { getStallLocationAddress, getStallLocationName, IPendingStall } from '../../redux/modules/stalls'

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

const getWhatChanged = (stall: IPendingStall) => {
  if (stall.current_stall === null) {
    return null
  }

  return diff(
    pick(stall, ['name', 'description', 'opening_hours', 'website', 'noms']),
    pick(stall.current_stall, ['name', 'description', 'opening_hours', 'website', 'noms'])
  )
}

class StallInfoCard extends React.PureComponent<IProps, {}> {
  render() {
    const { stall, cardActions } = this.props

    const whatChanged = getWhatChanged(stall)
    const whatChangedFields = whatChanged !== null ? Object.keys(whatChanged) : []

    const getFieldStyle = (fieldName: string) =>
      whatChangedFields.includes(fieldName) ? { backgroundColor: lightGreen100 } : undefined

    const getFieldStyleForPreviousValue = (fieldName: string) =>
      whatChangedFields.includes(fieldName) ? { backgroundColor: blue100 } : undefined

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
            {whatChangedFields.includes('name') && (
              <ListItem
                primaryText="Name (was previously)"
                secondaryText={stall.current_stall?.name}
                leftIcon={<ActionLabel />}
                disabled={true}
                style={getFieldStyleForPreviousValue('name')}
              />
            )}
            <ListItemWithBigSecondaryText
              primaryText="Description"
              secondaryText={stall.description}
              secondaryTextLines={3}
              leftIcon={<ActionDescription />}
              disabled={true}
              style={getFieldStyle('description')}
            />
            {whatChangedFields.includes('description') && (
              <ListItem
                primaryText="Description (was previously)"
                secondaryText={stall.current_stall?.description}
                secondaryTextLines={3}
                leftIcon={<ActionDescription />}
                disabled={true}
                style={getFieldStyleForPreviousValue('description')}
              />
            )}
            <ListItem
              primaryText="Opening hours"
              secondaryText={stall.opening_hours}
              leftIcon={<DeviceAccessTime />}
              disabled={true}
              style={getFieldStyle('opening_hours')}
            />
            {whatChangedFields.includes('opening_hours') && (
              <ListItem
                primaryText="Opening hours (was previously)"
                secondaryText={stall.current_stall?.opening_hours}
                leftIcon={<DeviceAccessTime />}
                disabled={true}
                style={getFieldStyleForPreviousValue('opening_hours')}
              />
            )}
            <ListItem
              primaryText="Website"
              secondaryText={stall.website}
              leftIcon={<AvWeb />}
              disabled={true}
              style={getFieldStyle('website')}
            />
            {whatChangedFields.includes('website') && (
              <ListItem
                primaryText="Website (was previously)"
                secondaryText={stall.current_stall?.website}
                leftIcon={<AvWeb />}
                disabled={true}
                style={getFieldStyleForPreviousValue('website')}
              />
            )}
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
          <List>
            {whatChangedFields.includes('noms') && (
              <ListItem leftIcon={<MapsLocalDining />} disabled={true} style={getFieldStyleForPreviousValue('noms')}>
                <div>Deliciousness (was previously)</div>
                {stall.current_stall?.noms.bbq && (
                  <IconButton tooltip="Sausage Sizzle" touch={true}>
                    <SausageIcon />
                  </IconButton>
                )}

                {stall.current_stall?.noms.cake && (
                  <IconButton tooltip="Cake Stall" touch={true}>
                    <CakeIcon />
                  </IconButton>
                )}

                {stall.current_stall?.noms.vego && (
                  <IconButton tooltip="Savoury Vegetarian Options" touch={true}>
                    <VegoIcon />
                  </IconButton>
                )}

                {stall.current_stall?.noms.halal && (
                  <IconButton tooltip="Halal Options" touch={true}>
                    <HalalIcon />
                  </IconButton>
                )}

                {stall.current_stall?.noms.coffee && (
                  <IconButton tooltip="Coffee" touch={true}>
                    <CoffeeIcon />
                  </IconButton>
                )}

                {stall.current_stall?.noms.bacon_and_eggs && (
                  <IconButton tooltip="Bacon and Eggs" touch={true}>
                    <BaconandEggsIcon />
                  </IconButton>
                )}
                {stall.current_stall?.noms !== undefined && 'free_text' in stall.current_stall?.noms && (
                  <HasFreeTextDeliciousness>Also has: {stall.current_stall?.noms.free_text}</HasFreeTextDeliciousness>
                )}
              </ListItem>
            )}
          </List>
        </CardText>
        {cardActions}
      </Card>
    )
  }
}

export default StallInfoCard
