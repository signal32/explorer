<template>
    <p v-if="props.recommendation.reason" color="primary"><IonIcon :icon="flash"/>  {{props.recommendation.reason}}</p>
    <p v-if="props.recommendation.distance">{{round(props.recommendation.distance, 1)}}km away</p>
</template>

<script setup lang="ts">
import {defineProps} from 'vue';
import {IonIcon} from '@ionic/vue';
import {flash} from 'ionicons/icons'
import {Recommendation} from '@/modules/services/recommendationService';
import {round} from 'lodash';


const props = defineProps<{recommendation: Recommendation}>();

</script>

<style scoped>

</style>