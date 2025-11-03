// Dark Mode Toggle System
(function() {
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply theme on page load
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('darkModeToggle');
        const toggleMobile = document.getElementById('darkModeToggleMobile');

        // Function to update theme
        function updateTheme(isDark) {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            // Sync both toggles
            if (toggle) toggle.checked = isDark;
            if (toggleMobile) toggleMobile.checked = isDark;
        }

        // Set initial state
        if (toggle) {
            toggle.checked = currentTheme === 'dark';
            toggle.addEventListener('change', function() {
                updateTheme(this.checked);
            });
        }

        if (toggleMobile) {
            toggleMobile.checked = currentTheme === 'dark';
            toggleMobile.addEventListener('change', function() {
                updateTheme(this.checked);
            });
        }
    });
})();
