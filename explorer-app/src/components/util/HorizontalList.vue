<template>
    <div class="horizontal-container">
        <div class="horizontal-container-slot">
            <slot></slot>
        </div>

    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
    name: "HorizontalList"
})
</script>

<style>
.horizontal-container {
    overflow: auto;
    white-space: nowrap;
}

.horizontal-container-slot > *  {
    display: inline-block;

}
</style>