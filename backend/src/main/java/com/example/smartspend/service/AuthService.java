package com.example.smartspend.service;

import com.example.smartspend.dto.AuthResponseDTO;
import com.example.smartspend.dto.LoginRequestDTO;
import com.example.smartspend.dto.RegisterRequestDTO;

public interface AuthService {
    AuthResponseDTO register(RegisterRequestDTO request);
    AuthResponseDTO login(LoginRequestDTO request);
}