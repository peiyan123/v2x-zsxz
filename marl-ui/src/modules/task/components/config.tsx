import { FormSchema } from '../../../components/Form/types/form'
import { domainIpValidate, portValidate, blankValidate } from '@/utils/formValidate'
import { h } from 'vue'
import { Tooltip } from 'ant-design-vue'
// single task 配置相关数据
export const SINGLE_LIST: Record<string, any>[] = [
  { key: 'CameraAlgoTask', label: '摄像头算法（CameraAlgoTask）', value: true, disabled: true },
  { key: 'FuseTask', label: '融合（FuseTask）', value: true, disabled: true },
  { key: 'LprAlgoTask', label: '车辆车牌识别（LprAlgoTask）', default: true },
  { key: 'StatisticTask', label: '统计（StatisticTask）' },
  { key: 'ShowTask', label: '显示（ShowTask）', value: false, disabled: true },
  // { key: 'DataSaveTask', label: 'Data Save Task' },
  { key: 'DistributionSendTask', label: '分发（DistributionSendTask）', disabled: true, unsupported: true },
]
// multiple task 配置相关数据
export const MULTIPLE_LIST = [
  { key: 'MultiObjFuseTask', label: '多目标融合（MultiObjFuseTask）', value: true, disabled: true },
  { key: 'VisibilityDetectTask', label: '视觉检测（VisibilityDetectTask）' },
  { key: 'OcclusionCalTask', label: '遮挡计算（OcclusionCalTask）', value: true, disabled: true },
  { key: 'SpillsDetectTask', label: '抛洒物检测（SpillsDetectTask）' },
  { key: 'CrossLineTask', label: '车辆压线行驶（CrossLineTask）' },
  { key: 'RetrogradeTask', label: '逆行（RetrogradeTask）' },
  { key: 'QueueOverloadTask', label: '排队超限（QueueOverloadTask）' },
  { key: 'TrafficJamTask', label: '交通拥堵（TrafficJamTask）' },
  { key: 'StopValidationTask', label: '车辆违停（StopValidationTask）' },
  { key: 'HighSpeedTask', label: '超速（HighSpeedTask）' },
  { key: 'LowSpeedTask', label: '低速（LowSpeedTask）' },
  { key: 'MultiTurnLaneTask', label: '车辆多次变道（MultiTurnLaneTask）' },
  { key: 'EmergenceLaneOccupationTask', label: '占用应急车道（EmergenceLaneOccupationTask）' },
  { key: 'PedestrianInstrusionTask', label: '行人闯入（PedestrianInstrusionTask）' },
  { key: 'PedestrianAtZebraCrossingTask', label: '行人在斑马线（PedestrianAtZebraCrossingTask）' },
  { key: 'VehicleReverseTask', label: '倒车（VehicleReverseTask）' },
  { key: 'AbnormalVehicleLeavingTask', label: '车辆异常驶离（AbnormalVehicleLeavingTask）' },
  { key: 'QueueOverflowTask', label: '队列溢出（QueueOverflowTask）' },
  // { key: 'RoadConstructionTask', label: '道路施工（RoadConstructionTask）' },
  { key: 'TrafficAccidentTask', label: '交通事故（TrafficAccidentTask）' },
  // { key: 'GoHighClientTask', label: '大唐RSU（GoHighClientTask）' },
  { key: 'MqttAlgoDataTask', label: '算法数据, 通过mqtt输出（MqttAlgoDataTask）', change: true },
  { key: 'MqttAlgoDataTaskSlot', label: '', slot: 'mqtt' },
  { key: 'MultiFuseShowTask', label: '多路融合显示（MultiFuseShowTask）', hidden: true },
  {
    key: 'MultiFuseShowForDebugFuseTask',
    label: '调试用多路融合显示（MultiFuseShowForDebugFuseTask）',
    hidden: true,
  },
  { key: 'CreateBevImgTask', label: '生成全息界面背景图（CreateBevImgTask）' },
  { key: 'HttpBevPublishTask', label: '算法数据, 通过http输出（HttpBevPublishTask）' },
  { key: 'MultiEventFuseTask', label: '多事件融合（MultiEventFuseTask）', value: true, disabled: true },
]
/**
 * 根据原始数据生成form表单的schema数据
 * @param isMultiple 是否multiple task
 * @returns form表单的schema数据
 */
export const getFormSchema: (isMultiple?: boolean) => FormSchema[] = (isMultiple?) => {
  const listTemp: Record<string, any>[] = isMultiple ? MULTIPLE_LIST : SINGLE_LIST
  return listTemp.map((item) => {
    const result: FormSchema = {
      field: item.key,
      label: item.unsupported
        ? h(Tooltip, { title: '该项目前不支持' }, [h('span', { class: 'color-gray' }, item.label)])
        : item.label,
      component: 'Checkbox',
      componentProps: {
        disabled: item.disabled || item.unsupported,
      },
      colProps: {
        span: 24,
        // span: isMultiple ? 24 : 12,
      },
      itemProps: {
        labelCol: {
          span: 8,
          // span: isMultiple ? 6 : 12,
        },
        wrapperCol: {
          span: 16,
          // span: isMultiple ? 16 : 10,
          offset: item.slot ? 8 : 0,
        },
      },
    }
    // if (item.change) {
    //   result.componentProps.onChange = changeMqtt
    // }
    if (item.slot) {
      result.slot = item.slot
      result.ifShow = ({ values }) => {
        return values.MqttAlgoDataTask
      }
    }
    if (item.hidden) {
      result.ifShow = false
    }
    return result
  })
}
export const mqttSchema: FormSchema[] = [
  {
    field: 'field1',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    render: () => {
      return <div class="text-18px font-semibold">网络配置</div>
    },
  },
  {
    field: 'ip',
    label: 'MQTT服务器地址',
    component: 'Input',
    rules: [
      { required: true, message: '请输入服务器地址' },
      { max: 100, message: '字符数不大于100', trigger: 'change' },
      {
        validator: domainIpValidate,
      },
    ],
    colProps: {
      span: 24,
    },
  },
  {
    field: 'port',
    label: '端口号',
    component: 'InputNumber',
    componentProps: {
      maxLength: 10,
      style: {
        width: '100%',
      },
    },
    rules: [
      { required: true, message: '请输入端口号', trigger: 'change' },
      { validator: portValidate, trigger: 'change' },
    ],
    colProps: {
      span: 24,
    },
  },
  {
    field: 'field2',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    render: () => {
      return <div class="text-18px font-semibold">认证信息</div>
    },
  },
  {
    field: 'username',
    label: 'MQTT用户名',
    component: 'Input',
    colProps: { span: 24 },
    rules: [
      { required: true, message: '请输入用户名', trigger: 'change' },
      { max: 100, message: '字符数应不大于100', trigger: 'change' },
      { validator: blankValidate, trigger: 'change' },
    ],
  },
  {
    field: 'password',
    label: 'MQTT密码',
    component: 'Input',
    rules: [
      { required: true, message: '请输入密码', trigger: 'change' },
      { max: 100, message: '字符数应不大于100', trigger: 'change' },
      { validator: blankValidate, trigger: 'change' },
    ],
    colProps: { span: 24 },
  },
  {
    field: 'field3',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    slot: 'up-cret',
  },
]
