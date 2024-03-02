'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const BaseMarkController = require('./baseMark');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const image = require('imageinfo');
const { testJson } = require('./test');
const { cameraConfigJsonData, skylineConfigJsonData } = require('./config');
// const { positionName } = require('../utils/constant');
const { isRtsp, captureRtsp, setAttachmentFilename, downloadFile } = require('../utils/utils');
const { compressDir } = require('../utils/compressing');
const compressing = require('compressing');
const { isNil } = require('lodash');
const { commonDir, extrinsicBin } = require('../utils/constant');

class MarkController extends BaseMarkController {
  async handleMarkData() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const cameraId = ctx.request.body.cameraId;
    const valid = await this.ctx.validate('mark', ctx.request.body, 'saveMark');
    if (!valid) return;
    const isExist = await this.app.model.Camera3.findOne({ where: { id: cameraId } });
    if (!isExist) return this.failed('不存在此设备');
    const result = await this.service.mark3.handleMarkData(requestData, cameraId);
    this.success(result);
  }
  async getMarkData() {
    const { ctx } = this;
    const cameraId = ctx.query.id;
    const isExist = await this.app.model.Camera3.findOne({ where: { id: cameraId } });
    if (!isExist) return this.failed('不存在此设备');
    const result = await this.service.mark3.getMarkData(cameraId);
    this.success(result);
  }

  async download() {
    const cameraId = this.ctx.query.cameraId;
    if (!cameraId) {
      return this.failed('id 不存在');
    }
    const camera = await this.app.model.Camera3.findOne({ where: { id: cameraId } });
    if (!camera) {
      return this.failed('不存在此设备');
    }
    const position = await this.service.group3.getGroupNameById(camera.groupId);
    // const position = positionName[String(camera.position)];
    // const position = camera.name;
    const dir = 'app/public/zip';
    const prepareFolder = `${dir}/${position}`;
    await fsExtra.ensureDir(dir);
    const outputPath = `${dir}/${position}.zip`;
    try {
      const sourceDir = `${this.app.config.algorithmicDir}chan3/cfg_single/${position}`;
      fsExtra.ensureDir(sourceDir);
      fsExtra.copySync(sourceDir, prepareFolder);
      // await compressing.zip.compressDir(prepareFolder, outputPath);
      await compressDir(prepareFolder, outputPath);
      this.ctx.attachment(outputPath);
      this.ctx.set('Content-Type', 'application/octet-stream');
      setAttachmentFilename(this.ctx, path.basename(outputPath));
      this.ctx.body = fs.createReadStream(outputPath);
      fsExtra.removeSync(prepareFolder);
    } catch (error) {
      console.log(error);
      return this.failed('打包失败');
    }

  }

  // 获取图片
  async getImage() {
    const rtsp = this.ctx.query.rtsp;
    const id = this.ctx.query.id;
    const valid = await this.ctx.validate('mark', this.ctx.query, 'image');
    if (!valid) return;
    const camera = await this.app.model.Camera3.findOne({ where: { id } });
    if (!camera) return this.failed('设备不存在');
    // 如果请求的接口是"/imageFirst"，且camera.imagePath路径的图片存在，则直接返回该图片数据
    if (this.ctx.path.startsWith('/imageFirst') && !isNil(camera.imagePath) && fs.existsSync(camera.imagePath)) {
      const img = fs.readFileSync(camera.imagePath);
      const imgInfo = image(img);
      this.success({
        url: 'data:image/jpeg;base64,' + img.toString('base64'),
        width: imgInfo.width,
        height: imgInfo.height,
      });
      return;
    }
    // 如果rtsp地址不正确，则直接返回空数据（修改bug 3791，标定页面未上传图片时，打开标定页面接口会超时）
    if (!isRtsp(rtsp)) {
      // 下面exec逻辑不会用到，故注释
      // await exec(
      //   this.cmd + `/v2x_img_capture "${rtsp}" 5560 5565 ${this.imageDir}${cameraName}/capture_img.png`
      // );
      this.success({});
      return;
    }
    const groupName = await this.service.group3.getGroupNameById(camera.groupId);
    const cameraName = this.ctx.query.name ? this.ctx.query.name : groupName;
    // 确保图片存储目录存在
    const captureImgDir = `${this.imageDir}${cameraName}`;
    await fsExtra.ensureDir(captureImgDir);
    // 截图图片名字
    const imageName = 'capture_img.png';
    try {
      // await exec(
      //   this.cmd + `/v2x_img_capture_rtsp "${rtsp}" ${this.imageDir}${cameraName}/capture_img.png`
      // );
      await captureRtsp(rtsp, captureImgDir, imageName);
    } catch (error) {
      this.ctx.logger.error(error);
      return this.failed('请确认rstp地址是否可用');
    }
    const imagePath = `${captureImgDir}/${imageName}`;
    const secondImagePath = `${captureImgDir}/${imageName.replace(/(\.[^\.]+)$/, '_2$1')}`;
    // 如果不存在capture_img.png，则将capture_img_2.png复制为capture_img.png
    if (fs.existsSync(secondImagePath)) {
      fsExtra.copyFileSync(secondImagePath, imagePath);
    }
    // 遍历截图所在目录，删除截图图片(capture_img.png)外的其他图片
    fs.readdir(captureImgDir, (err, files) => {
      if (err) {
        return this.ctx.logger.error('[Read capture dir error]', err);
      }
      files.forEach(file => {
        if (file !== imageName) {
          // 删除非截图图片
          fs.unlink(`${captureImgDir}/${file}`, err => {
            if (err) {
              this.ctx.logger.error('[Delete capture dir error]', err);
            }
          });
        }
      });
    });
    if (!fs.existsSync(imagePath)) {
      return this.failed('图片生成出错，请重试');
    }
    const img = fs.readFileSync(imagePath);
    // 更新数据库中的图片路径
    await camera.update({ imagePath });
    const imgInfo = image(img);
    this.success({
      url: 'data:image/jpeg;base64,' + img.toString('base64'),
      width: imgInfo.width,
      height: imgInfo.height,
    });
  }

  async getImageFirst() {
    const rtsp = this.ctx.query.rtsp;
    const id = this.ctx.query.id;
    const valid = await this.ctx.validate('mark', this.ctx.query, 'image');
    if (!valid) return;
    // const isExist = await this.app.model.Camera.findOne({ where: { name: cameraName } });
    // if (!isExist) return this.failed('设备名称不存在');
    const camera = await this.app.model.Camera3.findOne({ where: { id } });
    if (!camera) return this.failed('设备不存在');
    // const dir = 'app/public/cameraImage';
    // await fsExtra.ensureDir(dir);
    if (!isNil(camera.imagePath) && fs.existsSync(camera.imagePath)) {
      const img = fs.readFileSync(camera.imagePath);
      const imgInfo = image(img);
      this.success({
        url: 'data:image/jpeg;base64,' + img.toString('base64'),
        width: imgInfo.width,
        height: imgInfo.height,
      });
      return;
    }
    // 如果rtsp地址不正确，则直接返回空数据（修改bug 3791，标定页面未上传图片时，打开标定页面接口会超时）
    if (!isRtsp(rtsp)) {
      this.success({});
      return;
    }
    const groupName = await this.service.group3.getGroupNameById(camera.groupId);
    const cameraName = this.ctx.query.name ? this.ctx.query.name : groupName;
    // 确保目录存在
    await fsExtra.ensureDir(`${this.imageDir}${cameraName}`);
    const imagePath = `${this.imageDir}${cameraName}/capture_img.png`;
    if (!(await fsExtra.pathExists(imagePath))) {
      try {
        await captureRtsp(rtsp, `${this.imageDir}${cameraName}`, 'capture_img.png');
        // await exec(
        //   this.cmd + `/v2x_img_capture_rtsp "${rtsp}" ${this.imageDir}${cameraName}/capture_img.png`
        // );
        // 下面exec逻辑不会用到，故注释
        // } else {
        //   await exec(
        //     this.cmd + `/v2x_img_capture "${rtsp}" 5560 5565 ${this.imageDir}${cameraName}/capture_img.png`
        //   );
      } catch (error) {
        this.ctx.logger.error(error);
        return this.failed('请确认rstp地址是否可用');
      }
    }
    const secondImagePath = `${this.imageDir}${cameraName}/capture_img_2.png`;
    // 如果不存在capture_img.png，则将capture_img_2.png复制为capture_img.png
    if (!fs.existsSync(imagePath) && fs.existsSync(secondImagePath)) {
      fsExtra.copyFileSync(secondImagePath, imagePath);
    }
    const img = fs.readFileSync(imagePath);
    const imgInfo = image(img);
    this.success({
      url: 'data:image/jpeg;base64,' + img.toString('base64'),
      width: imgInfo.width,
      height: imgInfo.height,
    });
  }

  // 上报数据至算法侧
  async reportData() {
    const { ctx } = this;
    let index = 0;
    const { resultGroup, cameraData } = await ctx.service.mark3.getReportData();
    const handleArr = [];
    // await fsExtra.emptyDir(this.algorithmicDir);
    // await fsExtra.emptyDir(this.app.config.cfgSingleDir);
    let fuseAllData = [];
    for (const key in cameraData) {
      const cameraItemData = cameraData[key][0];
      // 如果相机不在某个group里面，则跳过该数据，继续遍历下一条数据
      if (!cameraItemData.groupId) {
        continue;
      }
      // 获取与camera所在的group的基本信息
      const groupInfo = await this.service.group3.getGroupBasicInfoById(cameraItemData.groupId);
      if (!groupInfo) {
        continue;
      }
      const markData = resultGroup[key] ? resultGroup[key] : [];
      cameraItemData.positionName = groupInfo.name;
      this.writeOtherEventParams(groupInfo.name);
      // this.writeSpeedThreshold(groupInfo);
      // cameraItemData.positionName = positionName[String(cameraItemData.position)];
      this.writeSensorData(cameraItemData, groupInfo, index, '3');
      const fuseArrTemp = this.handleData(markData, cameraItemData, '3');
      fuseAllData = [ ...fuseAllData, ...fuseArrTemp ];
      index++;
    }
    await this.writeFuseData(fuseAllData);
    await this.writeDeviceData();
    // 下面是写分布式相关配置文件，项目暂时不用，故注释
    // await this.writeDistributionData();
    this.success();
  }
  /**
   * 写融合标定配置文件
   * @param {array} entryAreaData 融合标定配置页面中的entry_area字段数据
   */
  async writeFuseData(entryAreaData) {
    const result = {
      topview: {
        visual: false,
        max_length_miles: 150,
        max_width_miles: 150,
        scale: 1.2,
      },
      control: {
        enable: false,
      },
      entry_area: entryAreaData,
      retrieve_lost: true,
    };
    const filePath = `${this.app.config.algorithmicDir}chan3/cfg_multiple/fuse_multiple.json`;
    await fsExtra.ensureDir(this.app.config.algorithmicDir + 'chan3/cfg_multiple/');
    await fsExtra.writeJson(filePath, result, { spaces: '\t' });
  }

  // 设备数据写入文件
  async writeDeviceData() {
    // const filePath = this.deviceConfigPath;
    const filePathLocal = 'app/public/files/default-empty.json';
    const emptyArr = [];
    const allDeviceData = await this.service.camera3.getAll();
    const result = await fsExtra.readJson(filePathLocal);
    // result['chan-configs'][0]['spl-configs'] = [];
    // 过滤出非camera的设备
    const notCameraData = result['chan-configs'][0]['spl-configs'].filter(a => a.spl != 'omnipotent' && a.spl != 'horizon');
    allDeviceData.forEach((item, index) => {
      if (isRtsp(item.rtsp)) {
        const cameraConfigJson = this.cloneDeep(cameraConfigJsonData);
        cameraConfigJson.name = item.name;
        // cameraConfigJson['camera-id'] = positionName[String(item.position)] + '_' + String(index * 2);
        cameraConfigJson['camera-id'] = item.name + '_' + String(index * 2);
        cameraConfigJson.config.general.type = 'rtsp';
        cameraConfigJson.config.general.uri = item.rtsp;
        emptyArr.push(cameraConfigJson);
      } else {
        const skylineConfigJson = this.cloneDeep(skylineConfigJsonData);
        skylineConfigJson.name = item.name;
        // skylineConfigJson['camera-id'] = positionName[String(item.position)] + '_' + String(index * 2);
        skylineConfigJson['camera-id'] = item.name + '_' + String(index * 2);
        skylineConfigJson.config.ip = item.rtsp;
        emptyArr.push(skylineConfigJson);
      }
    });
    result['chan-configs'][0]['spl-configs'] = [ ...emptyArr, ...notCameraData ];
    result['chan-configs'][0]['alg-configs'][0].mask = [ ...emptyArr, ...notCameraData ].map(a => a.name);
    result['chan-configs'][0]['alg-configs'][0].config.fusecfgpath = this.algorithmicDir;
    // await fsExtra.writeJson(filePath, result);
    await fsExtra.writeJson(filePathLocal, result);
  }

  // 标定经纬度数据的检测，返回结果不正确的标定点数据
  async checkCameraData() {
    const { ctx } = this;
    const requestData = ctx.request.body;
    const cmd = this.cmd + `/v2x_outparams_mark_verify '${JSON.stringify(requestData)}' | grep "invalid_points"`;
    let result;
    try {
      result = await exec(cmd);
    } catch (error) {
      return this.failed('命令执行失败,请确认数据的正确性');
    }
    if (result.stderr) {
      this.failed(result.stderr);
    } else {
      this.success(JSON.parse(result.stdout));
    }
  }

  // 标定经纬度数据的检测，返回结果不正确的标定点数据图片
  async checkCameraDataImg() {

    const { ctx } = this;
    const requestData = ctx.request.body;
    // 存放检测经纬度数据文件位置
    const cameraJsonPath = path.resolve(__dirname, '../public/files/camera_params.json');
    await fsExtra.ensureFile(cameraJsonPath);
    await fsExtra.writeJson(cameraJsonPath, requestData.cameraData);
    if (requestData.cameraId === undefined) {
      return this.failed('请传递摄像头ID参数');
    }
    const groupIdResult = await this.service.camera3.getGroupId(requestData.cameraId);
    if (!groupIdResult) {
      return this.failed('未获取到摄像头所在组');
    }
    const groupName = await this.service.group3.getGroupNameById(groupIdResult.groupId);
    const imgPath = `${this.imageDir}${groupName}/capture_img.png`;
    const cmd = this.cmd + '/v2x_fuse_calibrate_verify ' + cameraJsonPath + ' ' + imgPath;
    try {
      const result = await exec(cmd);
      this.ctx.logger.info('[checkCameraDataImg] result: ', result);
    } catch (error) {
      this.ctx.logger.error('[checkCameraDataImg] error: ', error);
      return this.failed('请检测数据的准确性');
    }
    const img = fs.readFileSync(`${this.imageDir}${requestData.cameraName}/calibrated_img.jpg`);
    const imageUrl = 'data:image/jpeg;base64,' + img.toString('base64');
    this.success(imageUrl);
  }

  /**
   * 写事件高低速阈值配置文件
   * @param {object} data 包含阈值数据和组名的对象数据
   */
  async writeSpeedThreshold(data) {
    // 解析低速阈值范围值
    let lowSpeedThreshold = [ 0, 0 ];
    if (data.lowSpeedThreshold) {
      lowSpeedThreshold = data.lowSpeedThreshold.split(',');
      lowSpeedThreshold = lowSpeedThreshold.map(item => {
        item = +item;
        if (typeof item === 'number' && !isNaN(item)) {
          return item;
        }
        return 0;
      });
    }
    if (lowSpeedThreshold.length < 2) {
      lowSpeedThreshold = [ 0, 0 ];
    }
    const result = {
      high_speed: data.highSpeedThreshold || 0,
      low_speed_thresh_upper: lowSpeedThreshold[1],
      low_speed_thresh_lower: lowSpeedThreshold[0],
    };
    const fileDir = `${this.app.config.algorithmicDir}chan3/cfg_single/${data.name}/event_param`;
    const filePath = `${fileDir}/speed_params.json`;
    await fsExtra.ensureDir(fileDir);
    await fsExtra.writeJson(filePath, result, { spaces: '\t' });
  }
  /**
   * 写其余事件的阈值配置文件，均使用默认阈值
   * @param {String} groupName 组名字
   */
  async writeOtherEventParams(groupName) {
    const paramsArr = [
      {
        filename: 'traffic_jam_params',
        params: {
          // 平均车速
          avg_speed: 4.0,
          // 车辆数
          vehicle_num: 6,
          // 持续时间
          time_length_s: 300,
        },
      },
      {
        filename: 'speed_params',
        params: {
          // 高速阈值
          high_speed_thresh: 60,
          // 高速移动距离
          high_speed_move_distance: 20,
          // 高速持续时间
          high_speed_move_time_ms: 1000,
          // 低速阈值
          low_speed_thresh: 30,
          // 低速持续时间
          low_speed_move_time_ms: 1000,
        },
      },
      {
        filename: 'queue_overload_params',
        params: {
          // 平均车速
          avg_speed: 10.0,
          // 车辆数
          vehicle_num: 5,
          // 平均车距
          avg_vehicle_dist: 5.0,
          // 持续时间
          time_length_s: 5,
        },
      }, {
        filename: 'queue_overflow_params',
        params: {
          // 占用区域比例
          area_rate_thresh: 0.5,
          // 车速
          speed_thresh: 2.0,
          // 持续时间
          queue_time_s: 300,
        },
      }];
    const fileDir = `${this.app.config.algorithmicDir}chan3/cfg_single/${groupName}/event_param`;
    await fsExtra.ensureDir(fileDir);
    // 遍历源数据数组，每个元素的内容分别写入一个文件中
    paramsArr.forEach(item => {
      const filePath = `${fileDir}/${item.filename}.json`;
      // 如果文件不存在，则写文件
      if (!fsExtra.pathExistsSync(filePath)) {
        fsExtra.writeJson(filePath, item.params, { spaces: '\t' });
      }
    });
  }
  /**
   * 下载车标定外参文件
   */
  async downloadExtrinsicBin() {
    const group = this.ctx.query.group;
    if (!group) {
      return this.failed('Group参数不存在');
    }
    // 下载文件路径
    const file = this.app.config.algorithmicDir + 'chan3/cfg_single/' + group + commonDir + '/' + extrinsicBin;
    const message = downloadFile(file, this.ctx);
    if (message) {
      this.failed(message);
    }
  }
}

module.exports = MarkController;
