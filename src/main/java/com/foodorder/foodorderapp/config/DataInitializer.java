package com.foodorder.foodorderapp.config;

import com.foodorder.foodorderapp.entity.*;
import com.foodorder.foodorderapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final AccountStatusRepository accountStatusRepository;
    private final ClientRepository clientRepository;
    private final AddressRepository addressRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantCategoryRepository restaurantCategoryRepository;
    private final MenuProductRepository menuProductRepository;
    private final MenuProductCategoryRepository menuProductCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRestaurantCategories();
        seedMenuProductCategories();
        User owner = seedTestOwner();
        if (owner != null) {
            seedOwnerRestaurantAndMenu(owner);
        }
    }

    private void seedRestaurantCategories() {
        if (restaurantCategoryRepository.count() >= 4) return;
        List<String> names = Arrays.asList("Pizzeria", "Sushi", "Burger", "Polska", "Włoska", "Azjatycka");
        for (String name : names) {
            boolean exists = restaurantCategoryRepository.findAll().stream()
                    .anyMatch(c -> name.equalsIgnoreCase(c.getCategoryName()));
            if (!exists) {
                RestaurantCategory c = new RestaurantCategory();
                c.setCategoryName(name);
                c.setCategoryDescription(name + " category");
                restaurantCategoryRepository.save(c);
            }
        }
    }

    private void seedMenuProductCategories() {
        List<String> names = Arrays.asList("Przystawki", "Dania główne", "Desery", "Napoje");
        for (String name : names) {
            boolean exists = menuProductCategoryRepository.findAll().stream()
                    .anyMatch(c -> name.equalsIgnoreCase(c.getCategoryName()));
            if (!exists) {
                MenuProductCategory c = new MenuProductCategory();
                c.setCategoryName(name);
                c.setCategoryDescription(name + " category");
                menuProductCategoryRepository.save(c);
            }
        }
    }

    private User seedTestOwner() {
        if (userRepository.existsByLogin("owner@test.com")) {
            return userRepository.findByLogin("owner@test.com").orElse(null);
        }

        UserRole ownerRole = userRoleRepository.findById(2).orElseThrow(
                () -> new IllegalStateException("Role with id=2 (OWNER) not found in roles table")
        );
        AccountStatus activeStatus = accountStatusRepository.findById(1).orElseThrow(
                () -> new IllegalStateException("AccountStatus with id=1 (ACTIVE) not found")
        );

        User user = new User();
        user.setLogin("owner@test.com");
        user.setPassword(passwordEncoder.encode("Owner1234"));
        user.setRoles(List.of(ownerRole));
        user.setAccountStatus(activeStatus);
        user.setCreateAccountDate(LocalDateTime.now());
        User savedUser = userRepository.save(user);

        Address address = new Address();
        address.setStreet("ul. Nowy Świat");
        address.setHouseNumber("20");
        address.setApartmentNumber(null);
        address.setPostalCode("00-029");
        address.setCity("Warszawa");
        Address savedAddress = addressRepository.save(address);

        Client client = new Client();
        client.setUser(savedUser);
        client.setName("Anna");
        client.setSurname("Nowak");
        client.setAddresses(List.of(savedAddress));
        clientRepository.save(client);

        return savedUser;
    }

    private void seedOwnerRestaurantAndMenu(User owner) {
        if (restaurantRepository.findByUser(owner).isPresent()) {
            return;
        }
        RestaurantCategory pizzeria = restaurantCategoryRepository.findAll().stream()
                .filter(c -> "Pizzeria".equalsIgnoreCase(c.getCategoryName()))
                .findFirst().orElse(restaurantCategoryRepository.findAll().stream().findFirst().orElse(null));
        if (pizzeria == null) return;

        Restaurant restaurant = new Restaurant();
        restaurant.setUser(owner);
        restaurant.setCategory(pizzeria);
        restaurant.setRestaurantName("Pizzeria Bella");
        restaurant.setStreet("ul. Marszałkowska");
        restaurant.setHouseNumber("12");
        restaurant.setApartmentNumber(null);
        restaurant.setPostalCode("00-001");
        restaurant.setCity("Warszawa");
        restaurant.setImagePath("");
        restaurant.setIsApproved(1);
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);

        MenuProductCategory mains = menuProductCategoryRepository.findAll().stream()
                .filter(c -> "Dania główne".equalsIgnoreCase(c.getCategoryName()))
                .findFirst().orElse(null);
        MenuProductCategory drinks = menuProductCategoryRepository.findAll().stream()
                .filter(c -> "Napoje".equalsIgnoreCase(c.getCategoryName()))
                .findFirst().orElse(null);
        MenuProductCategory desserts = menuProductCategoryRepository.findAll().stream()
                .filter(c -> "Desery".equalsIgnoreCase(c.getCategoryName()))
                .findFirst().orElse(null);

        if (mains != null) {
            saveProduct(savedRestaurant, mains, "Margherita", new BigDecimal("32.00"),
                    "Sos pomidorowy, mozzarella fior di latte, świeża bazylia, oliwa extra virgin.");
            saveProduct(savedRestaurant, mains, "Capricciosa", new BigDecimal("38.50"),
                    "Sos pomidorowy, mozzarella, szynka dojrzewająca, pieczarki, karczochy, oliwki.");
            saveProduct(savedRestaurant, mains, "Spaghetti Carbonara", new BigDecimal("36.00"),
                    "Makaron spaghetti z guanciale, jajkiem, pecorino romano i czarnym pieprzem.");
        }
        if (desserts != null) {
            saveProduct(savedRestaurant, desserts, "Tiramisu", new BigDecimal("18.00"),
                    "Klasyczny włoski deser z mascarpone, kawą espresso i biszkoptami.");
        }
        if (drinks != null) {
            saveProduct(savedRestaurant, drinks, "Cola 0,5L", new BigDecimal("8.00"),
                    "Schłodzony napój gazowany.");
            saveProduct(savedRestaurant, drinks, "Lemoniada cytrynowa", new BigDecimal("12.00"),
                    "Domowa lemoniada z miętą i limonką.");
        }
    }

    private void saveProduct(Restaurant restaurant, MenuProductCategory category, String name,
                             BigDecimal price, String description) {
        MenuProduct p = new MenuProduct();
        p.setRestaurant(restaurant);
        p.setCategory(category);
        p.setProductName(name);
        p.setPrice(price);
        p.setProductDescription(description);
        menuProductRepository.save(p);
    }
}
