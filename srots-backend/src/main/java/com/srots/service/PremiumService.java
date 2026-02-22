package com.srots.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.srots.model.PremiumPayment;
import com.srots.model.Student;
import com.srots.repository.PremiumPaymentRepository;
import com.srots.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Hex;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PremiumService {

    private final StudentRepository studentRepository;
    private final PremiumPaymentRepository paymentRepo;
    private final EmailService emailService;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    public Map<String, Object> createOrder(String username) throws RazorpayException {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();
        options.put("amount", 49900); // ₹499 in paise
        options.put("currency", "INR");
        options.put("receipt", "premium_" + username);

        Order order = client.orders.create(options);

        // save payment
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        PremiumPayment payment = new PremiumPayment();
        payment.setOrderId(order.get("id"));
        payment.setStatus("CREATED");
        payment.setStudent(student);

        paymentRepo.save(payment);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", order.get("amount"));
        response.put("key", keyId);

        return response;
    }

    public void processWebhook(String payload, String signature) {
        try {
            // 1️⃣ verify signature
            if (!verifyWebhookSignature(payload, signature)) {
                throw new RuntimeException("Invalid webhook signature");
            }

            // 2️⃣ parse event
            JSONObject json = new JSONObject(payload);
            String event = json.getString("event");

            // 3️⃣ only handle successful payment
            if ("payment.captured".equals(event)) {
                JSONObject paymentEntity = json
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

                String orderId = paymentEntity.getString("order_id");
                String paymentId = paymentEntity.getString("id");

                // 4️⃣ activate premium
                activatePremiumViaWebhook(orderId, paymentId);
            }

        } catch (Exception e) {
            log.error("Webhook failed", e);
            throw new RuntimeException("Webhook failed", e);
        }
    }

    private boolean verifyWebhookSignature(String payload, String actualSignature) throws Exception {
        String expectedSignature = hmacSHA256(payload, webhookSecret);
        return expectedSignature.equals(actualSignature);
    }

    private String hmacSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(secretKey);
        byte[] hash = mac.doFinal(data.getBytes());
        return Hex.encodeHexString(hash);
    }

    @Transactional
    public void activatePremiumViaWebhook(String orderId, String paymentId) {
        PremiumPayment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // prevent duplicate webhook
        if ("PAID".equals(payment.getStatus()))
            return;

        payment.setPaymentId(paymentId);
        payment.setStatus("PAID");
        paymentRepo.save(payment);

        Student student = payment.getStudent();

        if (!student.isPremiumActive()) {
            student.setPremiumActive(true);
            student.setAccountStatus("ACTIVE");
            student.setPremiumExpiryDate(LocalDate.now().plusMonths(6));

            studentRepository.save(student);

            // 📧 send mail
            try {
                emailService.sendPremiumActivatedMail(student.getEmail(), student.getPremiumExpiryDate());
            } catch (Exception e) {
                log.error("Email failed but premium activated: {}", e.getMessage());
            }
        }
    }

    @Transactional
    public String activatePremium(String username, String utr) {

        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ Validate UTR
        if (utr == null || utr.trim().length() < 6) {
            throw new RuntimeException("Invalid UTR. Must be at least 6 characters.");
        }

        // 🔓 ACTIVATE
        student.setPremiumActive(true);
        student.setAccountStatus("ACTIVE");
        student.setPremiumExpiryDate(LocalDate.now().plusMonths(12));

        studentRepository.save(student);

        // 📧 send mail
        try {
            emailService.sendPremiumActivatedMail(student.getEmail(), student.getPremiumExpiryDate());
        } catch (Exception e) {
            System.err.println("Email failed but premium activated: " + e.getMessage());
        }

        return "Premium activated successfully";
    }
}
