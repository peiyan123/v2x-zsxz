'use strict';
const Service = require('egg').Service;
const { transformTimezone, getSaveFilename } = require('../utils/utils');
const path = require('path');
const awaitWriteStream = require('await-stream-ready').write;
const fs = require('fs');
const fsExtra = require('fs-extra');
const { readStreamData, parseData, parseSensor } = require('../utils/parseConfigs');

class GroupService extends Service {
  /**
   * 获取所有组
   * @return {Array} 查询结果
   */
  async getAll() {
    const result = await this.app.model.Group3.findAll();
    return result;
  }
  /**
   * 创建组
   * @param {object} data 用于创建组的数据
   * @return {object} 创建结果
   */
  async create(data) {
    const allData = await this.getAll();
    for (let i = 0; i < allData.length; i++) {
      if (data.name && allData[i].name === data.name) {
        return { data: '', returnStatus: 'FAILED', errorMessage: '组名重复' };
      }
    }
    const result = await this.app.model.Group3.create(data);
    return { data: result, returnStatus: 'SUCCEED' };
  }
  /**
   * 更新组
   * @param {object} data 用于更新组的数据
   * @return {object} 更新结果
   */
  async update(data) {
    const isExist = await this.app.model.Group3.findOne({ where: { id: data.id } });
    if (!isExist) return { data: '', returnStatus: 'FAILED', errorMessage: 'ID不存在' };
    const allData = await this.getAll();
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].id === data.id) continue;
      if (data.name && allData[i].name === data.name) {
        return { data: '', returnStatus: 'FAILED', errorMessage: '组名重复' };
      }
    }
    const result = await this.app.model.Group3.update(data, {
      where: { id: data.id },
    });
    return { data: result, returnStatus: 'SUCCEED' };
  }
  /**
   * 删除组
   * @param {number} id 待删除组的id
   * @return {object} 删除结果
   */
  async delete(id) {
    const group = await this.app.model.Group3.findOne({
      where: { id },
      // 获取关联的摄像头和雷达id
      include: [{
        model: this.app.model.Camera3,
        attributes: [ 'id' ],
      }, {
        model: this.app.model.Radar3,
        attributes: [ 'id' ],
      }],
    });
    if (!group) return { data: '', returnStatus: 'FAILED', errorMessage: 'ID不存在' };
    // const result = await this.app.model.Group.destroy({
    //   where: { id },
    // });
    try {
      const result = await group.destroy();
      // 将删除的group中所包含的相机和雷达的id拼接成字符串
      const deleteIds = [];
      if (group.camera3) {
        deleteIds.push({ operatorType: 'VIDEO', ids: [ group.camera3.id ] });
      }
      if (group.radar3) {
        deleteIds.push({ operatorType: 'LIDAR', ids: [ group.radar3.id ] });
      }
      // 将删除的相机和雷达id字符串返回给controller处理
      return { data: result, deleteIds, returnStatus: 'SUCCEED' };
    } catch (error) {
      this.ctx.logger.error('[Delete group error]', error);
      return { data: '', returnStatus: 'FAILED', errorMessage: '删除出错' };
    }
  }
  /**
   * 根据group id获取组的基本信息和设备信息
   * @param {number} id 组id
   * @return {object} 查询结果
   */
  async getGroupInfoById(id) {
    return await this.getGroupInfo({ id });
  }
  /**
   * 根据group name获取组的基本信息和设备信息
   * @param {string} name 组名字
   * @return {object} 查询结果
   */
  async getGroupInfoByName(name) {
    return await this.getGroupInfo({ name });
  }
  /**
   * 获取组的基本信息和设备信息
   * @param {object} whereClause where语句
   * @return {object} 查询结果
   */
  async getGroupInfo(whereClause) {
    const result = await this.app.model.Group3.findOne({
      where: whereClause,
      include: [{
        model: this.app.model.Camera3,
        attributes: { include: transformTimezone('camera3') },
      }, {
        model: this.app.model.Radar3,
        attributes: { include: transformTimezone('radar3') },
      }],
    })
    return { data: result, returnStatus: 'SUCCEED' };
  }
  /**
   * 获取组的基本信息
   * @param {number} id 组id
   * @return {object} 查询结果
   */
  async getGroupBasicInfoById(id) {
    const result = await this.app.model.Group3.findOne({ where: { id } });
    return result;
  }
  /**
   * 获取组的名字
   * @param {number} id 组id
   * @return {object} 查询结果
   */
  async getGroupNameById(id) {
    const result = await this.app.model.Group3.findOne({ where: { id } });
    return result && result.name || '';
  }
  /**
   * 删除表group中的所有数据，同时会级联删除camera表,radar表和mark表中的数据
   */
  async deleteAllGroups() {
    const deleteIds = [];
    const cameraIds = await this.app.model.Camera3.findAll({
      attributes: [ 'id' ],
    });
    const radarIds = await this.app.model.Radar3.findAll({
      attributes: [ 'id' ],
    });
    if (cameraIds) {
      deleteIds.push({ operatorType: 'VIDEO', ids: cameraIds.map(item => item.id) });
    }
    if (radarIds) {
      deleteIds.push({ operatorType: 'LIDAR', ids: radarIds.map(item => item.id) });
    }
    // 调用EdgeService的删除算法配置接口
    let data = {
      analyIds: deleteIds, 
      taskCode: 'chan3'
    }
    this.service.edge.deleteDetail(data);
    const group = await this.app.model.Group3.findAll();
    if (group && group.length > 0) {
      await new Promise((resolve, reject) => {
        let count = 0;
        // 逐个删除group表中的数据，并级联删除关联表的数据
        group.forEach(async element => {
          await element.destroy();
          count++;
          if (count === group.length) {
            resolve();
          }
        });
      });
    }
    // await this.app.model.Group.destroy({truncate: true,  : true });
  }
  /**
   * 根据名字创建group和属于该group的camera
   * @param {Object} cameraIds key为group名字，value为camera id的映射对象
   * @param {String} group group名字
   */
  async createGroupAndCamera(cameraIds, group) {
    if (cameraIds[group] === undefined) {
      const { data: groupResult } = await this.create({ name: group });
      const { data: cameraResult } = await this.service.camera3.create({ model: `${group}_1`, groupId: groupResult.id });
      cameraIds[group] = cameraResult.id;
      // // 新建摄像头时需调用EdgeService的保存通道算法配置接口
      // this.service.edge.saveDetail({ id: cameraResult.id, operatorType: 'VIDEO', uri: '', groupName: group });
    }
  }
  /**
   * 根据sensor.json文件的数据判断是否需要创建雷达
   * @param {Object} data sensor.json文件的数据
   * @param {String} group group名字
   */
  async createRadar(data, group) {
    const radarData = parseSensor(data);
    if (radarData) {
      const groupResult = await this.app.model.Group3.findOne({ where: { name: group }, attributes: [ 'id' ] });
      if (groupResult) {
        await this.service.radar.create({ groupId: groupResult.id, ip: radarData.ip, port: radarData.port, protocol: 'TCP', model: `${group}_1`, position: '0' });
      }
    }
  }
  /**
   * 转换文件流数据为数据库数据，并将流数据存储到对应的文件中
   * @param {Object} stream 文件流对象
   * @param {Object} cameraIds key为group名字，value为camera id的映射对象
   */
  async saveConfigFiles(stream, cameraIds) {
    const { app, ctx } = this;
    const filename = stream.filename.toLowerCase();
    const fieldname = stream.fieldname;
    let streamData = null;
    let targetPath = null;
    let targetDir = null;
    // 匹配在cfg_single目录中的文件的文件路径
    const reg = /^([^/]+\/)*chan3\/cfg_single\/([^/]+)\/([^/]+)\/(.+)$/;
    const matchResult = fieldname.match(reg);
    if (matchResult) {
      const group = matchResult[2];
      const dir = matchResult[3];
      const otherResult = matchResult[4].match(/(.+\/)?[^/]+$/);
      const otherDir = otherResult ? otherResult[1] || '' : '';
      targetDir = `${app.config.algorithmicDir}chan3/cfg_single/${group}/${dir}`;
      if (otherDir) {
        targetDir = `${targetDir}/${otherDir}`;
      }
      targetPath = path.join(targetDir, filename);
      await this.createGroupAndCamera(cameraIds, group);
      if (dir !== 'event_param' && /.json$/.test(fieldname)) {
        const allData = await readStreamData(stream, ctx);
        if (allData) {
          streamData = allData.data;
          // 如果文件是sensor.json，则调用创建雷达的方法
          if (filename === 'sensor.json') {
            await this.createRadar(allData.json, group);
          } else {
            const markValue = parseData(filename, allData.json, dir === 'event_area', ctx);
            if (markValue) {
              // 将解析后的数据写入到数据库的mark表中
              await this.service.mark3.create(cameraIds[group], [ markValue ], { width: 1920, height: 1080, url: '' });
            }
          }
        }
      }
    } else {
      // 匹配在cfg_multiple目录中的文件的文件路径
      const multipleResult = fieldname.match(/^([^/]+\/)*chan3\/cfg_multiple\/(.+)$/);
      if (multipleResult) {
        const otherResult = multipleResult[2].match(/(.+\/)?[^/]+$/);
        const otherDir = otherResult ? otherResult[1] || '' : '';
        targetDir = app.config.algorithmicDir + 'chan3/cfg_multiple/';
        if (otherDir) {
          targetDir = `${targetDir}/${otherDir}`;
        }
        targetPath = path.join(app.config.algorithmicDir + 'chan3/cfg_multiple/', multipleResult[2]);
        if (multipleResult[2] === 'fuse_multiple.json') {
          const allData = await readStreamData(stream, ctx);
          if (allData) {
            streamData = allData.data;
            const markValue = parseData(filename, allData.json, false, ctx);
            Object.keys(markValue).forEach(async group => {
              await this.createGroupAndCamera(cameraIds, group);
              const data = { type: 'fuse', data: markValue[group] };
              // 将解析后的数据写入到数据库的mark表中
              await this.service.mark3.create(cameraIds[group], [ data ], { width: 1920, height: 1080, url: '' });
            });
          }
        }
      } else {
        // 匹配在image目录中的文件的文件路径
        const imageResult = fieldname.match(/^([^/]+\/)?image\/(.*\/)?([^/]+)/);
        if (imageResult) {
          const otherDir = imageResult[2] || '';
          targetDir = app.config.imageDir;
          if (otherDir) {
            targetDir = `${targetDir}/${otherDir}`;
          }
          targetPath = path.join(targetDir, filename);
        } else {
          // 匹配在其他目录中的文件的文件路径
          const otherResult = fieldname.match(/^([^/]+\/)+([^/]+)$/);
          if (otherResult) {
            targetDir = app.config.algorithmicDir;
            targetPath = path.join(app.config.algorithmicDir, otherResult[2]);
            // 如果是device_info.json文件，则将数据保存在mec表中
            if (filename === 'device_info.json') {
              const allData = await readStreamData(stream, ctx);
              if (allData) {
                streamData = allData.data;
                // 将数据存入mec表
                const configData = { ...allData.json, id: 1, deviceId: allData.json.id };
                await this.service.mec3.saveMecConfig(configData);
                const { id, ...otherData } = configData;
                // 调用EdgeService保存设备信息配置的接口
                // this.service.edge.saveDeviceDetail3(otherData);
              }
            }
          }
        }
      }
    }
    await fsExtra.ensureDir(targetDir);
    const writeStream = fs.createWriteStream(targetPath);
    if (streamData) {
      writeStream.write(streamData);
      writeStream.end();
    } else {
      await awaitWriteStream(stream.pipe(writeStream));
    }
  }
  /**
   * 批量更新摄像头的标定页面的图片：将上传的group下面摄像头的图片拷贝到存储标定图片上传目录，并更新camera表中的对应字段
   * @param {Object} cameraIds key为group名字，value为camera id的映射对象
   */
  async updateCameraImage(cameraIds) {
    const uploadBasePath = 'app/public/cameraImage';
    return new Promise((resolve, reject) => {
      let count = 0;
      const groups = Object.keys(cameraIds);
      // 没有group，则直接返回
      if (groups.length <= 0) {
        resolve();
      }
      // 遍历每个group，更新摄像头的标定页面图片
      groups.forEach(async group => {
        const cameraId = cameraIds[group];
        const imageDir = `${this.app.config.imageDir}${group}/`;
        if (fsExtra.existsSync(imageDir)) {
          const files = fsExtra.readdirSync(imageDir);
          for (let index = 0; index < files.length; index++) {
            const filename = files[index];
            if (/\.(png|jpg)$/.test(filename)) {
              const camera = await this.app.model.Camera3.findOne({ where: { id: cameraId } });
              if (camera) {
                const extname = path.extname(filename);
                const fileBaseName = path.basename(filename, extname);
                const filenameTemp = `${fileBaseName}_${Date.now()}${extname}`;
                fs.copyFileSync(path.join(imageDir, filename), path.join(uploadBasePath, filenameTemp));
                const saveFile = await getSaveFilename(filename, filenameTemp, uploadBasePath);
                await camera.update({ imagePath: `${uploadBasePath}/${saveFile}` });
              }
            }
          }
        }
        count++;
        if (count === groups.length) {
          resolve();
        }
      });
    });
  }
}
module.exports = GroupService;
