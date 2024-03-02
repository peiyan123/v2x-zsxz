<script lang="tsx">
import { computed, defineComponent, PropType, Ref, toRefs, unref } from 'vue'
// components
import { Form } from 'ant-design-vue'
// utils
import { upperFirst, cloneDeep } from 'lodash-es'
import { isBoolean, isFunction, isNull } from '@/utils/is'
import { componentMap } from './componentMap'
// types
import { FormProps, FormSchema } from './types/form'
import { createPlaceholderMessage, getSlot, setComponentRuleType } from '@/utils/helper'
import { Col } from 'ant-design-vue'
import { ValidationRule } from 'ant-design-vue/lib/form/Form'
type IProps = {
  schema: FormSchema
  formProps: FormProps
  allDefaultValues: Recordable
  formModel: Recordable
  setFormModel: (key: string, value: any) => void
}
export default defineComponent({
  name: 'BasicFormItem',
  inheritAttrs: false,
  props: {
    schema: {
      type: Object as PropType<FormSchema | any>,
    },
    formProps: {
      type: Object as PropType<FormProps>,
      default: () => ({}),
    },
    allDefaultValues: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    formModel: {
      type: Object as PropType<Recordable>,
      default: () => ({}),
    },
    setFormModel: {
      type: Function as PropType<(key: string, value: any) => void>,
      default: null,
    },
  },
  setup(props: IProps, { slots }) {
    const { schema, formProps } = toRefs(props) as {
      schema: Ref<FormSchema>
      formProps: Ref<FormProps>
    }
    const getValues = computed(() => {
      const { formModel, schema } = props as any
      return {
        field: schema.field,
        model: formModel,
        values: {
          ...formModel,
        } as Recordable,
        schema: schema,
      }
    })

    const getComponentsProps = computed(() => {
      const { schema, formModel } = props as any
      let { componentProps = {} } = schema
      if (isFunction(componentProps)) {
        componentProps = componentProps({ schema, formModel }) ?? {}
      }
      if (schema.component === 'Divider') {
        componentProps = Object.assign({ type: 'horizontal' }, componentProps, {
          orientation: 'left',
          plain: true,
        })
      }
      return componentProps as Recordable
    })

    function getShow(): { isShow: boolean; isIfShow: boolean } {
      const { show, ifShow } = props.schema
      let isShow = true
      let isIfShow = true

      if (isBoolean(show)) {
        isShow = show
      }
      if (isBoolean(ifShow)) {
        isIfShow = ifShow
      }
      if (isFunction(show)) {
        isShow = show(unref(getValues))
      }
      if (isFunction(ifShow)) {
        isIfShow = ifShow(unref(getValues))
      }

      return { isShow, isIfShow }
    }
    const getDisable = computed(() => {
      const { disabled: globDisabled } = props.formProps as FormProps
      const { dynamicDisabled } = props.schema
      const { disabled: itemDisabled = false } = unref(getComponentsProps)
      let disabled = !!globDisabled || itemDisabled
      if (isBoolean(dynamicDisabled)) {
        disabled = dynamicDisabled
      }
      if (isFunction(dynamicDisabled)) {
        disabled = dynamicDisabled(unref(getValues))
      }
      return disabled
    })
    function renderComponent() {
      const { renderComponentContent, component, field, changeEvent = 'change', valueField } = props.schema

      const isCheck = component && ['Switch', 'Checkbox'].includes(component)

      const eventKey = `on${upperFirst(changeEvent)}`

      const on = {
        [eventKey]: (...args: Nullable<Recordable>[]) => {
          const [e] = args
          if (propsData[eventKey]) {
            propsData[eventKey](...args)
          }
          const target = e ? e.target : null
          const value = target ? (isCheck ? target.checked : target.value) : e
          props.setFormModel(field, value)
        },
      }
      const Comp = componentMap.get(component) as ReturnType<typeof defineComponent>

      const { autoSetPlaceHolder, size } = props.formProps as FormProps
      const propsData: Recordable = {
        allowClear: true,
        getPopupContainer: (trigger: Element) => trigger.parentNode,
        size,
        ...unref(getComponentsProps),
        disabled: unref(getDisable),
      }

      const isCreatePlaceholder = !propsData.disabled && autoSetPlaceHolder
      // RangePicker place is an array
      if (isCreatePlaceholder && component !== 'RangePicker' && component) {
        propsData.placeholder = unref(getComponentsProps)?.placeholder || createPlaceholderMessage(component)
      }
      propsData.codeField = field
      propsData.formValues = unref(getValues)

      const bindValue: Recordable = {
        [valueField || (isCheck ? 'checked' : 'value')]: props.formModel[field],
      }

      const compAttr: Recordable = {
        ...propsData,
        ...on,
        ...bindValue,
      }

      if (!renderComponentContent) {
        return <Comp {...compAttr} />
      }
      const compSlot = isFunction(renderComponentContent)
        ? { ...renderComponentContent(unref(getValues)) }
        : {
            default: () => renderComponentContent,
          }
      return <Comp {...compAttr}>{compSlot}</Comp>
    }
    function renderLabelHelpMessage() {
      const { label, helpMessage, helpComponentProps, subLabel } = props.schema as FormSchema
      const renderLabel = subLabel ? (
        <span>
          {label} <span class="text-secondary">{subLabel}</span>
        </span>
      ) : (
        label
      )
      const getHelpMessage = isFunction(helpMessage) ? helpMessage(unref(getValues)) : helpMessage
      if (!getHelpMessage || (Array.isArray(getHelpMessage) && getHelpMessage.length === 0)) {
        return renderLabel
      }
      return <span>{renderLabel}</span>
    }
    function handleRules(): ValidationRule[] {
      const {
        rules: defRules = [],
        component,
        rulesMessageJoinLabel,
        label,
        dynamicRules,
        required,
      } = props.schema as FormSchema

      if (isFunction(dynamicRules)) {
        return dynamicRules(unref(getValues)) as ValidationRule[]
      }

      let rules: ValidationRule[] = cloneDeep(defRules) as ValidationRule[]

      const getRequired = isFunction(required) ? required(unref(getValues)) : required
      if (getRequired) {
        return [{ required: true, message: '必填', trigger: 'change' }]
      } else {
        return rules
      }
    }
    function renderItem() {
      const { itemProps, slot, render, field, suffix, component } = props.schema as FormSchema
      const getContent = () => {
        return slot ? getSlot(slots, slot, unref(getValues)) : render ? render(unref(getValues)) : renderComponent()
      }
      return (
        <Form.Item name={field} {...(itemProps as Recordable)} label={renderLabelHelpMessage()} rules={handleRules()}>
          <div style="display:flex">
            <div style="flex:1;">{getContent()}</div>
          </div>
        </Form.Item>
      )
    }
    return () => {
      const { colProps = {}, colSlot, renderColContent, component } = props.schema as FormSchema
      if (!componentMap.has(component)) {
        return null
      }

      const realColProps = { ...colProps }
      const { isIfShow, isShow } = getShow()
      const values = unref(getValues)

      const getContent = () => {
        return renderItem()
      }
      return (
        isIfShow && (
          <Col {...realColProps} v-show={isShow}>
            {getContent()}
          </Col>
        )
      )
    }
  },
})
</script>
<style lang="less" scoped></style>
