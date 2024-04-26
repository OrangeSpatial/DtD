<script setup lang="ts">
import { ref } from 'vue'
import DragToDrop from './components/DragToDrop.vue';

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

function getData() {
  console.log(data.value)
}
</script>

<template>
  <div class="title">TEST DTD</div>
  <hr/>
  <DragToDrop v-model="data">
    <template #default="{ item }">
      <div>{{ item.props?.name }}</div>
    </template>
    <template #ghost="{ item }">
      <div class="ghost-custom">{{ item?.name }}</div>
    </template>
  </DragToDrop>
  <button @click="getData"> getData </button>
</template>

<style scoped>
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
.ghost-custom {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 5px;
}
</style>
