package com.example.demo.repository;

import com.example.demo.model.Attachment;
import com.example.demo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    // Find all attachments for a specific task
    List<Attachment> findByTask(Task task);

    // Find all attachments for a task by taskId
    List<Attachment> findByTaskId(Long taskId);

    // Count attachments for a task
    long countByTaskId(Long taskId);
}