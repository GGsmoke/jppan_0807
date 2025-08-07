<template>
  <div class="profile-edit-page">
    <div class="container">
      <div class="edit-header">
        <h1>修改密码</h1>
        <button class="btn-back" @click="router.back()">
          <i class="ri-arrow-left-line"></i>
          返回
        </button>
      </div>

      <form class="edit-form" @submit.prevent="handleSubmit">
        <div class="form-section">
          <h2>密码设置</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>新密码</label>
              <input 
                type="password" 
                v-model="formData.newPassword"
                placeholder="请输入新密码"
                required
              >
            </div>

            <div class="form-group">
              <label>确认新密码</label>
              <input 
                type="password" 
                v-model="formData.confirmPassword"
                placeholder="请再次输入新密码"
                required
              >
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="router.back()">取消</button>
          <button type="submit" class="btn-save" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { API_ENDPOINTS } from '../config/api'
import md5 from 'md5'

const router = useRouter()
const authStore = useAuthStore()
const isSubmitting = ref(false)

const formData = ref({
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  try {
    // Validate passwords match
    if (formData.value.newPassword !== formData.value.confirmPassword) {
      ElMessage.error('两次输入的新密码不一致')
      return
    }

    isSubmitting.value = true
    
    // Encrypt password with md5
    const pwKey = "chunshualiguan"
    const encryptedPassword = md5(formData.value.newPassword + pwKey)

    const response = await fetch(API_ENDPOINTS.user.changePassword, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: authStore.userInfo?.userId,
        token: authStore.token,
        phoneNumber: authStore.phoneNumber?.replace(/^\+/, ''),
        userAccount: "1111",
        newPassword: encryptedPassword,
        loginType: 2
      })
    })

    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(data.msg || '修改密码失败')
    }

    // Show success message for 1 second
    ElMessage({
      message: '密码修改成功',
      type: 'success',
      duration: 1000,
      onClose: () => {
        // Logout and redirect to login page
        authStore.logout()
        router.push('/auth/login')
      }
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '修改失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-edit-page {
  padding: var(--spacing-xl) 0;
  background-color: var(--background-color);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  
  h1 {
    font-size: 1.8rem;
  }
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.edit-form {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.form-section {
  margin-bottom: var(--spacing-xl);
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    
    &::after {
      content: '';
      display: block;
      width: 40px;
      height: 3px;
      background-color: var(--primary-color);
      margin-top: 8px;
    }
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.form-group {
  label {
    display: block;
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: var(--spacing-xs);
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  
  button {
    padding: 10px 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
  
  .btn-cancel {
    background: none;
    border: 1px solid var(--border-color);
    
    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  }
  
  .btn-save {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
  }
}
</style>