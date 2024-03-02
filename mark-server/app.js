'use strict';

const Stream = require('./rtsp/videoStream');
// const { Store } = require('data-store');

module.exports = app => {
  // app.locals.store = {
  //   // settings.json文件对应的存储对象
  //   settings: new Store({
  //     home: app.config.dataStoreDir,
  //     name: 'settings',
  //   }),
  //   // task_multiple_list.json文件对应的存储对象
  //   multipleTask: new Store({
  //     home: app.config.dataStoreDir,
  //     name: 'task_multiple_list',
  //   }),
  // };
  // app.rtspStream = [];


  // app.rtspStream = new Stream({
  //   width: 1920,
  //   height: 1080,
  //   name: "name",
  //   // streamUrl: 'rtsp://admin:ZKCD1234@10.0.20.112:554/Streaming/Channels/1', // 接收的web摄像头地址（摄像头需要网线+电源线），可以先在VCL测试摄像头是否接受正常  "rtsp://admin:ThunderSoft88@192.168.10.90/onvif-media/media.amp?profile=profile_1_jpeg&sessiontimeout=60&streamtype=unicast"
  //   wsPort: 8082, // 给8082端口发送数据帧，html前端页面需要在9999端口接收
  //   ffmpegOptions: {
  //     // options ffmpeg flags
  //     "-stats": "", // an option with no neccessary value uses a blank string
  //     "-r": 25, // options with required values specify the value after the key
  //     "-s": "1024 768",
  //     "-b:v": "4000k",
  //     "-qscale": 1,
  //   },
  // });
};
