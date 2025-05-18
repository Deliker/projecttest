package com.example.demo.controller;

import com.example.demo.model.Attachment;
import com.example.demo.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = {"http://localhost:8080"}, allowCredentials = "true")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @Autowired
    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("taskId") Long taskId,
            @RequestParam("userId") Long userId) {

        try {
            Attachment savedAttachment = attachmentService.storeFile(file, taskId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedAttachment.getId());
            response.put("filename", savedAttachment.getFilename());
            response.put("originalFilename", savedAttachment.getOriginalFilename());
            response.put("contentType", savedAttachment.getContentType());
            response.put("size", savedAttachment.getFileSize());
            response.put("uploadedAt", savedAttachment.getUploadedAt());
            response.put("taskId", taskId);
            response.put("message", "File uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Could not upload the file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (IllegalArgumentException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/download/{attachmentId}")
    public ResponseEntity<?> downloadFile(@PathVariable Long attachmentId) {
        try {
            Attachment attachment = attachmentService.getAttachment(attachmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

            Path filePath = attachmentService.getFilePath(attachment.getFilename());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new IOException("File not found: " + attachment.getFilename());
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(attachment.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (IllegalArgumentException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (MalformedURLException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Malformed URL: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (IOException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Could not download the file: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long attachmentId) {
        try {
            attachmentService.deleteAttachment(attachmentId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Attachment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Could not delete the attachment: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<?> getAttachmentsForTask(@PathVariable Long taskId) {
        List<Attachment> attachments = attachmentService.getAttachmentsForTask(taskId);

        List<Map<String, Object>> attachmentsList = attachments.stream()
                .map(this::mapAttachmentToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(attachmentsList);
    }

    private Map<String, Object> mapAttachmentToResponse(Attachment attachment) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", attachment.getId());
        response.put("filename", attachment.getFilename());
        response.put("originalFilename", attachment.getOriginalFilename());
        response.put("contentType", attachment.getContentType());
        response.put("size", attachment.getFileSize());
        response.put("uploadedAt", attachment.getUploadedAt());
        response.put("taskId", attachment.getTask().getId());
        response.put("uploaderId", attachment.getUploader().getId());
        return response;
    }
}