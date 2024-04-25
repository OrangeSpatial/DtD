<script setup lang="ts">
import { computed } from 'vue'
import { DtdNode } from '../model/DtdNode';
import DtdItem from './DtdItem.vue';


defineOptions({
    name: 'DtD',
})

const props = withDefaults(defineProps<{
    modelValue: Array<any>,
}>(), {})

const emits = defineEmits<{
    (event: 'update:modelValue', value: Array<any>): void
}>()

const dtdData = computed({
    get: () => {
        return DtdNode.fromList(props.modelValue)
    },
    set: (value) => {
        console.log(value);
        emits('update:modelValue', DtdNode.toList(value))
    }
})


console.log(dtdData.value);

</script>

<template>
    <dtd-item
        v-for="item in dtdData.children"
        :data="item"
        :disabled="item.disabled"
    >
        <slot :item="item">
        </slot>
        <Dtd v-if="item.children?.length" v-model="item.children">
            <template #default="{ item: cItem }">
                <slot :item="cItem"></slot>
            </template>
        </Dtd>
    </dtd-item>
</template>