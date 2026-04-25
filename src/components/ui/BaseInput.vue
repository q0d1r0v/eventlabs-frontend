<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    label?: string
    hint?: string
    error?: string
    disabled?: boolean
    required?: boolean
    name?: string
    autocomplete?: string
    pill?: boolean
  }>(),
  {
    type: 'text',
    pill: true,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()

const fieldId = computed(() => props.name ?? inputId)
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" :for="fieldId" class="field__label">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="field__req">*</span>
    </label>

    <div class="field__wrap" :class="{ 'field__wrap--pill': pill }">
      <slot name="leading" />
      <input
        :id="fieldId"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="field__input"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value,
          )
        "
      />
      <slot name="trailing" />
    </div>

    <p v-if="error" class="field__error">{{ error }}</p>
    <p v-else-if="hint" class="field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.field__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.field__req {
  color: var(--color-error);
  margin-left: 2px;
}

.field__wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  transition:
    border-color 0.2s var(--ease-out-soft),
    box-shadow 0.2s var(--ease-out-soft);
}

.field__wrap--pill {
  border-radius: var(--radius-pill);
  padding: 6px 18px;
}

.field__wrap:focus-within {
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(24, 226, 153, 0.15);
}

.field--error .field__wrap {
  border-color: var(--color-error);
}

.field__input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  line-height: 1.5;
  color: var(--color-text);
  padding: 4px 0;
}

.field__input::placeholder {
  color: var(--color-text-disabled);
}

.field__input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.field__hint {
  font-size: 13px;
  color: var(--color-text-muted);
}

.field__error {
  font-size: 13px;
  color: var(--color-error);
}
</style>
