'use strict';
module.exports = {
  regIp: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
  regDomain: /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?/,
  regPort: /^[1-9]\d*$/,
  regBlank: /\s+/,
  regLon: /(^-?([1-9])$)|(^-?[1-9]\d$)|(^-?1[0-7]\d$)|(^-?180$)|(^-?([1-9])\.\d{1,10}$)|(^-?[1-9]\d\.\d{1,10}$)|(^-?1[0-7]\d\.\d{1,10}$)|(^-?180.0{1,10}$)/,
  regLat: /^-?((0|[1-8]?[0-9]?)(([.][0-9]{1,10})?)|90(([.][0]{1,10})?))$/,
  regRtsp: /rtsp:\/\/(\w{1,20}:\w{1,20}@)?\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/,
  positionName: {
    0: 'in_north',
    1: 'in_northeast',
    2: 'in_east',
    3: 'in_southeast',
    4: 'in_south',
    5: 'in_southwest',
    6: 'in_west',
    7: 'in_northwest',
    8: 'out_north',
    9: 'out_northeast',
    10: 'out_east',
    11: 'out_southeast',
    12: 'out_south',
    13: 'out_southwest',
    14: 'out_west',
    15: 'out_northwest',
  },
  positionName2: {
    0: '进口(北向)',
    1: '进口(东北向)',
    2: '进口(东向)',
    3: '进口(东南向)',
    4: '进口(南向)',
    5: '进口(西南向)',
    6: '进口(西向)',
    7: '进口(西北向)',
    8: '出口(北向)',
    9: '出口(东北向)',
    10: '出口(东向)',
    11: '出口(东南向)',
    12: '出口(南向)',
    13: '出口(西南向)',
    14: '出口(西向)',
    15: '出口(西北向)',
  },
  towardsVal: [ '0', '1', '2', '3' ],
  positionVal: [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15' ],
  deviceStatus: [ '0', '1', '2' ],
  facturer: [ 'raysun' ],
  cameraFacturer: [ 'hikvision', 'sensing' ],
  radarFacturer: [ 'hikvision', 'sensing', 'gohighclient' ],
  rsuFacturer: [ 'rsunebulalink', 'gohighclient' ],
  protocol: [ 'TCP', 'UDP', 'pcap' ],
  dirName: [ 'in_north', 'in_northeast', 'in_east', 'in_southeast', 'in_south', 'in_southwest', 'in_west', 'in_northwest', 'out_north', 'out_northeast', 'out_east', 'out_southeast', 'out_south', 'out_southwest', 'out_west', 'out_northwest' ],
  commonDir: '/common',
  extrinsicBin: 'extrinsic.bin',
  defultDetectArea: {
    "areas": [
    ],
    "image_width": 1920,
    "image_height": 1080
  },
  defultLaneArea: {
    "areas": [],
    "solid_lines": [],
    "image_width": 1920,
    "image_height": 1080
  },
  defultCameraParams: {
    "mode": "WORLD",
    "in_params": "0,0,0,0,0,0,0,0,0",
    "in_type": "undistort",
    "image_width": 1920,
    "image_height": 1080,
    "direction": [
        {
            "img_x": 999,
            "img_y": 1073,
            "longitude": 0,
            "latitude": 0,
            "world_x": 0,
            "world_y": 0
        },
        {
            "img_x": 1015,
            "img_y": 561,
            "longitude": 0,
            "latitude": 0,
            "world_x": 50,
            "world_y": 0
        }
    ],
    "out_params_mark": [
        {
            "img_x": 959,
            "img_y": 1079,
            "longitude": 0,
            "latitude": 0,
            "world_x": 0,
            "world_y": 0
        },
        {
            "img_x": 959,
            "img_y": 539,
            "longitude": 0,
            "latitude": 0,
            "world_x": 50,
            "world_y": 0
        },
        {
            "img_x": 959,
            "img_y": 0,
            "longitude": 0,
            "latitude": 0,
            "world_x": 100,
            "world_y": 0
        },
        {
            "img_x": 0,
            "img_y": 1079,
            "longitude": 0,
            "latitude": 0,
            "world_x": 0,
            "world_y": -30
        },
        {
            "img_x": 0,
            "img_y": 539,
            "longitude": 0,
            "latitude": 0,
            "world_x": 50,
            "world_y": -30
        },
        {
            "img_x": 0,
            "img_y": 0,
            "longitude": 0,
            "latitude": 0,
            "world_x": 100,
            "world_y": -30
        },
        {
            "img_x": 1919,
            "img_y": 1079,
            "longitude": 0,
            "latitude": 0,
            "world_x": 0,
            "world_y": 30
        },
        {
            "img_x": 1919,
            "img_y": 539,
            "longitude": 0,
            "latitude": 0,
            "world_x": 50,
            "world_y": 30
        },
        {
            "img_x": 1919,
            "img_y": 0,
            "longitude": 0,
            "latitude": 0,
            "world_x": 100,
            "world_y": 30
        }
    ]
  }
};
