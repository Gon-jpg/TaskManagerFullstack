import React, { useEffect, useState, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { tasksAPI, categoriesAPI, authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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

interface TaskFormValues {
  title: string;
  description: string;
  categoryId: number | '';
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

interface CategoryFormValues {
  name: string;
}

const CategorySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters')
    .required('Category name is required'),
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

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user info', error);
      toast.error('Failed to load user information.');
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      toast.error('Failed to load tasks.');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories.');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (token) {
        await Promise.all([
          fetchTasks(),
          fetchCategories(),
          fetchCurrentUser(),
        ]);
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    loadData();
  }, [token, fetchTasks, fetchCategories, fetchCurrentUser, navigate]);

  const handleCreateTask = async (values: TaskFormValues, { resetForm, setSubmitting }: FormikHelpers<TaskFormValues>) => {
    try {
      const taskData = {
        ...values,
        completed: false,
        categoryId: values.categoryId as number,
      };
      
      await tasksAPI.create(taskData);
      await fetchTasks();
      resetForm();
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Failed to create task', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (values: TaskFormValues, { setSubmitting }: FormikHelpers<TaskFormValues>) => {
    if (!editingTask?.id) {
      setSubmitting(false);
      return;
    }

    try {
      const taskData = {
        title: values.title,
        description: values.description,
        completed: editingTask.completed,
        categoryId: values.categoryId as number,
      };
      
      await tasksAPI.update(editingTask.id, taskData);
      await fetchTasks();
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Failed to update task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(taskId);
        await fetchTasks();
        toast.success('Task deleted successfully!');
      } catch (error) {
        console.error('Failed to delete task', error);
        toast.error('Failed to delete task. Please try again.');
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    if (!task.id) return;

    try {
      const newCompletedStatus = !task.completed;
      await tasksAPI.update(task.id, { 
        title: task.title,
        description: task.description,
        completed: newCompletedStatus,
        categoryId: task.category?.id
      });

      await fetchTasks();
      toast.success(`Task marked as ${newCompletedStatus ? 'completed' : 'pending'}!`);
    } catch (error) {
      console.error('Failed to update task completion status', error);
      toast.error('Failed to change task status.');
    }
  };

  const handleCreateCategory = async (values: CategoryFormValues, { resetForm, setSubmitting }: FormikHelpers<CategoryFormValues>) => {
    try {
      await categoriesAPI.create(values);
      await fetchCategories();
      resetForm();
      toast.success('Category created successfully!');
    } catch (error) {
      console.error('Failed to create category', error);
      toast.error('Failed to create category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;

  const initialTaskFormValues: TaskFormValues = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description,
        categoryId: editingTask.category?.id || '',
      }
    : {
        title: '',
        description: '',
        categoryId: '',
      };

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
            <p>Welcome back, {currentUser?.username || 'User'}!</p>
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
          <div className="forms-container">
            <div className="task-form-section">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <Formik
                initialValues={initialTaskFormValues}
                validationSchema={TaskSchema}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                enableReinitialize={true}
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

            {/* NEW: Category Creation Form */}
            <div className="category-form-section">
              <h2>Add New Category</h2>
              <Formik
                initialValues={{ name: '' }}
                validationSchema={CategorySchema}
                onSubmit={handleCreateCategory}
              >
                {({ isSubmitting }) => (
                  <Form className="category-form">
                    <div className="form-group">
                      <label htmlFor="name">Category Name</label>
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className="form-input"
                        placeholder="e.g., Work, Personal"
                      />
                      <ErrorMessage name="name" component="div" className="error-message" />
                    </div>
                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                      >
                        {isSubmitting ? 'Adding...' : 'Add Category'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
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