'use strict';

const BaseController = require('./base');
const { writeFile, mkdir } = require('fs/promises');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const util = require('util');
const _ = require('lodash');
const exec = util.promisify(require('child_process').exec);
const { sensorJsonData, runtimeJsonData, spillParamsJsonData, desaturationParams } = require('./config');
const { commonDir: COMMON_DIR } = require('../utils/constant');
const { defultDetectArea, defultLaneArea, defultCameraParams } = require('../utils/constant');
// common目录
// const COMMON_DIR = '/common';

/**
 * 解析事件区域配置数据，形成config文件数据格式
 * @param {Object} eventData 数据库中存储的原始数据
 * @return {Object} 解析后的数据
 */
const parseEventData = eventData => {
  const childData = {};
  const dataStack = [];
  const childStack = [];
  if (eventData) {
    for (let index = 0; index < eventData.length; index++) {
      const element = eventData[index];
      childData[element.name] = { area: element.area ? element.area.map(item => item.pointSource) : [], child: {} };
      if (element.children) {
        dataStack.push(element);
        childStack.push(childData[element.name].child);
        while (dataStack.length > 0) {
          const item = dataStack.pop();
          const childTemp = childStack.pop();
          const tempArr = item.children || [];
          for (let tempIndex = 0; tempIndex < tempArr.length; tempIndex++) {
            const child = tempArr[tempIndex];
            childTemp[child.name] = { area: child.area ? child.area.map(item => item.pointSource) : [], child: {} };
            dataStack.push(child);
            childStack.push(childTemp[child.name].child);
          }
        }
      }
    }
  }
  // console.log('*********', JSON.stringify(childData));
  return { area: [], child: childData };
};
class BaseMarkController extends BaseController {
  // 重新组装数据 符合算法的数据结构
  handleData(data, cameraItemData, type) {
    // cameraItemData.positionName = cameraItemData.position; // TODO
    const runtimeJson = _.cloneDeep(runtimeJsonData);
    const spillParamsJson = _.cloneDeep(spillParamsJsonData);
    let cameraData,
      areaData,
      laneData,
      fuseData,
      // spilledData,
      imageInfo;
    // const cameraJson = {},
    //   areaJson = {},
    //   laneJson = {},
      // spilledJson = {},
    const eventJsonArr = [];
    data.forEach(item => {
      if (!imageInfo) {
        imageInfo = JSON.parse(item.image_info);
      }
      if (item.type === 'area') {
        areaData = JSON.parse(item.value);
      } else if (item.type === 'camera') {
        cameraData = JSON.parse(item.value);
      } else if (item.type === 'lane') {
        laneData = JSON.parse(item.value);
      } else if (item.type === 'fuse') {
        fuseData = JSON.parse(item.value);
      } else if (item.type === 'event') {
        eventJsonArr.push({ data: parseEventData(JSON.parse(item.value)), name: item.file_name });
      }
      // if (item.type === 'spilled') {
      //   spilledData = JSON.parse(item.value);
      // }
    });
    const cameraJson = this.getCameraData(cameraData, imageInfo, cameraItemData.positionName, type);
    const { areaJson, spillTask } = this.getAreaData(areaData, imageInfo);
    runtimeJson.spill_task = spillTask;
    const laneJson = this.getLaneData(laneData, imageInfo);
    const fuseArr = this.getFuseData(fuseData, cameraItemData.positionName);
    // for (let index = 0; index < eventJsonArr.length; index++) {
    //   const { data, name } = eventJsonArr[index];
    //   const fileName = this.algorithmicDir + 'hjxy_4100_20230117/' + name + '.json';
    //   await fsExtra.ensureFile(fileName);
    //   await fsExtra.writeJson(fileName, data);
    // }
    // if (spilledData) {
    //   spilledJson.areas = spilledData.map(item => {
    //     return {
    //       area_points: item.pointSource,
    //     };
    //   });
    //   spilledJson.image_width = imageInfo.width;
    //   spilledJson.image_height = imageInfo.height;
    // }
    this.writeSingleData({
      camera: cameraJson?.mode || defultCameraParams,
      area: areaJson?.areas || defultDetectArea,
      lane: laneJson?.areas || defultLaneArea,
      event: eventJsonArr,
      runtime: runtimeJson,
      spillParams: spillParamsJson,
    }, cameraItemData.positionName, type);
    return fuseArr;
  }
  /**
   * 调用写入文件的方法将转换后的数据写入文件
   * @param {object} allData 待写入json文件的数据
   * @param {string} dirName json文件所在的目录名
   */
  async writeSingleData(allData, dirName, type) {
    const { camera, area, lane, runtime, spillParams, event } = allData;
    await this.makeDirFile(
      dirName,
      camera,
      area,
      lane,
      runtime,
      spillParams,
      event,
      type
    );

    //
    const cmd = this.cmd + `/v2x_outparams_to_camera ${this.app.config.algorithmicDir + `chan${type}/cfg_single/` + dirName}`;
    await exec(cmd);
  }
  /**
   * 获取待写入json文件的外参标定数据
   * @param {object} sourceData 原数据
   * @param {object} imageInfo 图片信息
   * @param {String} dirName 相机配置文件所在的目录名，即group名
   * @return {object} 结果对象
   */
  getCameraData(sourceData, imageInfo, dirName, type) {
    let cameraJson = {};
    if (sourceData) {
      // 如果version属性值为2.0，则表示是车标定方式，则camera_params.json中保存{version: '2.0'}
      if (sourceData.version === '2.0') {
        cameraJson = sourceData;
        return cameraJson;
      }
      cameraJson.mode = sourceData.mode;
      cameraJson.in_params = sourceData.inData;
      cameraJson.in_type = sourceData.isdistort;
      cameraJson.image_width = imageInfo.width;
      cameraJson.image_height = imageInfo.height;
      if (sourceData.mode == 'LL') {
        cameraJson.center = {
          longitude: sourceData.center.longitude,
          latitude: sourceData.center.latitude,
        };
      }
      // deriction
      cameraJson.direction = [];
      cameraJson.out_params_mark = sourceData.sceneData.map(item => {
        if (item.shapeId == sourceData.startPointId) {
          cameraJson.direction[0] = {
            img_x: item.pointSource[0].x,
            img_y: item.pointSource[0].y,
            longitude: item.lon,
            latitude: item.lat,
            world_x: item.worldX,
            world_y: item.worldY,
          };
        }
        if (item.shapeId == sourceData.endPointId) {
          cameraJson.direction[1] = {
            img_x: item.pointSource[0].x,
            img_y: item.pointSource[0].y,
            longitude: item.lon,
            latitude: item.lat,
            world_x: item.worldX,
            world_y: item.worldY,
          };
        }
        return {
          img_x: item.pointSource[0].x,
          img_y: item.pointSource[0].y,
          longitude: item.lon,
          latitude: item.lat,
          world_x: item.worldX,
          world_y: item.worldY,
        };
      });
    } else {
      // 如果数据库中没有camera_params.json文件的数据，且camera_params.json文件存在，则返回null，代表不写camera_params.json文件
      const cameraParamsFile = this.app.config.algorithmicDir + `chan${type}/cfg_single/` + dirName + COMMON_DIR + '/camera_params.json';
      if (fs.existsSync(cameraParamsFile)) {
        return null;
      } 
    }
    return cameraJson;
  }
  /**
   * 获取待写入json文件的检测区域数据
   * @param {object} sourceData 原数据
   * @param {object} imageInfo 图片信息
   * @return {object} 结果对象
   */
  getAreaData(sourceData, imageInfo) {
    const areaJson = {};
    const spillTask = false;
    if (sourceData) {
      areaJson.areas = sourceData.map(item => {
        return {
          area_points: item.pointSource,
        };
      });
      areaJson.image_width = imageInfo.width;
      areaJson.image_height = imageInfo.height;
      // runtime.json中的spill_task字段暂时未用，故可以注释修改该字段值的代码
      // 抛洒物文件写入
      // const filterData = sourceData.filter(item => item.detectionType.includes('抛洒物'));
      // spillTask = filterData.length > 0;
      // spilledJson.areas = filterData.map(item => {
      //   return {
      //     area_points: item.pointSource,
      //   };
      // });
      // spilledJson.image_width = imageInfo.width;
      // spilledJson.image_height = imageInfo.height;
    }
    return { areaJson, spillTask };
  }
  /**
   * 获取待写入json文件的车道标定数据
   * @param {object} sourceData 原数据
   * @param {object} imageInfo 图片信息
   * @return {object} 结果对象
   */
  getLaneData(sourceData, imageInfo) {
    const laneJson = {};
    if (sourceData) {
      const groupResult = this.ctx.helper.groupBy(sourceData, item => item.type);
      const areas = [];
      const solidLines = [];
      for (const index in groupResult) {
        const obj = { direction: {}, count_line: {} };
        obj.lane_id = Number(index);
        groupResult[index].forEach(item => {
          if (item.name === '车道区域') {
            obj.area_points = item.pointSource.map(a => {
              return { x: a.x, y: a.y };
            });
          } else if (item.name === '方向') {
            obj.direction.begin_point = {
              x: item.pointSource[0].x,
              y: item.pointSource[0].y,
            };
            obj.direction.end_point = {
              x: item.pointSource[1].x,
              y: item.pointSource[1].y,
            };
          } else if (item.name === '流量统计线') {
            obj.count_line.begin_point = {
              x: item.pointSource[0].x,
              y: item.pointSource[0].y,
            };
            obj.count_line.end_point = {
              x: item.pointSource[1].x,
              y: item.pointSource[1].y,
            };
          } else if (item.name === '实线') {
            solidLines.push({
              id: obj.lane_id,
              points: item.pointSource.map(a => {
                return { x: a.x, y: a.y };
              }),
            });
          }
        });
        // 如果obj包含有‘车道区域’、‘流量统计线’、‘实线’中的一种，则放到areas数组中
        if ((obj.area_points && obj.area_points.length > 0) || obj.direction.begin_point || obj.count_line.begin_point) {
          areas.push(obj);
        }
      }
      laneJson.areas = areas;
      laneJson.solid_lines = solidLines;
      laneJson.image_width = imageInfo.width;
      laneJson.image_height = imageInfo.height;
    }
    return laneJson;
  }
  /**
   * 获取待写入json文件的融合配置数据
   * @param {object} sourceData 原数据
   * @param {string} name 相机位置名字属性值
   * @return {array} 结果数据
   */
  getFuseData(sourceData, name) {
    const fuseResult = [];
    if (sourceData) {
      const groupResult = this.ctx.helper.groupBy(sourceData, item => item.type);
      for (const index in groupResult) {
        const obj = { direction: {}, area_points: {}, name };
        groupResult[index].forEach(item => {
          if (item.name === 'area') {
            obj.area_points = item.pointSource.map(a => {
              return { x: a.x, y: a.y };
            });
          } else {
            obj.direction.begin_point = {
              x: item.pointSource[0].x,
              y: item.pointSource[0].y,
            };
            obj.direction.end_point = {
              x: item.pointSource[1].x,
              y: item.pointSource[1].y,
            };
          }
        });
        fuseResult.push(obj);
      }
    }
    return fuseResult;
  }

  // 生成目录并写入文件
  async makeDirFile(dirName, cameraJson, areaJson, laneJson, runtimeJson, spillParamsJson, eventJsonArr, type) {
    const dir = this.app.config.algorithmicDir + `chan${type}/cfg_single/` + dirName;
    const commonDir = dir + COMMON_DIR;
    const eventAreaDir = dir + '/event_area';
    const eventParamDir = dir + '/event_param';
    // const maskPath = this.maskPath;
    const storageCameraFileName = 'camera_params.json';
    const storageAreaFileName = 'detect_area.json';
    const storageLaneFileName = 'lane_area.json';
    const storageSpilledFileName = 'spill_area.json';
    const storageRuntimeFileName = 'runtime.json';
    const storageSpillParamsFileName = 'spill_params.json';
    const write = async () => {
      const eventWriteArr = [];
      // 遍历写事件配置文件
      for (let index = 0; index < eventJsonArr.length; index++) {
        const { data, name } = eventJsonArr[index];
        // 第三个参数代表存储json数据时增加换行符，以便打开json文件时以格式化后的方式展示
        eventWriteArr.push(writeFile(eventAreaDir + '/' + name + '.json', JSON.stringify(data, '', '\t')));
      }
      const promiseArr = [
        writeFile(commonDir + '/' + storageAreaFileName, JSON.stringify(areaJson, '', '\t')),
        writeFile(commonDir + '/' + storageLaneFileName, JSON.stringify(laneJson, '', '\t')),
        // 暂时将spill_area.json文件内容从detect_area.json复制一份，提供给算法使用
        writeFile(commonDir + '/' + storageSpilledFileName, JSON.stringify(areaJson, '', '\t')),
        writeFile(commonDir + '/' + storageRuntimeFileName, JSON.stringify(runtimeJson, '', '\t')),
        writeFile(eventParamDir + '/' + storageSpillParamsFileName, JSON.stringify(spillParamsJson, '', '\t')),
        this.writeDesaturationParams(eventParamDir),
        ...eventWriteArr,
      ];
      if (cameraJson !== null) {
        promiseArr.push(writeFile(commonDir + '/' + storageCameraFileName, JSON.stringify(cameraJson, '', '\t')));
      }
      await Promise.all(promiseArr);
    };

    await fsExtra.ensureDir(commonDir);
    await fsExtra.ensureDir(eventAreaDir);
    await fsExtra.ensureDir(eventParamDir);
    await write();
    // await fsExtra.ensureDir(dir + '/gen_mask_img');
    // // 生成mask图
    // await exec(maskPath + dirName);
  }

  // 写入sensorJson camera data
  async writeSensorData(data, groupInfo, index, type) {
    const fileName = this.app.config.algorithmicDir + `chan${type}/cfg_single/` + data.positionName + COMMON_DIR + '/sensor.json';
    let sensorJson = _.cloneDeep(sensorJsonData);
    // const fileName = 'app/public/files/lgj.json';
    const isFileExsit = await fsExtra.pathExists(fileName);
    if (isFileExsit) {
      sensorJson = await fsExtra.readJson(fileName);
      // fileData.camera.enable = true;
      // fileData.camera.ip = data.rtsp;
      // fileData.sub_name = data.positionName;
      // fileData.group_id = index;
      // // spaces代表存储json数据时增加换行符，以便打开json文件时以格式化后的方式展示
      // await fsExtra.writeJson(fileName, fileData, { spaces: '\t' });
    } else {
      await fsExtra.ensureFile(fileName);
      // sensorJson.camera.enable = true;
      // sensorJson.camera.ip = data.rtsp;
      // sensorJson.group_id = index;
      // sensorJson.sub_name = data.positionName;
      // // spaces代表存储json数据时增加换行符，以便打开json文件时以格式化后的方式展示
      // await fsExtra.writeJson(fileName, sensorJson, { spaces: '\t' });
    }
    sensorJson.camera.ip = data.rtsp;
    // 判断是否有上传视频
    if (data.video) {
      const videoList = JSON.parse(data.video);
      // 有上传视频，则设置对应的属性
      if (videoList.length > 0) {
        sensorJson.camera.subtype = 'FilePuller';
        sensorJson.camera.ip = `${this.app.config.videoPath}/${videoList[0].hash}${path.extname(videoList[0].name)}`;
      }
    }
    // 获取camera的序列号，如果不为空，则写入sensor.json
    if (data.sn) {
      sensorJson.camera.serial = data.sn;
    }
    sensorJson.sub_name = data.positionName;
    sensorJson.group_id = index;
    // 保存mec设置
    // const group = await this.service.group.getGroupBasicInfoById(data.groupId);
    sensorJson.camera.enable = !groupInfo.pullData;
    // 查找是否组中是否包含雷达
    const result = await this.service.radar.getRadarByGroupId(data.groupId);
    // 获取radar的序列号，如果不为空，则写入sensor.json
    if (result && result.sn) {
      sensorJson.radar.serial = result.sn;
    }
    sensorJson.radar.enable = groupInfo.pullData ? false : !!result;
    sensorJson.mec.enable = groupInfo.pullData;
    sensorJson.mec.ip = groupInfo.extensionIp;
    sensorJson.mec.port = groupInfo.dataPort ? +groupInfo.dataPort : '';
    // spaces代表存储json数据时增加换行符，以便打开json文件时以格式化后的方式展示
    await fsExtra.writeJson(fileName, sensorJson, { spaces: '\t' });
  }
  /**
   * 写distribution_send_task.json文件
   */
  async writeDistributionData() {
    // // get前先load，避免出现脏数据
    // this.app.locals.store.settings.load();
    // if (this.app.locals.store.settings.get('isSubDevice')) {
    const result = await this.service.mec.getOneColumn(1, 'sub_device');
    if (result && result.subDevice) {
      const groupList = await this.service.group.getAll();
      if (groupList) {
        for (let index = 0; index < groupList.length; index++) {
          const group = groupList[index];
          const writeData = {};
          if (group.dataPort) {
            writeData.port = group.dataPort;
          }
          const fileName = this.app.config.cfgSingleDir + group.name + COMMON_DIR + '/distribution_send_task.json';
          await fsExtra.ensureFile(fileName);
          await fsExtra.writeJson(fileName, writeData, { spaces: '\t' });
        }
      }
    }
  }
  /**
   * 写desaturation_params.json文件
   * @param {string} dir 文件所在的目录
   * @return {Promise object} Promise对象
   */
  async writeDesaturationParams(dir) {
    const dirWithSlash = !/\/$/.test(dir) ? `${dir}/` : dir;
    return writeFile(`${dirWithSlash}desaturation_params.json`, JSON.stringify(desaturationParams, '', '\t'));
  }
}

module.exports = BaseMarkController;
