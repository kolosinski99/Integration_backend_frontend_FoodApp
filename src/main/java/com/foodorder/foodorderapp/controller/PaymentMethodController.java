package com.foodorder.foodorderapp.controller;

import com.foodorder.foodorderapp.dto.PaymentMethodDto;
import com.foodorder.foodorderapp.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodRepository paymentMethodRepository;

    @GetMapping("/api/payment-methods")
    public List<PaymentMethodDto> list() {
        return paymentMethodRepository.findAll()
                .stream()
                .map(m -> new PaymentMethodDto(
                        m.getId(),
                        m.getMethodName(),
                        m.getMethodDescription()
                ))
                .toList();
    }
}
