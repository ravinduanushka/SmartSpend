package com.example.smartspend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:*", allowCredentials = "true")
public class PaymentController {

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @PostMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestBody Map<String, Object> payload) {
        String orderId = payload.get("orderId").toString();
        double amount = Double.parseDouble(payload.get("amount").toString());
        String currency = payload.getOrDefault("currency", "LKR").toString();

        String formattedAmount = new DecimalFormat("0.00").format(amount);
        String hashedSecret = getMd5(merchantSecret).toUpperCase();
        String rawString = merchantId + orderId + formattedAmount + currency + hashedSecret;
        String finalHash = getMd5(rawString).toUpperCase();

        Map<String, String> response = new HashMap<>();
        response.put("merchantId", merchantId);
        response.put("orderId", orderId);
        response.put("amount", formattedAmount);
        response.put("currency", currency);
        response.put("hash", finalHash);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/notify")
    public ResponseEntity<?> paymentNotify(@RequestParam Map<String, String> params) {
        System.out.println("PayHere Webhook Notification Received: " + params);
        return ResponseEntity.ok("Notification Received");
    }

    private String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            BigInteger no = new BigInteger(1, messageDigest);
            StringBuilder hashtext = new StringBuilder(no.toString(16));
            while (hashtext.length() < 32) {
                hashtext.insert(0, "0");
            }
            return hashtext.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }
}