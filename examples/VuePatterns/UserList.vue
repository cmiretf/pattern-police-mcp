<template>
  <div class="user-list">
    <input v-model="searchQuery" placeholder="Search users..." />
    
    <ul v-if="filteredUsers.length > 0">
      <UserListItem
        v-for="user in filteredUsers"
        :key="user.id"
        :user="user"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </ul>
    
    <EmptyState v-else message="No users found" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

interface Props {
  users: User[]
  filterEnabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'user-edited': [userId: number]
  'user-deleted': [userId: number]
}>()

const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!props.filterEnabled) return props.users
  
  const query = searchQuery.value.toLowerCase()
  return props.users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const handleEdit = (userId: number) => {
  emit('user-edited', userId)
}

const handleDelete = (userId: number) => {
  emit('user-deleted', userId)
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
}
</style>
