import { FormSchema } from '../../../components/Form/types/form'
import {
  ipValidate,
  domainIpValidate,
  latValidate,
  lonValidate,
  portValidate,
  blankValidate,
} from '@/utils/formValidate'
export const networkSchema: FormSchema[] = [
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
    label: '服务器地址',
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
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
  {
    field: 'port',
    label: '端口号',
    component: 'InputNumber',
    componentProps: {
      maxLength: 10,
    },
    rules: [
      { required: true, message: '请输入端口号', trigger: 'change' },
      { validator: portValidate, trigger: 'change' },
    ],
    colProps: {
      span: 24,
    },
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
]
export const mqttSchema: FormSchema[] = [
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
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
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
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
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
export const deviceSchema: FormSchema[] = [
  {
    field: 'field4',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    render: () => {
      return <div class="text-18px font-semibold">设备信息</div>
    },
  },
  {
    field: 'deviceId',
    label: 'ID',
    component: 'Input',
    componentProps: {
      disabled: true,
      maxlength: 128,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    // rules: [{ required: true, message: '请输入ID', trigger: 'change' }],
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
  {
    field: 'sn',
    label: 'SN',
    component: 'Input',
    componentProps: {
      disabled: true,
      maxlength: 128,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    // rules: [{ required: true, message: '请输入SN', trigger: 'change' }],
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
  {
    field: 'longitude',
    label: '经度',
    component: 'Input',
    componentProps: {
      maxlength: 15,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    rules: [
      // { required: true, message: '请输入经度', trigger: 'change' },
      { validator: (rule, value) => lonValidate(rule, value), trigger: 'change' },
    ],
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
  {
    field: 'latitude',
    label: '纬度',
    component: 'Input',
    componentProps: {
      maxlength: 15,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    rules: [
      // { required: true, message: '请输入纬度', trigger: 'change' },
      { validator: (rule, value) => latValidate(rule, value), trigger: 'change' },
    ],
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
  {
    field: 'elevation',
    label: '高程',
    component: 'Input',
    componentProps: {
      maxlength: 15,
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    rules: [
      // { required: true, message: '请输入高程', trigger: 'change' },
      { pattern: /^(0|[1-9]\d*)(.\d+|\.?)?$/, message: '请输入正确的高程', trigger: 'change' },
      // { validator: (rule, value) => latValidate(rule, value), trigger: 'change' },
    ],
    itemProps: {
      labelCol: {
        span: 2,
      },
      wrapperCol: {
        span: 6,
      },
    },
  },
]
export const roadSchema: FormSchema[] = [
  {
    field: 'field5',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    render: () => {
      return <div class="text-18px font-semibold">全息展示</div>
    },
  },
  {
    field: 'imageUrl',
    label: '',
    component: 'Input',
    colProps: { span: 24 },
    required: false,
    slot: 'img',
    rules: [{ required: true, message: '请上传图片', trigger: 'change' }],
  },
]

export const tableColumn = [
  {
    key: 'names',
    title: '应用名称',
    dataIndex: 'Names',
  },
  {
    key: 'image',
    title: '镜像名',
    dataIndex: 'Image',
  },
  {
    key: 'status',
    title: '状态',
    dataIndex: 'State',
  },
  {
    key: 'ports',
    title: '端口信息',
    dataIndex: 'Ports',
  },
  {
    key: 'command',
    title: '备注',
    dataIndex: 'Command',
  },
]
