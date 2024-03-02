'use strict';

const hexList = [];
for (let i = 0; i <= 15; i++) {
  hexList[i] = i.toString(16);
}

function getShapePointId() {
  return new Date().getTime() + Math.round(Math.random() * 10000);
}
function randomColor() {
  return (
    'rgb(' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ',' +
    parseInt(Math.random() * 1000 + '') / 4 +
    ')'
  );
}
let unique = 0;
function buildShortUUID(prefix = '') {
  const time = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  unique++;
  return prefix + '_' + random + unique + String(time);
}

function buildUUID() {
  let uuid = '';
  for (let i = 1; i <= 36; i++) {
    if (i === 9 || i === 14 || i === 19 || i === 24) {
      uuid += '-';
    } else if (i === 15) {
      uuid += 4;
    } else if (i === 20) {
      // eslint-disable-next-line no-bitwise
      uuid += hexList[(Math.random() * 4) | 8];
    } else {
      // eslint-disable-next-line no-bitwise
      uuid += hexList[(Math.random() * 16) | 0];
    }
  }
  return uuid.replace(/-/g, '');
}
/**
 * 将camera_params.json中的数据解析为数据库存储的数据
 * @param {Object} data 待解析的配置文件数据
 * @return {Object} 数据库存储的数据
 */
function parseCamera(data) {
  let result_json = {};
  // 如果有version属性，则表示是车标定外参文件
  if (data.version) {
    result_json = data;
  } else {
    // 没有version属性，则是人工标定
    result_json.mode = data.mode;
    result_json.inData = data.in_params;
    result_json.isdistort = data.in_type;
    result_json.center = data.center;
    result_json.sceneData = data.out_params_mark.map((item, index) => ({
      id: index + 1,
      pointSource: [{ x: item.img_x, y: item.img_y }],
      lon: item.longitude,
      lat: item.latitude,
      worldX: item.world_x,
      worldY: item.world_y,
      color: 'rgb(255, 0, 0)',
      label: '点',
      labelColor: '#FFFFFF',
      shapeId: `shapPoint:${getShapePointId()}`,
    }));
    result_json.startPointId = '';
    result_json.endPointId = '';
    if (data.direction && data.direction.length > 1) {
      for (let index = 0; index < result_json.sceneData.length; index++) {
        const item = result_json.sceneData[index];
        if (item.lon == data.direction[0].longitude && item.lat == data.direction[0].latitude) {
          result_json.startPointId = item.shapeId;
        } else if (item.lon == data.direction[1].longitude && item.lat == data.direction[1].latitude) {
          result_json.endPointId = item.shapeId;
        }
        if (result_json.startPointId != '' && result_json.endPointId != '') {
          break;
        }
      }
    }
  }
  return { type: 'camera', data: result_json };
}
/**
 * 将detect_area.json中的数据解析为数据库存储的数据
 * @param {Object} data 待解析的配置文件数据
 * @return {Object} 数据库存储的数据
 */
function parseDetect(data) {
  const result_json = [];
  data.areas.forEach(item => {
    result_json.push({
      color: randomColor(),
      type: buildShortUUID(),
      label: '',
      shapeId: `shapPoint:${getShapePointId()}`,
      pointSource: item.area_points,
      detectionType: [
        '交通目标(机非人)',
        '抛洒物',
      ],
    });
  });
  return { type: 'area', data: result_json };
}
function getLaneItem(type, name, laneType, pointSource) {
  const lineType = name === '实线' ? 'brokenLine' : '';
  return {
    color: randomColor(),
    type,
    label: '',
    shapeId: `shapPoint:${getShapePointId()}`,
    name,
    laneType,
    lanePosition: '',
    pointSource,
    lineType,
    lineDescription: '',
  };
}
/**
 * 将lane_area.json中的数据解析为数据库存储的数据
 * @param {Object} data 待解析的配置文件数据
 * @return {Object} 数据库存储的数据
 */
function parseLane(data) {
  const result_json = [];
  data.areas.forEach(item => {
    if (item.area_points && item.area_points.length > 0) {
      const pointSource = item.area_points.map(point => ({
        x: point.x,
        y: point.y,
        lineType: 'line',
      }));
      const temp_item = getLaneItem(item.lane_id, '车道区域', '左转车道', pointSource);
      result_json.push(temp_item);
    }
    if (item.direction.begin_point) {
      const pointSource = [{ x: item.direction.begin_point.x, y: item.direction.begin_point.y, lineType: 'arrow' },
        { x: item.direction.end_point.x, y: item.direction.end_point.y, lineType: 'arrow' }];
      const temp_item = getLaneItem(item.lane_id, '方向', '左转车道', pointSource);
      result_json.push(temp_item);
    }
    if (item.count_line.begin_point) {
      const pointSource = [{ x: item.count_line.begin_point.x, y: item.count_line.begin_point.y, lineType: 'flow' },
        { x: item.count_line.end_point.x, y: item.count_line.end_point.y, lineType: 'flow' }];
      const temp_item = getLaneItem(item.lane_id, '流量统计线', '左转车道', pointSource);
      result_json.push(temp_item);
    }
  });
  data.solid_lines.forEach(item => {
    const pointSource = item.points.map(point => ({
      x: point.x,
      y: point.y,
      lineType: 'brokenLine',
    }));
    const temp_item = getLaneItem(item.id, '实线', '', pointSource);
    result_json.push(temp_item);
  });
  return { type: 'lane', data: result_json };
}
/**
 * 将event_area目录中的事件配置文件数据解析为数据库存储的数据
 * @param {Object} data 待解析的配置文件数据
 * @param {String} filename 待解析的配置文件的名字
 * @return {Object} 数据库存储的数据
 */
function parseEvent(data, filename) {
  const result_json = [];
  const dataStack = [];
  const childStack = [];
  Object.keys(data.child).forEach(key => {
    const current_item = data.child[key];
    // const child = current_item.child;
    dataStack.push({ data: current_item, key, level: 1 });
    childStack.push(result_json);
    while (dataStack.length > 0) {
      const current_item_inner = dataStack.pop();
      const child_arr = childStack.pop();
      const current_item_key = current_item_inner.key;
      const current_item_level = current_item_inner.level;
      const child_temp = current_item_inner.data;
      const child_temp_child = child_temp.child;
      const child_temp_area = child_temp.area;
      const area_new = [];
      const child_new = [];
      const id = buildUUID();
      Object.keys(child_temp_child).forEach(child_inner => {
        dataStack.push({
          data: child_temp_child[child_inner],
          key: child_inner,
          level: current_item_level + 1,
          parentId: id,
        });
        childStack.push(child_new);
      });
      if (child_temp_area.length > 0) {
        child_temp_area.forEach(item => {
          area_new.push({
            color: randomColor(),
            type: buildShortUUID(),
            label: '',
            shapeId: `shapPoint:${getShapePointId()}`,
            pointSource: item,
            propertyId: id,
          });
        });
      }
      const temp_item = {
        id,
        key: id,
        name: current_item_key,
        title: current_item_key,
        nodeLevel: current_item_level,
        children: child_new,
        icon: area_new.length > 0 ? 'clarity:network-switch-line' : 'ic:outline-folder-copy',
        area: area_new,
      };
      if (current_item_level !== 1) {
        temp_item.parentId = current_item_inner.parentId;
      }
      child_arr.push(temp_item);
    }
  });
  return { type: 'event', data: result_json, name: filename.replace(/(.*)\.json$/, '$1') };
}
/**
 * 将fuse_multiple.json中的数据解析为数据库存储的数据
 * @param {Object} data 待解析的配置文件数据
 * @return {Object} 数据库存储的数据
 */
function parseFuse(data) {
  const result_json = {};
  data.entry_area.forEach(item => {
    const direction = item.direction;
    const area_points = item.area_points;
    const name = item.name;
    if (!result_json[name]) {
      result_json[name] = [];
    }
    const current_index = result_json[name].length;
    if (direction.begin_point) {
      const point_source = [{ x: direction.begin_point.x, y: direction.begin_point.y, lineType: 'arrow' },
        { x: direction.end_point.x, y: direction.end_point.y, lineType: 'arrow' }];
      result_json[name].push({
        color: randomColor(),
        type: current_index + 1,
        label: '',
        shapeId: `shapPoint:${getShapePointId()}`,
        name: 'direction',
        pointSource: point_source,
      });
    }
    if (Array.isArray(area_points)) {
      const point_source = area_points.map(item => ({ x: item.x, y: item.y, lineType: 'line' }));
      result_json[name].push({
        color: randomColor(),
        type: current_index + 1,
        label: '',
        shapeId: `shapPoint:${getShapePointId()}`,
        name: 'area',
        pointSource: point_source,
      });
    }
  });
  return result_json;
}
/**
 * 解析sensor.json中的雷达数据
 * @param {Object} data 待解析的配置文件数据
 * @return {Object} 雷达数据
 */
function parseSensor(data) {
  // 如果radar数据中enable属性为真，则返回雷达数据，否则返回空
  if (data.radar && data.radar.enable) {
    return data.radar;
  }
  return null;
}
/**
 * 数据解析入口方法
 * @param {String} filename 文件名
 * @param {Object} data 待解析的配置文件数据
 * @param {Boolean} isEvent 是否event_area目录中的事件配置文件数据
 * @param {Object} ctx ctx对象
 * @return {Object} 数据库存储的数据
 */
function parseData(filename, data, isEvent, ctx) {
  let result = null;
  try {
    if (isEvent) {
      result = parseEvent(data, filename);
    } else if (filename === 'camera_params.json') {
      result = parseCamera(data);
    } else if (filename === 'detect_area.json') {
      result = parseDetect(data);
    } else if (filename === 'lane_area.json') {
      result = parseLane(data);
    } else if (filename === 'fuse_multiple.json') {
      result = parseFuse(data);
    }
  } catch (error) {
    ctx.logger.error('[Parse config files data]', error);
  }
  return result;
}
/**
 * 读取文件流的数据，并解析为json对象
 * @param {Object} fileStream 文件流对象
 * @param {Object} ctx ctx对象
 * @return {Object} Promise对象
 */
async function readStreamData(fileStream, ctx) {
  // 创建一个可写流来接收文件内容
  const chunks = [];
  fileStream.on('data', chunk => {
  // 将每个数据块存储到数组中
    chunks.push(chunk);
  });

  return new Promise((resolve, reject) => {
    fileStream.on('end', () => {
    // 将所有数据块连接起来，形成完整的文件内容
      const fileContent = Buffer.concat(chunks).toString();
      if (fileContent) {
        const jsonData = JSON.parse(fileContent);
        resolve({ json: jsonData, data: fileContent });
      } else {
        resolve(null);
      }
    });

    fileStream.on('error', error => {
      ctx.logger.error('[Read stream data error]', error);
      resolve(null);
    });
  });
}

module.exports = {
  readStreamData,
  parseData,
  parseSensor,
};
