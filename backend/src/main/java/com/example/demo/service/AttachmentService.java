package com.example.demo.service;

import com.example.demo.model.Attachment;
import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.AttachmentRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    @Autowired
    public AttachmentService(
            AttachmentRepository attachmentRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            @Value("${file.upload-dir:./uploads}") String uploadDir) {

        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;

        this.fileStorageLocation = Paths.get(uploadDir)
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Attachment storeFile(MultipartFile file, Long taskId, Long userId) throws IOException {
        // Validate taskId and userId
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        Optional<User> userOpt = userRepository.findById(userId);

        if (!taskOpt.isPresent() || !userOpt.isPresent()) {
            throw new IllegalArgumentException("Task or User not found");
        }

        Task task = taskOpt.get();
        User user = userOpt.get();

        // Normalize file name and create unique name to prevent duplicates
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save the file on the server
        Path targetLocation = this.fileStorageLocation.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Create the attachment record
        Attachment attachment = new Attachment(
                uniqueFilename,
                originalFilename,
                file.getContentType(),
                file.getSize(),
                task,
                user
        );

        return attachmentRepository.save(attachment);
    }

    public List<Attachment> getAttachmentsForTask(Long taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }

    public Optional<Attachment> getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId);
    }

    public void deleteAttachment(Long attachmentId) throws IOException {
        Optional<Attachment> attachmentOpt = attachmentRepository.findById(attachmentId);

        if (attachmentOpt.isPresent()) {
            Attachment attachment = attachmentOpt.get();

            // Delete file from filesystem
            Path filePath = this.fileStorageLocation.resolve(attachment.getFilename()).normalize();
            Files.deleteIfExists(filePath);

            // Delete record from database
            attachmentRepository.delete(attachment);
        }
    }

    public Path getFilePath(String filename) {
        return this.fileStorageLocation.resolve(filename).normalize();
    }
}