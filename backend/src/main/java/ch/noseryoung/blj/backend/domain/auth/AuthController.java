package ch.noseryoung.blj.backend.domain.auth;

import ch.noseryoung.blj.backend.domain.user.User;
import ch.noseryoung.blj.backend.domain.user.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        try {
            // Check validation errors
            if (bindingResult.hasErrors()) {
                return ResponseEntity.badRequest().body("Validation error: " + bindingResult.getFieldError().getDefaultMessage());
            }

            // Debug logging
            System.out.println("Registration request: username=" + request.getUsername() + ", password=" + (request.getPassword() != null ? "[PROVIDED]" : "[NULL]"));

            // Validate input manually as backup
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            // Check if user already exists
            if (userService.findByUsername(request.getUsername()) != null) {
                return ResponseEntity.badRequest().body("Username already exists");
            }

            // Create new user with encoded password
            User user = new User();
            user.setUsername(request.getUsername().trim());
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            user.setPassword(encodedPassword);

            System.out.println("About to save user: username=" + user.getUsername() + ", password=" + (user.getPassword() != null ? "[ENCODED]" : "[NULL]"));

            User savedUser = userService.createUser(user);

            // Return success response without password
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            e.printStackTrace(); // Add stack trace for debugging
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Simple authentication without JWT for now
            User user = userService.findByUsername(request.getUsername());

            if (user == null) {
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            // Check password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            // Return simple success response (you can implement JWT here later)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("token", "simple-token-" + user.getId()); // Placeholder token
            response.put("userId", user.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login failed: " + e.getMessage());
        }
    }
}