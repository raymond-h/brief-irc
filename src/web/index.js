/* eslint-env browser */
import deepstream from 'deepstream.io-client-js';
import React from 'react';
import ReactDOM from 'react-dom';
import stringHash from 'string-hash';

import qs from 'querystring';

import styles from './style/index.css';

const query = qs.parse(location.search.slice(1));
const client = deepstream(location.host).login({});

class Message extends React.Component {
    render() {
        const { msg } = this.props;
        const nickColor = styles['nick-color-' + (stringHash(msg.from) % 8 + 1)];

        return <li className={ styles['message-entry'] }>
            <div className={ styles['message-from'] + ' ' + nickColor }>{ msg.from }</div>
            <div className={ styles['message-msg'] }>{ msg.msg }</div>
        </li>;
    }
}

class App extends React.Component {
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

    onKeyPress(event) {
        if(event.key === 'Enter') {
            client.event.emit('send-message', { ...query, message: event.target.value });
            event.target.value = '';
        }
    }

    render() {
        return <div className={ styles.main }><div className={ styles['inner-wrap'] }>
            <div className={ styles.messages }>
                <ul className={ styles['messages-list'] }>{
                    (this.state.messages || []).map(msg => <Message key={ msg.id } msg={msg} />)
                }</ul>
            </div>
            <div className={ styles['message-entry'] }>
                <input className={ styles.input } type="text" onKeyPress={this.onKeyPress}/>
            </div>
        </div></div>;
    }
}

const record = client.record.getRecord(`channel/${query.server}/${query.channel}`);

ReactDOM.render(
    <App record={record} />,
    document.getElementById('container')
);
