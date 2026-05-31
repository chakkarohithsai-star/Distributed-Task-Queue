// importing models and queue
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { taskQueue } from "../queues/taskQueue.js";
import { scheduleWaitingTasks } from "../services/taskScheduler.js";

// create project and enqueue tasks
export const createProject = async (req, res) => {
  const { title, tasks } = req.body;

  // Enforce role security: workers cannot create projects/pipelines!
  if (req.user.role === "worker") {
    return res.status(403).json({
      message: "Worker nodes are not authorized to create pipelines.",
    });
  }

  const project = await Project.create({
    title,
    createdBy: req.user.id,
  });

  // Normalize incoming tasks array to support both strings and objects with priority
  const normalizedTasks = tasks.map((item) => {
    if (typeof item === "string") {
      return { taskName: item, priority: "medium" };
    }
    return {
      taskName: item.taskName || "Core Task",
      priority: item.priority || "medium",
    };
  });

  // Save all tasks in pending, unassigned state first
  for (const item of normalizedTasks) {
    await Task.create({
      projectId: project._id,
      taskName: item.taskName,
      priority: item.priority,
      status: "pending",
      assignedWorker: null,
    });
  }

  // Trigger priority scheduling loop for waiting tasks asynchronously
  setTimeout(() => {
    scheduleWaitingTasks();
  }, 0);

  res.json({
    message: "Project Created",
    project,
  });
};

// get all projects (modified: workers only see projects containing tasks assigned to them)
export const getAllProjects = async (req, res) => {
  try {
    let query = {};
    
    // If the logged-in user is a client/admin, filter by their own ID. 
    // If they are a worker node, isolate project visibility to only those projects containing tasks assigned to them!
    if (req.user.role === "worker") {
      const assignedTasks = await Task.find({ assignedWorker: req.user.id });
      const assignedProjectIds = assignedTasks.map((t) => t.projectId);
      query._id = { $in: assignedProjectIds };
    } else {
      query.createdBy = req.user.id;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get tasks of single project (modified: workers only see tasks assigned to them)
export const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { projectId: id };
    
    // If worker, strictly isolate tasks list to only tasks assigned to them
    if (req.user.role === "worker") {
      query.assignedWorker = req.user.id;
    }

    const tasks = await Task.find(query).populate("assignedWorker", "name email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// update task status manually (new: allows worker to complete the work from UI)
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["pending", "processing", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Security: If task is already assigned to a worker, only that worker can update it!
    if (req.user.role === "worker" && existingTask.assignedWorker && existingTask.assignedWorker.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to update a task assigned to another worker.",
      });
    }

    let updateFields = { status };
    if (req.user.role === "worker") {
      updateFields.assignedWorker = req.user.id;
    }

    const task = await Task.findByIdAndUpdate(
      taskId,
      updateFields,
      { new: true }
    ).populate("assignedWorker", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Trigger priority scheduling cycle for waiting tasks since a worker workload slot was freed
    if (status === "completed" || status === "failed") {
      setTimeout(() => {
        scheduleWaitingTasks();
      }, 0);
    }

    res.json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};