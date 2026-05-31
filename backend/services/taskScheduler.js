import User from "../models/User.js";
import Task from "../models/Task.js";
import { getIO } from "../socket/socketServer.js";
import { taskQueue } from "../queues/taskQueue.js";

/**
 * Finds the eligible worker node with the lowest active workload (< 2 active tasks).
 * Active tasks are tasks in "pending" or "processing" states.
 */
export const getLeastBusyWorker = async () => {
  try {
    // Find all registered worker nodes
    const workers = await User.find({ role: "worker" });
    if (workers.length === 0) {
      console.log("[Scheduler] No worker nodes registered in the system.");
      return null;
    }

    const workerLoadList = [];

    for (const worker of workers) {
      // Count active tasks assigned to this worker
      const activeCount = await Task.countDocuments({
        assignedWorker: worker._id,
        status: { $in: ["pending", "processing"] },
      });

      console.log(`[Scheduler] Worker ${worker.name} (${worker._id}) workload: ${activeCount}/2`);

      // Only consider if workload is less than 2
      if (activeCount < 2) {
        workerLoadList.push({
          worker,
          activeCount,
        });
      }
    }

    if (workerLoadList.length === 0) {
      console.log("[Scheduler] All registered workers are fully loaded (workload >= 2).");
      return null;
    }

    // Sort workers by active task count (ascending)
    workerLoadList.sort((a, b) => a.activeCount - b.activeCount);

    // Return the least busy worker candidate
    return workerLoadList[0].worker;
  } catch (error) {
    console.error("[Scheduler] Error finding least busy worker:", error);
    return null;
  }
};

/**
 * Scans all unassigned pending tasks, assigns them to available workers
 * using priority scheduling (High > Medium > Low), and enqueues them in Redis.
 */
export const scheduleWaitingTasks = async () => {
  try {
    console.log("[Scheduler] Running scheduling cycle for waiting tasks...");

    // Find all tasks that are pending and currently unassigned
    const waitingTasks = await Task.find({
      status: "pending",
      assignedWorker: null,
    }).sort({ createdAt: 1 });

    if (waitingTasks.length === 0) {
      console.log("[Scheduler] No waiting unassigned tasks found.");
      return;
    }

    // Sort waiting tasks by priority weights: high = 3, medium = 2, low = 1
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    waitingTasks.sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return a.createdAt - b.createdAt;
    });

    console.log(`[Scheduler] Found ${waitingTasks.length} unassigned tasks. Beginning priority scheduling...`);

    let scheduledCount = 0;

    for (const task of waitingTasks) {
      // Find the best available worker candidate
      const worker = await getLeastBusyWorker();
      if (!worker) {
        console.log("[Scheduler] Scheduling cycle halted: no free worker slots available.");
        break; // Stop scheduling since all workers are fully loaded
      }

      // Assign the task to the selected worker candidate
      task.assignedWorker = worker._id;
      task.assignedAt = new Date();
      await task.save();

      scheduledCount++;
      console.log(`[Scheduler] Task "${task.taskName}" (Priority: ${task.priority.toUpperCase()}) successfully assigned to Worker: ${worker.name}`);

      // Emit WebSocket real-time assignment update to clients
      try {
        const io = getIO();
        io.emit("task:assigned", {
          taskId: task._id,
          workerId: worker._id,
          status: "pending",
          taskName: task.taskName,
          priority: task.priority,
          assignedWorker: {
            _id: worker._id,
            name: worker.name,
            email: worker.email,
          },
        });
      } catch (wsErr) {
        console.error("[Scheduler] WebSocket broadcast failed:", wsErr.message);
      }

      // Add task to Redis BullMQ queue for execution
      try {
        await taskQueue.add("task-job", {
          taskId: task._id,
          taskName: task.taskName,
        });
        console.log(`[Scheduler] Task "${task.taskName}" enqueued in Redis taskQueue broker.`);
      } catch (qErr) {
        console.error("[Scheduler] Redis queue enqueue failed:", qErr.message);
      }
    }

    console.log(`[Scheduler] Completed scheduling cycle. Scheduled ${scheduledCount} tasks.`);
  } catch (error) {
    console.error("[Scheduler] General scheduling cycle failure:", error);
  }
};
