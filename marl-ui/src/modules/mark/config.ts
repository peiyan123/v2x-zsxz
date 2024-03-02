export const detectionTypeData = [
  { value: '交通目标(机非人)', label: '交通目标(机非人)' },
  { value: '行人横穿', label: '行人横穿' },
  { value: '非法停车', label: '非法停车' },
  { value: '车辆逆行', label: '车辆逆行' },
  { value: '违章变道', label: '违章变道' },
  { value: '道路拥堵', label: '道路拥堵' },
  { value: '抛洒物', label: '抛洒物' },
]

export const laneTypeData = [
  { value: '左转车道', label: '左转车道' },
  { value: '左转直行车道', label: '左转直行车道' },
  { value: '直行车道', label: '直行车道' },
  { value: '直行右转车道', label: '直行右转车道' },
  { value: '右转车道', label: '右转车道' },
  { value: '掉头车道', label: '掉头车道' },
  { value: '左转掉头车道', label: '左转掉头车道' },
]

// 事件类型
export const EVENT_TYPE = 'event'
// 事件类型tab标签页tab关键字前缀
export const EVENT_PREFIX = `${EVENT_TYPE}-`

// 默认事件区域配置数据
export const DEFAULT_EVENTS = {
  abnormal_vehicle_leaving_area: {
    property: [
      {
        name: 'lane_area',
        title: '车道区域',
        children: [
          { name: 'detect_area', title: '检测区域' },
          { name: 'leave_area', title: '驶离区域' },
        ],
      },
    ],
    label: '异常车辆驶离区域',
  },
  emergence_lane_occupation_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '应急车道占用区域',
  },
  pedestrian_at_zebra_crossing_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '行人过斑马线区域',
  },
  pedestrian_instrusion_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '行人闯入',
  },
  queue_overflow_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '队列溢出区',
  },
  stop_validation_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '违停',
  },
  road_construction_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '道路施工区域',
  },
  traffic_accident_area: {
    property: [
      {
        name: 'check_area',
        title: '检测区域',
      },
    ],
    label: '交通事故区域',
  },
}
