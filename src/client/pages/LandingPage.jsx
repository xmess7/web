import React, { Component } from 'react'

import LandingBody from '../components/landing/LandingBody.jsx'
import LandingFooter from '../components/landing/LandingFooter.jsx'

import { Alert } from 'shards-react'

import PageStyle from '../styles/pages/Landing.less'

class LandingPage extends Component {
    constructor(props) {
        super(props)

        this.dismiss = this.dismiss.bind(this)
        this.state = {
            poolAlert: true,
        }
    }

    dismiss() {
        this.setState({ poolAlert: false })
    }

    render() {
        return (
            <>
                <Alert
                    theme="warning"
                    className={PageStyle.amber}
                    dismissible={this.dismiss}
                    open={this.state.poolAlert}
                >
                    Our Mining Pool is in alpha so there may be some issues.
                    Thanks for your patience!
                </Alert>
                <LandingBody />
                <LandingFooter />
            </>
        )
    }
}

export default LandingPage
