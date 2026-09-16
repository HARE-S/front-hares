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
  background-color: var(--gray-50);
  padding: 1rem;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: var(--green-600);
  font-weight: 700;
}

p {
  font-size: 1.25rem;
  margin: 1rem 0;
  color: var(--gray-700);
}

a {
  color: var(--green-600);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.65rem 1.25rem;
  border: 1.5px solid var(--green-600);
  border-radius: var(--radius-md);
  display: inline-block;
  transition: var(--transition);
}

a:hover {
  background-color: var(--green-600);
  color: var(--white);
}
</style>
