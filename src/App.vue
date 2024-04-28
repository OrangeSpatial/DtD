<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import Tree from './demo/Tree.vue'
import Horizon from './demo/Horizon.vue'

const components = ref<{
  title: string
  component: Component
}[]>([
  {
    title: 'Tree Demo',
    component: Tree
  },
  {
    title: 'Horizon Demo',
    component: Horizon
  }
])

const current = ref<string>('Tree Demo')

const currentComponent = computed(() => {
  return components.value.find(item => item.title === current.value)?.component
})

</script>

<template>
  <div class="demo-root">
    <div class="demo-menu">
      <div class="demo-list">
        <div class="demo-item"
        :class="{ active: current === item.title }"
        v-for="item in components"
        :key="item.title">
          <a @click="current = item.title">{{ item.title }}</a>
        </div>
      </div>
    </div>
    <div class="demo-main">
      <component :is="currentComponent"></component>
    </div>
  </div>
</template>

<style scoped>
.demo-root {
  display: flex;
  height: 100%;
}

.demo-menu {
  width: 200px;
  height: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #f0f2f5;
  overflow-y: auto;
}

.demo-list {
  display: flex;
  flex-direction: column;
  padding: 24px 10px;
  gap: 10px;
}

.demo-item {
  padding: 10px;
  background-color: #f0f2f5;
  border-radius: 4px;
  cursor: pointer;
}

.demo-item:hover {
  background-color: #e8e8e8;
}

.active {
  background-color: #e8e8e8;
}

.demo-main {
  flex: 1;
  height: 100%;
  /* padding: 20px; */
  overflow-y: auto;
}
</style>
