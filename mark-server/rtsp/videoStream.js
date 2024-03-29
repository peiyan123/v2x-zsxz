'use strict';

const buffer = require('buffer');

const url = require('url');

const ws = require('ws');

const util = require('util');

const events = require('events');

const Mpeg1Muxer = require('./mpeg');

const STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes

const VideoStream = function(options) {
  this.options = options;
  this.name = options.name;
  this.streamUrl = options.streamUrl;
  this.width = options.width;
  this.height = options.height;
  this.wsPort = options.wsPort;
  this.inputStreamStarted = false;
  this.stream = undefined;
  this.clientMap = new Map(); // 管理每个client 对应的拉流
  // this.startMpeg1Stream();
  this.pipeStreamToSocketServer();
  return this;
};

util.inherits(VideoStream, events.EventEmitter);

VideoStream.prototype.stop = function() {
  this.wsServer.close();
  this.stream.kill();
  this.inputStreamStarted = false;
  return this;
};

VideoStream.prototype.startStream = function(rtspUrl, clientId) {
  let gettingInputData,
    gettingOutputData,
    inputData,
    outputData;
  const mpeg1Muxer = new Mpeg1Muxer({
    ffmpegOptions: this.options.ffmpegOptions,
    url: rtspUrl,
    ffmpegPath: this.options.ffmpegPath == undefined ? 'ffmpeg' : this.options.ffmpegPath,
  });
  mpeg1Muxer.on('mpeg1data', data => {
    return this.emit('camdata', {
      data,
      clientId,
    });
  });
  this.clientMap.set(clientId, mpeg1Muxer);
};
VideoStream.prototype.startMpeg1Stream = function() {
  let gettingInputData,
    gettingOutputData,
    inputData,
    outputData;
  this.mpeg1Muxer = new Mpeg1Muxer({
    ffmpegOptions: this.options.ffmpegOptions,
    url: this.streamUrl,
    ffmpegPath: this.options.ffmpegPath == undefined ? 'ffmpeg' : this.options.ffmpegPath,
  });
  this.stream = this.mpeg1Muxer.stream;
  if (this.inputStreamStarted) {
    return;
  }
  this.mpeg1Muxer.on('mpeg1data', data => {
    return this.emit('camdata', data);
  });
  gettingInputData = false;
  inputData = [];
  gettingOutputData = false;
  outputData = [];
  this.mpeg1Muxer.on('ffmpegStderr', data => {
    let size;
    data = data.toString();
    if (data.indexOf('Input #') !== -1) {
      gettingInputData = true;
    }
    if (data.indexOf('Output #') !== -1) {
      gettingInputData = false;
      gettingOutputData = true;
    }
    if (data.indexOf('frame') === 0) {
      gettingOutputData = false;
    }
    if (gettingInputData) {
      inputData.push(data.toString());
      size = data.match(/\d+x\d+/);
      if (size != null) {
        size = size[0].split('x');
        if (this.width == null) {
          this.width = parseInt(size[0], 10);
        }
        if (this.height == null) {
          this.height = parseInt(size[1], 10);
          return;
        }
      }
    }
  });
  this.mpeg1Muxer.on('ffmpegStderr', function(data) {
    return global.process.stderr.write(data);
  });
  this.mpeg1Muxer.on('exitWithError', () => {
    return this.emit('exitWithError');
  });
  return this;
};

VideoStream.prototype.pipeStreamToSocketServer = function() {
  this.wsServer = new ws.Server({
    port: this.wsPort,
  });
  this.wsServer.on('connection', (socket, request) => {
    return this.onSocketConnect(socket, request);
  });
  this.wsServer.broadcast = function(data, opts) {
    const results = [];
    for (const client of this.clients) {
      if (client.readyState === 1) {
        if (client.clientId == data.clientId) {
          client.send(data.data, opts);
        }
        // results.push(client.send(data, opts));
      } else {
        results.push(console.log('Error: Client from remoteAddress ' + client.remoteAddress + ' not connected.'));
      }
    }
    return results;
  };
  return this.on('camdata', data => {
    return this.wsServer.broadcast(data);
  });
};

VideoStream.prototype.onSocketConnect = function(socket, request) {
  const clientId = url.parse(request.url, true).query.clientId;
  socket.clientId = clientId;
  this.startStream(url.parse(request.url, true).query.rtsp, clientId);
  let streamHeader;
  // Send magic bytes and video size to the newly connected socket
  // struct { char magic[4]; unsigned short width, height;}
  streamHeader = buffer.Buffer.alloc(8);
  streamHeader.write(STREAM_MAGIC_BYTES);
  streamHeader.writeUInt16BE(this.width, 4);
  streamHeader.writeUInt16BE(this.height, 6);
  socket.send(streamHeader, {
    binary: true,
  });
  console.log(`${this.name}: New WebSocket Connection (` + this.wsServer.clients.size + ' total)');

  socket.remoteAddress = request.connection.remoteAddress;

  // 响应close操作
  const handleCloseEvent = currentSocketClientId => {
    if (this.clientMap.get(currentSocketClientId)) {
      this.clientMap.get(currentSocketClientId).stream.kill();
    }
    this.clientMap.delete(currentSocketClientId);
    return console.log(`${this.name}: Disconnected WebSocket (` + this.wsServer.clients.size + ' total)');
  };

  return socket.on('close', function(code, message) {
    const currentSocketClientId = this.clientId;
    handleCloseEvent(currentSocketClientId);
  });
};

function handlePraseUrl() {}

module.exports = VideoStream;
