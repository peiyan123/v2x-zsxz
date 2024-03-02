<template>
  <Form ref="formElRef" v-bind="getBindValue" :model="formModel">
    <Row v-bind="getRow">
      <template v-for="schema in getSchema" :key="schema.field">
        <FormItem :schema="schema" :formProps="getProps" :formModel="formModel" :setFormModel="setFormModel">
          <template #[item]="data" v-for="item in Object.keys($slots)">
            <slot :name="item" v-bind="data || {}"></slot>
          </template>
        </FormItem> </template
    ></Row>
  </Form>
</template>
<script lang="ts" setup>
import { ref, unref, computed, useAttrs, defineProps, reactive, Ref, onMounted } from 'vue'
// components
import { Row, Form } from 'ant-design-vue'
import FormItem from './FormItem.vue'
// hooks
import { useFormEvents } from './hooks/useFormEvents'
import { useFormValues } from './hooks/useFormValues'
// types
import { FormActionType, FormProps, FormSchema } from './types/form'
// utils
import { deepMerge } from '@/utils'

const attrs = useAttrs()
const props = defineProps()
const emit = defineEmits(['advanced-change', 'reset', 'submit', 'register'])
const propsRef = ref<Partial<FormProps>>({})
const schemaRef = ref<Nullable<FormSchema[]>>([])
const formModel = reactive<Recordable>({})
const formElRef = ref<Nullable<FormActionType>>(null)
const defaultValueRef = ref<Recordable>({})

const getProps = computed((): FormProps => {
  return { ...unref(propsRef) } as unknown as FormProps
})
const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) } as Recordable))
const getSchema = computed((): FormSchema[] => {
  const schemas: FormSchema[] = (unref(getProps).schemas as any) || []
  return schemas
})

const getRow = computed((): Recordable => {
  const { baseRowStyle = {}, rowProps } = unref(getProps)
  return {
    style: baseRowStyle,
    ...rowProps,
  }
})

const { handleFormValues, initDefault } = useFormValues({
  getProps,
  defaultValueRef,
  getSchema,
  formModel,
})

const {
  handleSubmit,
  setFieldsValue,
  clearValidate,
  validate,
  validateFields,
  getFieldsValue,
  updateSchema,
  updateSchemaInDiffTypes,
  resetSchema,
  appendSchemaByField,
  removeSchemaByFiled,
  resetFields,
  scrollToField,
} = useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  formElRef: formElRef as Ref<FormActionType>,
  schemaRef: schemaRef as any,
  handleFormValues,
})

async function setProps(formProps: Partial<FormProps>): Promise<void> {
  propsRef.value = deepMerge(unref(propsRef) || {}, formProps)
}

function setFormModel(key: string, value: any) {
  formModel[key] = value
  const { validateTrigger } = unref(getBindValue)
  if (!validateTrigger || validateTrigger === 'change') {
    validateFields([key]).catch((_) => {})
  }
}

function handleEnterPress(e: KeyboardEvent) {
  const { autoSubmitOnEnter } = unref(getProps)
  if (!autoSubmitOnEnter) return
  if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
    const target: HTMLElement = e.target as HTMLElement
    if (target && target.tagName && target.tagName.toUpperCase() == 'INPUT') {
      handleSubmit()
    }
  }
}

const formActionType: Partial<FormActionType> = {
  getFieldsValue,
  setFieldsValue,
  resetFields,
  updateSchema,
  updateSchemaInDiffTypes,
  resetSchema,
  setProps,
  removeSchemaByFiled,
  appendSchemaByField,
  clearValidate,
  validateFields,
  validate,
  submit: handleSubmit,
  scrollToField: scrollToField,
}

onMounted(() => {
  initDefault()
  emit('register', formActionType)
})
</script>
<style lang="less" scoped></style>
