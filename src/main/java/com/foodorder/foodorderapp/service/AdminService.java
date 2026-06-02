package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.AdminRestaurantDetailDto;
import com.foodorder.foodorderapp.dto.MenuProductDto;
import com.foodorder.foodorderapp.dto.OrderDto;
import com.foodorder.foodorderapp.dto.RestaurantDto;
import com.foodorder.foodorderapp.entity.Client;
import com.foodorder.foodorderapp.entity.MenuProduct;
import com.foodorder.foodorderapp.entity.Order;
import com.foodorder.foodorderapp.entity.Restaurant;
import com.foodorder.foodorderapp.entity.User;
import com.foodorder.foodorderapp.repository.ClientRepository;
import com.foodorder.foodorderapp.repository.MenuProductRepository;
import com.foodorder.foodorderapp.repository.OrderRepository;
import com.foodorder.foodorderapp.repository.RestaurantRepository;
import com.foodorder.foodorderapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final MenuProductRepository menuProductRepository;
    private final OrderRepository orderRepository;

    public AdminRestaurantDetailDto getRestaurantDetail(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));

        User owner = r.getUser();
        String ownerLogin = owner != null ? owner.getLogin() : "";

        // Pobierz dane klienta (imię, nazwisko) jeśli istnieje
        String ownerName = "";
        String ownerSurname = "";
        if (owner != null) {
            Optional<Client> clientOpt = clientRepository.findByUser(owner);
            if (clientOpt.isPresent()) {
                ownerName = clientOpt.get().getName();
                ownerSurname = clientOpt.get().getSurname();
            }
        }

        // Pobierz menu restauracji
        List<MenuProduct> products = menuProductRepository.findAllByRestaurant_Id(id);
        List<MenuProductDto> menuDtos = products.stream()
                .map(p -> new MenuProductDto(
                        p.getId(),
                        p.getCategory() != null ? p.getCategory().getId() : null,
                        r.getId(),
                        p.getProductName(),
                        p.getPrice(),
                        p.getProductDescription(),
                        p.getImagePath(),
                        p.getSpiceLevel(),
                        p.getAllergens()
                ))
                .toList();

        return new AdminRestaurantDetailDto(
                r.getId(),
                r.getRestaurantName(),
                r.getDescription(),
                r.getStreet(),
                r.getHouseNumber(),
                r.getPostalCode(),
                r.getCity(),
                r.getImagePath(),
                r.getIsApproved(),
                r.getCategory() != null ? r.getCategory().getCategoryName() : "",
                ownerLogin,
                ownerName,
                ownerSurname,
                menuDtos
        );
    }

    public List<RestaurantDto> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public RestaurantDto approveRestaurant(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));
        r.setIsApproved(1);
        return toDto(restaurantRepository.save(r));
    }

    public RestaurantDto rejectRestaurant(Integer id) {
        Restaurant r = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));
        r.setIsApproved(0);
        return toDto(restaurantRepository.save(r));
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllByOrderByCreateDateDesc()
                .stream()
                .map(this::orderToDto)
                .toList();
    }

    private OrderDto orderToDto(Order order) {
        List<com.foodorder.foodorderapp.dto.OrderItemDto> items =
                order.getItems() == null ? List.of()
                : order.getItems().stream()
                        .map(i -> new com.foodorder.foodorderapp.dto.OrderItemDto(
                                i.getMenuProduct() != null ? i.getMenuProduct().getId() : null,
                                i.getMenuProduct() != null ? i.getMenuProduct().getProductName() : "",
                                i.getItemQuantity(),
                                i.getItemPrice()
                        )).toList();

        BigDecimal total = items.stream()
                .map(i -> i.getItemPrice()
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderDto(
                order.getId(),
                order.getRestaurant() != null ? order.getRestaurant().getId() : null,
                order.getRestaurant() != null ? order.getRestaurant().getRestaurantName() : null,
                order.getStatus() != null ? order.getStatus().getStatusName() : null,
                order.getCreateDate(),
                order.getClientComment(),
                order.getRestaurantComment(),
                total,
                items,
                order.getEstimatedMinutes()
        );
    }

    private String timeToString(java.time.LocalTime t) {
        return t != null ? t.toString() : null;
    }

    private RestaurantDto toDto(Restaurant r) {
        RestaurantDto dto = new RestaurantDto();
        dto.setIdRestaurant(r.getId());
        dto.setRestaurantCategoryId(r.getCategory() != null ? r.getCategory().getId() : null);
        dto.setUserId(r.getUser() != null ? r.getUser().getId() : null);
        dto.setRestaurantName(r.getRestaurantName());
        dto.setDescription(r.getDescription());
        dto.setStreet(r.getStreet());
        dto.setHouseNumber(r.getHouseNumber());
        dto.setApartmentNumber(r.getApartmentNumber());
        dto.setPostalCode(r.getPostalCode());
        dto.setCity(r.getCity());
        dto.setImagePath(r.getImagePath());
        dto.setIsApproved(r.getIsApproved());
        dto.setDeliveryPrice(r.getDeliveryPrice());
        dto.setFreeDeliveryFrom(r.getFreeDeliveryFrom());
        dto.setMinOrderAmount(r.getMinOrderAmount());
        dto.setOpenFrom(timeToString(r.getOpenFrom()));
        dto.setOpenTo(timeToString(r.getOpenTo()));
        dto.setDeliveryFrom(timeToString(r.getDeliveryFrom()));
        dto.setDeliveryTo(timeToString(r.getDeliveryTo()));
        dto.setPickupAvailable(r.getPickupAvailable());

        if (r.getUser() != null) {
            dto.setOwnerLogin(r.getUser().getLogin());
            clientRepository.findByUser(r.getUser()).ifPresent(c -> {
                dto.setOwnerName(c.getName());
                dto.setOwnerSurname(c.getSurname());
            });
        }

        return dto;
    }
}
