<template>
  <div class="task-manager">
    <header-component :user-name="userName" @logout="handleLogout" />
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else>
      <task-list
        :tasks="tasks"
        @task-complete="markTaskComplete"
        @task-delete="deleteTask"
      />
      <task-form @task-add="addNewTask" />
      <stats-display
        :total-tasks="calculateTotalTasks"
        :completed-tasks="calculateCompletedTasks"
      />
    </div>
  </div>
</template>

<script>
import HeaderComponent from "./components/HeaderComponent.vue";
import TaskList from "./components/TaskList.vue";
import TaskForm from "./components/TaskForm.vue";
import StatsDisplay from "./components/StatsDisplay.vue";
import axios from "axios";

export default {
  name: "TaskManager",

  components: {
    HeaderComponent,
    TaskList,
    TaskForm,
    StatsDisplay,
  },

  data() {
    return {
      userName: "",
      tasks: [],
      isLoading: true,
      apiBaseUrl: "https://jsonplaceholder.typicode.com",
    };
  },

  async beforeCreate() {
    console.log("beforeCreate: Component está inicializándose");
    try {
      const response = await axios.get(`service/users/1`);
      this.userName = response.data.name;
    } catch (error) {
      console.error("Error in beforeCreate:", error);
    }
  },

  async created() {
    console.log("created: Componente creado");
    try {
      const response = await axios.get(`service/todos?_limit=5`);
      this.tasks = response.data.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed,
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error in created:", error);
    }
  },

  async beforeMount() {
    console.log("beforeMount: El componente se va a montar en el DOM");
    try {
      await axios.post(`service/posts`, {
        title: "Component Mounting",
        body: "Component is about to mount",
        userId: 1,
      });
    } catch (error) {
      console.error("Error in beforeMount:", error);
    }
  },

  async mounted() {
    console.log("mounted: Componente montado en el DOM");
    try {
      const response = await this.$http.get(`service/users/1/todos`);
      console.log("User todos loaded:", response.data);
      this.isLoading = false;
    } catch (error) {
      console.error("Error in mounted:", error);
      this.isLoading = false;
    }

    try {
      const response = await this.$http.get(`service/users/1/todos`);
      console.log("User todos loaded:", response.data);
      this.isLoading = false;
    } catch (error) {
      console.error("Error in mounted:", error);
      this.isLoading = false;
    }
    try {
      const response = await this.$http.delete(`service/delete`);
      console.log("User todos loaded:", response.data);
      this.isLoading = false;
    } catch (error) {
      console.error("Error in mounted:", error);
      this.isLoading = false;
    }
    try {
      const response = await this.$http.post(`service/post/1/todos`);
      console.log("User todos loaded:", response.data);
      this.isLoading = false;
    } catch (error) {
      console.error("Error in mounted:", error);
      this.isLoading = false;
    }
  },

  // async beforeUpdate() {
  //   console.log("beforeUpdate: El componente se va a actualizar");
  //   try {
  //     await axios.post(`service/posts`, {
  //       title: "Component Updating",
  //       body: "Component is about to update",
  //       userId: 1,
  //     });
  //   } catch (error) {
  //     console.error("Error in beforeUpdate:", error);
  //   }
  // },

  async updated() {
    console.log("updated: Componente actualizado");
    try {
      await axios.patch(`service/todos/1`, {
        completed: true,
      });
    } catch (error) {
      console.error("Error in updated:", error);
    }
  },

  async beforeDestroy() {
    console.log("beforeDestroy: El componente se va a destruir");
    try {
      await axios.post(`service/posts`, {
        title: "Component Destroying",
        body: "Component is about to be destroyed",
        userId: 1,
      });
      await this.cleanup();
    } catch (error) {
      console.error("Error in beforeDestroy:", error);
    }
  },

  async destroyed() {
    console.log("destroyed: Componente destruido");
    try {
      await axios.delete(`service/posts/1`);
    } catch (error) {
      console.error("Error in destroyed:", error);
    }
  },

  computed: {
    calculateTotalTasks() {
      return this.tasks.length;
    },

    calculateCompletedTasks() {
      return this.tasks.filter((task) => task.completed).length;
    },
  },

  methods: {
    async addNewTask(taskData) {
      try {
        const response = await axios.post(`service/todos`, {
          title: taskData.title,
          completed: false,
          userId: 1,
        });

        this.tasks.push({
          id: response.data.id,
          title: response.data.title,
          completed: false,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error adding task:", error);
      }
    },

    async markTaskComplete(taskId) {
      try {
        await axios.patch(`service/todos/${taskId}`, {
          completed: true,
        });

        const task = this.tasks.find((t) => t.id === taskId);
        if (task) {
          task.completed = true;
        }
      } catch (error) {
        console.error("Error completing task:", error);
      }
    },

    async deleteTask(taskId) {
      try {
        await axios.delete(`service/todos/${taskId}`);
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          this.tasks.splice(index, 1);
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },

    async cleanup() {
      try {
        await axios.delete(`service/todos/1`);
        this.tasks = [];
        this.userName = "";
      } catch (error) {
        console.error("Error in cleanup:", error);
      }
    },

    async handleLogout() {
      try {
        await axios.post(`service/auth/logout`);
        this.$emit("user-logout");
      } catch (error) {
        console.error("Error in handleLogout:", error);
      }
    },
  },
};
</script>

<style scoped>
.task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}

.error {
  color: #ff4444;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ff4444;
  border-radius: 4px;
}
</style>
