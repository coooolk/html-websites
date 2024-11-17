import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Sun, Moon } from 'lucide-react';
import TaskList from './components/TaskList';
import TaskInput from './components/TaskInput';
import { Task, Column } from './types';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<{ [key: string]: Task }>({});
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    active: {
      id: 'active',
      title: 'Active Tasks',
      taskIds: [],
    },
    completed: {
      id: 'completed',
      title: 'Completed Tasks',
      taskIds: [],
    },
  });
  const [isDark, setIsDark] = useState(true);

  const handleAddTask = (content: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      content,
      completed: false,
    };

    setTasks(prev => ({ ...prev, [newTask.id]: newTask }));
    setColumns(prev => ({
      ...prev,
      active: {
        ...prev.active,
        taskIds: [newTask.id, ...prev.active.taskIds],
      },
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const newTasks = { ...tasks };
    delete newTasks[taskId];
    
    setTasks(newTasks);
    setColumns(prev => ({
      ...prev,
      active: {
        ...prev.active,
        taskIds: prev.active.taskIds.filter(id => id !== taskId),
      },
      completed: {
        ...prev.completed,
        taskIds: prev.completed.taskIds.filter(id => id !== taskId),
      },
    }));
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks[taskId];
    const newTask = { ...task, completed: !task.completed };
    
    setTasks(prev => ({ ...prev, [taskId]: newTask }));
    
    const sourceColumn = task.completed ? 'completed' : 'active';
    const destinationColumn = !task.completed ? 'completed' : 'active';
    
    setColumns(prev => ({
      ...prev,
      [sourceColumn]: {
        ...prev[sourceColumn],
        taskIds: prev[sourceColumn].taskIds.filter(id => id !== taskId),
      },
      [destinationColumn]: {
        ...prev[destinationColumn],
        taskIds: [taskId, ...prev[destinationColumn].taskIds],
      },
    }));
  };

  const handleStarTask = (taskId: string) => {
    const task = tasks[taskId];
    setTasks(prev => ({
      ...prev,
      [taskId]: { ...task, starred: !task.starred },
    }));
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destinationColumn = columns[destination.droppableId];

    if (sourceColumn === destinationColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: newTaskIds,
        },
      }));
    } else {
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);
      const destinationTaskIds = Array.from(destinationColumn.taskIds);
      destinationTaskIds.splice(destination.index, 0, draggableId);

      setColumns(prev => ({
        ...prev,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        },
        [destinationColumn.id]: {
          ...destinationColumn,
          taskIds: destinationTaskIds,
        },
      }));

      if (source.droppableId !== destination.droppableId) {
        const task = tasks[draggableId];
        setTasks(prev => ({
          ...prev,
          [draggableId]: {
            ...task,
            completed: destination.droppableId === 'completed',
          },
        }));
      }
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Task Manager
            </h1>
            <button
              onClick={() => setIsDark(prev => !prev)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          <TaskInput onAdd={handleAddTask} />

          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-6">
              {Object.values(columns).map(column => (
                <div key={column.id}>
                  <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    {column.title}
                  </h2>
                  <TaskList
                    columnId={column.id}
                    tasks={column.taskIds.map(taskId => tasks[taskId])}
                    onDelete={handleDeleteTask}
                    onToggle={handleToggleTask}
                    onStar={handleStarTask}
                  />
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default App;