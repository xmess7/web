import React, { Component, createContext } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { Card, CardBody, CardFooter, Button,  ListGroup, ListGroupItem, Alert } from 'shards-react';
import { HashRouter as Router, Link, Switch} from 'react-router-dom';

import { BoldBlackLink } from '../components/common/Link.jsx';
import { SecondaryButton } from '../components/common/Buttons.jsx';

import { gql } from 'apollo-boost';
import gqlClient from '../utils/graphql.js';
import jwt_decode from 'jwt-decode';

import {  ProtectedRoute, AuthConsumer } from '../layers/AuthLayer.jsx';

import PageStyle from '../styles/pages/Dashboard.less';

import Analytics from '../components/dashboard/Analytics.jsx';
import Counter from '../components/dashboard/Counter.jsx';
import Mine from '../components/dashboard/Mine.jsx';
import Gameroom from '../components/dashboard/Gameroom.jsx';
import Gravatar from 'react-gravatar'

const minerContext = createContext();

class DashboardPage extends Component {

  constructor(props) {
    super(props);
    this.state ={
      minerId: null,
      error: null,
      miner: {
        id: null,
        email: null,
        name: null,
        email: null,
        myriade_credits: [],
        myriade_credits_balance: null,
        shares: [],
        historical_hashrates: [],
        average_hashrate: "0",
        monero_balance: null
      }
    }
    this.dismissError = this.dismissError.bind(this);
  }

  dismissError(){
    this.setState({error: null});
  }

  displayError() {
    return (
      <Alert theme="danger" dismissible={this.dismissError}>
        {this.state.error}
      </Alert>
    )
  }

  componentDidMount() {
    let minerId = jwt_decode(localStorage.getItem('access_token')).sub; 
    let minerData = {}; 
    return gqlClient.query({
      query: gql`
        query ($minerId: ID!, $hashratePage: Int) {
          minerData(id: $minerId) {
            id,
            myriade_credits {
              credit,
              time
            },
            monero_balance,
            hashrates(page: $hashratePage) {
              rate,
              time
            }
          }
        }
      `,
      variables: {
        minerId: minerId,
        hashratePage: 1,
      }

    }).then(({data}) => {

      minerData = data.minerData;
      const mc = 0 < minerData.myriade_credits.length ? minerData.myriade_credits[0] : '0';
      const accountData = jwt_decode(localStorage.getItem('access_token')).account;
      return this.setState({
        minerId: minerId,
        miner: {
          name: accountData.name,
          email: accountData.email,
          myriade_credits_balance: mc,
          myriade_credits: minerData.myriade_credits,
          monero_balance: minerData.monero_balance,
          hashrates: minerData.hashrates,
          average_hashrate: 0,
          shares: [],
        }
      })
    }).catch(err => {
      return this.setState({
        error: 'Unable to fetch your data, please check your connection, your login and try again later'
      });
    })
    
  }

  render() {
    return (
      
      <AuthConsumer>
        {({authenticated, logout}) => (
          <minerContext.Provider value={this.state.miner}>
            <Row>
              {this.state.error && this.displayError()}
              <Col md={{span: 3}}>
                <Card className={PageStyle.sidebar}>
                  <CardBody>
                    <Gravatar className={PageStyle.gravatar} size={200} email={this.state.miner.email} />
                    <br/>
                    <h3>{this.state.miner.name}</h3>
                    <p>{this.state.miner.email}</p>
                    <p><strong>Mining Credits: {this.state.miner.myriade_credits_balance}</strong></p>
                    <p>Monero Balance: {this.state.miner.monero_balance}</p>
                    <hr/>
                    <ListGroup>

                      <BoldBlackLink to={`${this.props.match.path}/`} > Mining Metrics </BoldBlackLink>
                      <BoldBlackLink to={`${this.props.match.path}/mining`} > Start Mining </BoldBlackLink>
                      {/* <BoldBlackLink to={`${this.props.match.path}/gameroom`} > Game Room </BoldBlackLink> */}
                    </ListGroup>
                    
                  </CardBody>
                  <CardFooter className={PageStyle.sidebarFooter} onClick={logout}>
                    <SecondaryButton pill outline>Logout</SecondaryButton>
                  </CardFooter>

                </Card>
              </Col>
              <Col md={{span: 9}}>
                  
                <Switch>
                  <ProtectedRoute exact path={`${this.props.match.path}/`} component={Analytics} authenticated={authenticated} />
                  <ProtectedRoute path={`${this.props.match.url}/mining`} component={Mine} authenticated={authenticated} />
                  {/* <ProtectedRoute path={`${this.props.match.url}/gameroom`} component={Gameroom} authenticated={authenticated} /> */}
                </Switch>
              </Col>
            </Row>
          </minerContext.Provider>
        )}
      </AuthConsumer>
    )
  }
}

export const MinerConsumer = minerContext.Consumer;

export default DashboardPage;
