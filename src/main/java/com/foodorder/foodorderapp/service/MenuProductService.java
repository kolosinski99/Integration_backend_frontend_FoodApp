package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.CategoryDto;
import com.foodorder.foodorderapp.dto.MenuProductDto;
import com.foodorder.foodorderapp.entity.MenuProduct;
import com.foodorder.foodorderapp.entity.MenuProductCategory;
import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.repository.MenuProductCategoryRepository;
import com.foodorder.foodorderapp.repository.MenuProductRepository;
import com.foodorder.foodorderapp.repository.RestaurantRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuProductService {

    private final MenuProductRepository menuProductRepository;
    private final MenuProductCategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public List<MenuProductDto> findByRestaurant(Integer restaurantId) {
        return menuProductRepository.findAllByRestaurant_Id(restaurantId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public MenuProductDto findById(Integer id) {
        return toDto(menuProductRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danie nie istnieje")
        ));
    }

    public MenuProductDto create(String userLogin, Integer restaurantId, Integer categoryId,
                                 String name, BigDecimal price, String description, MultipartFile image) {
        Restaurant restaurant = resolveRestaurant(userLogin, restaurantId);
        MenuProductCategory category = categoryRepository.findById(categoryId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieznana kategoria")
        );
        MenuProduct p = new MenuProduct();
        p.setRestaurant(restaurant);
        p.setCategory(category);
        p.setProductName(name);
        p.setPrice(price);
        p.setProductDescription(description != null ? description : "");
        if (image != null && !image.isEmpty()) {
            p.setImagePath(fileStorageService.store(image));
        }
        return toDto(menuProductRepository.save(p));
    }

    public MenuProductDto update(Integer id, String userLogin, Integer categoryId,
                                 String name, BigDecimal price, String description, MultipartFile image) {
        MenuProduct p = menuProductRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danie nie istnieje")
        );
        if (p.getRestaurant() == null || p.getRestaurant().getUser() == null
                || !p.getRestaurant().getUser().getLogin().equals(userLogin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień");
        }
        if (categoryId != null) {
            MenuProductCategory category = categoryRepository.findById(categoryId).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieznana kategoria")
            );
            p.setCategory(category);
        }
        if (name != null) p.setProductName(name);
        if (price != null) p.setPrice(price);
        if (description != null) p.setProductDescription(description);
        if (image != null && !image.isEmpty()) {
            p.setImagePath(fileStorageService.store(image));
        }
        return toDto(menuProductRepository.save(p));
    }

    public void delete(Integer id, String userLogin) {
        MenuProduct p = menuProductRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Danie nie istnieje")
        );
        if (p.getRestaurant() == null || p.getRestaurant().getUser() == null
                || !p.getRestaurant().getUser().getLogin().equals(userLogin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień");
        }
        menuProductRepository.delete(p);
    }

    public List<CategoryDto> listCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getCategoryName()))
                .collect(Collectors.toList());
    }

    private Restaurant resolveRestaurant(String userLogin, Integer restaurantId) {
        User user = userRepository.findByLogin(userLogin).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Brak użytkownika")
        );
        Restaurant restaurant;
        if (restaurantId != null) {
            restaurant = restaurantRepository.findById(restaurantId).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restauracja nie istnieje")
            );
        } else {
            restaurant = restaurantRepository.findByUser(user).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brak restauracji właściciela")
            );
        }
        if (restaurant.getUser() == null || !restaurant.getUser().getLogin().equals(userLogin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Brak uprawnień");
        }
        return restaurant;
    }

    private MenuProductDto toDto(MenuProduct p) {
        return new MenuProductDto(
                p.getId(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getRestaurant() != null ? p.getRestaurant().getId() : null,
                p.getProductName(),
                p.getPrice(),
                p.getProductDescription(),
                p.getImagePath()
        );
    }
}
