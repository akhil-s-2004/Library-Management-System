package com.library.controller;


import com.library.dto.request.UpdateCopyRequest;
import com.library.entity.PhysicalCopy;
import com.library.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/copies")
@RequiredArgsConstructor
public class AdminCopyController {

    private final BookService bookService;

    @GetMapping("/{copyId}")
    public PhysicalCopy getCopy(@PathVariable Long copyId) {
        return bookService.getCopyById(copyId);
    }

    @PutMapping("/{copyId}")
    public String updateCopy(
            @PathVariable Long copyId,
            @RequestBody UpdateCopyRequest request) {

        return bookService.updateCopy(copyId, request);
    }

    @DeleteMapping("/{copyId}")
    public String deleteCopy(@PathVariable Long copyId) {
        return bookService.deleteCopy(copyId);
    }
}