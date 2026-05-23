package com.foodorder.foodorderapp.auth;

import com.foodorder.foodorderapp.dto.AuthResponse;
import com.foodorder.foodorderapp.dto.LoginRequest;
import com.foodorder.foodorderapp.dto.RegisterRequest;
import com.foodorder.foodorderapp.entity.AccountStatus;
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.entity.UserRole;
import com.foodorder.foodorderapp.repository.AccountStatusRepository;
import com.foodorder.foodorderapp.repository.ClientRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import com.foodorder.foodorderapp.repository.UserRoleRepository;
import com.foodorder.foodorderapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AccountStatusRepository accountStatusRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByLogin(request.getLogin())) {
            throw new RuntimeException("Login already exists");
        }

        Integer roleId;

        if ("OWNER".equalsIgnoreCase(request.getRole())) {
            roleId = 2;
        } else {
            roleId = 1;
        }

        UserRole role = userRoleRepository.findById(roleId)
                .orElseThrow();

        AccountStatus activeStatus = accountStatusRepository.findById(1)
                .orElseThrow();

        User user = new User();

        user.setLogin(request.getLogin());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setAccountStatus(activeStatus);
        user.setCreateAccountDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        Client client = new Client();

        client.setUser(savedUser);
        client.setName(request.getName());
        client.setSurname(request.getSurname());
        client.setStreet(request.getStreet());
        client.setHouseNumber(request.getHouseNumber());
        client.setApartmentNumber(request.getApartmentNumber());
        client.setPostalCode(request.getPostalCode());
        client.setCity(request.getCity());

        clientRepository.save(client);

        String token = jwtService.generateToken(savedUser.getLogin());

        return new AuthResponse(
                token,
                savedUser.getLogin(),
                savedUser.getRole().getRoleName()
        );
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Invalid login"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getLogin());

        return new AuthResponse(
                token,
                user.getLogin(),
                user.getRole().getRoleName()
        );
    }
}