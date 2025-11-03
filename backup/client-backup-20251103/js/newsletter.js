/**
 * File: newsletter.js (Hoặc được đặt trong khối <script> của CourseandLesson.html)
 */

// Đảm bảo các biến toàn cục cần thiết đã được khai báo ở đâu đó (ví dụ: newsletterMessage, newsletterForm)
// Nếu đây là file riêng biệt, cần đảm bảo các biến này được truyền vào hoặc là biến global.

function handleNewsletterSubscription(event) {
    event.preventDefault();
    
    // Đảm bảo các phần tử này tồn tại trong DOM:
    const emailInput = document.getElementById('email-address');
    const submitBtn = document.getElementById('newsletter-submit-btn');
    const newsletterMessage = document.getElementById('newsletter-message'); // Cần phải là global hoặc được định nghĩa ở đây

    if (!emailInput || !submitBtn || !newsletterMessage) {
        console.error("Newsletter form elements are missing from the DOM.");
        return;
    }
    
    newsletterMessage.textContent = 'Đang đăng ký...';
    newsletterMessage.classList.remove('text-green-600', 'text-red-600');
    submitBtn.disabled = true;

    const email = emailInput.value;

    try {
        // Sử dụng Promise.resolve().then() để bắt đầu chuỗi promise async/await
        (async () => {
            const response = await fetch('/api/marketing/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();
            
            if (response.ok || response.status === 200) {
                // Thành công hoặc đã tồn tại (201 hoặc 200)
                newsletterMessage.textContent = result.message;
                newsletterMessage.classList.add('text-green-600');
                emailInput.value = ''; // Xóa email sau khi đăng ký thành công
            } else {
                // Lỗi server (400, 500)
                newsletterMessage.textContent = result.message;
                newsletterMessage.classList.add('text-red-600');
            }
        })()
        .catch((error) => {
            console.error("Subscription failed:", error);
            newsletterMessage.textContent = 'Lỗi kết nối. Vui lòng thử lại sau.';
            newsletterMessage.classList.add('text-red-600');
        })
        .finally(() => {
            submitBtn.disabled = false;
        });

    } catch (error) {
        // Chỉ bắt lỗi đồng bộ (synchronous errors), nhưng tôi đã bọc logic trong async IIFE ở trên.
        console.error("Synchronous error:", error);
        submitBtn.disabled = false;
    }
}

// Giả định rằng đoạn code này sẽ được tích hợp vào khối <script> chính nơi các hàm khác được định nghĩa
// Nếu bạn muốn nó là một file độc lập (newsletter.js), bạn có thể gọi nó như sau:
/*
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubscription);
    }
});
*/