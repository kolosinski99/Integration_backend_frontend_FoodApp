package com.foodorder.foodorderapp.auth;

import com.foodorder.foodorderapp.dto.AuthResponse;
import com.foodorder.foodorderapp.dto.LoginRequest;
import com.foodorder.foodorderapp.dto.RegisterRequest;
import com.foodorder.foodorderapp.entity.AccountStatus;
import com.foodorder.foodorderapp.entity.Address;
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.entity.UserRole;
import com.foodorder.foodorderapp.repository.AccountStatusRepository;
import com.foodorder.foodorderapp.repository.AddressRepository;
import com.foodorder.foodorderapp.repository.ClientRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import com.foodorder.foodorderapp.repository.UserRoleRepository;
import com.foodorder.foodorderapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AccountStatusRepository accountStatusRepository;
    private final ClientRepository clientRepository;
    private final AddressRepository addressRepository;
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
        user.setRoles(List.of(role));
        user.setAccountStatus(activeStatus);
        user.setCreateAccountDate(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        Address address = new Address();
        if (request.getAddress() != null) {
            address.setStreet(request.getAddress().getStreet());
            address.setHouseNumber(request.getAddress().getHouseNumber());
            address.setApartmentNumber(request.getAddress().getApartmentNumber());
            address.setPostalCode(request.getAddress().getPostalCode());
            address.setCity(request.getAddress().getCity());
        }

        Address savedAddress = addressRepository.save(address);

        Client client = new Client();

        client.setUser(savedUser);
        client.setName(request.getName());
        client.setSurname(request.getSurname());
        client.setAddresses(List.of(savedAddress));

        clientRepository.save(client);

        String token = jwtService.generateToken(savedUser.getLogin());

        return new AuthResponse(
                token,
                savedUser.getLogin(),
                savedUser.getRoles().get(0).getRoleName(),
                client.getName(),
                client.getSurname()
        );
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Invalid login"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getLogin());

        Client client = clientRepository.findByUser(user).orElse(null);
        String name = client != null ? client.getName() : null;
        String surname = client != null ? client.getSurname() : null;

        return new AuthResponse(
                token,
                user.getLogin(),
                user.getRoles().get(0).getRoleName(),
                name,
                surname
        );
    }
}
