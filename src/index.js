import deepstream from 'deepstream.io-client-js';

const client = deepstream('localhost:6021').login({});
const r = client.record.getRecord('horp/dorp');

setInterval(() => {
    r.set({ woah: Math.floor(Math.random() * 50) });
}, 1000);
