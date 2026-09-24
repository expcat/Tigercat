<script setup lang="ts">
import { QRCode } from '@expcat/tigercat-vue/QRCode'
</script>

<template>
  <QRCode value="https://tigercat.dev" error-level="H" status="scanned" icon="M4 4h6v6H4z" />
</template>
