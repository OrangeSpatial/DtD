<script setup lang="ts">
import { DtdNode } from "../model/DtdNode";
import DtdItem from "./DtdItem.vue";

defineOptions({
  name: "DtD",
});

withDefaults(
  defineProps<{
    node: DtdNode;
    key: string;
  }>(),
  {}
);
</script>

<template>
  <dtd-item
    v-for="n in node.children"
    :key="n.props?.[key] || n.dragId"
    :data="n"
    :disabled="n.disabled"
  >
    <slot :item="n"></slot>
    <DtD v-if="n.children?.length" :node="n">
      <template #default="{ item: cItem }">
        <slot :item="cItem"></slot>
      </template>
    </DtD>
  </dtd-item>
</template>
