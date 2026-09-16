<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  font-size: 6rem;
  margin: 0;
}

p {
  font-size: 1.5rem;
  margin: 1rem 0;
}

a {
  color: #0066cc;
  text-decoration: none;
  font-size: 1.1rem;
}
</style>
