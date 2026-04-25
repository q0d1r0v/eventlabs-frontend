<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import IconBase from './IconBase.vue'
import { useConfirmStore } from '@/stores/confirm'

const store = useConfirmStore()

const open = computed(() => store.pending !== null)
const data = computed(() => store.pending)

const onConfirm = () => store.accept()
const onCancel = () => store.decline()
</script>

<template>
  <BaseModal
    :open="open"
    :title="data?.title"
    size="sm"
    @close="onCancel"
  >
    <div class="confirm">
      <div
        class="confirm__icon"
        :class="data?.danger ? 'confirm__icon--danger' : 'confirm__icon--info'"
        aria-hidden="true"
      >
        <IconBase v-if="data?.danger" :size="22">
          <path d="M12 2L2 22h20z" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </IconBase>
        <IconBase v-else :size="22">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </IconBase>
      </div>
      <p v-if="data?.message" class="confirm__message">{{ data.message }}</p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" size="md" @click="onCancel">
        {{ data?.cancelLabel ?? 'Bekor qilish' }}
      </BaseButton>
      <BaseButton
        :variant="data?.danger ? 'danger' : 'primary'"
        size="md"
        @click="onConfirm"
      >
        {{ data?.confirmLabel ?? 'Tasdiqlash' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.confirm__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.confirm__icon--danger {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.confirm__icon--info {
  background: var(--color-brand-light);
  color: var(--color-brand-deep);
}

.confirm__message {
  font-size: 15px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
</style>
