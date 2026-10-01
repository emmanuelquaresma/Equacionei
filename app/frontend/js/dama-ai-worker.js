'use strict';
importScripts('dama-rules.js', 'dama-learning.js', 'dama-models.js', 'dama-ai.js');
self.onmessage = ({ data }) => {
    try { self.postMessage({ ticket: data.ticket, ...DamaAI.choose(data.state, data.difficulty) }); }
    catch (_) { self.postMessage({ ticket: data.ticket, error: true }); }
};
