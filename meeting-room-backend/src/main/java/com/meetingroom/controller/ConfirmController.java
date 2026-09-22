package com.meetingroom.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
public class ConfirmController {
    @GetMapping("/confirm")
    public ResponseEntity<String> confirmPage() {
        try {
            ClassPathResource resource = new ClassPathResource("static/confirm.html");
            String html = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_HTML);

            return new ResponseEntity<>(html, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("<html><body><h1>页面加载失败</h1></body></html>");
        }
    }
}
