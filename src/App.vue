<script setup lang="ts">
import DragToDrop from './components/DragToDrop.vue'
import { computed, ref, toRaw } from 'vue'
import { DtdNode } from './model/DtdNode.ts'
import DtdItem from './components/DtdItem.vue'
import DtdList from './components/DtdList.vue'

const data = ref([
  {
    id: 12,
    name: 'Input',
  },
  {
    id: 13,
    name: 'Button',
  },
  {
    id: 14,
    name: 'Card',
    droppable: true,
    children: [
      {
        id: 15,
        name: 'CardHeader',
      },
      {
        id: 16,
        name: 'CardBody',
      },
      {
        id: 17,
        name: 'CardFooter',
      },
    ],
  }
])

const dragNodes = new DtdNode({
  children: toRaw(data.value),
})

console.log(dragNodes)

</script>

<template>
  <div class="title">TEST DTD</div>
  <hr/>
  <DragToDrop :root="dragNodes.root">
    <dtd-list v-if="dragNodes.children.length" :list="dragNodes.children">
      <template #default="{ item }">
        {{ item.droppable }}
        <dtd-item :data="item" :key="item.id">
          <div>{{ item.props.name}}</div>
          <dtd-list v-if="item.children.length" :list="item.children">
            <template #default="{ item }">
              <dtd-item :data="item" :key="item.id">
                <div>{{ item.props.name}}</div>
              </dtd-item>
            </template>
          </dtd-list>
        </dtd-item>
      </template>
    </dtd-list>
  </DragToDrop>

</template>

<style scoped>
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
