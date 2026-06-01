package com.foodorder.foodorderapp.service;

import com.foodorder.foodorderapp.dto.CreateOrderRequest;
import com.foodorder.foodorderapp.dto.NewAddressDto;
import com.foodorder.foodorderapp.dto.OrderDto;
import com.foodorder.foodorderapp.dto.OrderItemDto;
import com.foodorder.foodorderapp.dto.OrderItemRequest;
import com.foodorder.foodorderapp.dto.SalesReportDto;
import com.foodorder.foodorderapp.entity.*;
import com.foodorder.foodorderapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ClientRepository clientRepository;
    private final RestaurantRepository restaurantRepository;
    private final AddressRepository addressRepository;
    private final MenuProductRepository menuProductRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto createOrder(String userLogin, CreateOrderRequest request) {
        User user = userRepository.findByLogin(userLogin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Brak użytkownika"));

        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Brak profilu klienta"));

        Restaurant restaurant = restaurantRepository
                .findById(request.getRestaurantId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restauracja nie istnieje"));

        Address address;

        if (request.getNewAddress() != null) {
            NewAddressDto dto = request.getNewAddress();
            Address newAddr = new Address();
            newAddr.setStreet(dto.getStreet() != null ? dto.getStreet() : "");
            newAddr.setHouseNumber(dto.getHouseNumber() != null ? dto.getHouseNumber() : "");
            newAddr.setApartmentNumber(dto.getApartmentNumber());
            newAddr.setPostalCode(dto.getPostalCode() != null ? dto.getPostalCode() : "");
            newAddr.setCity(dto.getCity() != null ? dto.getCity() : "");
            address = addressRepository.save(newAddr);

            if (client.getAddresses() != null && !client.getAddresses().contains(address)) {
                client.getAddresses().add(address);
                clientRepository.save(client);
            }
        } else if (request.getAddressId() != null) {
            address = addressRepository
                    .findById(request.getAddressId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Adres nie istnieje"));
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Brak adresu dostawy — podaj address_id lub new_address");
        }

        PaymentMethod paymentMethod = paymentMethodRepository
                .findById(request.getPaymentMethodId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Metoda płatności nie istnieje"));

        OrderStatus newStatus = orderStatusRepository
                .findByStatusName("NEW")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Brak statusu NEW w bazie"));

        Order order = new Order();
        order.setRestaurant(restaurant);
        order.setClient(client);
        order.setAddress(address);
        order.setPaymentMethod(paymentMethod);
        order.setStatus(newStatus);
        order.setCreateDate(LocalDateTime.now());
        order.setClientComment(request.getClientComment());

        Order saved = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequest itemReq : request.getItems()) {
            MenuProduct product = menuProductRepository
                    .findById(itemReq.getMenuProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Danie " + itemReq.getMenuProductId() + " nie istnieje"));

            OrderItem item = new OrderItem();
            item.setId(new OrderItemId());
            item.setOrder(saved);
            item.setMenuProduct(product);
            item.setItemQuantity(itemReq.getQuantity());
            item.setItemPrice(product.getPrice());
            orderItems.add(item);
        }

        saved.setItems(orderItems);
        return toDto(orderRepository.save(saved));
    }

    public List<OrderDto> getMyOrders(String userLogin) {
        User user = userRepository.findByLogin(userLogin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Brak użytkownika"));
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Brak profilu klienta"));
        return orderRepository
                .findByClientOrderByCreateDateDesc(client)
                .stream().map(this::toDto).toList();
    }

    public List<OrderDto> getRestaurantOrders(String userLogin) {
        User user = userRepository.findByLogin(userLogin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Brak użytkownika"));
        Restaurant restaurant = restaurantRepository
                .findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Brak restauracji"));
        return orderRepository
                .findByRestaurantOrderByCreateDateDesc(restaurant)
                .stream().map(this::toDto).toList();
    }

    public OrderDto updateStatus(Integer orderId, String statusName, Integer estimatedMinutes, String userLogin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Zamówienie nie istnieje"));

        OrderStatus status = orderStatusRepository
                .findByStatusName(statusName)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Nieznany status: " + statusName));

        if ("CANCELLED".equals(statusName)) {
            order.setCancelledDate(LocalDateTime.now());
        }

        if (estimatedMinutes != null) {
            order.setEstimatedMinutes(estimatedMinutes);
        }

        order.setStatus(status);
        return toDto(orderRepository.save(order));
    }

    public SalesReportDto getSalesReport(String userLogin) {
        User user = userRepository.findByLogin(userLogin)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Brak użytkownika"));

        Restaurant restaurant = restaurantRepository
                .findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Brak restauracji"));

        List<Order> completedOrders = orderRepository
                .findByRestaurant(restaurant)
                .stream()
                .filter(o -> "COMPLETED".equals(
                        o.getStatus() != null
                                ? o.getStatus().getStatusName() : ""))
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .flatMap(o -> o.getItems() != null
                        ? o.getItems().stream() : Stream.empty())
                .map(i -> i.getItemPrice()
                        .multiply(BigDecimal.valueOf(i.getItemQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agregacja po nazwie produktu
        Map<String, int[]> productStats = new LinkedHashMap<>();
        Map<String, BigDecimal> productRevenue = new LinkedHashMap<>();

        completedOrders.forEach(order -> {
            if (order.getItems() == null) return;
            order.getItems().forEach(item -> {
                String name = item.getMenuProduct() != null
                        ? item.getMenuProduct().getProductName()
                        : "Nieznane";
                productStats.merge(name,
                        new int[]{item.getItemQuantity()},
                        (a, b) -> new int[]{a[0] + b[0]});
                productRevenue.merge(name,
                        item.getItemPrice().multiply(
                                BigDecimal.valueOf(item.getItemQuantity())),
                        BigDecimal::add);
            });
        });

        List<SalesReportDto.TopProductDto> topProducts =
                productStats.entrySet().stream()
                        .sorted((a, b) ->
                                Integer.compare(b.getValue()[0], a.getValue()[0]))
                        .limit(10)
                        .map(e -> new SalesReportDto.TopProductDto(
                                e.getKey(),
                                e.getValue()[0],
                                productRevenue.get(e.getKey())
                        ))
                        .toList();

        return new SalesReportDto(
                totalRevenue,
                completedOrders.size(),
                topProducts
        );
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems() == null
                ? List.of()
                : order.getItems().stream().map(i -> new OrderItemDto(
                i.getMenuProduct().getId(),
                i.getMenuProduct().getProductName(),
                i.getItemQuantity(),
                i.getItemPrice()
        )).toList();

        BigDecimal total = itemDtos.stream()
                .map(i -> i.getItemPrice()
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderDto(
                order.getId(),
                order.getRestaurant() != null
                        ? order.getRestaurant().getId() : null,
                order.getRestaurant() != null
                        ? order.getRestaurant().getRestaurantName() : null,
                order.getStatus() != null
                        ? order.getStatus().getStatusName() : null,
                order.getCreateDate(),
                order.getClientComment(),
                order.getRestaurantComment(),
                total,
                itemDtos,
                order.getEstimatedMinutes()
        );
    }
}
