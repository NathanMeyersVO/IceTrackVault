<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import mediumZoom from "medium-zoom";
import { onMounted } from "vue";
import { useRouter } from "vitepress";

const { Layout } = DefaultTheme;
const router = useRouter();

const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "transparent",
  });
};

onMounted(setupMediumZoom);

router.onAfterRouteChange = setupMediumZoom;
</script>

<template>
  <Layout />
</template>
