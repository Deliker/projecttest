package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.server-url:http://localhost:8081}")
    private String serverUrl;

    /**
     * Upload a file to the server and return its URL
     *
     * @param file The file to upload
     * @param subdirectory Optional subdirectory to store the file in
     * @return The URL where the file can be accessed
     * @throws IOException If the file cannot be saved
     */
    public String uploadFile(MultipartFile file, String subdirectory) throws IOException {
        // Create the upload directory if it doesn't exist
        String targetDir = subdirectory != null ? uploadDir + "/" + subdirectory : uploadDir;
        Path uploadPath = Paths.get(targetDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Create a unique filename to prevent duplicates
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save the file to the server
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the URL to access the file
        String fileUrl = subdirectory != null
                ? "/api/files/download/" + subdirectory + "/" + uniqueFilename
                : "/api/files/download/" + uniqueFilename;

        return fileUrl;
    }
}