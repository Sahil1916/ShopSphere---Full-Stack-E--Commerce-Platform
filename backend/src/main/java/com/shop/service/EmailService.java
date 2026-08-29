package com.shop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:shopverse.notifications@gmail.com}")
    private String from;

    @Value("${mail.support:support@shopverse.com}")
    private String support;

    @Value("${app.url:https://stupendous-flan-56da5d.netlify.app}")
    private String appUrl;

    private static final String BRAND = "Shop_With_Sahil";

    // ── Send helper — async so it never blocks the HTTP response ──
    @Async
    public void sendHtmlMail(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from, BRAND);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("=== Email sent to {} | Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("=== Email failed to {} | {}", to, e.getMessage());
        }
    }

    // ── Shared header/footer ──────────────────────────────────────
    private String header(String emoji, String title, String color) {
        return "<html><body style='margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;'>" +
               "<table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center'>" +
               "<table width='620' cellpadding='0' cellspacing='0' " +
               "style='background:#ffffff;margin:30px auto;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);'>" +
               "<tr><td style='background:#0B0B0C;padding:28px;text-align:center;color:white;'>" +
               "<h1 style='margin:0;font-size:24px;letter-spacing:-0.5px;'>" +
               "<span style='color:#C9A24B;'>&#9679;</span> " + BRAND + "</h1>" +
               "<p style='margin-top:6px;font-size:14px;color:#aaa;'>Premium Shopping Experience</p>" +
               "</td></tr>" +
               "<tr><td style='padding:36px;'>" +
               "<div style='background:" + color + ";border-radius:10px;padding:18px 22px;margin-bottom:24px;'>" +
               "<h2 style='margin:0;color:#fff;font-size:20px;'>" + emoji + " " + title + "</h2>" +
               "</div>";
    }

    private String footer() {
        return "<hr style='border:none;border-top:1px solid #eee;margin:32px 0;'/>" +
               "<h4 style='color:#333;'>Need Help?</h4>" +
               "<p style='color:#666;font-size:14px;'>Email: <a href='mailto:" + support + "' style='color:#C9A24B;'>" + support + "</a></p>" +
               "<p style='color:#666;font-size:14px;'>Phone: +91 9876543210</p>" +
               "<p style='margin-top:32px;color:#aaa;font-size:13px;'>© 2026 " + BRAND + ". All Rights Reserved.</p>" +
               "</td></tr></table></td></tr></table></body></html>";
    }

    private String orderBtn(String label, String url) {
        return "<div style='text-align:center;margin-top:28px;'>" +
               "<a href='" + url + "' style='background:#C9A24B;color:#fff;text-decoration:none;" +
               "padding:14px 32px;border-radius:8px;font-size:15px;font-weight:bold;'>" +
               label + "</a></div>";
    }

    private String orderTable(Long orderId, BigDecimal total) {
        return "<table width='100%' cellpadding='12' cellspacing='0' " +
               "style='border-collapse:collapse;margin-top:20px;border:1px solid #eee;border-radius:8px;overflow:hidden;'>" +
               "<tr style='background:#F8F7F5;'>" +
               "<th align='left' style='color:#555;font-size:13px;'>Order ID</th>" +
               "<th align='left' style='color:#555;font-size:13px;'>Total Amount</th>" +
               "<th align='left' style='color:#555;font-size:13px;'>Status</th>" +
               "</tr><tr>" +
               "<td style='font-weight:bold;color:#0B0B0C;'>#" + orderId + "</td>" +
               "<td style='font-weight:bold;color:#C9A24B;font-size:16px;'>&#8377;" + total + "</td>" +
               "<td>{STATUS_BADGE}</td>" +
               "</tr></table>";
    }

    // ====================================================
    // 1. WELCOME / REGISTRATION EMAIL
    // ====================================================
    @Async
    public void sendWelcomeMail(String customerName, String customerEmail) {
        String subject = "Welcome to " + BRAND + " \uD83C\uDECD\uFE0F";
        String html = header("🎉", "Welcome aboard, " + customerName + "!", "#1FAA70") +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>We're thrilled to have you as part of the <b>" + BRAND + "</b> family.</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Your account has been created successfully. Start exploring thousands of premium products today.</p>" +
            "<ul style='color:#555;font-size:14px;line-height:2;'>" +
            "<li>&#10003; Browse our latest collections</li>" +
            "<li>&#10003; Save favourites to your Wishlist</li>" +
            "<li>&#10003; Track all your orders in real time</li>" +
            "</ul>" +
            orderBtn("Start Shopping", appUrl + "/products") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 2. ORDER PLACED EMAIL  (exact same as original)
    // ====================================================
    @Async
    public void sendOrderPlacedMail(String customerName, String customerEmail,
                                     Long orderId, BigDecimal total) {
        String subject = "Order Placed Successfully — " + BRAND;
        String table = orderTable(orderId, total)
            .replace("{STATUS_BADGE}",
                "<span style='background:#FFF3CD;color:#856404;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold;'>PENDING</span>");
        String html = header("✅", "Order Placed Successfully!", "#1FAA70") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Thank you for shopping with <b>" + BRAND + "</b>. Your order has been received and is now being processed.</p>" +
            table +
            "<p style='color:#555;font-size:14px;margin-top:20px;'>We'll notify you when your order is <b>Confirmed</b>, <b>Shipped</b> and <b>Delivered.</b></p>" +
            orderBtn("View My Orders", appUrl + "/orders") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 3. ORDER CONFIRMED EMAIL
    // ====================================================
    @Async
    public void sendOrderConfirmedMail(String customerName, String customerEmail, Long orderId) {
        String subject = "Order Confirmed — " + BRAND;
        String html = header("✅", "Order Confirmed!", "#1565C0") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Your Order <b>#" + orderId + "</b> has been confirmed. Our warehouse has started preparing your package.</p>" +
            "<p style='color:#555;font-size:14px;'>Expected dispatch: <b>1–2 business days</b></p>" +
            orderBtn("Track Order", appUrl + "/orders") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 4. ORDER SHIPPED EMAIL
    // ====================================================
    @Async
    public void sendOrderShippedMail(String customerName, String customerEmail, Long orderId) {
        String subject = "Your Order is On the Way \uD83D\uDE9A — " + BRAND;
        String html = header("🚚", "Order Shipped!", "#1565C0") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Great news! Your Order <b>#" + orderId + "</b> is on its way to you.</p>" +
            "<p style='color:#555;font-size:14px;'>Estimated Delivery: <b>2–5 business days</b></p>" +
            orderBtn("Track Order", appUrl + "/orders") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 5. OUT FOR DELIVERY EMAIL
    // ====================================================
    @Async
    public void sendOutForDeliveryMail(String customerName, String customerEmail, Long orderId) {
        String subject = "Out For Delivery \uD83D\uDCCD — " + BRAND;
        String html = header("📍", "Out For Delivery!", "#E65100") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Your Order <b>#" + orderId + "</b> is out for delivery today. Please keep your phone available.</p>" +
            "<p style='color:#555;font-size:14px;'>If you're not available, the delivery agent will attempt again tomorrow.</p>" +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 6. ORDER DELIVERED EMAIL
    // ====================================================
    @Async
    public void sendDeliveredMail(String customerName, String customerEmail, Long orderId) {
        String subject = "Order Delivered Successfully \uD83C\uDF89 — " + BRAND;
        String html = header("🎉", "Order Delivered!", "#1FAA70") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Your Order <b>#" + orderId + "</b> has been delivered successfully. We hope you love your purchase!</p>" +
            "<p style='font-size:22px;text-align:center;margin:20px 0;'>&#11088;&#11088;&#11088;&#11088;&#11088;</p>" +
            "<p style='color:#555;font-size:14px;text-align:center;'>Please rate your experience to help us improve.</p>" +
            orderBtn("Shop Again", appUrl + "/products") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }

    // ====================================================
    // 7. ORDER CANCELLED EMAIL
    // ====================================================
    @Async
    public void sendOrderCancelledMail(String customerName, String customerEmail, Long orderId) {
        String subject = "Order Cancelled — " + BRAND;
        String html = header("❌", "Order Cancelled", "#C62828") +
            "<p style='color:#444;font-size:15px;'>Hello <b>" + customerName + "</b>,</p>" +
            "<p style='color:#444;font-size:15px;line-height:1.7;'>Your Order <b>#" + orderId + "</b> has been cancelled as requested. If this was a mistake, please place a new order.</p>" +
            "<p style='color:#555;font-size:14px;'>Refunds (if applicable) will be processed within 5–7 business days.</p>" +
            orderBtn("Shop Again", appUrl + "/products") +
            footer();
        sendHtmlMail(customerEmail, subject, html);
    }
}
