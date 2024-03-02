import type { App } from 'vue'
import {
  Button,
  ConfigProvider,
  Layout,
  Menu,
  Select,
  Form,
  Input,
  Checkbox,
  Dropdown,
  Popover,
  Card,
  Breadcrumb,
  Tooltip,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Pagination,
  Transfer,
  Calendar,
  LocaleProvider,
  Table,
  Modal,
  Radio,
  Switch,
  Tabs,
  Upload,
  notification,
  message,
  InputNumber,
  Tag,
  Spin,
  Space,
  Popconfirm,
  Divider,
  Drawer,
  Descriptions,
  DescriptionsItem,
  Progress,
  Image,
} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

export function setupAntd(app: App) {
  app.config.globalProperties.$message = message
  app.config.globalProperties.$notification = notification
  app.use(Descriptions)
  app.use(Image)
  app.use(Progress)
  app.use(Drawer)
  app.use(Divider)
  app.use(Popconfirm)
  app.use(Space)
  app.use(Spin)
  app.use(Button)
  app.use(Menu)
  app.use(Row)
  app.use(Col)
  app.use(Layout)
  app.use(Tooltip)
  app.use(Popover)
  app.use(Dropdown)
  app.use(Breadcrumb)
  app.use(Form)
  app.use(Input)
  app.use(Select)
  app.use(Checkbox)
  app.use(DatePicker)
  app.use(TimePicker)
  app.use(Transfer)
  app.use(Calendar)
  app.use(Card)
  app.use(Table)
  app.use(Pagination)
  app.use(LocaleProvider)
  app.use(ConfigProvider)
  app.use(Modal)
  app.use(Radio)
  app.use(Switch)
  app.use(Tabs)
  app.use(Upload)
  app.use(InputNumber)
  app.use(Tag)
}
