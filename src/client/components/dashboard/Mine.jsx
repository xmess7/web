import React, { Component } from 'react';
import { Row, Col, ResponsiveEmbed, Jumbotron, Button } from 'react-bootstrap';
import { Alert, Nav, NavItem, NavLink, Container, Badge } from 'shards-react';
import { PrimaryButton } from '../common/Buttons.jsx';
import Style from '../../styles/components/dashboard/Mine.less';

import xmrConfigData from '../../utils/xmr_config.js';

import * as ROUTES from '../../utils/routes.js';
import { Link } from 'react-router-dom';
import { MinerConsumer } from '../../pages/Dashboard.jsx';

class Mine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'w',
      windowsVideo: true,
    };
    this.handleTabSwitch = this.handleTabSwitch.bind(this);
    this.handleDownloadConfig = this.handleDownloadConfig.bind(this);
    this.showWindowsVideo = this.showWindowsVideo.bind(this);
  }

  showWindowsVideo() {
    this.setState({ windowsVideo: !this.state.windowsVideo });
  }

  handleDownloadConfig(miner) {
    const fileName = 'config.json';

    let config_data = xmrConfigData;

    config_data.pools[0].user = miner.id;
    config_data.pools[0].pass = miner.address;
    config_data.pools[0].url = 'pool.myriade.io:8222';

    const json = JSON.stringify(config_data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  windowsInstruction() {
    return (
      <Container>
        <Row className="mb-3">
          <Col></Col>
          <Col md="auto" className="pr-0">
            <section className={Style.sliderCheckbox}>
              <input
                type="checkbox"
                id="1"
                onClick={this.showWindowsVideo}
                checked={this.state.windowsVideo}
              />
              <label className={Style.label} for="1" />
            </section>
          </Col>
          <Col md="auto" className="mt-1 pl-0">
            Toggle Video Tutorial
          </Col>
        </Row>
        {this.state.windowsVideo && (
          <Jumbotron className="p-2">
            <ResponsiveEmbed aspectRatio="16by9">
              <iframe
                src="https://www.youtube.com/embed/9EZTGp5wbm4"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </ResponsiveEmbed>
          </Jumbotron>
        )}
        <h5 className="mt-3">1. Requirements</h5>
        <p>You will need the following</p>
        <ul>
          <li>
            A computer (desktop or laptop) - minimum 2GHz+ processor and 2GB of
            RAM.
          </li>
          <li>XMRig miner desktop client (Download in the step below)</li>
        </ul>
        <h5>2. Download and installing XMRig</h5>
        <p>
          You can download alternate official releases of XMRig{' '}
          <a target="_blank" href="https://github.com/xmrig/xmrig/releases">
            {' '}
            here
          </a>{' '}
          or you can use the dowload button below for v6.6.2.
        </p>
        <Row>
          <Col md={{ offset: 4, span: 4 }} style={{ textAlign: 'center' }}>
            <PrimaryButton
              pill
              style={{ margin: 10 }}
              href="https://github.com/xmrig/xmrig/releases/download/v6.8.1/xmrig-6.8.1-msvc-win64.zip"
            >
              Download Miner (64-bit)
            </PrimaryButton>
          </Col>
        </Row>
        <h5>3. Extract the downloaded zip file</h5>
        <p>
          Et voila! You have an executable XMRig client downloaded. The file to
          run is called <strong>xmrig.exe</strong>. Now you can proceed to the
          next step to download your configuration file.
        </p>
      </Container>
    );
  }

  linuxInstruction() {
    return (
      <Container>
        <Row>
          <Col>
            <h5>1. Requirements</h5>
          </Col>
          <Col md="auto">
            <Link target="_blank" to={ROUTES.LINUX}>
              <Button>Detailed Instructions</Button>
            </Link>
          </Col>
        </Row>

        <p>You will need the following</p>
        <ul>
          <li>
            A computer (desktop or laptop) - minimum 2GHz+ processor and 2GB of
            RAM
          </li>
          <li>A 64 bits UNIX-based operating system</li>
          <li>XMRig miner desktop client (Download in the step below)</li>
        </ul>
        <h5>2. Download and installing XMRig</h5>
        <p>
          You can download alternate official releases of XMRig{' '}
          <a target="_blank" href="https://github.com/xmrig/xmrig/releases">
            {' '}
            here
          </a>{' '}
          or you can use the dowload button below for v6.6.2.
        </p>
        <Row>
          <Col md={{ offset: 2, span: 4 }} style={{ textAlign: 'center' }}>
            <PrimaryButton
              pill
              style={{ margin: 10 }}
              href="https://github.com/xmrig/xmrig/releases/download/v6.8.1/xmrig-6.8.1-linux-x64.tar.gz"
            >
              Download Miner for Linux
            </PrimaryButton>
          </Col>
          <Col md={{ offset: 0, span: 4 }} style={{ textAlign: 'center' }}>
            <PrimaryButton
              pill
              style={{ margin: 10 }}
              href="https://github.com/xmrig/xmrig/releases/download/v6.8.1/xmrig-6.8.1-macos-x64.tar.gz"
            >
              Download Miner for OSX
            </PrimaryButton>
          </Col>
        </Row>
        <br />
        <h5>3. Extract the downloaded tar file</h5>
        <p>
          Et voila! You have an executable XMRig client downloaded. The file to
          run is called <strong>xmrig</strong>. Now you can proceed to the next
          step to download your configuration file.
        </p>
      </Container>
    );
  }

  renderInstructions() {
    return 'w' === this.state.type
      ? this.windowsInstruction()
      : this.linuxInstruction();
  }

  handleTabSwitch(type) {
    this.setState({
      type,
    });
  }

  render() {
    return (
      <Container className={Style.Container}>
        <Row>
          <h3>Getting started with mining [XMRig]</h3>
          <p>
            Stay tuned for our updates, we are currently working on desktop
            client app that will provide an easier mining experience for you.
          </p>
        </Row>
        <div className={Style.Scrollbox}>
          <Row>
            <Col md={1}>
              <Badge pill theme="primary">
                Step 1
              </Badge>
            </Col>
            <Col md={11}>
              <strong>Setup XMRig for your operating system</strong>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={12}>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    onClick={(e) => {
                      this.handleTabSwitch('w');
                    }}
                    active={this.state.type === 'w' ? 'active' : ''}
                    className={Style.tab}
                  >
                    Windows
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    onClick={(e) => {
                      this.handleTabSwitch('l');
                    }}
                    active={this.state.type === 'l' ? 'active' : ''}
                    className={Style.tab}
                  >
                    Linux / OSX
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
            <div style={{ padding: '20px' }}>{this.renderInstructions()}</div>
          </Row>
          <Row>
            <Col md={1}>
              <Badge pill theme="primary">
                Step 2
              </Badge>
            </Col>
            <Col md={11}>
              <strong>Download your XMRig configuration file below</strong>
            </Col>
            <hr />
            <div style={{ padding: '20px' }}>
              <Col md={12}>
                After downloading this file, make sure to put it in the
                configuration folder where you installed your XMR rig. Then you
                should be able to start mining with us. <br />
                <strong>Important:</strong> Please note that this configuration
                file is made for you only, it will identify you as a miner on
                our services, please do not share this configuration file with
                other miners. Whoever is in possession of this configuration
                file can impersonate you during mining.
              </Col>
              <Col md={{ offset: 4, span: 4 }} style={{ textAlign: 'center' }}>
                <MinerConsumer>
                  {(miner) => (
                    <PrimaryButton
                      pill
                      style={{ margin: '10px' }}
                      onClick={(e) => {
                        this.handleDownloadConfig(miner);
                      }}
                    >
                      Download Configuration
                    </PrimaryButton>
                  )}
                </MinerConsumer>
              </Col>
              <Col md={12}>
                Once downloaded, you should replace this file with the{' '}
                <strong>config.json</strong> file in your XMRig download from
                step 1.
              </Col>
            </div>
          </Row>
          <Row>
            <Col md={1}>
              <Badge pill theme="primary">
                Step 3
              </Badge>
            </Col>
            <Col md={11}>
              <strong>
                Start mining on XMRig with your downloaded configuration file
              </strong>
            </Col>
            <div style={{ padding: '20px' }}>
              <Col md={12}>
                <p>
                  You are now ready to start mining on Myriade with your
                  configuration file from step 2 and with the XMRig from step 1.
                  To do so simply click on the executable program either called
                  `xmrig.exe` or `xmrig` depending on your operation system.
                  Happy mining and please write us your feedback or questions to
                  info@myriade.io
                </p>
              </Col>
            </div>
          </Row>
        </div>
      </Container>
    );
  }
}

export default Mine;
