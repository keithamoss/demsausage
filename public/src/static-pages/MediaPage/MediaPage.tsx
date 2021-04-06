import { List, ListItem } from 'material-ui/List'
import { CommunicationEmail, FileFileDownload } from 'material-ui/svg-icons'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { IStore } from '../../redux/modules/reducer'

interface IProps {}

interface IDispatchProps {}

interface IStoreProps {}

interface IStateProps {}

const PageWrapper = styled.div`
  padding-left: 15px;
  padding-right: 15px;
`

type TComponentProps = IProps & IStoreProps & IDispatchProps
class MediaPage extends React.Component<TComponentProps, IStateProps> {
  componentDidMount() {
    document.title = 'Democracy Sausage | Media'
  }

  render() {
    return (
      <PageWrapper>
        <h2>Media</h2>
        Do you love sausage? We do!
        <List>
          <ListItem
            primaryText="Media Contact"
            secondaryText="ausdemocracysausage@gmail.com"
            secondaryTextLines={2}
            leftIcon={<CommunicationEmail />}
            disabled={true}
          />

          <h3>Media Releases</h3>
          <ListItem
            primaryText="WA Election 2021 - March 13th"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href="/media/2021%20WA%20Media%20Release%20-%206%20Mar.pdf" />
            }
          />
          <ListItem
            primaryText="ACT & QLD Elections 2020 - October 11th"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href="/media/2020%20ACT%20%2B%20Qld%20-%20Media%20Release%20-%2011%20Oct.pdf" />
            }
          />
          <ListItem
            primaryText="NT Election 2020 - August 22nd"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href={'/media/2020%20NT%20-%20Media%20Release.pdf'} />
            }
          />
          <ListItem
            primaryText="Federal Election 2019 - May 17th"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href="/media/2019%20Federal%20Election%20Media%20Release%20-%2017%20May.pdf" />
            }
          />
          <ListItem
            primaryText="Federal Election 2019 - April 13th"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href={'/media/2019%20Fed%20-%20Media%20Release.pdf'} />
            }
          />
          <ListItem
            primaryText="Federal Election 2016"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href="/media/Democracy%20Sausage%20-%202016%20Federal%20Election%20Release.pdf" />
            }
          />
          <ListItem
            primaryText="Canning By-election"
            leftIcon={<FileFileDownload />}
            containerElement={
              // eslint-disable-next-line
              <a href="/media/Canning%20Press%20Release%20-%20DemSausage.pdf" />
            }
          />
        </List>
      </PageWrapper>
    )
  }
}

const mapStateToProps = (_state: IStore): IStoreProps => {
  return {}
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(MediaPage)
