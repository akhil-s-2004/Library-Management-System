package com.library.controller;

import com.library.dto.request.BorrowRequest;
import com.library.dto.request.ReturnRequest;
import com.library.service.KioskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/kiosk")
@RequiredArgsConstructor
public class KioskController {

    private final KioskService kioskService;

    @PostMapping("/borrow")
    public String borrow(@Valid @RequestBody BorrowRequest request) {
        return kioskService.borrowBook(request);
    }

    @PostMapping("/return")
    public String returnBook(@Valid @RequestBody ReturnRequest request) {
        return kioskService.returnBook(request.getCopyId());
    }

    @GetMapping("/copy/{copyId}")
    public Map<String, Object> getCopyDetails(@PathVariable Long copyId) {
        return kioskService.getCopyDetails(copyId);
    }

    @GetMapping("/issue/{copyId}")
    public Map<String, Object> getIssueDetails(@PathVariable Long copyId) {
        return kioskService.getIssueDetails(copyId);
    }
}