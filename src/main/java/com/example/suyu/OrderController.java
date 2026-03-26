package com.example.suyu;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DoctorRepository doctorRepository; // Assuming Doctors are the "Agents" here or we need another entity

    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order orderRequest) {
        try {
            orderRequest.setOrderDate(LocalDateTime.now());
            orderRequest.setStatus("Processing");
            
            // Save the order
            Order savedOrder = orderRepository.save(orderRequest);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown persistence error"));
        }
    }

    @GetMapping("/customer/{email}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable String email) {
        return ResponseEntity.ok(orderRepository.findByCustomerEmailIgnoreCase(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<AdminDashboardDTO> getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        AdminDashboardDTO stats = new AdminDashboardDTO();
        stats.setTotalOrders((long) allOrders.size());
        stats.setTotalRevenue(allOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum());
        
        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalAgents(doctorRepository.count()); // Doctors as agents for now, following project pattern
        
        // Get last 5 orders
        List<Order> recent = allOrders.size() > 5 ? allOrders.subList(allOrders.size() - 5, allOrders.size()) : allOrders;
        stats.setRecentOrders(recent);
        
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        
        order.setStatus(body.get("status"));
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }
}
