'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const verifyToken = app.middleware.verifyToken({ secret: '123456' });

  router.get('/', controller.home.index);
  // camera
  router.get('/camera', verifyToken, controller.camera.get);
  router.post('/camera', verifyToken, controller.camera.create);
  router.post('/camera/update', verifyToken, controller.camera.update);
  router.delete('/camera', verifyToken, controller.camera.delete);
  router.get('/camera/video/:name', controller.camera.getVideo);
  router.post('/rtsp/open', verifyToken, controller.camera.startRtsp);
  router.post('/rtsp/close', verifyToken, controller.camera.closeRtsp);
  router.post('/reboot', verifyToken, controller.camera.rebootDevice);

  router.get('/camera2', verifyToken, controller.camera2.get);
  router.post('/camera2', verifyToken, controller.camera2.create);
  router.post('/camera2/update', verifyToken, controller.camera2.update);
  router.delete('/camera2', verifyToken, controller.camera2.delete);
  router.get('/camera2/video/:name', controller.camera2.getVideo);
  router.post('/rtsp2/open', verifyToken, controller.camera2.startRtsp);
  router.post('/rtsp2/close', verifyToken, controller.camera2.closeRtsp);
  router.post('/reboot2', verifyToken, controller.camera2.rebootDevice);
  router.get('/camera3', verifyToken, controller.camera3.get);
  router.post('/camera3', verifyToken, controller.camera3.create);
  router.post('/camera3/update', verifyToken, controller.camera3.update);
  router.delete('/camera3', verifyToken, controller.camera3.delete);
  router.get('/camera3/video/:name', controller.camera3.getVideo);
  router.post('/rtsp3/open', verifyToken, controller.camera3.startRtsp);
  router.post('/rtsp3/close', verifyToken, controller.camera3.closeRtsp);
  router.post('/reboot3', verifyToken, controller.camera3.rebootDevice);
  // mark
  router.get('/mark/download/bin', verifyToken, controller.mark.downloadExtrinsicBin);
  router.get('/mark2/download/bin', verifyToken, controller.mark2.downloadExtrinsicBin);
  router.get('/mark3/download/bin', verifyToken, controller.mark3.downloadExtrinsicBin);
  router.post('/mark', verifyToken, controller.mark.handleMarkData);
  router.post('/mark2', verifyToken, controller.mark2.handleMarkData);
  router.post('/mark3', verifyToken, controller.mark3.handleMarkData);
  router.get('/mark', verifyToken, controller.mark.getMarkData);
  router.get('/mark2', verifyToken, controller.mark2.getMarkData);
  router.get('/mark3', verifyToken, controller.mark3.getMarkData);
  router.get('/mark-download', controller.mark.download);
  router.get('/mark-download2', controller.mark2.download);
  router.get('/mark-download3', controller.mark3.download);
  router.get('/image', verifyToken, controller.mark.getImage);
  router.get('/image2', verifyToken, controller.mark2.getImage);
  router.get('/image3', verifyToken, controller.mark3.getImage);
  router.get('/imageFirst', verifyToken, controller.mark.getImage);
  router.get('/imageFirst2', verifyToken, controller.mark2.getImage);
  router.get('/imageFirst3', verifyToken, controller.mark3.getImage);
  router.post('/check', verifyToken, controller.mark.checkCameraData);
  router.post('/check2', verifyToken, controller.mark2.checkCameraData);
  router.post('/check3', verifyToken, controller.mark3.checkCameraData);
  router.post('/checkImg', verifyToken, controller.mark.checkCameraDataImg);
  router.post('/checkImg2', verifyToken, controller.mark2.checkCameraDataImg);
  router.post('/checkImg3', verifyToken, controller.mark3.checkCameraDataImg);
  // 上报数据至算法侧
  router.post('/report', verifyToken, controller.mark.reportData);
  router.post('/report2', verifyToken, controller.mark2.reportData);
  router.post('/report3', verifyToken, controller.mark3.reportData);
  // user
  router.get('/user/login/token', controller.user.loginWithToken); // 使用第三方Token并调用第三方接口进行token登录
  router.post('/user/login', controller.user.login);
  router.post('/user/modify', controller.user.modifyPassword);
  router.post('/user/logout', controller.user.logout);
  // 文件上传
  router.post('/upload/camera/bin', verifyToken, controller.upload.uploadExtrinsicBin);
  router.post('/upload', verifyToken, controller.upload.upload);
  router.post('/uploadCameraImage', verifyToken, controller.upload.uploadCameraImage);
  router.post('/upload-cert', verifyToken, controller.upload.uploadCert);
  router.post('/upload/chunk/upload', verifyToken, controller.upload.uploadChunkFile);
  router.post('/upload/chunk/merge', verifyToken, controller.upload.mergeChunkFile);
  router.post('/upload/chunk/check', verifyToken, controller.upload.checkChunkFile);
  // mec
  router.post('/mec', verifyToken, controller.mec.saveConfig);
  router.post('/test-connect', verifyToken, controller.mec.testConnect);
  router.get('/mec', verifyToken, controller.mec.getConfig);
  router.get('/mec/info', verifyToken, controller.mec.getMecInfo);
  router.get('/mec/applications', verifyToken, controller.mec.getApplications);
  router.get('/mec/road/picture', verifyToken, controller.mec.getRoadPicture);
  router.get('/mec/road/config', verifyToken, controller.mec.getRoadConfig);
  router.get('/mec/apply', verifyToken, controller.mec.saveApply);

  router.post('/mec2', verifyToken, controller.mec2.saveConfig);
  router.post('/test-connect2', verifyToken, controller.mec2.testConnect);
  router.get('/mec2', verifyToken, controller.mec2.getConfig);
  router.get('/mec2/info', verifyToken, controller.mec2.getMecInfo);
  router.get('/mec2/applications', verifyToken, controller.mec2.getApplications);
  router.get('/mec2/road/picture', verifyToken, controller.mec2.getRoadPicture);
  router.get('/mec2/road/config', verifyToken, controller.mec2.getRoadConfig);
  router.get('/mec2/apply', verifyToken, controller.mec2.saveApply);
  
  router.post('/mec3', verifyToken, controller.mec3.saveConfig);
  router.post('/test-connect3', verifyToken, controller.mec3.testConnect);
  router.get('/mec3', verifyToken, controller.mec3.getConfig);
  router.get('/mec3/info', verifyToken, controller.mec3.getMecInfo);
  router.get('/mec3/applications', verifyToken, controller.mec3.getApplications);
  router.get('/mec3/road/picture', verifyToken, controller.mec3.getRoadPicture);
  router.get('/mec3/road/config', verifyToken, controller.mec3.getRoadConfig);
  router.get('/mec3/apply', verifyToken, controller.mec3.saveApply);
  // radar
  router.get('/radar', verifyToken, controller.radar.get);
  router.get('/radar2', verifyToken, controller.radar2.get);
  router.get('/radar3', verifyToken, controller.radar3.get);
  router.post('/radar', verifyToken, controller.radar.create);
  router.post('/radar2', verifyToken, controller.radar2.create);
  router.post('/radar3', verifyToken, controller.radar3.create);
  router.post('/radar/update', verifyToken, controller.radar.update);
  router.post('/radar2/update', verifyToken, controller.radar2.update);
  router.post('/radar3/update', verifyToken, controller.radar3.update);
  router.delete('/radar', verifyToken, controller.radar.delete);
  router.delete('/radar2', verifyToken, controller.radar2.delete);
  router.delete('/radar3', verifyToken, controller.radar3.delete);
  router.post('/radar/report', verifyToken, controller.radar.reportData);
  router.post('/radar2/report', verifyToken, controller.radar2.reportData);
  router.post('/radar3/report', verifyToken, controller.radar3.reportData);
  // rsu
  router.get('/rsu', verifyToken, controller.rsu.get);
  router.post('/rsu', verifyToken, controller.rsu.create);
  router.post('/rsu/update', verifyToken, controller.rsu.update);
  router.delete('/rsu', verifyToken, controller.rsu.delete);
  router.post('/rsu/report', verifyToken, controller.rsu.reportData);
  // task
  router.get('/task', verifyToken, controller.task.getTaskConfig);
  router.post('/task/single', verifyToken, controller.task.saveSingleConfig);
  router.post('/task/multiple', verifyToken, controller.task.saveMultipleConfig);
  router.get('/task2', verifyToken, controller.task2.getTaskConfig);
  router.post('/task2/single', verifyToken, controller.task2.saveSingleConfig);
  router.post('/task2/multiple', verifyToken, controller.task2.saveMultipleConfig);
  router.get('/task3', verifyToken, controller.task3.getTaskConfig);
  router.post('/task3/single', verifyToken, controller.task3.saveSingleConfig);
  router.post('/task3/multiple', verifyToken, controller.task3.saveMultipleConfig);
  // group
  router.post('/group/upload/configs', verifyToken, controller.group.uploadConfigFiles);
  router.post('/group2/upload/configs', verifyToken, controller.group2.uploadConfigFiles);
  router.post('/group3/upload/configs', verifyToken, controller.group3.uploadConfigFiles);
  router.get('/group', verifyToken, controller.group.getAll);
  router.get('/group2', verifyToken, controller.group2.getAll);
  router.get('/group3', verifyToken, controller.group3.getAll);
  router.get('/group/info', verifyToken, controller.group.getGroupInfoById);
  router.get('/group2/info', verifyToken, controller.group2.getGroupInfoById);
  router.get('/group3/info', verifyToken, controller.group3.getGroupInfoById);
  router.post('/group', verifyToken, controller.group.create);
  router.post('/group2', verifyToken, controller.group2.create);
  router.post('/group3', verifyToken, controller.group3.create);
  router.post('/group/update', verifyToken, controller.group.update);
  router.post('/group2/update', verifyToken, controller.group2.update);
  router.post('/group3/update', verifyToken, controller.group3.update);
  router.delete('/group', verifyToken, controller.group.delete);
  router.delete('/group2', verifyToken, controller.group2.delete);
  router.delete('/group3', verifyToken, controller.group3.delete);
  router.get('/group/pull', verifyToken, controller.group.pullDataFromExtension);
  router.get('/group2/pull', verifyToken, controller.group2.pullDataFromExtension);
  router.get('/group3/pull', verifyToken, controller.group3.pullDataFromExtension);
  router.get('/group/all-info', controller.group.getAllInfoByGroupName); // 服务器间同步数据接口，故未做token验证
  router.get('/group2/all-info', controller.group2.getAllInfoByGroupName); // 
  router.get('/group3/all-info', controller.group3.getAllInfoByGroupName); // 服务器间同步数据接口，故未做token验证
  // settings
  router.get('/settings/sub-device', verifyToken, controller.settings.getSubDevice);
  router.post('/settings/sub-device', verifyToken, controller.settings.setSubDevice);
};
