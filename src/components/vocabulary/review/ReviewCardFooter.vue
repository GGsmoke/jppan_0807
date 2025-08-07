<template>
  <div class="card-footer">
    <div class="review-actions">
      <button class="btn-good" @click="$emit('review-good')">
        <i class="ri-check-line"></i>
        再来一个
      </button>
      <button class="btn-easy" @click="$emit('show-contact')">
        <i class="ri-wechat-line"></i>
        联系我们
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['review-good', 'show-contact'])
</script>

<style lang="scss" scoped>
.card-footer {
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid #f0f0f0;
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  .btn-good {
    background-color: #e8f5e9;
    color: #43a047;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  .btn-easy {
    background-color: #fff8e1;
    color: #ffa000;
    
    &:hover {
      background-color: #ffecb3;
    }
  }
}
</style>