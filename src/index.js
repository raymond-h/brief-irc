import deepstream from 'deepstream.io-client-js';
import IrcClient from 'squelch-client';
import loadJsonFile from 'load-json-file';
import R from 'ramda';
import Rx from 'rxjs/Rx';

const setPath = R.curry((path, value, record) => record.set(path, value));

function whenReady(record) {
    return new Promise(resolve => {
        record.whenReady(resolve);
    });
}

function eventObservable(event, dsClient) {
    return Rx.Observable.fromEventPattern(
        (h) => dsClient.event.subscribe(event, h),
        (h) => dsClient.event.unsubscribe(event, h)
    );
}

async function manageClientChannel(config, dsClient, ircClient, channel) {
    console.log('Managing', 'channel/' + config.server + '/' + channel);

    const channelRecord = dsClient.record.getRecord('channel/' + config.server + '/' + channel);

    await whenReady(channelRecord);

    channelRecord.set({ messages: [] });

    Rx.Observable.fromEvent(ircClient, 'msg')
        .filter(R.propEq('to', channel))
        .map(o => ({ ...o, id: dsClient.getUid() }))
        .bufferCount(10, 1)
        .debounceTime(20)
        .subscribe(setPath('messages', R.__, channelRecord));

    eventObservable('send-message', dsClient)
        .filter(R.allPass([
            R.propEq('server', config.server),
            R.propEq('channel', channel)
        ]))
        .subscribe(R.pipe(
            R.prop('message'),
            R.curryN(2, ::ircClient.msg)(channel)
        ));
}

async function manageClient(config, dsClient) {
    const ircClient = new IrcClient({
        ...config,
        autoConnect: false, triggerEventsForOwnMessages: true
    });

    await ircClient.connect();

    await Promise.all(
        config.channels.map(
            manageClientChannel.bind(null, config, dsClient, ircClient)
        )
    );
}

async function main() {
    const dsClient = deepstream('localhost:6021').login({});

    const config = await loadJsonFile('./irc-config.json');

    await Promise.all(
        config.map(c => manageClient(c, dsClient))
    );
}

main().catch(e => console.error(e.stack));
