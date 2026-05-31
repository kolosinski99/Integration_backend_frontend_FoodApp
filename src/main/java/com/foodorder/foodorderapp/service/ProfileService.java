package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.AddressDto;
import com.foodorder.foodorderapp.dto.ProfileDto;
import com.foodorder.foodorderapp.dto.UpdateProfileRequest;
import com.foodorder.foodorderapp.entity.Address;
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.repository.ClientRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    public ProfileDto getProfile(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Użytkownik nie istnieje"));

        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Profil klienta nie istnieje"));

        String role = user.getRoles().isEmpty()
                ? "USER"
                : user.getRoles().get(0).getRoleName();

        Address addr = client.getAddresses() != null
                && !client.getAddresses().isEmpty()
                ? client.getAddresses().get(0)
                : null;

        AddressDto addressDto = addr == null ? null : new AddressDto(
                addr.getStreet(),
                addr.getHouseNumber(),
                addr.getApartmentNumber(),
                addr.getPostalCode(),
                addr.getCity()
        );

        return new ProfileDto(
                client.getName(),
                client.getSurname(),
                user.getLogin(),
                role,
                addressDto
        );
    }

    @Transactional
    public ProfileDto updateProfile(String login,
                                    UpdateProfileRequest req) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Użytkownik nie istnieje"));

        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Profil klienta nie istnieje"));

        if (req.getName() != null)
            client.setName(req.getName());
        if (req.getSurname() != null)
            client.setSurname(req.getSurname());

        if (client.getAddresses() != null && !client.getAddresses().isEmpty()) {
            Address addr = client.getAddresses().get(0);
            if (req.getStreet() != null)
                addr.setStreet(req.getStreet());
            if (req.getHouseNumber() != null)
                addr.setHouseNumber(req.getHouseNumber());
            addr.setApartmentNumber(req.getApartmentNumber());
            if (req.getPostalCode() != null)
                addr.setPostalCode(req.getPostalCode());
            if (req.getCity() != null)
                addr.setCity(req.getCity());
        }

        clientRepository.save(client);
        return getProfile(login);
    }
}
