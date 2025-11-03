document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('email-address');
    const messageElement = document.getElementById('newsletter-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            messageElement.textContent = 'Đang xử lý...';
            messageElement.classList.remove('text-red-600', 'text-green-600');
            messageElement.classList.add('text-gray-600');

            try {
                const response = await fetch('http://localhost:7000/api/marketing/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                
                // Xử lý thông báo thành công hoặc thất bại
                if (response.ok || response.status === 200) {
                    messageElement.textContent = data.message;
                    messageElement.classList.remove('text-gray-600', 'text-red-600');
                    messageElement.classList.add('text-green-600');
                    emailInput.value = ''; // Xóa email sau khi đăng ký thành công
                } else {
                    // Xử lý lỗi từ server (ví dụ: email không hợp lệ, lỗi server 500)
                    messageElement.textContent = data.message || 'Đã xảy ra lỗi khi đăng ký.';
                    messageElement.classList.remove('text-gray-600', 'text-green-600');
                    messageElement.classList.add('text-red-600');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                messageElement.textContent = 'Lỗi kết nối. Vui lòng kiểm tra lại server.';
                messageElement.classList.remove('text-gray-600', 'text-green-600');
                messageElement.classList.add('text-red-600');
            }
        });
    }
});