<script setup lang="ts">
import { ref } from 'vue'
import Dtd from './components/Dtd.vue';

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

</script>

<template>
  <div class="title">TEST DTD</div>
  <hr/>
  <Dtd v-model="data">
    <template #default="{ item }">
      <div>{{ item.props?.name }}</div>
    </template>
  </Dtd>
</template>

<style scoped>
.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
