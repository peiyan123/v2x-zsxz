import { CameraTowardsEnum, PositionEnum } from './../../core/enums/cameraEnum'
import { DeviceType } from '@/core/enums/cameraEnum'

export const cameraList: any[] = [
  { name: 'camera1', ip: '192.168.1.1', port: 88, radar: '雷达1', id: 1 },
  { name: 'camera2', ip: '192.168.1.1', port: 88, radar: '雷达2' },
  { name: 'camera3', ip: '192.168.1.1', port: 88, radar: '雷达3' },
  { name: 'camera4', ip: '192.168.1.1', port: 88, radar: '雷达4' },
  { name: 'camera5', ip: '192.168.1.1', port: 88, radar: '雷达5' },
  { name: 'camera6', ip: '192.168.1.1', port: 88, radar: '雷达6' },
  { name: 'camera7', ip: '192.168.1.1', port: 88, radar: '雷达7' },
  { name: 'camera8', ip: '192.168.1.1', port: 88, radar: '雷达8' },
  { name: 'camera9', ip: '192.168.1.1', port: 88, radar: '雷达9' },
  { name: 'camera10', ip: '192.168.1.1', port: 88, radar: '雷达10' },
  { name: 'camera11', ip: '192.168.1.1', port: 88, radar: '雷达11' },
]

export const deviceType: any[] = [
  { value: '0', label: '交通摄像头' },
  { value: '1', label: '毫米波雷达' },
  { value: '2', label: 'RSU' },
]

export const cameraTowards: any[] = [
  { value: '0', label: '东', key: 'east' },
  { value: '1', label: '南', key: 'south' },
  { value: '2', label: '西', key: 'west' },
  { value: '3', label: '北', key: 'north' },
  { value: '4', label: '东北', key: 'northeast' },
  { value: '5', label: '东南', key: 'southeast' },
  { value: '6', label: '西南', key: 'southwest' },
  { value: '7', label: '西北', key: 'northwest' },
]

export const installPosition: any[] = [
  {
    value: '0',
    label: '进口(北向)',
  },
  {
    value: '1',
    label: '进口(东北向)',
  },
  {
    value: '2',
    label: '进口(东向)',
  },
  {
    value: '3',
    label: '进口(东南向)',
  },
  {
    value: '4',
    label: '进口(南向)',
  },
  {
    value: '5',
    label: '进口(西南向)',
  },
  {
    value: '6',
    label: '进口(西向)',
  },
  {
    value: '7',
    label: '进口(西北向)',
  },
  {
    value: '8',
    label: '出口(北向)',
  },
  {
    value: '9',
    label: '出口(东北向)',
  },
  {
    value: '10',
    label: '出口(东向)',
  },
  {
    value: '11',
    label: '出口(东南向)',
  },
  {
    value: '12',
    label: '出口(南向)',
  },
  {
    value: '13',
    label: '出口(西南向)',
  },
  {
    value: '14',
    label: '出口(西向)',
  },
  {
    value: '15',
    label: '出口(西北向)',
  },
]

export const columns = [
  // {
  //   title: '设备名称',
  //   dataIndex: 'name',
  //   align: 'center',
  //   ellipsis: true,
  //   sorter: true,
  // },
  {
    title: 'RTSP',
    dataIndex: 'rtsp',
    align: 'center',
    customRender: ({ text }) => (text ? text : '/'),
    ellipsis: true,
  },
  { title: '方向', align: 'center', dataIndex: 'towards', customRender: ({ text }) => CameraTowardsEnum[text] },
  {
    title: '厂商',
    align: 'center',
    dataIndex: 'facturer',
    customRender: ({ text }) => (text === 'hikvision' ? '海康威视' : text === 'sensing' ? '森云' : ''),
  },
  // { title: '安装位置', align: 'center', dataIndex: 'position', customRender: ({ text }) => PositionEnum[text] },
  { title: '设备型号', align: 'center', dataIndex: 'model', ellipsis: true },
  {
    title: '设备状态',
    dataIndex: 'status',
    align: 'center',
    // customRender: ({ text }) => (text == '1' ? '启用' : text == '0' ? '关闭' : '/'),
  },
  { title: '创建/更新时间', align: 'center', dataIndex: 'updatedAt', sorter: true },
  { title: '操作', align: 'center', dataIndex: 'operation' },
]
