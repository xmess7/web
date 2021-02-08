import React, { Component } from 'react';
import axios from 'axios';
import config from '../../../utils/config.js';
import moment from 'moment';

import {
  Modal,
  Button,
  InputGroup,
  FormControl,
  Row,
  Col,
  Table,
  Card,
  CardColumns,
  Badge,
  ProgressBar,
} from 'react-bootstrap';
import { Container, Alert } from 'shards-react';

import Style from '../../../styles/components/dashboard/Gameroom.less';
import { MinerConsumer } from '../../../pages/Dashboard.jsx';
// import { gqlRaffles } from '../../../utils/graphql.js'

// import * as tempData from './api.json'

// import { gql } from 'apollo-boost'
import { formatMoney } from 'accounting-js';

//TODO: Connect with endpoint
const EXPIRYTHRESHOLD = 1000 * 60 * 60 * 24 * 30; // The theshold at which any raffle x miliseconds in the future is considered to not have an expiry
// const raffle = tempData.raffles
// const purchasedTickets = tempData.miner.raffles

class Raffle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      setModalShow: false,
      drawOption: 0,
      tickets: 1,
      purchasedTickets: [],
      countdownString: [],
      raffle: null,
      error: null,
      USD: 121.36,
      success: null,
    };

    this.getEvent = this.getEvent.bind(this);
    this.validateRaffle = this.validateRaffle.bind(this);
  }

  displaySuccess() {
    return (
      <Alert
        theme="success"
        dismissible={() => this.setState({ success: null })}
      >
        {this.state.success}
      </Alert>
    );
  }

  componentDidMount() {
    axios
      .get(`${config.miner_metrics_url}/v1/eventContent/active`)
      .then((response) => {
        this.setState({ raffle: response.data });

        axios
          .get(`${config.miner_metrics_url}/v1/credits/allEvents`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          })
          .then((response) => {
            this.setState({
              purchasedTickets: response.data.map((ticket) => {
                const event = this.getEvent(ticket.contentId);

                ticket.title = event.public.title;
                ticket.tickets = ticket.amount / event.public.entryPrice;
                ticket.amount = event.public.prizeAmount;
                ticket.purchased = new Date(ticket.eventTime).getTime() / 1000;
                ticket.eventTime = event.public.expiry;

                return ticket;
              }),
            });
          })
          .catch((error) => {
            console.error('There was an error!', error);
            return this.setState({
              error:
                'Unable to fetch your data, please check your connection, your login and try again later',
            });
          });
      })
      .catch((error) => {
        console.error('There was an error!', error);
        return this.setState({
          error:
            'Unable to fetch your data, please check your connection, your login and try again later',
        });
      });

    axios
      .get(`https://min-api.cryptocompare.com/data/price?fsym=XMR&tsyms=USD`)
      .then((response) => {
        this.setState(response.data);
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });

    this.countdownTimer = setInterval(() => this.countdown(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.countdownTimer);
  }

  getEvent(contentId) {
    return this.state.raffle.find((raffle) => raffle.id === contentId);
  }

  appendPurchase(raffle) {
    const purchase = {
      id: 1,
      title: raffle.public.title,
      tickets: this.state.tickets,
      amount: raffle.public.prizeAmount,
      lockType: 10,
      eventTime: raffle.public.expiry,
      contentId: raffle.id,
      status: 1,
      purchased: new Date().getTime() / 1000,
    };

    const purchasedTickets = this.state.purchasedTickets.slice();
    purchasedTickets.push(purchase);
    this.setState({ purchasedTickets });
  }

  handleClose = (purchase, miner) => {
    this.setState({ modalShow: false });
    let component = this;
    // Buy a raffle ticket if purchase = true
    if (purchase) {
      const raffle = this.state.raffle[this.state.drawOption];

      const options = {
        method: 'post',
        url: `${config.miner_metrics_url}/v1/credits/buy`,
        data: {
          amount: Number(this.state.tickets) * raffle.public.entryPrice,
          contentId: raffle.id,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      };

      axios(options)
        .then((response) => {
          if (response.status == 200) {
            miner.myriade_credits_balance -= options.data.amount;
            miner.refresh();
            this.appendPurchase(raffle);
            component.setState({
              success: 'Ticket purchase successful!',
            });
          } else {
            return component.setState({
              error:
                'Unable to purchase the ticket, please check your connection, and try again later',
            });
          }
        })
        .catch(function (error) {
          console.error('There was an error!', error);
          return this.setState({
            error:
              'Unable to purchase the ticket, please check your connection, and try again later',
          });
        });
    }
  };

  handleShow = (i) =>
    this.setState({
      modalShow: true,
      drawOption: i,
    });

  updateTicketNum(e) {
    const tickets = e.target.value < 1 ? 1 : Math.round(e.target.value);

    this.setState({ tickets });
  }

  goBack = () => {
    this.props.history.goBack();
  };

  countdown = () => {
    let cds = {};
    this.state.raffle.map((value, index) => {
      if (value.public.expiry === -1) {
        cds[index] = '-';
      } else {
        let countDownDate = value.public.expiry;
        // Get today's date and time
        let now = Math.floor(new Date().getTime() / 1000);
        // Find the distance between now and the count down date
        let distance = countDownDate - now;
        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (60 * 60 * 24));
        let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
        let minutes = Math.floor((distance % (60 * 60)) / 60);
        let seconds = Math.floor(distance % 60);

        cds[index] =
          days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';
        // If the count down is over, write some text
        if (distance < 0) {
          cds[index] = 'EXPIRED';
        }
      }
    });

    this.setState({ countdownString: cds });
  };

  validateRaffle = (raffle) => {
    return (
      raffle.public &&
      raffle.public.title &&
      raffle.public.description &&
      raffle.public.entryPrice &&
      raffle.public.prizeAmount &&
      raffle.public.expiry
    );
  };

  render() {
    let drawingCards;
    if (this.state.raffle) {
      drawingCards = this.state.raffle.map((value, index) => {
        const valid =
          this.validateRaffle(value) &&
          this.state.countdownString[index] != 'EXPIRED';
        return (
          valid && (
            <Card
              className={Style.hoverCard}
              onClick={() => this.handleShow(index)}
              key={index}
            >
              <Card.Body className="pb-0">
                <Row>
                  <Col>
                    <Card.Title>
                      {formatMoney(value.public.prizeAmount * this.state.USD)}
                      USD
                    </Card.Title>
                  </Col>
                  <Col md="auto">
                    <Card.Title></Card.Title>
                  </Col>
                </Row>
                <Card.Subtitle className="mb-2 text-muted">
                  <i className="fab fa-monero" /> {value.public.prizeAmount}XMR
                </Card.Subtitle>
                <Card.Text className={Style.orange + ' mb-0'}>
                  {value.public.title}
                </Card.Text>
                <Card.Text>Ticket price: {value.public.entryPrice}MC</Card.Text>
              </Card.Body>
              <Card.Footer style={{ textAlign: 'center' }}>
                {value.public.totalTickets ? (
                  <>
                    <ProgressBar
                      min={0}
                      max={value.public.totalTickets}
                      now={value.public.numTickets}
                    />{' '}
                    {`${value.public.numTickets} of ${value.public.totalTickets} purchased`}
                  </>
                ) : (
                  <small className="text-muted">
                    Closes in: {this.state.countdownString[index]}
                  </small>
                )}
              </Card.Footer>
            </Card>
          )
        );
      });
    } else {
      drawingCards = <h5>Loading drawing info...</h5>;
    }

    let ticketList = this.state.purchasedTickets.map((value, index) => {
      let purchaseDate = moment(value.purchased * 1000).format('lll');
      let status = value.status;

      return (
        <tr key={index}>
          <td>{value.title}</td>
          <td>{value.tickets}</td>
          <td>{value.amount + ' XMR'}</td>
          <td>{purchaseDate}</td>
          <td>{status == 1 ? 'Pending' : 'Expired'}</td>
        </tr>
      );
    });

    return (
      <MinerConsumer>
        {(miner) => (
          <div>
            {this.state.success && this.displaySuccess()}
            <Row>
              <Col>
                <h3 className={Style.orange}>Monero Giveaways</h3>
              </Col>
              <Col md="auto">
                <Button onClick={this.goBack}>Back to Gameroom</Button>
              </Col>
            </Row>
            <Container className="mb-4">
              <h4>Current Drawings</h4>
              <CardColumns>{drawingCards}</CardColumns>

              <h4>History</h4>
              {this.state.purchasedTickets.length ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Drawing Title</th>
                      <th>Number of Tickets</th>
                      <th>Prize Amount (XMR)</th>
                      <th>Purchase Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>{ticketList}</tbody>
                </Table>
              ) : (
                <p>You don't have any tickets :/</p>
              )}
            </Container>

            <Modal
              centered
              show={this.state.modalShow}
              onHide={() => this.handleClose(false)}
            >
              <Modal.Header closeButton>
                <Modal.Title>Ticket Purchase</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.state.raffle ? (
                  <div>
                    <h5>
                      <small className="text-muted">Drawing Amount: </small>
                      {formatMoney(
                        this.state.raffle[this.state.drawOption].public
                          .prizeAmount * this.state.USD
                      )}
                      USD
                      <small className="text-muted">
                        (
                        {
                          this.state.raffle[this.state.drawOption].public
                            .prizeAmount
                        }
                        XMR)
                      </small>
                    </h5>
                    <h5>
                      <small className="text-muted">Ticket Price: </small>{' '}
                      {
                        this.state.raffle[this.state.drawOption].public
                          .entryPrice
                      }
                      MC
                    </h5>
                    <Row className="justify-content-md-center mb-2">
                      <Col md="6">
                        <h5>
                          <small className="text-muted">Tickets: </small>
                        </h5>
                      </Col>
                      <Col md="6">
                        <InputGroup>
                          <FormControl
                            defaultValue={this.state.tickets}
                            value={this.state.tickets}
                            type="number"
                            min="1"
                            max="10"
                            onChange={this.updateTicketNum.bind(this)}
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                    <h4>
                      <small className="text-muted">Total Price: </small>
                      {this.state.raffle[this.state.drawOption].public
                        .entryPrice * this.state.tickets}
                      MC
                    </h4>
                  </div>
                ) : (
                  <h5>No purchase options available :/</h5>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => this.handleClose(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    this.handleClose(true, miner);
                  }}
                  disabled={
                    this.state.countdownString[this.state.drawOption] ===
                    'EXPIRED'
                  }
                >
                  Confirm Purchase
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </MinerConsumer>
    );
  }
}

export default Raffle;
