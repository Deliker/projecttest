package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.service.TaskService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @Autowired
    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getAllTasksForUser(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getAllTasksForUser(userOpt.get());
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/date")
    public ResponseEntity<?> getTasksForDate(
            @RequestParam Long userId,
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam Integer day) {
        
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getTasksForUserOnDate(userOpt.get(), year, month, day);
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/month")
    public ResponseEntity<?> getTasksForMonth(
            @RequestParam Long userId,
            @RequestParam Integer year,
            @RequestParam Integer month) {
        
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getTasksForUserInMonth(userOpt.get(), year, month);
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            Task createdTask = taskService.createTask(task, userOpt.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        Optional<Task> taskOpt = taskService.getTaskById(id);
        
        if (taskOpt.isPresent()) {
            return ResponseEntity.ok(taskOpt.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Task not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        Optional<Task> taskOpt = taskService.getTaskById(id);
        
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            
            // Update fields
            task.setDescription(taskDetails.getDescription());
            task.setCategory(taskDetails.getCategory());
            task.setPriority(taskDetails.getPriority());
            task.setYear(taskDetails.getYear());
            task.setMonth(taskDetails.getMonth());
            task.setDay(taskDetails.getDay());
            task.setDuration(taskDetails.getDuration());
            
            Task updatedTask = taskService.updateTask(task);
            return ResponseEntity.ok(updatedTask);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Task not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        Optional<Task> taskOpt = taskService.getTaskById(id);
        
        if (taskOpt.isPresent()) {
            taskService.deleteTask(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Task deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Task not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(@PathVariable Long id, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (!userOpt.isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        Optional<Task> taskOpt = taskService.getTaskById(id);
        
        if (taskOpt.isPresent()) {
            Task completedTask = taskService.completeTask(id, userOpt.get());
            return ResponseEntity.ok(completedTask);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Task not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedTasks(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getCompletedTasksForUser(userOpt.get());
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/incomplete")
    public ResponseEntity<?> getIncompleteTasks(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getIncompleteTasksForUser(userOpt.get());
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getTasksByCategory(@PathVariable String category, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getTasksByCategory(userOpt.get(), category);
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<?> getTasksByPriority(@PathVariable String priority, @RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            List<Task> tasks = taskService.getTasksByPriority(userOpt.get(), priority);
            return ResponseEntity.ok(tasks);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getTaskStats(@RequestParam Long userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> stats = new HashMap<>();
            
            stats.put("totalTasks", taskService.getAllTasksForUser(user).size());
            stats.put("completedTasks", taskService.getCompletedTaskCount(user));
            stats.put("categoryCounts", taskService.getTaskCountsByCategory(user));
            
            return ResponseEntity.ok(stats);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}