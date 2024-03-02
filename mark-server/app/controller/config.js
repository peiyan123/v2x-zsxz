'use strict';

const cameraConfigJsonData = {
  // name 从spl1开始，依次递增
  name: 'spl1',
  // devideid + groupid
  // 个位数值为groupid，十位数为设备id
  // groupid 为方向相关，从北顺时针以此为0-7
  'camera-id': '10',
  // camera 专用spl
  spl: 'omnipotent',
  config: {
    general: {
      // rtsp流地址
      uri: 'file:///home/v2x_datas/mecsoftware/testobj.mp4',
      debug: false,
    },
    display: {
      enable: false,
    },
    output: {
      'fps-n': 30,
      'fps-d': 1,
    },
  },
};

const radarConfigJsonData = {
  name: 'spl2',
  'camera-id': '20',
  // 毫米波雷达专用spl
  spl: 'mmwradar',
  config: {
    // 厂商名
    manufacturer: 'raysun',
    general: {
      raysun: {
        uri: '10.4.213.247',
        port: 8899,
        protocol: 'tcp',
      },
      debug: false,
      queue_max_length: -1,
      radarslice: {
        enable: false,
        outpath: '/home/store',
      },
    },
  },
};

const skylineConfigJsonData = {
  name: 'spl0',
  'camera-id': 'in_northeast_0',
  spl: 'horizon',
  config: {
    ip: '10.4.213.250',
    'port-meta': 5565,
    'port-img': 5560,
    debug: false,
  },
};

const deviceType = {
  0: '交通摄像头',
  1: '毫米波雷达',
  2: 'RSU',
  3: 'MEC路测计算设备',
};

const sensorJsonData = {
  name: '墨玉路路口',
  sub_name: '北路口', // 动态配置
  group_id: 0, // 动态配置
  camera: {
    enable: false, // 动态配置
    subtype: 'CameraPuller',
    serial: 'sn0123456',
    device_id: 0,
    max_frame_count_img: 101,
    max_frame_count_meta: 300,
    ip: 'rtsp://admin:ThunderSoft88@10.4.213.245/profile?token=media_profile1&amp;TO=60&amp;AB=1', // 动态配置
    '//ip': './videos/0418_1min.mp4',
    '///ip': '10.4.213.250',
    port_meta: 5565,
    port_img: 5560,
  },
  radar: {
    enable: false, // 动态配置
    subtype: 'RadarPullerWx',
    serial: 'sn0123456',
    device_id: 21,
    max_frame_count: 300,
    ip: '10.4.213.242', // 动态配置
    port: 8000, // 动态配置
  },
  mec: {
    enable: true,
    subtype: 'DistributionReceiver',
    device_id: 221,
    max_frame_count: 300,
    ip: '127.0.0.1',
    port: 11086,
  },
  detect_area_img_mask: './gen_mask_img/detect_area_img_mask.raw',
  detect_area_wgs_mask: './gen_mask_img/detect_area_wgs_mask.raw',
  lane_area_img_mask: './gen_mask_img/lane_area_img_mask.raw',
  lane_area_wgs_mask: './gen_mask_img/lane_area_wgs_mask.raw',
  spill_area_img_mask: './gen_mask_img/spill_area_img_mask.raw',
  spill_area_wgs_mask: './gen_mask_img/spill_area_wgs_mask.raw',
};
const runtimeJsonData = {
  enable_visual: false,
  log_level: 'info',
  visibility_task: true,
  fuse_task: true,
  statistic_task: true,
  spill_task: false,
  visual_task: false,
  save_task: {
    enable_save_task: false,
    save_image_format: 'h265',
    save_task_params: {
      save_dir: './save_datas/camera3',
      one_file_exist_time_ms: 600000,
      one_file_max_size_mb: 200,
      max_files: 60,
      mode: 0,
    },
  },
  data_source: {
    input_data_mode: 'real',
    replay_data_source: '/home/lan/v2x_fuse/save_datas/real/2022-06-25-16-49-35',
  },
};

const spillParamsJsonData = {
  object_det_args: {
    bgmod_varThreshold: 10,
    bgmod_varmax: 15,
    timeIntervalPerBuildBg_: 108000,
    bgmod_detect_shadow: false,
    bgmod_filter_size: 5,
    bgmod_track_iou_thr: 0.8,
    bgmod_object_roi_pad: 0,
    detect_nms_iou_threshold: 0.3,

    timePerBuildBg_: 900,
    process_per_second: 1,
    frameIntervalSpillDetect_: 5,
    trash_frame_cnt: 1000,
    class_as_spill_cnt: 200,
    detected_cnt_thr: 60,
    track_lost_cnt_thr: 60,

    bgmod_history_fast: 100,
    bgmod_history_slow: 1000,
    bgmod_spill_min_area: 400,
    bgmod_spill_max_area: 20000,
    bgmod_simi_threshold: 0.85,
    bgmod_object_threshold: 0.40,

  },
};
// task_single_list.json文件内容
const taskSingleList = [
  {
    type: 'CameraAlgoTask',
    enable: true,
  },
  {
    type: 'VisibilityDetectTask',
    enable: false,
  },
  {
    type: 'FuseTask',
    enable: true,
  },
  {
    type: 'OcclusionCalTask',
    enable: false,
  },
  {
    type: 'StatisticTask',
    enable: false,
  },
  {
    type: 'SpillsDetectTask',
    enable: false,
  },
  {
    type: 'ShowTask',
    enable: false,
  },
  {
    type: 'DataSaveTask',
    enable: false,
  },
  {
    type: 'CrossLineTask',
    enable: false,
  },
  {
    type: 'RetrogradeTask',
    enable: false,
  },
  {
    type: 'QueueOverloadTask',
    enable: false,
  },
  {
    type: 'TrafficJamTask',
    enable: false,
  },
  {
    type: 'StopValidationTask',
    enable: false,
  },
  {
    type: 'HighSpeedTask',
    enable: false,
  },
  {
    type: 'LowSpeedTask',
    enable: false,
  },
  {
    type: 'MultiTurnLaneTask',
    enable: false,
  },
  {
    type: 'EmergenceLaneOccupationTask',
    enable: false,
  },
  {
    type: 'PedestrianInstrusionTask',
    enable: false,
  },
  {
    type: 'PedestrianAtZebraCrossingTask',
    enable: false,
  },
  {
    type: 'VehicleReverseTask',
    enable: false,
  },
  {
    type: 'DistributionSendTask',
    enable: false,
  },
];
// task_multiple_list.json文件内容
const taskMultipleList = [
  {
    type: 'MultiObjFuseTask',
    enable: true,
  },
  {
    type: 'GoHighClientTask',
    enable: false,
  },
  {
    type: 'MultiFuseShowTask',
    enable: false,
  },
  {
    type: 'MultiFuseShowForDebugFuseTask',
    enable: false,
  },
  {
    type: 'CreateBevImgTask',
    enable: false,
  },
  {
    type: 'HttpBevPublishTask',
    enable: false,
  },
];

const deviceInfoConfig = {
  id: '0000000000',
  sn: 'sn123456',
  latitude: 0.0,
  longitude: 0.0,
  elevation: 0.0,
};
// desaturation_params.json文件内容
const desaturationParams = {
  lane_max_speed: 60.0,
  lane_allow_car_distance: 1.0,
  avg_car_length: 5.0,
  green_light_time: 60,
  annunciator_cycle_time: 120,
};
// const testJson = {center:{latitude:31.5841128828,longitude:120.4169874292},in_params:'1878.4779052734375,0.00000000,952.63232421875,0.00000000,1879.6148681640625,538.6544189453125,0.0000000,0.00000000,1.00000000,0.32501161098480225,-0.31161433458328247,0.00273350952193141,0.00004785439887200482,0.6769999265670776',mode:'LL',out_params_mark:[{img_x:598,img_y:480,latitude:31.5841296132,longitude:120.4172103288,world_x:0,world_y:0},{img_x:611,img_y:341,latitude:31.5841260037,longitude:120.4172954598,world_x:0,world_y:0},{img_x:608,img_y:267,latitude:31.5841252418,longitude:120.417369995,world_x:0,world_y:0},{img_x:610,img_y:216,latitude:31.584122501,longitude:120.4174449755,world_x:0,world_y:0},{img_x:610,img_y:162,latitude:31.5841197843,longitude:120.4175585168,world_x:0,world_y:0},{img_x:913,img_y:472,latitude:31.584096226,longitude:120.4172050358,world_x:0,world_y:0},{img_x:838,img_y:330,latitude:31.5840935102,longitude:120.4172949135,world_x:0,world_y:0},{img_x:791,img_y:238,latitude:31.5840898233,longitude:120.4173990325,world_x:0,world_y:0},{img_x:765,img_y:190,latitude:31.5840869945,longitude:120.4174842862,world_x:0,world_y:0},{img_x:765,img_y:152,latitude:31.584078742,longitude:120.4175732653,world_x:0,world_y:0},{img_x:1240,img_y:451,latitude:31.584059333,longitude:120.4172043512,world_x:0,world_y:0},{img_x:1125,img_y:320,latitude:31.584050415,longitude:120.4172918722,world_x:0,world_y:0},{img_x:1038,img_y:229,latitude:31.5840414598,longitude:120.4173980212,world_x:0,world_y:0},{img_x:982,img_y:183,latitude:31.5840363235,longitude:120.4174822515,world_x:0,world_y:0},{img_x:939,img_y:150,latitude:31.5840333532,longitude:120.4175648133,world_x:0,world_y:0},{img_x:1578,img_y:416,latitude:31.5840149942,longitude:120.4172115553,world_x:0,world_y:0},{img_x:1365,img_y:307,latitude:31.5840116898,longitude:120.4172926657,world_x:0,world_y:0},{img_x:1214,img_y:227,latitude:31.5840069315,longitude:120.4173927222,world_x:0,world_y:0},{img_x:1156,img_y:191,latitude:31.5840018943,longitude:120.417455689,world_x:0,world_y:0},{img_x:1087,img_y:149,latitude:31.5839940833,longitude:120.4175576917,world_x:0,world_y:0},{img_x:1907,img_y:398,latitude:31.583971154,longitude:120.41721056,world_x:0,world_y:0},{img_x:1665,img_y:311,latitude:31.5839686973,longitude:120.4172779222,world_x:0,world_y:0},{img_x:1453,img_y:235,latitude:31.5839656477,longitude:120.4173690835,world_x:0,world_y:0},{img_x:1379,img_y:180,latitude:31.583946084,longitude:120.417462151,world_x:0,world_y:0},{img_x:1256,img_y:162,latitude:31.583961164,longitude:120.4175089342,world_x:0,world_y:0}]};


module.exports = {
  cameraConfigJsonData,
  radarConfigJsonData,
  deviceType,
  sensorJsonData,
  runtimeJsonData,
  skylineConfigJsonData,
  spillParamsJsonData,
  taskSingleList,
  taskMultipleList,
  deviceInfoConfig,
  desaturationParams,
};
