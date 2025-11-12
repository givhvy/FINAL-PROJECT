/** (helper avatar file)
 * Avatar Helper - Updates user avatar across all pages
 * Supports profile pictures from Cloudinary or falls back to initials
 */

function updateHeaderAvatar(user) {
    const headerAvatar = document.getElementById('user-avatar');
    if (!headerAvatar) return;

    const getUserInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        let initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
            initials += parts[parts.length - 1].charAt(0).toUpperCase();
        }
        return initials;
    };

    if (user && user.avatarUrl) {
        headerAvatar.innerHTML = `<img src="${user.avatarUrl}" alt="Avatar" class="h-8 w-8 rounded-full object-cover">`;
    } else if (user && user.name) {
        const initials = getUserInitials(user.name);
        headerAvatar.textContent = initials;
        headerAvatar.className = 'h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold';
    }
}

// Auto-update avatar on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.name) {
        updateHeaderAvatar(user);
    }
});
