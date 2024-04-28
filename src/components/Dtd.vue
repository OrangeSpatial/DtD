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
    nodeClass?: string;
  }>(),
  {}
);
</script>

<template>
  <dtd-item
    :class="nodeClass ? nodeClass : ''"
    v-for="n in node.children"
    :key="n.props?.[key] || n.dragId"
    :data="n"
    :disabled="n.disabled"
  >
    <slot :item="n"></slot>
    <DtD :nodeClass v-if="n.children?.length" :node="n">
      <template #default="{ item: cItem }">
        <slot :item="cItem"></slot>
      </template>
    </DtD>
  </dtd-item>
</template>
