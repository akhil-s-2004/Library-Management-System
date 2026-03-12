package com.library.controller;

import com.library.dto.request.MemberReserveRequest;
import com.library.dto.request.SetPinRequest;
import com.library.dto.request.UpdatePinRequest;
import com.library.dto.request.UpdateProfileRequest;
import com.library.dto.request.ContactRequest;
import com.library.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/member", "/users"})
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PutMapping("/set-pin")
    public String setPin(@Valid @RequestBody SetPinRequest request) {
        return memberService.setPin(request);
    }

    @PutMapping("/update-pin")
    public String updatePin(@Valid @RequestBody UpdatePinRequest request) {
        return memberService.updatePin(request);
    }

    @GetMapping
    public Object getProfile() {
        return memberService.getProfile();
    }

    @PutMapping("/profile")
    public Object updateProfile(@RequestBody UpdateProfileRequest request) {
        return memberService.updateProfile(request);
    }

    @GetMapping("/dashboard")
    public Object getDashboard() {
        return memberService.getDashboard();
    }

    @GetMapping("/membership")
    public Object getMembershipStatus() {
        return memberService.getMembershipStatus();
    }

    @GetMapping("/issues")
    public Object getIssues(@RequestParam(required = false) String status) {
        return memberService.getIssues(status);
    }

    @GetMapping("/reservations")
    public Object getReservations() {
        return memberService.getReservations();
    }

    @PostMapping("/reservations")
    public String createReservation(@Valid @RequestBody MemberReserveRequest request) {
        return memberService.reserveBook(request);
    }

    @DeleteMapping("/reservations/{reservationId}")
    public String cancelReservation(@PathVariable Long reservationId) {
        return memberService.cancelReservation(reservationId);
    }

    @GetMapping("/fines")
    public Object getFines() {
        return memberService.getFines();
    }

    @PutMapping("/issues/{issueId}/renew")
    public String renewIssue(@PathVariable Long issueId) {
        return memberService.renewIssue(issueId);
    }

    @GetMapping("/notifications")
    public Object getNotifications() {
        return memberService.getNotifications();
    }

    @PostMapping("/reserve")
    public String reserve(@Valid @RequestBody MemberReserveRequest request) {
        return memberService.reserveBook(request);
    }

    @PostMapping("/contact")
    public String contact(@RequestBody ContactRequest request) {
        return memberService.sendContactMessage(request);
    }
}
