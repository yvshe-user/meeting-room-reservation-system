package com.meetingroom.service;

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
    @Value("${file.upload.dir:src/main/resources/static/upload}")
    private String uploadDir;

    @Value("${file.upload.url-prefix:/upload}")
    private String urlPrefix;

    public String uploadPhoto(MultipartFile file) throws IOException {
        return uploadFile(file, "photo");
    }

    public String uploadQrCode(MultipartFile file) throws IOException {
        return uploadFile(file, "qrcode");
    }

    private String uploadFile(MultipartFile file, String type) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("文件名不能为空");
        }

        String extension = getFileExtension(originalFilename);
        if (!isValidImageExtension(extension)) {
            throw new RuntimeException("不支持的文件格式, 仅支持jpg、jpeg、png、gif格式");
        }

        String fileName = generateFileName(type, extension);
        Path uploadPath = Paths.get(uploadDir, type);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return urlPrefix + "/" + type + "/" + fileName;
    }

    private String generateFileName(String type, String extension) {
        return type + "_" + UUID.randomUUID().toString().replace("-", "") + extension;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex).toLowerCase();
    }

    private boolean isValidImageExtension(String extension) {
        return extension.equals(".jpg") || extension.equals(".jpeg") ||
                extension.equals(".png") || extension.equals(".gif");
    }

    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        try {
            String relativePath = fileUrl.replace(urlPrefix + "/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                return true;
            }
        } catch (IOException e) {
            return false;
        }

        return false;
    }
}
