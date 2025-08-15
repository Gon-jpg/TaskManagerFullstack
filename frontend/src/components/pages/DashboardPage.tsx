import React, { useEffect, useState, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/DashboardPage.css';

interface Task {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: string;
  category?: Category;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
}

const TaskSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description must be less than 500 characters')
    .required('Description is required'),
  categoryId: Yup.number()
    .positive('Please select a category')
    .required('Category is required'),
});

const DashboardPage: React.FC = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Fetch current user info
  const fetchCurrentUser = useCallback(async () => {
    try {
      // This would need to be implemented in your backend
      const response = await api.get('/users/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user info', error);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchCategories(),
        fetchCurrentUser(),
      ]);
      setLoading(false);
    };

    if (token) {
      loadData();
    }
  }, [token, fetchTasks, fetchCategories, fetchCurrentUser]);

  const handleCreateTask = async (values: any, { resetForm, setSubmitting }: any) => {
    try {
      const taskData = {
        ...values,
        completed: false,
        createdAt: new Date().toISOString(),
        user: currentUser,
        category: categories.find(cat => cat.id === values.categoryId)
      };
      
      await api.post('/tasks', taskData);
      await fetchTasks();
      resetForm();
    } catch (error) {
      console.error('Failed to create task', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (values: any, { setSubmitting }: any) => {
    if (!editingTask?.id) return;

    try {
      const taskData = {
        ...values,
        completed: editingTask.completed,
        user: currentUser,
        category: categories.find(cat => cat.id === values.categoryId)
      };
      
      await api.put(`/tasks/${editingTask.id}`, taskData);
      await fetchTasks();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        await fetchTasks();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await api.put(`/tasks/${task.id}`, updatedTask);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Task Manager</h1>
            <p>Welcome back, {currentUser?.username}!</p>
          </div>
          <div className="header-right">
            <div className="stats">
              <span className="stat">
                <strong>{completedTasksCount}</strong> / {totalTasksCount} completed
              </span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Task Creation Form */}
          <div className="task-form-section">
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <Formik
              initialValues={{
                title: editingTask?.title || '',
                description: editingTask?.description || '',
                categoryId: editingTask?.category?.id || '',
              }}
              validationSchema={TaskSchema}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              enableReinitialize
              key={editingTask?.id || 'new'}
            >
              {({ isSubmitting }) => (
                <Form className="task-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Task Title</label>
                      <Field
                        type="text"
                        name="title"
                        id="title"
                        className="form-input"
                        placeholder="Enter task title"
                      />
                      <ErrorMessage name="title" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="categoryId">Category</label>
                      <Field as="select" name="categoryId" id="categoryId" className="form-input">
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="categoryId" component="div" className="error-message" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      id="description"
                      className="form-input form-textarea"
                      placeholder="Enter task description"
                      rows={3}
                    />
                    <ErrorMessage name="description" component="div" className="error-message" />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    >
                      {isSubmitting 
                        ? (editingTask ? 'Updating...' : 'Creating...') 
                        : (editingTask ? 'Update Task' : 'Create Task')
                      }
                    </button>
                    {editingTask && (
                      <button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Task List */}
          <div className="task-list-section">
            <div className="task-list-header">
              <h2>Your Tasks</h2>
              <div className="task-filters">
                <button
                  className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({totalTasksCount})
                </button>
                <button
                  className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending ({totalTasksCount - completedTasksCount})
                </button>
                <button
                  className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed ({completedTasksCount})
                </button>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found. Create your first task to get started!</p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="checkbox"
                      />
                    </div>
                    
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        {task.category && (
                          <span className="task-category">{task.category.name}</span>
                        )}
                        {task.createdAt && (
                          <span className="task-date">
                            {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="edit-button"
                        title="Edit task"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id!)}
                        className="delete-button"
                        title="Delete task"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;