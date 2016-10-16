/* eslint-env browser */
import deepstream from 'deepstream.io-client-js';
import React from 'react';
import ReactDOM from 'react-dom';

import styles from './style/index.css';

const client = deepstream(location.hostname + ':6020').login({});

class HorpDorp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        this.props.record.subscribe(::this.setState, true);
    }

    componentWillUnmount() {
        this.props.record.unsubscribe();
    }

    render() {
        const style = this.state.woah > 25 ? styles.banana : styles.apple;

        return <div className={style}>{ this.state.woah }</div>;
    }
}

ReactDOM.render(
    <HorpDorp record={client.record.getRecord('horp/dorp')} />,
    document.getElementById('container')
);
