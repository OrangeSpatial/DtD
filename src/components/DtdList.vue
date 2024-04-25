<script setup lang="ts">
import { DragToDropListProps } from '../types'

defineProps<DragToDropListProps>()

</script>

<template>
<div class="drag-to-drop-list" v-for="item in list" :key="item.dragId">
  <slot :item="item"></slot>
</div>
</template>

<style scoped>

</style>
