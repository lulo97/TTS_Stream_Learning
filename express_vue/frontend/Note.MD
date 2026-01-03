Oxlint = Eslint but written in Rust

rolldown-vite (bundler builder by Rust, aimed to replace rollup - another bundler vite use)

Create with npm create vue@latest -> Choose typescript -> Not work
Create with npm create vite@latest -> Choose typescript -> Work

Vue app flow:
- index.html
    + Declare div with id = app
    + Import main.ts file
- main.ts
    + Import { createApp } from vue
    + Import { App } from "App.vue"
    + createApp(App).mount('#app')