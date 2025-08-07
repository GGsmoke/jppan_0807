<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>ページが見つかりません</h1>
        <p>お探しのページは存在しないか、移動した可能性があります。</p>
        <router-link to="/" class="btn btn-primary">
          ホームに戻る
        </router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: var(--spacing-xxl) 0;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

h1 {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
}

p {
  color: var(--text-light);
  margin-bottom: var(--spacing-lg);
  font-size: 1.1rem;
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  font-size: 1rem;
}
</style>